import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site-url";

/**
 * Sitemap generator. Deliberately conservative per Google's own sitemap
 * guidance (https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap):
 * - Only canonical, absolute URLs the site actually wants indexed.
 * - No ?query-param filtered views (e.g. /search?category=x) — those are
 *   filtered listings of /search, not distinct indexable pages, and
 *   including them risks duplicate/thin-content signals.
 * - No changeFrequency/priority — Google has stated for years it ignores
 *   both, so they're just noise in the output.
 * - lastModified only set when the DB value is a real, valid, non-future
 *   date — a future timestamp would misrepresent freshness to crawlers.
 * - Any Supabase failure is caught and logged, never allowed to throw and
 *   fail the whole sitemap route — worst case we fall back to the static
 *   routes instead of returning nothing at all.
 * - Cached for 1 hour (revalidate) so this doesn't hit the database on
 *   every single crawl request.
 */
export const revalidate = 3600;

/** Returns a Date only if `value` parses to a real, valid date that isn't
 * in the future; otherwise undefined so we simply omit lastModified rather
 * than emit a garbage or misleading value. */
function safeDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  if (d.getTime() > Date.now()) return undefined;
  return d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL },
    { url: `${SITE_URL}/search` },
    { url: `${SITE_URL}/code` },
  ];

  try {
    const supabase = await createClient();

    const [scriptsRes, snippetsRes] = await Promise.all([
      supabase.from("scripts").select("slug, updated_at").eq("status", "published"),
      supabase.from("code_snippets").select("slug, updated_at").eq("status", "published"),
    ]);

    if (scriptsRes.error) {
      console.error("[sitemap] failed to load scripts:", scriptsRes.error.message);
    }
    if (snippetsRes.error) {
      console.error("[sitemap] failed to load code_snippets:", snippetsRes.error.message);
    }

    const scriptRoutes: MetadataRoute.Sitemap = (scriptsRes.data ?? []).map((s) => ({
      url: `${SITE_URL}/script/${s.slug}`,
      lastModified: safeDate(s.updated_at),
    }));

    const snippetRoutes: MetadataRoute.Sitemap = (snippetsRes.data ?? []).map((s) => ({
      url: `${SITE_URL}/code/${s.slug}`,
      lastModified: safeDate(s.updated_at),
    }));

    return [...staticRoutes, ...scriptRoutes, ...snippetRoutes];
  } catch (err) {
    // Never let a DB/network hiccup take down the entire sitemap — Google
    // (and our own users) are better served by a partial-but-valid sitemap
    // than a hard failure on every crawl attempt.
    console.error("[sitemap] unexpected error, falling back to static routes only:", err);
    return staticRoutes;
  }
}
