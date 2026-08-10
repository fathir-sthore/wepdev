import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Supabase = SupabaseClient<Database>;

export async function getMyScripts(supabase: Supabase, developerId: string) {
  const { data } = await supabase
    .from("scripts")
    .select("*")
    .eq("developer_id", developerId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getMyScriptById(supabase: Supabase, id: string, developerId: string) {
  const { data } = await supabase
    .from("scripts")
    .select("*")
    .eq("id", id)
    .eq("developer_id", developerId)
    .maybeSingle();

  if (!data) return null;

  const { data: tagRows } = await supabase
    .from("script_tags")
    .select("tag:tags(name)")
    .eq("script_id", id);

  const tags = (tagRows ?? []).map((t: any) => t.tag?.name).filter(Boolean);
  return { ...data, tags: tags as string[] };
}

export type DeveloperStats = {
  totalScripts: number;
  totalDownloads: number;
  totalViews: number;
  totalRevenue: number;
  topScripts: { title: string; download_count: number }[];
};

/**
 * Summary widget stats for a developer's own scripts — upload count,
 * cumulative downloads/views, and revenue from completed purchases on
 * their premium scripts. Used by the "My scripts" dashboard widget.
 */
export async function getDeveloperStats(
  supabase: Supabase,
  developerId: string
): Promise<DeveloperStats> {
  const { data: scripts } = await supabase
    .from("scripts")
    .select("id, title, download_count, view_count, is_premium")
    .eq("developer_id", developerId);

  const myScripts = scripts ?? [];
  const totalScripts = myScripts.length;
  const totalDownloads = myScripts.reduce((sum, s) => sum + (s.download_count ?? 0), 0);
  const totalViews = myScripts.reduce((sum, s) => sum + (s.view_count ?? 0), 0);
  const topScripts = [...myScripts]
    .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0))
    .slice(0, 5)
    .map((s) => ({ title: s.title, download_count: s.download_count ?? 0 }));

  const scriptIds = myScripts.filter((s) => s.is_premium).map((s) => s.id);
  let totalRevenue = 0;
  if (scriptIds.length > 0) {
    const { data: purchases } = await supabase
      .from("purchases")
      .select("amount")
      .in("script_id", scriptIds)
      .eq("status", "completed");
    totalRevenue = (purchases ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);
  }

  return { totalScripts, totalDownloads, totalViews, totalRevenue, topScripts };
}
