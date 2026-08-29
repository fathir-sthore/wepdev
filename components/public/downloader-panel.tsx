"use client";

import { useState } from "react";
import Image from "next/image";
import { Music2, Youtube, Download, Loader2, Link2, CheckCircle2 } from "lucide-react";
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

      const data = json.data;
      setResult({ platform, data } as ResultState);
      triggerDownload(platform, data);
    } catch {
      setError("Gagal terhubung ke server, coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function triggerAnchorDownload(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function triggerDownload(p: Platform, data: TikTokData | YouTubeData | SpotifyData) {
    if (p === "tiktok") {
      const d = data as TikTokData;
      if (d.isImageSlide) {
        // Multiple images — trigger each with a small stagger so browsers
        // don't swallow them as a popup flood.
        d.images.forEach((img, i) => {
          setTimeout(() => triggerAnchorDownload(img, `tiktok-${i + 1}.jpg`), i * 400);
        });
      } else if (d.video) {
        triggerAnchorDownload(d.video, `${slugify(d.title)}.mp4`);
      } else if (d.audio) {
        triggerAnchorDownload(d.audio, `${slugify(d.title)}.mp3`);
      }
      return;
    }

    if (p === "youtube") {
      const d = data as YouTubeData;
      if (d.video) {
        triggerAnchorDownload(d.video.url, `${slugify(d.title)}.${d.video.container}`);
      } else if (d.audio) {
        triggerAnchorDownload(d.audio.url, `${slugify(d.title)}.${d.audio.container}`);
      }
      return;
    }

    const d = data as SpotifyData;
    triggerAnchorDownload(d.audio.url, `${slugify(`${d.artist} - ${d.title}`)}.${d.audio.container}`);
  }

  function slugify(name: string) {
    return name.replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 80) || "download";
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

      {!loading && result && (
        <ResultCard result={result} onRedownload={() => triggerDownload(result.platform, result.data)} />
      )}
    </div>
  );
}

function ResultCard({
  result,
  onRedownload,
}: {
  result: ResultState;
  onRedownload: () => void;
}) {
  const { cover, title, subtitle } = getDisplayInfo(result);

  return (
    <div className="rounded-lg border border-line bg-panel p-5 flex items-center gap-4">
      <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden bg-panel2">
        {cover ? (
          <Image src={cover} alt={title} fill sizes="64px" className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <Music2 size={22} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-1.5 text-xs text-accent mb-1">
          <CheckCircle2 size={13} />
          Unduhan dimulai
        </p>
        <h2 className="text-sm font-medium text-text truncate">{title}</h2>
        <p className="text-xs text-muted truncate">{subtitle}</p>
        {result.platform === "spotify" && (
          <p className="text-[11px] text-muted mt-1">
            Diambil dari YouTube: &quot;{result.data.matchedYoutubeTitle}&quot;
          </p>
        )}
      </div>

      <Button size="sm" variant="outline" onClick={onRedownload} className="shrink-0 gap-1.5">
        <Download size={13} />
        Ulangi
      </Button>
    </div>
  );
}

function getDisplayInfo(result: ResultState) {
  if (result.platform === "tiktok") {
    return {
      cover: result.data.cover,
      title: result.data.title || "TikTok Video",
      subtitle: result.data.author.name,
    };
  }
  if (result.platform === "youtube") {
    return { cover: result.data.thumbnail, title: result.data.title, subtitle: result.data.author };
  }
  return { cover: result.data.cover, title: result.data.title, subtitle: result.data.artist };
}
