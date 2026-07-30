import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://fathirsthore.my.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: scripts }, { data: categories }, { data: snippets }] = await Promise.all([
    supabase.from("scripts").select("slug, updated_at").eq("status", "published"),
    supabase.from("categories").select("id, sort_order"),
    supabase.from("code_snippets").select("slug, updated_at").eq("status", "published"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/code`, changeFrequency: "daily", priority: 0.7 },
  ];

  const scriptRoutes: MetadataRoute.Sitemap = (scripts ?? []).map((s) => ({
    url: `${SITE_URL}/script/${s.slug}`,
    lastModified: s.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const snippetRoutes: MetadataRoute.Sitemap = (snippets ?? []).map((s) => ({
    url: `${SITE_URL}/code/${s.slug}`,
    lastModified: s.updated_at,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/search?category=${c.id}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...scriptRoutes, ...snippetRoutes, ...categoryRoutes];
}
