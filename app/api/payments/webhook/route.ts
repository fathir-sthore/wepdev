import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncPurchaseStatus } from "@/lib/payments/sync";

export async function POST(request: Request) {
  // v2 introduces webhook signature verification (v1 had none) — the
  // secret is set/reset on the project's detail page on Pakasir's
  // dashboard and must match PAKASIR_WEBHOOK_SECRET here.
  const expectedSecret = process.env.PAKASIR_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-secret");

  if (expectedSecret && receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  const admin = createAdminClient();

  let body: { txn_id?: string; order_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!body.txn_id && !body.order_id) {
    return NextResponse.json({ error: "txn_id/order_id missing" }, { status: 400 });
  }

  const query = admin.from("purchases").select("*");
  const { data: purchase } = body.txn_id
    ? await query.eq("pakasir_txn_id", body.txn_id).maybeSingle()
    : await query.eq("order_id", body.order_id!).maybeSingle();

  if (!purchase) {
    // Acknowledge anyway so Pakasir doesn't keep retrying for an order
    // that isn't ours (or was already cleaned up).
    return NextResponse.json({ ok: true });
  }

  // Pakasir's docs recommend re-checking via the status API rather than
  // trusting this webhook's body — the webhook here is only the trigger,
  // syncPurchaseStatus does the actual verification.
  await syncPurchaseStatus(admin, purchase);

  return NextResponse.json({ ok: true });
}
