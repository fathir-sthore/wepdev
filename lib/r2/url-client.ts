/** Client-safe equivalent of lib/r2/service.ts's getPublicUrl — used right
 * after a client-side upload completes, before the page has a chance to
 * re-fetch server-rendered data. Reads only the NEXT_PUBLIC_ variant since
 * this file may be imported from Client Components. */
export function r2PublicUrlClient(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}
