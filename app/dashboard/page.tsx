import { Flame, Sparkles, Star, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveBanners } from "@/lib/queries/banners";
import { getUserDashboardSections } from "@/lib/queries/dashboard";
import { getCategories } from "@/lib/queries/scripts";
import { BannerSlider } from "@/components/dashboard-home/banner-slider";
import { ScriptSection } from "@/components/public/script-section";
import { CategoryGrid } from "@/components/public/category-grid";

export const metadata = { title: "Dashboard" };

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [banners, sections, categories] = await Promise.all([
    getActiveBanners(supabase),
    getUserDashboardSections(supabase, user!.id),
    getCategories(supabase),
  ]);

  return (
    <div className="-m-6 md:-m-10 pb-6">
      <BannerSlider banners={banners} />

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
    </div>
  );
}
