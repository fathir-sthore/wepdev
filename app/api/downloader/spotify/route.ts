import { NextResponse } from "next/server";
import { downloadSpotifyTrack, SpotifyDownloadError } from "@/lib/downloader/spotify";
import { getClientIp, hashIp } from "@/lib/ip";
import { isRateLimited } from "@/lib/downloader/rate-limit";

export const maxDuration = 30;

export async function POST(request: Request) {
  const ip = hashIp(getClientIp(request));
  if (isRateLimited(`spotify:${ip}`)) {
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
    const result = await downloadSpotifyTrack(url);
    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    console.error("[downloader/spotify]", err);
    const message =
      err instanceof SpotifyDownloadError
        ? err.message
        : "Gagal memproses lagu, coba lagi sebentar lagi";
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }
}
