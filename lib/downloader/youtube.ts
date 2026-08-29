import "server-only";
import { Innertube } from "youtubei.js";

/**
 * YouTube downloader — powered by youtubei.js (InnerTube client library).
 * Docs: https://ytjs.dev — talks directly to YouTube's own internal API,
 * no third-party middleman, no API key. Actively maintained (successor to
 * the now-unmaintained ytdl-core / @distube/ytdl-core forks).
 */

let clientPromise: Promise<Innertube> | null = null;

function getClient() {
  if (!clientPromise) {
    clientPromise = Innertube.create({ lang: "id", location: "ID" });
  }
  return clientPromise;
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
  const yt = await getClient();

  let info;
  try {
    info = await yt.getInfo(videoId);
  } catch (err) {
    throw new YouTubeDownloadError(
      err instanceof Error ? err.message : "Video tidak ditemukan atau bersifat privat"
    );
  }

  if (info.basic_info.is_live) {
    throw new YouTubeDownloadError("Video sedang live — tidak bisa diunduh");
  }

  // Progressive (muxed video+audio) format — simplest reliable single-file
  // download, no ffmpeg merge needed. YouTube caps progressive at 720p.
  // chooseFormat throws (rather than returning null) when nothing matches,
  // so each attempt is isolated — a missing video format shouldn't also
  // kill the audio-only fallback, and vice versa.
  const videoFormat = tryChooseFormat(info, { type: "video+audio", quality: "best" });
  const audioFormat = tryChooseFormat(info, { type: "audio", quality: "best" });

  const player = yt.session.player;

  const video = videoFormat
    ? {
        url: await videoFormat.decipher(player),
        quality: videoFormat.quality_label || "unknown",
        container: videoFormat.mime_type?.split(";")[0].split("/")[1] || "mp4",
      }
    : null;

  const audio = audioFormat
    ? {
        url: await audioFormat.decipher(player),
        container: audioFormat.mime_type?.split(";")[0].split("/")[1] || "m4a",
        bitrate: audioFormat.bitrate || 0,
      }
    : null;

  if (!video && !audio) {
    throw new YouTubeDownloadError("Tidak ada format yang bisa diunduh untuk video ini");
  }

  return {
    id: videoId,
    title: info.basic_info.title || "YouTube Video",
    thumbnail: info.basic_info.thumbnail?.[0]?.url || "",
    author: info.basic_info.author || "unknown",
    durationSeconds: info.basic_info.duration || 0,
    video,
    audio,
  };
}

/** Used by the Spotify fallback: find the best-matching YouTube video for a track. */
export async function searchYouTubeBestMatch(query: string): Promise<{ id: string; title: string } | null> {
  const yt = await getClient();
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
