/**
 * Single source of truth for the production site URL. Every place that
 * used to hardcode "https://fathirsthore.my.id" now imports SITE_URL from
 * here instead — set NEXT_PUBLIC_SITE_URL once (env var) and it propagates
 * everywhere (metadata, sitemap, emails, OAuth/reset redirects, webhooks).
 *
 * NEXT_PUBLIC_ prefix is required because a few client components need this
 * at runtime in the browser (e.g. building a URL right after upload). The
 * fallback matches the current production domain so nothing breaks if the
 * env var isn't set yet.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fathirsthore.my.id").replace(/\/$/, "");
