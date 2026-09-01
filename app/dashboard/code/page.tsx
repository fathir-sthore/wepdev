import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMySnippets } from "@/lib/queries/code-snippets";
import { LANGUAGE_LABELS, type DetectedLanguage } from "@/lib/detect-language";
import { formatCount } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteSnippetButton } from "@/components/code/delete-snippet-button";

export const metadata = { title: "Kode Saya — Dashboard" };

export default async function MyCodePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const snippets = await getMySnippets(supabase, user!.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-title text-2xl text-text">Kode Saya</h1>
        </div>
        <Link href="/dashboard/code/new">
          <Button>upload kode baru</Button>
        </Link>
      </div>

      {snippets.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted font-data">
            kamu belum upload kode apapun.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {snippets.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-text truncate">{s.title}</span>
                    <span className="font-data text-[11px] text-signal">
                      {LANGUAGE_LABELS[s.language as DetectedLanguage] ?? s.language}
                    </span>
                  </div>
                  <p className="font-data text-[11px] text-muted mt-1">
                    {formatCount(s.view_count)} views · rating {s.rating_avg.toFixed(1)} ({s.rating_count})
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/code/${s.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">lihat</Button>
                  </Link>
                  <Link href={`/dashboard/code/${s.id}/edit`}>
                    <Button variant="outline" size="sm">edit</Button>
                  </Link>
                  <DeleteSnippetButton snippetId={s.id} title={s.title} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
