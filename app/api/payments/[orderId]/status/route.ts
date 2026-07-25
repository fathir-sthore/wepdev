import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncPurchaseStatus } from "@/lib/payments/sync";

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

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ error: "purchase not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const synced = await syncPurchaseStatus(admin, purchase);

  return NextResponse.json({ status: synced.status, expiresAt: synced.expires_at });
}
