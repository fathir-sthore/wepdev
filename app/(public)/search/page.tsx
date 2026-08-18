import { createClient } from "@/lib/supabase/server";
import { searchScripts, getCategories, getDistinctFilterValues } from "@/lib/queries/scripts";
import { Filters } from "@/components/public/filters";
import { ScriptCard } from "@/components/public/script-card";
import { Pagination } from "@/components/public/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchX } from "lucide-react";

export const metadata = {
  title: "Browse scripts — Fathir Code",
  description:
    "Cari dan unduh script Telegram bot, WhatsApp bot, aplikasi Flutter, panel, dan source code developer lainnya di Fathir Code.",
  alternates: { canonical: "/search" },
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    language?: string;
    framework?: string;
    developer?: string;
    minRating?: string;
    pricing?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ scripts, total, page, pageSize }, categories, { languages, frameworks, developers }] =
    await Promise.all([
      searchScripts(supabase, {
        q: params.q,
        category: params.category,
        language: params.language,
        framework: params.framework,
        developer: params.developer,
        minRating: params.minRating ? parseFloat(params.minRating) : undefined,
        pricing: params.pricing as "free" | "premium" | undefined,
        sort: params.sort as "newest" | "popular" | "downloads" | "az" | undefined,
        page: params.page ? parseInt(params.page, 10) : 1,
      }),
      getCategories(supabase),
      getDistinctFilterValues(supabase),
    ]);

  const totalPages = Math.ceil(total / pageSize);

  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.language) sp.set("language", params.language);
    if (params.framework) sp.set("framework", params.framework);
    if (params.developer) sp.set("developer", params.developer);
    if (params.minRating) sp.set("minRating", params.minRating);
    if (params.pricing) sp.set("pricing", params.pricing);
    if (params.sort) sp.set("sort", params.sort);
    sp.set("page", String(p));
    return `/search?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <p className="font-data text-xs text-signal mb-2">
        $ fathir search{params.q ? ` --query "${params.q}"` : ""}
      </p>
      <h1 className="text-title text-2xl text-text mb-6">
        {params.q ? `Results for "${params.q}"` : "Browse all scripts"}
      </h1>

      <div className="mb-6">
        <Filters categories={categories} languages={languages} frameworks={frameworks} developers={developers} />
      </div>

      <p className="font-data text-xs text-muted mb-4">{total} script(s) found</p>

      {scripts.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nggak ada script yang cocok"
          description="Coba ubah kata kunci atau filter kategori/bahasa yang kamu pakai."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
