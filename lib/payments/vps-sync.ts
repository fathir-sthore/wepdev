import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getPakasirTransactionStatus } from "@/lib/payments/pakasir";

type Supabase = SupabaseClient<Database>;
type VpsOrder = Database["public"]["Tables"]["vps_orders"]["Row"];

/**
 * Mirrors lib/payments/sync.ts's syncPurchaseStatus, plus VPS-specific
 * stock lifecycle: a completed order marks its unit 'sold' (so it drops
 * out of the public listing for good), while a cancelled/expired one
 * releases the reservation back to 'available' via release_vps_stock()
 * so the unit can be sold to someone else.
 */
export async function syncVpsOrderStatus(admin: Supabase, order: VpsOrder): Promise<VpsOrder> {
  if (order.status !== "pending") return order;

  if (order.expires_at && new Date(order.expires_at) < new Date()) {
    await admin.from("vps_orders").update({ status: "expired" }).eq("id", order.id);
    await admin.rpc("release_vps_stock", { p_stock_id: order.vps_stock_id });
    return { ...order, status: "expired" };
  }

  if (!order.pakasir_txn_id) return order;

  try {
    const detail = await getPakasirTransactionStatus(order.pakasir_txn_id);
    if (detail.status === order.status) return order;

    const nextStatus =
      detail.status === "completed" ? "completed" : detail.status === "canceled" ? "cancelled" : order.status;

    if (nextStatus === order.status) return order;

    const { data: updated } = await admin
      .from("vps_orders")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "completed" ? detail.completed_at : null,
      })
      .eq("id", order.id)
      .select()
      .single();

    if (nextStatus === "completed") {
      await admin.from("vps_stock").update({ status: "sold" }).eq("id", order.vps_stock_id);
    } else if (nextStatus === "cancelled") {
      await admin.rpc("release_vps_stock", { p_stock_id: order.vps_stock_id });
    }

    return updated ?? order;
  } catch (err) {
    console.error("[vps-sync] status check failed for", order.id, err);
    return order;
  }
}
