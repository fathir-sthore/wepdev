import "server-only";

/**
 * YouTube downloader — proxied through api.siputzx.my.id's public
 * "savefrom" endpoint (free, no API key), which itself automates
 * SaveFrom.net server-side. Source (open source, verified before use):
 * https://github.com/siputzx/apisku/blob/master/router/downloader/saveform.ts
 *
 * Why not talk to YouTube directly (as an earlier version of this file
 * did, via youtubei.js): YouTube's anti-bot measures against datacenter
 * IPs (which is exactly what Vercel serverless functions are) escalated
 * hard in 2026 and now block/interstitial a large share of requests
 * regardless of client type or session freshness — a problem affecting
 * yt-dlp and every other cloud-hosted extractor industry-wide, not
 * something fixable by tweaking our own request. SaveFrom.net's own
 * servers have a much better IP/session reputation with YouTube, so
 * proxying through their already-solved extraction is far more reliable
 * than re-solving the same anti-bot problem ourselves.
 */

const SAVEFROM_ENDPOINT = "https://api.siputzx.my.id/api/d/savefrom";

export class YouTubeDownloadError extends Error {}

type SaveFromItem = {
  title?: string;
  platform?: string;
  type?: "video" | "audio" | "image" | "unknown";
  format?: string;
  url?: string;
  thumb?: string | null;
  quality?: string | null;
};

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/live/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export type YouTubeResult = {
  title: string;
  thumbnail: string;
  video: { url: string; quality: string; container: string } | null;
  audio: { url: string; container: string; bitrate: number } | null;
};

const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "avi", "mkv", "3gp", "flv"];
const AUDIO_EXTENSIONS = ["mp3", "m4a", "aac", "wav", "ogg", "opus", "weba"];

function guessKind(item: SaveFromItem): "video" | "audio" | "other" {
  if (item.type === "video") return "video";
  if (item.type === "audio") return "audio";

  // The upstream classifier falls back to type "unknown" whenever the
  // scraped format string doesn't match its own hardcoded extension list —
  // the link itself is still perfectly valid, so widen the net ourselves
  // using both the declared format and the URL's file extension.
  const format = (item.format || "").toLowerCase();
  const urlExt = (item.url?.split("?")[0].split(".").pop() || "").toLowerCase();

  if (VIDEO_EXTENSIONS.includes(format) || VIDEO_EXTENSIONS.includes(urlExt)) return "video";
  if (AUDIO_EXTENSIONS.includes(format) || AUDIO_EXTENSIONS.includes(urlExt)) return "audio";
  return "other";
}

/** Highest-quality item first — parses a leading number out of "720p", "1080", etc. */
function pickBest(items: SaveFromItem[]): SaveFromItem | null {
  const withUrl = items.filter((i) => i.url);
  if (withUrl.length === 0) return null;
  return [...withUrl].sort((a, b) => {
    const qa = parseInt(a.quality || "0", 10) || 0;
    const qb = parseInt(b.quality || "0", 10) || 0;
    return qb - qa;
  })[0];
}

export async function downloadYouTube(input: string): Promise<YouTubeResult> {
  const videoId = extractVideoId(input);
  if (!videoId) {
    throw new YouTubeDownloadError("URL bukan link YouTube yang valid");
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const endpoint = `${SAVEFROM_ENDPOINT}?url=${encodeURIComponent(canonicalUrl)}`;

  let res: Response;
  try {
    // The upstream scraper drives a headless browser on its own end, so
    // it's genuinely slower than a direct API call — give it real room.
    res = await fetch(endpoint, { signal: AbortSignal.timeout(55_000) });
  } catch {
    throw new YouTubeDownloadError("Gagal terhubung ke layanan pengunduh, coba lagi sebentar lagi");
  }

  if (!res.ok) {
    throw new YouTubeDownloadError(`Layanan pengunduh merespons ${res.status}`);
  }

  const json = await res.json();

  if (!json.status || !Array.isArray(json.data) || json.data.length === 0) {
    throw new YouTubeDownloadError(
      json.error || "Video tidak ditemukan, bersifat privat, atau tidak bisa diproses"
    );
  }

  const items: SaveFromItem[] = json.data;
  const bestVideo = pickBest(items.filter((i) => guessKind(i) === "video"));
  const bestAudio = pickBest(items.filter((i) => guessKind(i) === "audio"));

  if (!bestVideo && !bestAudio) {
    console.error(
      "[downloader/youtube] no video/audio match after fallback, raw items:",
      JSON.stringify(items).slice(0, 2000)
    );
    throw new YouTubeDownloadError("Tidak ada format yang bisa diunduh untuk video ini");
  }

  return {
    title: items[0]?.title || "YouTube Video",
    thumbnail: items[0]?.thumb || "",
    video: bestVideo
      ? {
          url: bestVideo.url!,
          quality: bestVideo.quality || "unknown",
          container: bestVideo.format || "mp4",
        }
      : null,
    audio: bestAudio
      ? { url: bestAudio.url!, container: bestAudio.format || "mp3", bitrate: 0 }
      : null,
  };
}
