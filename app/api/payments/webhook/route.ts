import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncPurchaseStatus } from "@/lib/payments/sync";

export async function POST(request: Request) {
  const admin = createAdminClient();

  let body: { order_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!body.order_id) {
    return NextResponse.json({ error: "order_id missing" }, { status: 400 });
  }

  const { data: purchase } = await admin
    .from("purchases")
    .select("*")
    .eq("order_id", body.order_id)
    .maybeSingle();

  if (!purchase) {
    // Acknowledge anyway so Pakasir doesn't keep retrying for an order
    // that isn't ours (or was already cleaned up).
    return NextResponse.json({ ok: true });
  }

  // Pakasir's docs explicitly recommend re-checking via transactiondetail
  // rather than trusting this webhook's body — the webhook here is only
  // the trigger, syncPurchaseStatus does the actual verification.
  await syncPurchaseStatus(admin, purchase);

  return NextResponse.json({ ok: true });
}
