import { createClient } from "@/lib/supabase/server";
import { getUserVpsOrders } from "@/lib/queries/vps";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { VpsCredentials } from "@/components/dashboard/vps-credentials";
import { Server } from "lucide-react";

export const metadata = { title: "VPS Saya — Dashboard" };

const statusColor: Record<string, string> = {
  pending: "text-accent",
  completed: "text-free",
  failed: "text-danger",
  expired: "text-muted",
  cancelled: "text-muted",
};

const statusLabel: Record<string, string> = {
  pending: "Menunggu pembayaran",
  completed: "Aktif",
  failed: "Gagal",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
};

export default async function VpsOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const orders = await getUserVpsOrders(user!.id);

  return (
    <div>
      <h1 className="text-title text-2xl text-text mb-6">VPS Saya</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={Server}
          title="Belum ada VPS"
          description="VPS yang kamu beli bakal muncul di sini beserta kredensial loginnya."
          actionLabel="Lihat Panel & Hosting"
          actionHref="/panel-hosting"
        />
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent>
                <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                  <p className="text-sm font-medium text-text">
                    {order.stock?.title ?? "VPS tidak ditemukan"}
                  </p>
                  <span className={`text-xs shrink-0 ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>
                <p className="text-xs text-muted mb-3">
                  {order.order_id} · Rp {(order.total_payment ?? order.amount).toLocaleString("id-ID")} ·{" "}
                  {new Date(order.created_at).toLocaleString("id-ID")}
                </p>

                {order.status === "completed" && order.stock?.ip_address && (
                  <VpsCredentials
                    ipAddress={order.stock.ip_address}
                    port={order.stock.port ?? 22}
                    username={order.stock.username ?? ""}
                    password={order.stock.password ?? ""}
                    meta={`${order.stock.provider_type} · ${order.stock.os} · ${order.stock.cpu_cores} core · ${order.stock.ram_gb} GB RAM · ${order.stock.disk_gb} GB Disk`}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
