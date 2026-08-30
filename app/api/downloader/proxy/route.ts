import { NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * Browsers only honor the <a download> attribute for same-origin URLs.
 * TikTok/YouTube media lives on a different origin, so without this proxy
 * the browser just opens the file in a new tab instead of saving it.
 * Streaming it through our own domain with Content-Disposition: attachment
 * fixes that — same trick every real downloader site uses.
 */
const ALLOWED_HOST_SUFFIXES = [
  "tikwm.com",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokv.com",
  "tiktokv.us",
  "muscdn.com",
  "ibytedtos.com",
  "ibyteimg.com",
  "googlevideo.com",
];

function isAllowedHost(hostname: string) {
  return ALLOWED_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");
  const filename = searchParams.get("filename") || "download";

  if (!target) {
    return NextResponse.json({ ok: false, error: "Parameter url wajib diisi" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ ok: false, error: "URL tidak valid" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" || !isAllowedHost(parsed.hostname)) {
    return NextResponse.json({ ok: false, error: "Sumber file tidak diizinkan" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FathirCodeDownloader/1.0)" },
      signal: AbortSignal.timeout(50_000),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Gagal mengambil file dari sumber" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ ok: false, error: "File tidak dapat diakses" }, { status: 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);
  headers.set("Content-Disposition", `attachment; filename="${sanitizeFilename(filename)}"`);
  headers.set("Cache-Control", "no-store");

  return new Response(upstream.body, { headers });
}

function sanitizeFilename(name: string) {
  return name.replace(/[\\/:*?"<>|\r\n]+/g, "").trim().slice(0, 100) || "download";
}
