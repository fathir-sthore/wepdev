import "server-only";

/**
 * Spotify downloader — proxied through api.siputzx.my.id's public
 * "spotifyv2" endpoint (free, no API key), which automates Spotimate.io
 * server-side (including solving its Cloudflare Turnstile challenge).
 * Source (open source, verified before use):
 * https://github.com/siputzx/apisku/blob/master/router/downloader/spotifyv2.ts
 *
 * Spotify itself has no public API for downloading audio (tracks are
 * DRM-protected) — Spotimate.io has already solved the practical side of
 * this (matching + fetching playable audio for a given track), so we
 * proxy through their solved extraction rather than re-solving it
 * ourselves via a YouTube search-and-match fallback.
 */

const SPOTIFY_ENDPOINT = "https://api.siputzx.my.id/api/d/spotifyv2";
const SPOTIMATE_ORIGIN = "https://spotimate.io";

export class SpotifyDownloadError extends Error {}

function isSpotifyTrackUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return (host === "open.spotify.com" && u.pathname.startsWith("/track/")) || host === "spotify.link";
  } catch {
    return false;
  }
}

export type SpotifyResult = {
  title: string;
  artist: string;
  cover: string;
  audio: { url: string; container: string; bitrate: number };
};

export async function downloadSpotifyTrack(url: string): Promise<SpotifyResult> {
  const trimmed = url.trim();
  if (!isSpotifyTrackUrl(trimmed)) {
    throw new SpotifyDownloadError("URL bukan link lagu (track) Spotify yang valid");
  }

  const endpoint = `${SPOTIFY_ENDPOINT}?url=${encodeURIComponent(trimmed)}`;

  let res: Response;
  try {
    res = await fetch(endpoint, { signal: AbortSignal.timeout(55_000) });
  } catch {
    throw new SpotifyDownloadError("Gagal terhubung ke layanan pengunduh, coba lagi sebentar lagi");
  }

  if (!res.ok) {
    throw new SpotifyDownloadError(`Layanan pengunduh merespons ${res.status}`);
  }

  const json = await res.json();

  if (!json.status || !json.data) {
    throw new SpotifyDownloadError(json.error || "Lagu tidak ditemukan");
  }

  const d = json.data as {
    songTitle?: string;
    title?: string;
    artist?: string;
    coverImage?: string;
    mp3DownloadLink?: string | null;
  };

  if (!d.mp3DownloadLink) {
    throw new SpotifyDownloadError("Audio untuk lagu ini tidak tersedia saat ini");
  }

  const audioUrl = d.mp3DownloadLink.startsWith("http")
    ? d.mp3DownloadLink
    : `${SPOTIMATE_ORIGIN}${d.mp3DownloadLink}`;

  return {
    title: d.songTitle || d.title || "Unknown Track",
    artist: d.artist || "Unknown Artist",
    cover: d.coverImage || "",
    audio: { url: audioUrl, container: "mp3", bitrate: 0 },
  };
}
