import { NextResponse } from "next/server";
import { downloadTikTok, TikTokDownloadError } from "@/lib/downloader/tiktok";
import { getClientIp, hashIp } from "@/lib/ip";
import { isRateLimited } from "@/lib/downloader/rate-limit";

export async function POST(request: Request) {
  const ip = hashIp(getClientIp(request));
  if (isRateLimited(`tiktok:${ip}`)) {
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
    const result = await downloadTikTok(url);
    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    const message =
      err instanceof TikTokDownloadError
        ? err.message
        : "Gagal memproses video, coba lagi sebentar lagi";
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }
}
