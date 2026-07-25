import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Downloads — Dashboard" };

export default async function DashboardDownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: downloads } = await supabase
    .from("downloads")
    .select("id, created_at, script_id")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const scriptIds = [...new Set((downloads ?? []).map((d) => d.script_id))];
  const { data: scripts } = scriptIds.length
    ? await supabase.from("scripts").select("id, slug, title").in("id", scriptIds)
    : { data: [] };
  const scriptMap = new Map((scripts ?? []).map((s) => [s.id, s]));

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir downloads --history</p>
      <h1 className="font-mono text-2xl text-text mb-6">Download history</h1>

      {!downloads || downloads.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted font-data">
            no downloads yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {downloads.map((dl) => {
            const script = scriptMap.get(dl.script_id);
            return (
              <Link key={dl.id} href={script ? `/script/${script.slug}` : "#"}>
                <Card className="hover:border-accent/50 transition-colors">
                  <CardContent className="flex items-center justify-between">
                    <span className="font-mono text-sm text-text">
                      {script?.title ?? "script no longer available"}
                    </span>
                    <span className="font-data text-xs text-muted">
                      {new Date(dl.created_at).toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
