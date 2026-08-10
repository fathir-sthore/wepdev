import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyScripts, getDeveloperStats } from "@/lib/queries/developer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/storage";
import { DeleteScriptButton } from "@/components/dashboard/delete-script-button";
import { DeveloperStatsWidget } from "@/components/dashboard/developer-stats-widget";
import { EmptyState } from "@/components/ui/empty-state";
import { Upload } from "lucide-react";

export const metadata = { title: "My Scripts — Dashboard" };

const statusColor: Record<string, string> = {
  draft: "text-muted",
  published: "text-signal",
  archived: "text-danger",
};

export default async function MyScriptsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [scripts, stats] = await Promise.all([
    getMyScripts(supabase, user!.id),
    getDeveloperStats(supabase, user!.id),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-data text-xs text-signal mb-2">$ fathir scripts --mine</p>
          <h1 className="text-title text-2xl text-text">My scripts</h1>
        </div>
        <Link href="/dashboard/scripts/new">
          <Button>upload new</Button>
        </Link>
      </div>

      <DeveloperStatsWidget stats={stats} />

      {scripts.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="Belum ada script"
          description="Upload script pertama kamu dan mulai jual/bagikan ke developer lain."
          actionLabel="Upload script"
          actionHref="/dashboard/scripts/new"
        />
      ) : (
        <div className="grid gap-3">
          {scripts.map((script) => (
            <Card key={script.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-text truncate">{script.title}</span>
                    <span className={`font-data text-[11px] uppercase ${statusColor[script.status]}`}>
                      {script.status}
                    </span>
                  </div>
                  <p className="font-data text-[11px] text-muted mt-1">
                    v{script.version} · {formatCount(script.download_count)} downloads ·{" "}
                    {formatCount(script.view_count)} views · rating {script.rating_avg.toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {script.status === "published" && (
                    <Link href={`/script/${script.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">view</Button>
                    </Link>
                  )}
                  <Link href={`/dashboard/scripts/${script.id}/edit`}>
                    <Button variant="outline" size="sm">edit</Button>
                  </Link>
                  <DeleteScriptButton
                    scriptId={script.id}
                    title={script.title}
                    fileKeys={[script.file_path, script.thumbnail_path, script.documentation_path, ...script.screenshot_paths]}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
