import { createClient } from "@/lib/supabase/server";
import { getHomeSections } from "@/lib/queries/scripts";
import { Hero } from "@/components/public/hero";
import { StatsBar } from "@/components/public/stats-bar";
import { CategoryGrid } from "@/components/public/category-grid";
import { ScriptSection } from "@/components/public/script-section";
import { Faq } from "@/components/public/faq";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { trending, popular, newest, categories, stats } = await getHomeSections(supabase);

  return (
    <>
      <Hero />
      <StatsBar totalScripts={stats.totalScripts} totalDownloads={stats.totalDownloads} />
      <CategoryGrid categories={categories} />
      <ScriptSection title="Trending" scripts={trending} viewAllHref="/search?sort=downloads" />
      <ScriptSection title="Popular" scripts={popular} viewAllHref="/search?sort=popular" />
      <ScriptSection title="Newest" scripts={newest} viewAllHref="/search?sort=newest" />
      <Faq />
    </>
  );
}
