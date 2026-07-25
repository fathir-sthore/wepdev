"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Database } from "@/types/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function Filters({
  categories,
  languages,
  frameworks,
}: {
  categories: Category[];
  languages: string[];
  frameworks: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectClass =
    "h-9 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent";

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className={selectClass}
        value={searchParams.get("category") ?? ""}
        onChange={(e) => setParam("category", e.target.value)}
      >
        <option value="">all categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("language") ?? ""}
        onChange={(e) => setParam("language", e.target.value)}
      >
        <option value="">all languages</option>
        {languages.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("framework") ?? ""}
        onChange={(e) => setParam("framework", e.target.value)}
      >
        <option value="">all frameworks</option>
        {frameworks.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={searchParams.get("pricing") ?? ""}
        onChange={(e) => setParam("pricing", e.target.value)}
      >
        <option value="">free & premium</option>
        <option value="free">free only</option>
        <option value="premium">premium only</option>
      </select>

      <select
        className={selectClass}
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => setParam("sort", e.target.value)}
      >
        <option value="newest">terbaru</option>
        <option value="popular">populer</option>
        <option value="downloads">download terbanyak</option>
        <option value="az">a-z</option>
      </select>
    </div>
  );
}
