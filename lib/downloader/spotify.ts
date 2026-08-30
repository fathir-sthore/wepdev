import "server-only";
import { createRequire } from "module";
import { downloadYouTubeById, searchYouTubeBestMatch } from "./youtube";

/**
 * Spotify downloader — there is no official Spotify API for downloading audio
 * (tracks are DRM-protected). What every legitimate-looking "Spotify downloader"
 * actually does is:
 *   1. Read the track's public metadata (title, artist, cover) — no key needed.
 *      spotify-url-info reads this from Spotify's own oEmbed/embed page.
 *      Docs: https://www.npmjs.com/package/spotify-url-info
 *   2. Find the matching audio on YouTube and serve that.
 * This is the same approach used by spotDL, the most widely used open-source
 * Spotify downloader (https://github.com/spotDL/spotify-downloader).
 */

type SpotifyPreview = {
  title: string;
  track: string;
  artist: string;
  image?: string;
  link: string;
};

// The package's bundled .d.ts declares its CJS default export as an
// interface-only type, which trips `isolatedModules`. Load it via require
// instead of a typed ES import, and type the shape ourselves.
const require = createRequire(import.meta.url);
const spotifyUrlInfoFactory = require("spotify-url-info") as (
  fetchImpl: typeof fetch
) => { getPreview: (url: string, opts?: RequestInit) => Promise<SpotifyPreview> };

const { getPreview: fetchPreview } = spotifyUrlInfoFactory(fetch);

export class SpotifyDownloadError extends Error {}

function isSpotifyTrackUrl(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return (
      (host === "open.spotify.com" && u.pathname.startsWith("/track/")) ||
      host === "spotify.link"
    );
  } catch {
    return false;
  }
}

export type SpotifyResult = {
  title: string;
  artist: string;
  cover: string;
  spotifyUrl: string;
  audio: { url: string; container: string; bitrate: number };
  matchedYoutubeTitle: string;
};

export async function downloadSpotifyTrack(url: string): Promise<SpotifyResult> {
  const trimmed = url.trim();
  if (!isSpotifyTrackUrl(trimmed)) {
    throw new SpotifyDownloadError("URL bukan link lagu (track) Spotify yang valid");
  }

  let preview;
  try {
    preview = await fetchPreview(trimmed, {
      headers: { "user-agent": "googlebot" },
    });
  } catch (err) {
    console.error("[downloader/spotify] preview fetch failed", err);
    throw new SpotifyDownloadError("Gagal membaca metadata lagu dari Spotify");
  }

  const title = preview?.title || preview?.track;
  const artist = preview?.artist;

  if (!title) {
    throw new SpotifyDownloadError("Lagu tidak ditemukan — pastikan link mengarah ke sebuah track");
  }

  const query = artist ? `${artist} - ${title} audio` : `${title} audio`;
  const match = await searchYouTubeBestMatch(query);

  if (!match) {
    throw new SpotifyDownloadError("Tidak menemukan audio yang cocok untuk lagu ini");
  }

  const yt = await downloadYouTubeById(match.id);
  if (!yt.audio) {
    throw new SpotifyDownloadError("Audio untuk lagu ini tidak tersedia saat ini");
  }

  return {
    title,
    artist: artist || "Unknown Artist",
    cover: preview?.image || "",
    spotifyUrl: trimmed,
    audio: yt.audio,
    matchedYoutubeTitle: match.title,
  };
}
