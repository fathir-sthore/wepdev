import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getPakasirTransactionStatus } from "@/lib/payments/pakasir";
import { sendTransactionalEmail } from "@/lib/email/brevo";
import { purchaseConfirmationEmail } from "@/lib/email/templates";
import { createNotification } from "@/lib/notifications";
import { SITE_URL } from "@/lib/site-url";

type Purchase = Database["public"]["Tables"]["purchases"]["Row"];

async function sendPurchaseConfirmation(admin: SupabaseClient<Database>, purchase: Purchase) {
  try {
    const [{ data: authUser }, { data: script }] = await Promise.all([
      admin.auth.admin.getUserById(purchase.user_id),
      admin.from("scripts").select("id, title, slug").eq("id", purchase.script_id).maybeSingle(),
    ]);

    const email = authUser?.user?.email;
    if (!email || !script) return;

    await Promise.all([
      sendTransactionalEmail({
        to: [{ email }],
        subject: `Pembayaran berhasil — ${script.title}`,
        html: purchaseConfirmationEmail({
          scriptTitle: script.title,
          amount: purchase.total_payment ?? purchase.amount,
          orderId: purchase.order_id,
          downloadUrl: `${SITE_URL}/api/scripts/${script.id}/download`,
        }),
      }),
      createNotification({
        userId: purchase.user_id,
        type: "purchase_completed",
        title: "Pembayaran berhasil",
        message: `${script.title} sudah bisa didownload.`,
        linkUrl: `/script/${script.slug}`,
      }),
    ]);
  } catch (err) {
    // Never let an email/notification failure break the payment flow.
    console.error("failed to send purchase confirmation", err);
  }
}

/**
 * Re-checks a pending purchase against Pakasir's v2 transaction-status API
 * (the source of truth per their docs) and updates our row if it has
 * changed. Safe to call repeatedly — a no-op once the purchase is in a
 * final state, or if it predates the v2 migration (no txn_id yet).
 */
export async function syncPurchaseStatus(
  admin: SupabaseClient<Database>,
  purchase: Purchase
): Promise<Purchase> {
  if (purchase.status !== "pending") return purchase;

  if (purchase.expires_at && new Date(purchase.expires_at) < new Date()) {
    const { data } = await admin
      .from("purchases")
      .update({ status: "expired" })
      .eq("id", purchase.id)
      .select("*")
      .single();
    return data ?? purchase;
  }

  // Pre-v2-migration purchases created before this column existed have no
  // txn_id to check against — nothing to do but leave them as pending
  // until they naturally expire.
  if (!purchase.pakasir_txn_id) return purchase;

  try {
    const detail = await getPakasirTransactionStatus(purchase.pakasir_txn_id);

    if (detail.status === purchase.status) return purchase;

    // v2 spells it "canceled" (one L); our own status column has used
    // "cancelled" (two L) since before this migration — normalize here
    // rather than touching every other place that reads purchase.status.
    const nextStatus =
      detail.status === "completed"
        ? "completed"
        : detail.status === "canceled"
        ? "cancelled"
        : purchase.status;

    if (nextStatus === purchase.status) return purchase;

    const { data } = await admin
      .from("purchases")
      .update({
        status: nextStatus,
        completed_at: detail.completed_at ?? null,
      })
      .eq("id", purchase.id)
      .select("*")
      .single();

    if (nextStatus === "completed" && data) {
      await admin.rpc("decrement_script_stock", { p_script_id: data.script_id });
      await sendPurchaseConfirmation(admin, data);
    }

    return data ?? purchase;
  } catch {
    // Pakasir unreachable or transaction not found yet — leave as pending,
    // the next poll or the webhook will catch it.
    return purchase;
  }
}
