import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelPakasirTransaction } from "@/lib/payments/pakasir";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("vps_orders")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order || order.status !== "pending") {
    return NextResponse.json({ error: "nothing to cancel" }, { status: 400 });
  }

  if (order.pakasir_txn_id) {
    try {
      await cancelPakasirTransaction(order.pakasir_txn_id);
    } catch {
      // Pakasir may reject cancelling an already-completed/expired
      // transaction — we still cancel locally and release the unit.
    }
  }

  await admin.from("vps_orders").update({ status: "cancelled" }).eq("id", order.id);
  await admin.rpc("release_vps_stock", { p_stock_id: order.vps_stock_id });

  return NextResponse.json({ ok: true });
}
