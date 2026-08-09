import Link from "next/link";
import { Eye, Code2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RatingStars } from "@/components/public/rating-stars";
import { LANGUAGE_LABELS, type DetectedLanguage } from "@/lib/detect-language";
import { formatCount } from "@/lib/storage";
import type { SnippetWithAuthor } from "@/lib/queries/code-snippets";

export function SnippetCard({ snippet }: { snippet: SnippetWithAuthor }) {
  return (
    <Link href={`/code/${snippet.slug}`} className="group block">
      <Card className="h-full flex flex-col p-4 transition-colors group-hover:border-accent/50">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 rounded border border-line px-2 py-0.5 font-data text-[11px] text-signal">
            <Code2 size={11} />
            {LANGUAGE_LABELS[snippet.language as DetectedLanguage] ?? snippet.language}
          </span>
          <span className="flex items-center gap-1 font-data text-[11px] text-muted">
            <Eye size={11} /> {formatCount(snippet.view_count)}
          </span>
        </div>
        <h3 className="text-title text-sm text-text line-clamp-1 mb-1">{snippet.title}</h3>
        {snippet.description && (
          <p className="text-xs text-muted line-clamp-2 flex-1">{snippet.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-line">
          <span className="font-data text-[11px] text-muted">@{snippet.author?.username ?? "unknown"}</span>
          <RatingStars rating={snippet.rating_avg} count={snippet.rating_count} size={11} />
        </div>
      </Card>
    </Link>
  );
}
