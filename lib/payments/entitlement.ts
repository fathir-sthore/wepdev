import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Supabase = SupabaseClient<Database>;

export async function hasCompletedPurchase(supabase: Supabase, userId: string, scriptId: string) {
  const { data } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("script_id", scriptId)
    .eq("status", "completed")
    .maybeSingle();
  return !!data;
}

export async function getPendingPurchase(supabase: Supabase, userId: string, scriptId: string) {
  const { data } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("script_id", scriptId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
