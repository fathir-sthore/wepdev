import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSnippetBySlug, getSnippetComments } from "@/lib/queries/code-snippets";
import { LANGUAGE_LABELS, type DetectedLanguage } from "@/lib/detect-language";
import { formatCount } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/public/rating-stars";
import { ShareButtons } from "@/components/public/share-buttons";
import { CodeBlock } from "@/components/code/code-block";
import { CommentForm } from "@/components/code/comment-form";
import { CommentList } from "@/components/code/comment-list";
import { ReportSnippetDialog } from "@/components/code/report-snippet-dialog";
import { SnippetViewTracker } from "@/components/code/snippet-view-tracker";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const snippet = await getSnippetBySlug(supabase, slug);
  if (!snippet) return { title: "Kode tidak ditemukan — Fathir Code" };
  return {
    title: `${snippet.title} — Fathir Code`,
    description: snippet.description ?? `Kode ${LANGUAGE_LABELS[snippet.language as DetectedLanguage] ?? snippet.language} oleh @${snippet.author?.username}`,
  };
}

export default async function SnippetDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const snippet = await getSnippetBySlug(supabase, slug);

  if (!snippet) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const comments = await getSnippetComments(supabase, snippet.id);
  const isOwner = user?.id === snippet.user_id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SnippetViewTracker snippetId={snippet.id} />

      <p className="font-data text-xs text-muted mb-4">
        <Link href="/" className="hover:text-accent">home</Link>
        {" / "}
        <Link href="/code" className="hover:text-accent">source code</Link>
        {" / "}
        <span className="text-text">{snippet.title}</span>
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 min-w-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-title text-2xl text-text">{snippet.title}</h1>
              {isOwner && (
                <Link href={`/dashboard/code/${snippet.id}/edit`}>
                  <Button variant="outline" size="sm"><Pencil size={13} /> edit</Button>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={snippet.rating_avg} count={snippet.rating_count} />
              <span className="flex items-center gap-1 font-data text-xs text-muted">
                <Eye size={12} /> {formatCount(snippet.view_count)}
              </span>
              <span className="rounded border border-line px-2 py-0.5 font-data text-[11px] text-signal">
                {LANGUAGE_LABELS[snippet.language as DetectedLanguage] ?? snippet.language}
              </span>
            </div>
            {snippet.description && (
              <p className="text-sm text-muted whitespace-pre-line">{snippet.description}</p>
            )}
          </div>

          <CodeBlock content={snippet.content} language={snippet.language} fileName={snippet.file_name} />

          <div>
            <h2 className="text-title text-lg text-text mb-4">Komentar &amp; Rating ({snippet.rating_count})</h2>
            <div className="mb-6">
              <CommentForm snippetId={snippet.id} userId={user?.id ?? null} />
            </div>
            <CommentList comments={comments} />
          </div>
        </div>

        <div className="space-y-4 md:sticky md:top-20 md:self-start">
          <Card>
            <CardContent className="flex items-center gap-3">
              <Avatar src={snippet.author?.avatar_url} alt={snippet.author?.username ?? "u"} fallback={snippet.author?.username ?? "u"} size={40} />
              <div>
                <p className="font-mono text-sm text-text">@{snippet.author?.username ?? "unknown"}</p>
                <p className="font-data text-[11px] text-muted">
                  {new Date(snippet.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <ShareButtons title={snippet.title} />
              {!isOwner && (
                <div className="pt-2 border-t border-line">
                  <ReportSnippetDialog snippetId={snippet.id} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
