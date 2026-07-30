import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Supabase = SupabaseClient<Database>;
type SnippetRow = Database["public"]["Tables"]["code_snippets"]["Row"];

export type SnippetWithAuthor = SnippetRow & {
  author: { id: string; username: string; avatar_url: string | null } | null;
};

async function attachAuthors(supabase: Supabase, snippets: SnippetRow[]): Promise<SnippetWithAuthor[]> {
  if (snippets.length === 0) return [];
  const userIds = [...new Set(snippets.map((s) => s.user_id))];
  const { data: authors } = await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds);
  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]));
  return snippets.map((s) => ({ ...s, author: authorMap.get(s.user_id) ?? null }));
}

const PAGE_SIZE = 12;

export async function searchSnippets(
  supabase: Supabase,
  params: { q?: string; language?: string; sort?: "newest" | "popular" | "rating"; page?: number }
) {
  let query = supabase.from("code_snippets").select("*", { count: "exact" }).eq("status", "published");

  if (params.q?.trim()) {
    query = query.textSearch("search_vector", params.q.trim(), { type: "websearch", config: "simple" });
  }
  if (params.language) {
    query = query.eq("language", params.language);
  }

  switch (params.sort) {
    case "popular":
      query = query.order("view_count", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_avg", { ascending: false }).order("rating_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);

  const snippets = await attachAuthors(supabase, data ?? []);
  return { snippets, total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function getSnippetBySlug(supabase: Supabase, slug: string) {
  const { data } = await supabase
    .from("code_snippets")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;
  const [withAuthor] = await attachAuthors(supabase, [data]);
  return withAuthor;
}

export async function getSnippetComments(supabase: Supabase, snippetId: string) {
  const { data: comments } = await supabase
    .from("code_snippet_comments")
    .select("*")
    .eq("snippet_id", snippetId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!comments || comments.length === 0) return [];

  const userIds = [...new Set(comments.map((c) => c.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return comments.map((c) => ({ ...c, author: profileMap.get(c.user_id) ?? null }));
}

export async function getMySnippets(supabase: Supabase, userId: string) {
  const { data } = await supabase
    .from("code_snippets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDistinctLanguages(supabase: Supabase) {
  const { data } = await supabase.from("code_snippets").select("language").eq("status", "published");
  return [...new Set((data ?? []).map((s) => s.language))];
}
