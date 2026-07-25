import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1 py-8 font-data text-xs">
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-muted px-1">…</span>}
          <Link
            href={buildHref(p)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border border-line",
              p === page ? "bg-accent text-ink border-accent" : "text-muted hover:text-text"
            )}
          >
            {p}
          </Link>
        </span>
      ))}
    </div>
  );
}
