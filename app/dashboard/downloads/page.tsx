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
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

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
          {downloads.map((dl) => (
            <Card key={dl.id}>
              <CardContent className="flex items-center justify-between">
                <span className="font-data text-sm text-text">
                  script #{dl.script_id.slice(0, 8)}
                </span>
                <span className="font-data text-xs text-muted">
                  {new Date(dl.created_at).toLocaleString()}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
