import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Supabase = SupabaseClient<Database>;

export async function getActiveBanners(supabase: Supabase) {
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getBannerById(supabase: Supabase, id: string) {
  const { data } = await supabase.from("banners").select("*").eq("id", id).maybeSingle();
  return data;
}
