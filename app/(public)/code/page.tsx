import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { searchSnippets, getDistinctLanguages } from "@/lib/queries/code-snippets";
import { SnippetCard } from "@/components/code/snippet-card";
import { SnippetFilters } from "@/components/code/snippet-filters";
import { Pagination } from "@/components/public/pagination";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FileCode2 } from "lucide-react";

export const metadata = {
  title: "Source Code — Fathir Code",
  description:
    "Jelajahi kumpulan source code dan snippet dari developer: JavaScript, Python, dan bahasa lainnya, gratis untuk digunakan.",
  alternates: { canonical: "/code" },
};

type Props = {
  searchParams: Promise<{ q?: string; language?: string; sort?: string; page?: string }>;
};

export default async function CodePage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ snippets, total, page, pageSize }, languages] = await Promise.all([
    searchSnippets(supabase, {
      q: params.q,
      language: params.language,
      sort: params.sort as "newest" | "popular" | "rating" | undefined,
      page: params.page ? parseInt(params.page, 10) : 1,
    }),
    getDistinctLanguages(supabase),
  ]);

  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.language) sp.set("language", params.language);
    if (params.sort) sp.set("sort", params.sort);
    sp.set("page", String(p));
    return `/code?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="font-data text-xs text-signal mb-2">$ fathir code --browse</p>
          <h1 className="text-title text-2xl text-text">Source Code</h1>
          <p className="text-sm text-muted mt-1">
            Snippet kode dari user & admin — JS, Python, JSON, Dart, Shell, HTML.
          </p>
        </div>
        <Link href="/dashboard/code/new">
          <Button>upload kode</Button>
        </Link>
      </div>

      <div className="mb-6">
        <SnippetFilters languages={languages} />
      </div>

      <p className="font-data text-xs text-muted mb-4">{total} kode ditemukan</p>

      {snippets.length === 0 ? (
        <EmptyState
          icon={FileCode2}
          title="Belum ada kode di sini"
          description="Jadi yang pertama upload snippet buat kategori/bahasa ini."
          actionLabel="Upload kode"
          actionHref="/dashboard/code/new"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {snippets.map((s) => (
            <SnippetCard key={s.id} snippet={s} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={Math.ceil(total / pageSize)} buildHref={buildHref} />
    </div>
  );
}
