"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LANGUAGE_LABELS } from "@/lib/detect-language";

export function SnippetFilters({ languages }: { languages: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "h-9 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent";

  return (
    <div className="flex flex-wrap gap-2">
      <select className={selectClass} value={searchParams.get("language") ?? ""} onChange={(e) => setParam("language", e.target.value)}>
        <option value="">semua bahasa</option>
        {languages.map((l) => (
          <option key={l} value={l}>{LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS] ?? l}</option>
        ))}
      </select>
      <select className={selectClass} value={searchParams.get("sort") ?? "newest"} onChange={(e) => setParam("sort", e.target.value)}>
        <option value="newest">terbaru</option>
        <option value="popular">paling banyak dilihat</option>
        <option value="rating">rating tertinggi</option>
      </select>
    </div>
  );
}
