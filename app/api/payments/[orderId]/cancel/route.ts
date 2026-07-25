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

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!purchase || purchase.status !== "pending") {
    return NextResponse.json({ error: "nothing to cancel" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    await cancelPakasirTransaction(purchase.order_id, purchase.amount);
  } catch {
    // Pakasir may reject cancelling an already-completed/expired transaction —
    // we still mark it cancelled locally so the user isn't stuck.
  }

  await admin.from("purchases").update({ status: "cancelled" }).eq("id", purchase.id);

  return NextResponse.json({ ok: true });
}
