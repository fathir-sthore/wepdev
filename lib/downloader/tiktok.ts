import "server-only";

/**
 * TikTok downloader — powered by tikwm.com (free, no API key required).
 * Docs: community-verified endpoint, widely used (github.com/BOTCAHX/tiktokdl-api,
 * github.com/heilkit/tt, github.com/mehanon/tikwm).
 *
 * GET https://www.tikwm.com/api/?url={tiktokUrl}&hd=1
 */

const TIKWM_ENDPOINT = "https://www.tikwm.com/api/";

export type TikTokResult = {
  id: string;
  title: string;
  cover: string;
  author: { name: string; avatar: string };
  duration: number;
  video: string; // no-watermark, best available (hd if present)
  videoSd: string; // no-watermark, standard
  videoWatermarked: string;
  audio: string;
  isImageSlide: boolean;
  images: string[];
};

export class TikTokDownloadError extends Error {}

function isTikTokUrl(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return (
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com") ||
      host === "vt.tiktok.com" ||
      host === "vm.tiktok.com"
    );
  } catch {
    return false;
  }
}

export async function downloadTikTok(url: string): Promise<TikTokResult> {
  const trimmed = url.trim();
  if (!isTikTokUrl(trimmed)) {
    throw new TikTokDownloadError("URL bukan link TikTok yang valid");
  }

  const endpoint = `${TIKWM_ENDPOINT}?url=${encodeURIComponent(trimmed)}&hd=1`;

  const res = await fetch(endpoint, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FathirCodeDownloader/1.0)" },
    // tikwm can be slow under load — give it real room before we call it dead
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new TikTokDownloadError(`Server TikTok downloader merespons ${res.status}`);
  }

  const json = await res.json();

  if (json.code !== 0 || !json.data) {
    throw new TikTokDownloadError(json.msg || "Video tidak ditemukan atau bersifat privat");
  }

  const d = json.data;
  const images: string[] = Array.isArray(d.images) ? d.images : [];

  return {
    id: String(d.id ?? ""),
    title: d.title || "TikTok Video",
    cover: d.origin_cover || d.cover || "",
    author: {
      name: d.author?.nickname || d.author?.unique_id || "unknown",
      avatar: d.author?.avatar || "",
    },
    duration: Number(d.duration ?? 0),
    video: d.hdplay || d.play || "",
    videoSd: d.play || "",
    videoWatermarked: d.wmplay || "",
    audio: d.music || "",
    isImageSlide: images.length > 0,
    images,
  };
}
