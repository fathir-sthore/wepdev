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
