import Link from "next/link";
import { Download, ArrowRight } from "lucide-react";

export function DownloaderPromo() {
  return (
    <div className="mx-auto max-w-7xl px-4 my-6">
      <Link
        href="/downloader"
        className="flex items-center gap-4 rounded-lg border border-line bg-panel px-5 py-4 hover:border-accent/50 transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Download size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text">Downloader TikTok, YouTube & Spotify</p>
          <p className="text-xs text-muted truncate">
            Tempel link, dapatkan video/audionya langsung — gratis
          </p>
        </div>
        <ArrowRight size={16} className="text-muted shrink-0" />
      </Link>
    </div>
  );
}
