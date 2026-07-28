import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const statusColor: Record<string, string> = {
  pending: "text-accent",
  completed: "text-signal",
  failed: "text-danger",
  expired: "text-muted",
  cancelled: "text-muted",
};

type Transaction = {
  id: string;
  order_id: string;
  amount: number;
  total_payment: number | null;
  status: string;
  created_at: string;
  script: { title: string; slug: string } | null;
  buyer: { username: string } | null;
};

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="font-data text-sm text-muted">belum ada transaksi.</p>;
  }

  return (
    <div className="grid gap-2">
      {transactions.map((t) => (
        <Card key={t.id}>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-data text-xs text-muted">{t.order_id}</span>
                <span className={`font-data text-[11px] uppercase ${statusColor[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="font-mono text-sm text-text truncate">
                {t.script ? (
                  <Link href={`/script/${t.script.slug}`} target="_blank" className="hover:text-accent">
                    {t.script.title}
                  </Link>
                ) : (
                  "script dihapus"
                )}
              </p>
              <p className="font-data text-[11px] text-muted">
                @{t.buyer?.username ?? "user dihapus"} · {new Date(t.created_at).toLocaleString("id-ID")}
              </p>
            </div>
            <span className="font-mono text-sm text-accent shrink-0">
              Rp {(t.total_payment ?? t.amount).toLocaleString("id-ID")}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
