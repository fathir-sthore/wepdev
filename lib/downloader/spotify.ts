import "server-only";

/**
 * Spotify downloader — proxied through spotyloader.com's public
 * track-conversion API (free, no API key). Undocumented (no public API
 * reference exists — it's a consumer-facing website, not a documented
 * API product), so the response shape below is inferred from a working
 * request/response sample rather than an official spec. Diagnostic
 * logging is kept on any unexpected shape so a future break is easy to
 * diagnose instead of failing silently.
 *
 * Spotify itself has no public API for downloading audio (tracks are
 * DRM-protected) — spotyloader.com has already solved the practical
 * side of this, so we proxy through their solved extraction rather than
 * re-solving it ourselves via a YouTube search-and-match fallback.
 *
 * Flow: POST a job -> poll its status until "ready" -> read the result.
 */

const CREATE_ENDPOINT = "https://spotyloader.com/api/spotify/track";
const STATUS_ENDPOINT = "https://spotyloader.com/api/spotify/track/status";
const REQUEST_HEADERS = {
  "content-type": "application/json",
  origin: "https://spotyloader.com",
  referer: "https://spotyloader.com/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
};

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

/** The exact field names in the "ready" payload aren't documented anywhere
 * public, so we check a handful of plausible keys instead of assuming one.
 * `exclude` filters out values we know are never a real file link — e.g.
 * some payloads echo the original Spotify URL back under a generic "url"
 * key, which isn't a download link at all. */
function pickString(obj: Record<string, unknown>, keys: string[], exclude?: (v: string) => boolean): string | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.length > 0 && !(exclude && exclude(val))) return val;
  }
  return undefined;
}

function isSpotifyLink(v: string) {
  return v.includes("open.spotify.com") || v.includes("spotify.link");
}

export async function downloadSpotifyTrack(url: string): Promise<SpotifyResult> {
  const trimmed = url.trim();
  if (!isSpotifyTrackUrl(trimmed)) {
    throw new SpotifyDownloadError("URL bukan link lagu (track) Spotify yang valid");
  }

  let jobId: string;
  try {
    const createRes = await fetch(CREATE_ENDPOINT, {
      method: "POST",
      headers: REQUEST_HEADERS,
      body: JSON.stringify({ url: trimmed, format: "mp3" }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!createRes.ok) {
      throw new SpotifyDownloadError(`Layanan pengunduh merespons ${createRes.status}`);
    }

    const createJson = await createRes.json();
    jobId = createJson?.jobId;
    if (!jobId) {
      console.error("[downloader/spotify] no jobId in create response:", JSON.stringify(createJson).slice(0, 500));
      throw new SpotifyDownloadError("Gagal membuat tugas konversi");
    }
  } catch (err) {
    if (err instanceof SpotifyDownloadError) throw err;
    throw new SpotifyDownloadError("Gagal terhubung ke layanan pengunduh, coba lagi sebentar lagi");
  }

  // The job runs async server-side — poll until it flips to "ready"
  // instead of checking once immediately (which would usually still show
  // "processing"). ~20 attempts x 1.5s covers slow conversions without
  // blowing past Vercel's function timeout.
  const MAX_ATTEMPTS = 20;
  const POLL_INTERVAL_MS = 1500;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    let statusJson: Record<string, unknown>;
    try {
      const statusRes = await fetch(`${STATUS_ENDPOINT}/${jobId}`, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(15_000),
      });
      if (!statusRes.ok) continue; // transient — keep polling until MAX_ATTEMPTS
      statusJson = await statusRes.json();
    } catch {
      continue;
    }

    const status = statusJson?.status;
    if (status === "error" || status === "failed") {
      console.error("[downloader/spotify] job failed:", JSON.stringify(statusJson).slice(0, 500));
      throw new SpotifyDownloadError("Gagal mengonversi lagu ini");
    }
    if (status !== "ready") continue;

    const post = statusJson?.post as Record<string, unknown> | undefined;
    if (!post) {
      console.error("[downloader/spotify] ready but no post payload:", JSON.stringify(statusJson).slice(0, 500));
      throw new SpotifyDownloadError("Gagal mendapatkan info lagu");
    }

    // Always logged (not just on failure) — the payload shape is
    // undocumented, so this is how we confirm/refine the field names below
    // whenever the upstream service changes something.
    console.log("[downloader/spotify] post payload:", JSON.stringify(post).slice(0, 800));

    // More specific keys first; generic "url" goes last since some
    // payloads reuse it to echo the original Spotify link rather than a
    // download link. Any candidate that IS a Spotify link is rejected
    // outright, regardless of which key it came from.
    const audioUrl = pickString(
      post,
      ["downloadUrl", "download_url", "mp3Url", "audioUrl", "file", "link", "mp3", "audio", "url"],
      isSpotifyLink
    );
    if (!audioUrl) {
      console.error("[downloader/spotify] no usable download url in post payload:", JSON.stringify(post).slice(0, 800));
      throw new SpotifyDownloadError("Audio untuk lagu ini tidak tersedia saat ini");
    }

    return {
      title: pickString(post, ["title", "songTitle", "name"]) || "Unknown Track",
      artist: pickString(post, ["artist", "artists", "author"]) || "Unknown Artist",
      cover: pickString(post, ["cover", "coverImage", "image", "thumbnail"]) || "",
      audio: { url: audioUrl, container: "mp3", bitrate: 0 },
    };
  }

  throw new SpotifyDownloadError("Konversi lagu memakan waktu terlalu lama, coba lagi");
}
