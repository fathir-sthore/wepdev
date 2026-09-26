import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncVpsOrderStatus } from "@/lib/payments/vps-sync";

export async function GET(
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

  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  const synced = await syncVpsOrderStatus(admin, order);

  return NextResponse.json({ status: synced.status, expiresAt: synced.expires_at });
}
