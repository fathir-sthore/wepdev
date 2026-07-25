import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPakasirTransaction, generateOrderId } from "@/lib/payments/pakasir";
import { hasCompletedPurchase, getPendingPurchase } from "@/lib/payments/entitlement";
import { syncPurchaseStatus } from "@/lib/payments/sync";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { scriptId } = await request.json();
  if (!scriptId) {
    return NextResponse.json({ error: "scriptId is required" }, { status: 400 });
  }

  const { data: script } = await supabase
    .from("scripts")
    .select("id, price, is_premium, status")
    .eq("id", scriptId)
    .eq("status", "published")
    .maybeSingle();

  if (!script) {
    return NextResponse.json({ error: "script not found" }, { status: 404 });
  }
  if (!script.is_premium || script.price <= 0) {
    return NextResponse.json({ error: "this script is free, no purchase needed" }, { status: 400 });
  }

  if (await hasCompletedPurchase(supabase, user.id, script.id)) {
    return NextResponse.json({ error: "already purchased" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Reuse an existing unexpired pending purchase instead of opening a
  // duplicate Pakasir transaction every time the buy button is clicked.
  const existing = await getPendingPurchase(supabase, user.id, script.id);
  if (existing) {
    const synced = await syncPurchaseStatus(admin, existing);
    if (synced.status === "pending") {
      return NextResponse.json({
        orderId: synced.order_id,
        qrString: synced.qr_string,
        amount: synced.amount,
        totalPayment: synced.total_payment,
        expiresAt: synced.expires_at,
      });
    }
    if (synced.status === "completed") {
      return NextResponse.json({ error: "already purchased" }, { status: 400 });
    }
    // fall through to create a fresh one if expired/failed/cancelled
  }

  try {
    const orderId = generateOrderId(script.id);
    const payment = await createPakasirTransaction(orderId, script.price, "qris");

    const { error: insertError } = await supabase.from("purchases").insert({
      user_id: user.id,
      script_id: script.id,
      order_id: orderId,
      amount: script.price,
      fee: payment.fee,
      total_payment: payment.total_payment,
      qr_string: payment.payment_number,
      expires_at: payment.expired_at,
      status: "pending",
    });

    if (insertError) throw new Error(insertError.message);

    return NextResponse.json({
      orderId,
      qrString: payment.payment_number,
      amount: script.price,
      totalPayment: payment.total_payment,
      expiresAt: payment.expired_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "payment creation failed" }, { status: 500 });
  }
}
