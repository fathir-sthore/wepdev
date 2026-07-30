import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Supabase = SupabaseClient<Database>;
type ScriptRow = Database["public"]["Tables"]["scripts"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ScriptWithRelations = ScriptRow & {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  developer: Pick<ProfileRow, "id" | "username" | "avatar_url"> | null;
  tags: string[];
};

/**
 * PostgREST embeds (scripts(*, category:categories(*))) aren't typed against
 * our hand-written Database type (we don't declare Relationships), so instead
 * we batch-fetch categories/developers/tags by id and merge in JS. One extra
 * round trip per list, fully type-safe either way.
 */
export async function attachRelationsExport(
  supabase: Supabase,
  scripts: ScriptRow[]
): Promise<ScriptWithRelations[]> {
  return attachRelations(supabase, scripts);
}

async function attachRelations(
  supabase: Supabase,
  scripts: ScriptRow[]
): Promise<ScriptWithRelations[]> {
  if (scripts.length === 0) return [];

  const categoryIds = [...new Set(scripts.map((s) => s.category_id).filter(Boolean))] as string[];
  const developerIds = [...new Set(scripts.map((s) => s.developer_id))];
  const scriptIds = scripts.map((s) => s.id);

  const [categoriesRes, developersRes, tagsRes] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id, name, slug").in("id", categoryIds)
      : Promise.resolve({ data: [] as CategoryRow[] }),
    supabase.from("profiles").select("id, username, avatar_url").in("id", developerIds),
    supabase
      .from("script_tags")
      .select("script_id, tag:tags(name)")
      .in("script_id", scriptIds),
  ]);

  const categoryMap = new Map((categoriesRes.data ?? []).map((c: any) => [c.id, c]));
  const developerMap = new Map((developersRes.data ?? []).map((d: any) => [d.id, d]));
  const tagsByScript = new Map<string, string[]>();
  for (const row of (tagsRes.data ?? []) as any[]) {
    const list = tagsByScript.get(row.script_id) ?? [];
    if (row.tag?.name) list.push(row.tag.name);
    tagsByScript.set(row.script_id, list);
  }

  return scripts.map((s) => ({
    ...s,
    category: s.category_id ? categoryMap.get(s.category_id) ?? null : null,
    developer: developerMap.get(s.developer_id) ?? null,
    tags: tagsByScript.get(s.id) ?? [],
  }));
}

export async function getCategories(supabase: Supabase) {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getHomeSections(supabase: Supabase) {
  const [trendingRes, popularRes, newestRes, categories, statsRes] = await Promise.all([
    supabase
      .from("scripts")
      .select("*")
      .eq("status", "published")
      .order("download_count", { ascending: false })
      .limit(8),
    supabase
      .from("scripts")
      .select("*")
      .eq("status", "published")
      .order("rating_avg", { ascending: false })
      .order("rating_count", { ascending: false })
      .limit(8),
    supabase
      .from("scripts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(8),
    getCategories(supabase),
    supabase.from("scripts").select("download_count").eq("status", "published"),
  ]);

  const totalDownloads = (statsRes.data ?? []).reduce(
    (sum: number, row: any) => sum + (row.download_count ?? 0),
    0
  );

  const [trending, popular, newest] = await Promise.all([
    attachRelations(supabase, trendingRes.data ?? []),
    attachRelations(supabase, popularRes.data ?? []),
    attachRelations(supabase, newestRes.data ?? []),
  ]);

  return {
    trending,
    popular,
    newest,
    categories,
    stats: {
      totalScripts: (statsRes.data ?? []).length,
      totalDownloads,
    },
  };
}

export type SearchParams = {
  q?: string;
  category?: string;
  language?: string;
  framework?: string;
  developer?: string;
  minRating?: number;
  pricing?: "free" | "premium";
  sort?: "newest" | "popular" | "downloads" | "az";
  page?: number;
};

const PAGE_SIZE = 12;

export async function searchScripts(supabase: Supabase, params: SearchParams) {
  let query = supabase.from("scripts").select("*", { count: "exact" }).eq("status", "published");

  if (params.q?.trim()) {
    query = query.textSearch("search_vector", params.q.trim(), {
      type: "websearch",
      config: "simple",
    });
  }
  if (params.category) {
    query = query.eq("category_id", params.category);
  }
  if (params.language) {
    query = query.eq("programming_language", params.language);
  }
  if (params.framework) {
    query = query.eq("framework", params.framework);
  }
  if (params.developer) {
    query = query.eq("developer_id", params.developer);
  }
  if (params.minRating) {
    query = query.gte("rating_avg", params.minRating);
  }
  if (params.pricing === "free") {
    query = query.eq("is_premium", false);
  } else if (params.pricing === "premium") {
    query = query.eq("is_premium", true);
  }

  switch (params.sort) {
    case "downloads":
      query = query.order("download_count", { ascending: false });
      break;
    case "popular":
      query = query.order("rating_avg", { ascending: false });
      break;
    case "az":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);

  const scripts = await attachRelations(supabase, data ?? []);

  return { scripts, total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function getScriptBySlug(supabase: Supabase, slug: string) {
  const { data } = await supabase
    .from("scripts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;

  const [withRelations] = await attachRelations(supabase, [data]);
  return withRelations;
}

export async function getReviews(supabase: Supabase, scriptId: string) {
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("script_id", scriptId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!reviews || reviews.length === 0) return [];

  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  return reviews.map((r) => ({ ...r, author: profileMap.get(r.user_id) ?? null }));
}

export async function getDistinctFilterValues(supabase: Supabase) {
  const { data } = await supabase
    .from("scripts")
    .select("programming_language, framework, developer_id")
    .eq("status", "published");

  const languages = [...new Set((data ?? []).map((s) => s.programming_language).filter(Boolean))] as string[];
  const frameworks = [...new Set((data ?? []).map((s) => s.framework).filter(Boolean))] as string[];
  const developerIds = [...new Set((data ?? []).map((s) => s.developer_id))];

  const { data: developerProfiles } = developerIds.length
    ? await supabase.from("profiles").select("id, username").in("id", developerIds)
    : { data: [] };

  return {
    languages,
    frameworks,
    developers: (developerProfiles ?? []).sort((a, b) => a.username.localeCompare(b.username)),
  };
}
