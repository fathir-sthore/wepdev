import { Flame, Sparkles, Star, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/queries/scripts";
import { getActiveBanners } from "@/lib/queries/banners";
import { getUserDashboardSections } from "@/lib/queries/dashboard";
import { Hero } from "@/components/public/hero";
import { StatsBar } from "@/components/public/stats-bar";
import { CategoryGrid } from "@/components/public/category-grid";
import { ScriptSection } from "@/components/public/script-section";
import { BannerSlider } from "@/components/dashboard-home/banner-slider";
import { Faq } from "@/components/public/faq";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, banners, sections, statsRes, usersRes, codeRes] = await Promise.all([
    getCategories(supabase),
    getActiveBanners(supabase),
    getUserDashboardSections(supabase, user?.id ?? null),
    supabase.from("scripts").select("download_count").eq("status", "published"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("code_snippets").select("id", { count: "exact", head: true }).eq("status", "published"),
  ]);

  const totalDownloads = (statsRes.data ?? []).reduce(
    (sum, row) => sum + (row.download_count ?? 0),
    0
  );

  return (
    <>
      <Hero />
      <BannerSlider banners={banners} />
      <StatsBar
        totalScripts={(statsRes.data ?? []).length}
        totalDownloads={totalDownloads}
        totalUsers={usersRes.count ?? 0}
        totalCode={codeRes.count ?? 0}
      />

      <ScriptSection
        title="Trending"
        icon={<Flame size={18} className="text-danger" />}
        scripts={sections.trending}
        viewAllHref="/search?sort=popular"
        hot
      />
      <ScriptSection
        title="New Release"
        icon={<Sparkles size={18} className="text-signal" />}
        scripts={sections.newRelease}
        viewAllHref="/search?sort=newest"
      />
      <ScriptSection
        title="Most Downloaded"
        icon={<Star size={18} className="text-accent" />}
        scripts={sections.mostDownloaded}
        viewAllHref="/search?sort=downloads"
      />
      <ScriptSection
        title="Recommended"
        icon={<Heart size={18} className="text-danger" />}
        scripts={sections.recommended}
        viewAllHref="/search"
      />

      <CategoryGrid categories={categories} />
      <Faq />
    </>
  );
}
