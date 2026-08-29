"use client";

import { useState } from "react";
import Image from "next/image";
import { Music2, Youtube, Download, Loader2, Link2, Clock, User2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Platform = "tiktok" | "youtube" | "spotify";

type TikTokData = {
  title: string;
  cover: string;
  author: { name: string; avatar: string };
  duration: number;
  video: string;
  videoWatermarked: string;
  audio: string;
  isImageSlide: boolean;
  images: string[];
};

type YouTubeData = {
  title: string;
  thumbnail: string;
  author: string;
  durationSeconds: number;
  video: { url: string; quality: string; container: string } | null;
  audio: { url: string; container: string; bitrate: number } | null;
};

type SpotifyData = {
  title: string;
  artist: string;
  cover: string;
  audio: { url: string; container: string; bitrate: number };
  matchedYoutubeTitle: string;
};

type ResultState =
  | { platform: "tiktok"; data: TikTokData }
  | { platform: "youtube"; data: YouTubeData }
  | { platform: "spotify"; data: SpotifyData };

const PLATFORMS: { id: Platform; label: string; icon: typeof Music2; placeholder: string }[] = [
  {
    id: "tiktok",
    label: "TikTok",
    icon: Link2,
    placeholder: "https://www.tiktok.com/@user/video/...",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://www.youtube.com/watch?v=...",
  },
  {
    id: "spotify",
    label: "Spotify",
    icon: Music2,
    placeholder: "https://open.spotify.com/track/...",
  },
];

function formatDuration(seconds: number) {
  if (!seconds || Number.isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DownloaderPanel() {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  const active = PLATFORMS.find((p) => p.id === platform)!;

  function switchPlatform(next: Platform) {
    setPlatform(next);
    setUrl("");
    setError(null);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/downloader/${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Gagal memproses link, coba lagi.");
        return;
      }

      setResult({ platform, data: json.data } as ResultState);
    } catch {
      setError("Gagal terhubung ke server, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Platform tabs — Spotify-style pill segmented control */}
      <div className="flex gap-2 mb-6">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const isActive = p.id === platform;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => switchPlatform(p.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-data transition-colors border",
                isActive
                  ? "bg-accent text-ink border-accent"
                  : "bg-panel text-muted border-line hover:text-text hover:border-accent/50"
              )}
            >
              <Icon size={16} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={active.placeholder}
          className="flex-1 h-12"
          inputMode="url"
        />
        <Button type="submit" size="lg" disabled={loading || !url.trim()} className="sm:w-40">
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Proses"}
        </Button>
      </form>

      {error && (
        <div className="mb-8 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-line bg-panel p-5 flex gap-4 animate-pulse">
          <div className="h-28 w-28 rounded-md bg-panel2 shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 w-3/4 rounded bg-panel2" />
            <div className="h-3 w-1/2 rounded bg-panel2" />
            <div className="h-8 w-32 rounded bg-panel2 mt-4" />
          </div>
        </div>
      )}

      {!loading && result && <ResultCard result={result} />}
    </div>
  );
}

function ResultCard({ result }: { result: ResultState }) {
  if (result.platform === "tiktok") return <TikTokResult data={result.data} />;
  if (result.platform === "youtube") return <YouTubeResult data={result.data} />;
  return <SpotifyResult data={result.data} />;
}

/** Shared "now playing" shell — square cover art + info, Spotify-inspired. */
function MediaCard({
  cover,
  title,
  subtitle,
  meta,
  children,
}: {
  cover: string;
  title: string;
  subtitle: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-md overflow-hidden bg-panel2">
          {cover ? (
            <Image src={cover} alt={title} fill sizes="128px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <Music2 size={28} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-title text-lg text-text truncate">{title}</h2>
          <p className="flex items-center gap-1.5 text-sm text-muted mt-1 truncate">
            <User2 size={13} className="shrink-0" />
            {subtitle}
          </p>
          {meta && (
            <p className="flex items-center gap-1.5 text-xs text-muted mt-1">
              <Clock size={12} className="shrink-0" />
              {meta}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DownloadButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} download target="_blank" rel="noopener noreferrer">
      <Button size="sm" className="gap-1.5">
        <Download size={14} />
        {label}
      </Button>
    </a>
  );
}

function TikTokResult({ data }: { data: TikTokData }) {
  return (
    <MediaCard
      cover={data.cover}
      title={data.title || "TikTok Video"}
      subtitle={data.author.name}
      meta={formatDuration(data.duration)}
    >
      {data.isImageSlide ? (
        data.images.map((img, i) => (
          <DownloadButton key={img} href={img} label={`Gambar ${i + 1}`} />
        ))
      ) : (
        <>
          {data.video && <DownloadButton href={data.video} label="Video (No Watermark)" />}
          {data.audio && <DownloadButton href={data.audio} label="Audio" />}
        </>
      )}
    </MediaCard>
  );
}

function YouTubeResult({ data }: { data: YouTubeData }) {
  return (
    <MediaCard
      cover={data.thumbnail}
      title={data.title}
      subtitle={data.author}
      meta={formatDuration(data.durationSeconds)}
    >
      {data.video && (
        <DownloadButton
          href={data.video.url}
          label={`Video ${data.video.quality} (.${data.video.container})`}
        />
      )}
      {data.audio && (
        <DownloadButton href={data.audio.url} label={`Audio (.${data.audio.container})`} />
      )}
    </MediaCard>
  );
}

function SpotifyResult({ data }: { data: SpotifyData }) {
  return (
    <>
      <MediaCard cover={data.cover} title={data.title} subtitle={data.artist}>
        <DownloadButton href={data.audio.url} label={`Audio (.${data.audio.container})`} />
      </MediaCard>
      <p className="mt-3 text-xs text-muted">
        Spotify tidak menyediakan file audio untuk diunduh secara langsung — audio di atas diambil
        dari YouTube yang paling cocok dengan lagu ini:{" "}
        <span className="text-text">&quot;{data.matchedYoutubeTitle}&quot;</span>.
      </p>
    </>
  );
}
