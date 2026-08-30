import { NextResponse } from "next/server";
import { downloadYouTube, YouTubeDownloadError } from "@/lib/downloader/youtube";
import { getClientIp, hashIp } from "@/lib/ip";
import { isRateLimited } from "@/lib/downloader/rate-limit";

export const maxDuration = 60;

export async function POST(request: Request) {
  const ip = hashIp(getClientIp(request));
  if (isRateLimited(`youtube:${ip}`)) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak permintaan, coba lagi sebentar lagi" },
      { status: 429 }
    );
  }

  let url: string | undefined;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    return NextResponse.json({ ok: false, error: "Body request tidak valid" }, { status: 400 });
  }

  if (!url || typeof url !== "string") {
    return NextResponse.json({ ok: false, error: "URL wajib diisi" }, { status: 400 });
  }

  try {
    const result = await downloadYouTube(url);
    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    console.error("[downloader/youtube]", err);
    const message =
      err instanceof YouTubeDownloadError
        ? err.message
        : "Gagal memproses video, coba lagi sebentar lagi";
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }
}
