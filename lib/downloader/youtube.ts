import "server-only";
import { Innertube } from "youtubei.js";

/**
 * YouTube downloader — powered by youtubei.js (InnerTube client library).
 * Docs: https://ytjs.dev — talks directly to YouTube's own internal API,
 * no third-party middleman, no API key. Actively maintained (successor to
 * the now-unmaintained ytdl-core / @distube/ytdl-core forks).
 */

let sharedClientPromise: Promise<Innertube> | null = null;

/** Shared session — fine for search, which hasn't shown the bot-check issue. */
function getSharedClient() {
  if (!sharedClientPromise) {
    sharedClientPromise = Innertube.create({ lang: "id", location: "ID" });
  }
  return sharedClientPromise;
}

/**
 * A fresh session per download attempt. Reusing one cached session across
 * every request on a warm serverless instance means the moment YouTube
 * flags that session's visitor data, every subsequent download on that
 * instance fails the same way until it goes cold. A new session per
 * request costs a bit of latency but avoids that shared-blast-radius
 * problem.
 */
function getFreshClient() {
  return Innertube.create({ lang: "id", location: "ID", generate_session_locally: true });
}

export class YouTubeDownloadError extends Error {}

function tryChooseFormat(
  info: Awaited<ReturnType<Innertube["getInfo"]>>,
  options: Parameters<Awaited<ReturnType<Innertube["getInfo"]>>["chooseFormat"]>[0]
) {
  try {
    return info.chooseFormat(options);
  } catch {
    return null;
  }
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  // Bare 11-char video id
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
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  durationSeconds: number;
  video: { url: string; quality: string; container: string } | null;
  audio: { url: string; container: string; bitrate: number } | null;
};

export async function downloadYouTube(input: string): Promise<YouTubeResult> {
  const videoId = extractVideoId(input);
  if (!videoId) {
    throw new YouTubeDownloadError("URL bukan link YouTube yang valid");
  }

  return downloadYouTubeById(videoId);
}

export async function downloadYouTubeById(videoId: string): Promise<YouTubeResult> {
  const yt = await getFreshClient();
  const player = yt.session.player;

  // Different InnerTube clients expose different format sets, and some
  // (WEB) increasingly get served a bot-check interstitial from
  // datacenter IPs like Vercel's, which crashes the parser outright.
  // Try a cascade until one gives us something usable — ANDROID/IOS are
  // most reliable against bot-checks but sometimes only expose
  // adaptive (video-only + audio-only) streams, not a muxed
  // video+audio file, so we keep trying further down the list until we
  // find a client that has a proper muxed format too.
  const CLIENT_CASCADE = ["ANDROID", "IOS", "TV_EMBEDDED", "MWEB", "WEB"] as const;

  let basicInfo: Awaited<ReturnType<Innertube["getInfo"]>> | null = null;
  let bestVideo: ReturnType<typeof tryChooseFormat> = null;
  let bestAudio: ReturnType<typeof tryChooseFormat> = null;
  let lastError: unknown = null;

  for (const client of CLIENT_CASCADE) {
    let info;
    try {
      info = await yt.getInfo(videoId, { client });
    } catch (err) {
      lastError = err;
      console.error(
        `[downloader/youtube] getInfo failed for client=${client}`,
        err instanceof Error ? err.message : err
      );
      continue;
    }

    if (!basicInfo) basicInfo = info;

    if (info.basic_info.is_live) {
      throw new YouTubeDownloadError("Video sedang live — tidak bisa diunduh");
    }

    if (!bestVideo) {
      const muxed = tryChooseFormat(info, { type: "video+audio", quality: "best" });
      if (muxed) bestVideo = muxed;
    }
    if (!bestAudio) {
      const audioOnly = tryChooseFormat(info, { type: "audio", quality: "best" });
      if (audioOnly) bestAudio = audioOnly;
    }

    console.log(
      `[downloader/youtube] client=${client} video=${!!bestVideo} audio=${!!bestAudio}`
    );

    // Got a full muxed file — that's the best possible outcome, stop early.
    if (bestVideo) break;
  }

  if (!basicInfo) {
    throw new YouTubeDownloadError(
      lastError instanceof Error ? lastError.message : "Video tidak ditemukan atau bersifat privat"
    );
  }

  const video = bestVideo
    ? {
        url: await bestVideo.decipher(player),
        quality: bestVideo.quality_label || "unknown",
        container: bestVideo.mime_type?.split(";")[0].split("/")[1] || "mp4",
      }
    : null;

  const audio = bestAudio
    ? {
        url: await bestAudio.decipher(player),
        container: bestAudio.mime_type?.split(";")[0].split("/")[1] || "m4a",
        bitrate: bestAudio.bitrate || 0,
      }
    : null;

  if (!video && !audio) {
    throw new YouTubeDownloadError("Tidak ada format yang bisa diunduh untuk video ini");
  }

  return {
    id: videoId,
    title: basicInfo.basic_info.title || "YouTube Video",
    thumbnail: basicInfo.basic_info.thumbnail?.[0]?.url || "",
    author: basicInfo.basic_info.author || "unknown",
    durationSeconds: basicInfo.basic_info.duration || 0,
    video,
    audio,
  };
}

/** Used by the Spotify fallback: find the best-matching YouTube video for a track. */
export async function searchYouTubeBestMatch(query: string): Promise<{ id: string; title: string } | null> {
  const yt = await getSharedClient();
  const search = await yt.search(query, { type: "video" });

  type MaybeVideo = { id?: string; video_id?: string; title?: { toString(): string } | string };
  const candidates: MaybeVideo[] =
    (search as unknown as { videos?: MaybeVideo[] }).videos ??
    (search as unknown as { results?: MaybeVideo[] }).results ??
    [];

  const first = candidates.find((c) => c?.id || c?.video_id);
  const id = first?.id || first?.video_id;
  if (!id) return null;

  const title =
    typeof first?.title === "string" ? first.title : first?.title?.toString() || query;

  return { id, title };
}
