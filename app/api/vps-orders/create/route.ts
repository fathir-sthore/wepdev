import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPakasirTransaction, generateOrderId } from "@/lib/payments/pakasir";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { vpsStockId } = await request.json();
  if (!vpsStockId) {
    return NextResponse.json({ error: "vpsStockId is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Prevent a user from stacking multiple pending orders across
  // different units (which would tie up stock indefinitely) — one
  // pending VPS order per user at a time.
  const { data: existingPending } = await admin
    .from("vps_orders")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    return NextResponse.json({
      orderId: existingPending.order_id,
      qrString: existingPending.qr_string,
      amount: existingPending.amount,
      totalPayment: existingPending.total_payment,
      expiresAt: existingPending.expires_at,
    });
  }

  // Atomic claim — reserve_vps_stock() uses SELECT ... FOR UPDATE SKIP
  // LOCKED so two buyers racing for the same unit can never both win it.
  const { data: reserved, error: reserveError } = await admin.rpc("reserve_vps_stock", {
    p_stock_id: vpsStockId,
  });

  if (reserveError || !reserved) {
    return NextResponse.json({ error: "VPS ini sudah tidak tersedia" }, { status: 409 });
  }

  try {
    const orderId = generateOrderId(vpsStockId);
    const payment = await createPakasirTransaction(orderId, reserved.price, "qris");

    const { error: insertError } = await admin.from("vps_orders").insert({
      user_id: user.id,
      vps_stock_id: reserved.id,
      order_id: orderId,
      pakasir_txn_id: payment.txn_id,
      amount: reserved.price,
      fee: payment.fee ?? 0,
      total_payment: payment.total_payment ?? reserved.price,
      qr_string: payment.qr_string ?? null,
      expires_at: payment.expired_at ?? null,
      status: "pending",
    });

    if (insertError) throw new Error(insertError.message);

    return NextResponse.json({
      orderId,
      qrString: payment.qr_string,
      amount: reserved.price,
      totalPayment: payment.total_payment,
      expiresAt: payment.expired_at,
    });
  } catch (err) {
    // Payment creation or insert failed after we'd already claimed the
    // unit — release it so it doesn't get stuck 'reserved' forever.
    await admin.rpc("release_vps_stock", { p_stock_id: vpsStockId });
    const message = err instanceof Error ? err.message : "payment creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
