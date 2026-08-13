import Link from "next/link";
import Image from "next/image";
import { Eye, Code2, User, FileCode2 } from "lucide-react";
import { RatingStars } from "@/components/public/rating-stars";
import { LANGUAGE_LABELS, type DetectedLanguage } from "@/lib/detect-language";
import { formatCount } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { SnippetWithAuthor } from "@/lib/queries/code-snippets";

export function SnippetCard({ snippet }: { snippet: SnippetWithAuthor }) {
  return (
    <Link href={`/code/${snippet.slug}`} className="group block">
      <div className="h-full flex flex-col p-4 rounded-lg border border-line bg-panel2 transition-colors group-hover:border-accent/50">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 rounded border border-line px-2 py-0.5 font-data text-[11px] text-signal">
            <Code2 size={11} />
            {LANGUAGE_LABELS[snippet.language as DetectedLanguage] ?? snippet.language}
          </span>
          <span className="rounded-full border border-free/40 bg-ink px-2 py-0.5 font-data text-[10px] text-free">
            FREE
          </span>
        </div>

        <h3 className="text-title text-sm text-text line-clamp-1 mb-1">{snippet.title}</h3>
        {snippet.description && (
          <p className="text-desc text-xs text-muted line-clamp-2 flex-1">{snippet.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-line">
          <div className="flex items-center gap-1.5 text-muted">
            {snippet.author?.avatar_url ? (
              <Image
                src={snippet.author.avatar_url}
                alt={snippet.author.username}
                width={14}
                height={14}
                className="rounded-full object-cover"
              />
            ) : (
              <User size={12} />
            )}
            <span className="font-data text-[11px] truncate">
              @{snippet.author?.username ?? "unknown"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted">
            <RatingStars rating={snippet.rating_avg} count={snippet.rating_count} size={11} />
            <span className="flex items-center gap-1 font-data text-[11px]">
              <Eye size={11} /> {formatCount(snippet.view_count)}
            </span>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 flex items-center justify-center gap-1.5 rounded-md py-1.5",
            "font-data text-[11px] font-medium border border-accent/30 text-accent",
            "group-hover:bg-accent/10 transition-colors"
          )}
        >
          <FileCode2 size={12} /> Lihat kode
        </div>
      </div>
    </Link>
  );
}
