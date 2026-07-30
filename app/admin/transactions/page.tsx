import { DollarSign, Receipt, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTransactionStats, getAllTransactions } from "@/lib/queries/admin-transactions";
import { StatCard } from "@/components/admin/stat-card";
import { TrendChart } from "@/components/admin/trend-chart";
import { TransactionsTable } from "@/components/admin/transactions-table";
import { TransactionExportButtons } from "@/components/admin/transaction-export-buttons";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { Pagination } from "@/components/public/pagination";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatCount } from "@/lib/storage";

export const metadata = { title: "Transaksi — Admin" };

type Props = { searchParams: Promise<{ status?: string; page?: string }> };

export default async function AdminTransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const [stats, { transactions, total, page, pageSize }] = await Promise.all([
    getTransactionStats(supabase),
    getAllTransactions(supabase, {
      status: params.status as "pending" | "completed" | "failed" | "expired" | "cancelled" | undefined,
      page: params.page ? parseInt(params.page, 10) : 1,
    }),
  ]);

  const statuses = ["", "pending", "completed", "failed", "expired", "cancelled"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="font-data text-xs text-signal mb-2">$ fathir admin --transactions</p>
          <h1 className="font-mono text-2xl text-text">Transaksi &amp; Pendapatan</h1>
        </div>
        <TransactionExportButtons />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="total pendapatan" value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`} icon={DollarSign} />
        <StatCard label="transaksi selesai" value={formatCount(stats.totalTransactions)} icon={Receipt} />
        <StatCard label="pending" value={formatCount(stats.pendingCount)} icon={Clock} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Pendapatan harian — 30 hari terakhir</p>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.dailyRevenue} color="#33E0C2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Pendapatan bulanan — 12 bulan terakhir</p>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.monthlyRevenue} color="#F2B33D" />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">Script terlaris</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.bestSellingScripts.length === 0 && (
              <p className="font-data text-xs text-muted">belum ada penjualan.</p>
            )}
            {stats.bestSellingScripts.map((s, i) => (
              <div key={s.script?.id ?? i} className="flex items-center justify-between font-data text-xs">
                <span className="text-text truncate">{i + 1}. {s.script?.title ?? "script dihapus"}</span>
                <span className="text-muted shrink-0">{s.count}x · Rp {s.revenue.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-mono text-sm text-text">User teraktif</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.mostActiveUsers.length === 0 && (
              <p className="font-data text-xs text-muted">belum ada pembelian.</p>
            )}
            {stats.mostActiveUsers.map((u, i) => (
              <div key={u.user?.id ?? i} className="flex items-center gap-3">
                <Avatar src={u.user?.avatar_url} alt={u.user?.username ?? "u"} fallback={u.user?.username ?? "u"} size={24} />
                <span className="font-data text-xs text-text flex-1 truncate">@{u.user?.username ?? "user dihapus"}</span>
                <span className="font-data text-xs text-muted shrink-0">{u.count}x · Rp {u.spent.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <h2 className="font-mono text-lg text-text mb-4">Riwayat transaksi</h2>
      <div className="flex gap-2 mb-6">
        {statuses.map((s) => (
          <a
            key={s || "all"}
            href={s ? `/${ADMIN_BASE_PATH}/transactions?status=${s}` : `/${ADMIN_BASE_PATH}/transactions`}
            className={`rounded-md border px-3 py-1 font-data text-xs ${
              (params.status ?? "") === s
                ? "border-accent text-accent"
                : "border-line text-muted hover:text-text"
            }`}
          >
            {s || "all"}
          </a>
        ))}
      </div>

      <TransactionsTable transactions={transactions} />

      <Pagination
        page={page}
        totalPages={Math.ceil(total / pageSize)}
        buildHref={(p) => `/${ADMIN_BASE_PATH}/transactions?${params.status ? `status=${params.status}&` : ""}page=${p}`}
      />
    </div>
  );
}
