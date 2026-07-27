import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { attachRelationsExport } from "@/lib/queries/scripts";

type Supabase = SupabaseClient<Database>;

const SECTION_LIMIT = 8;

export async function getUserDashboardSections(supabase: Supabase, userId: string) {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [trendingIds, newReleaseRes, mostDownloadedRes, favCategoriesRes] = await Promise.all([
    // Trending = scripts with the most view events in the last 14 days
    // (a real "hot right now" signal, distinct from all-time download_count).
    supabase
      .from("views")
      .select("script_id")
      .gte("created_at", fourteenDaysAgo.toISOString()),
    supabase
      .from("scripts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(SECTION_LIMIT),
    supabase
      .from("scripts")
      .select("*")
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(SECTION_LIMIT),
    supabase
      .from("favorites")
      .select("script_id")
      .eq("user_id", userId)
      .limit(20),
  ]);

  // Tally recent views per script, take the top N.
  const viewCounts = new Map<string, number>();
  for (const row of trendingIds.data ?? []) {
    viewCounts.set(row.script_id, (viewCounts.get(row.script_id) ?? 0) + 1);
  }
  const topTrendingIds = [...viewCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, SECTION_LIMIT)
    .map(([id]) => id);

  const trendingRes = topTrendingIds.length
    ? await supabase.from("scripts").select("*").in("id", topTrendingIds).eq("status", "published")
    : { data: [] };
  // Preserve trending rank order (the .in() query doesn't guarantee it).
  const trendingSorted = topTrendingIds
    .map((id) => (trendingRes.data ?? []).find((s) => s.id === id))
    .filter(Boolean) as NonNullable<(typeof trendingRes.data)>[number][];

  // Recommended: published scripts in categories the user has favorited
  // before, excluding ones already favorited. Falls back to popular picks
  // for users with no favorites yet (new accounts).
  let recommendedRaw: Database["public"]["Tables"]["scripts"]["Row"][] = [];
  const favoriteScriptIds = (favCategoriesRes.data ?? []).map((f) => f.script_id);

  if (favoriteScriptIds.length > 0) {
    const { data: favoritedScripts } = await supabase
      .from("scripts")
      .select("category_id")
      .in("id", favoriteScriptIds);
    const categoryIds = [...new Set((favoritedScripts ?? []).map((s) => s.category_id).filter(Boolean))] as string[];

    if (categoryIds.length > 0) {
      const { data } = await supabase
        .from("scripts")
        .select("*")
        .eq("status", "published")
        .in("category_id", categoryIds)
        .not("id", "in", `(${favoriteScriptIds.join(",")})`)
        .order("rating_avg", { ascending: false })
        .limit(SECTION_LIMIT);
      recommendedRaw = data ?? [];
    }
  }

  if (recommendedRaw.length === 0) {
    const { data } = await supabase
      .from("scripts")
      .select("*")
      .eq("status", "published")
      .order("rating_avg", { ascending: false })
      .order("rating_count", { ascending: false })
      .limit(SECTION_LIMIT);
    recommendedRaw = data ?? [];
  }

  const [trending, newRelease, mostDownloaded, recommended] = await Promise.all([
    attachRelationsExport(supabase, trendingSorted),
    attachRelationsExport(supabase, newReleaseRes.data ?? []),
    attachRelationsExport(supabase, mostDownloadedRes.data ?? []),
    attachRelationsExport(supabase, recommendedRaw),
  ]);

  return { trending, newRelease, mostDownloaded, recommended };
}
