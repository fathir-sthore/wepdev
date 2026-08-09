import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Purchases — Dashboard" };

const statusColor: Record<string, string> = {
  pending: "text-accent",
  completed: "text-signal",
  failed: "text-danger",
  expired: "text-muted",
  cancelled: "text-muted",
};

export default async function PurchasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id, order_id, amount, total_payment, status, created_at, completed_at, script_id")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const scriptIds = [...new Set((purchases ?? []).map((p) => p.script_id))];
  const { data: scripts } = scriptIds.length
    ? await supabase.from("scripts").select("id, slug, title").in("id", scriptIds)
    : { data: [] };
  const scriptMap = new Map((scripts ?? []).map((s) => [s.id, s]));

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir purchases --list</p>
      <h1 className="text-title text-2xl text-text mb-6">Purchases</h1>

      {!purchases || purchases.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted font-data">
            no purchases yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {purchases.map((p) => {
            const script = scriptMap.get(p.script_id);
            return (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={script ? `/script/${script.slug}` : "#"}
                      className="font-mono text-sm text-text hover:text-accent truncate"
                    >
                      {script?.title ?? "script no longer available"}
                    </Link>
                    <p className="font-data text-[11px] text-muted mt-1">
                      {p.order_id} · Rp {(p.total_payment ?? p.amount).toLocaleString("id-ID")} ·{" "}
                      {new Date(p.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`font-data text-xs uppercase shrink-0 ${statusColor[p.status]}`}>
                    {p.status}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
