import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { createAdminClient } from "@/lib/supabase/admin";

type Supabase = SupabaseClient<Database>;
type VpsStockRow = Database["public"]["Tables"]["vps_stock"]["Row"];

/** Public listing — safe columns only, enforced by the column GRANT
 * (not just this select list), so this is safe even if RLS/grants
 * ever drift: the DB itself refuses to hand back credentials here. */
export async function getAvailableVpsStock(supabase: Supabase) {
  const { data, error } = await supabase
    .from("vps_stock")
    .select(
      "id, title, description, provider_type, os, cpu_cores, cpu_model, ram_gb, disk_gb, price, created_at"
    )
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[vps] getAvailableVpsStock failed:", error.message);
    return [];
  }
  return data ?? [];
}

/** Admin stock list — every column, every status. Service-role only:
 * the same column GRANT that protects the public listing also blocks
 * an admin's own regular session client from reading credentials. */
export async function getAllVpsStockAdmin({ page = 1 }: { page?: number } = {}) {
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const admin = createAdminClient();

  const { data, count, error } = await admin
    .from("vps_stock")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) {
    console.error("[vps] getAllVpsStockAdmin failed:", error.message);
    return { stock: [] as VpsStockRow[], total: 0, page, pageSize };
  }
  return { stock: data ?? [], total: count ?? 0, page, pageSize };
}

/** A buyer's own orders, with the purchased unit's spec — and, only for
 * completed orders, its credentials. Always via the admin client: same
 * column-GRANT reasoning as above, plus this joins across tables which
 * the buyer's own RLS policies don't need to (and shouldn't) allow. */
export async function getUserVpsOrders(userId: string) {
  const admin = createAdminClient();

  const { data: orders, error } = await admin
    .from("vps_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[vps] getUserVpsOrders failed:", error.message);
    return [];
  }
  if (!orders || orders.length === 0) return [];

  const stockIds = [...new Set(orders.map((o) => o.vps_stock_id))];
  const { data: stockRows } = await admin.from("vps_stock").select("*").in("id", stockIds);
  const stockById = new Map((stockRows ?? []).map((s) => [s.id, s]));

  return orders.map((order) => {
    const stock = stockById.get(order.vps_stock_id);
    const revealCredentials = order.status === "completed";
    return {
      ...order,
      stock: stock
        ? {
            title: stock.title,
            provider_type: stock.provider_type,
            os: stock.os,
            cpu_cores: stock.cpu_cores,
            cpu_model: stock.cpu_model,
            ram_gb: stock.ram_gb,
            disk_gb: stock.disk_gb,
            // Only surfaced once the purchase is actually completed —
            // never leaked on a pending/failed/expired order.
            ip_address: revealCredentials ? stock.ip_address : null,
            port: revealCredentials ? stock.port : null,
            username: revealCredentials ? stock.username : null,
            password: revealCredentials ? stock.password : null,
          }
        : null,
    };
  });
}
