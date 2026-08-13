"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { publicStorageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Banner = Database["public"]["Tables"]["banners"]["Row"];

const AUTOPLAY_MS = 5000;

/**
 * Simple image-only banner carousel: no text overlay, no decoration.
 * Click a banner -> opens the image in a lightbox modal. Plain CSS opacity
 * crossfade (no framer-motion) to keep this lightweight.
 */
export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goTo = useCallback(
    (next: number) => setIndex((next + banners.length) % banners.length),
    [banners.length]
  );

  useEffect(() => {
    if (banners.length < 2 || lightboxOpen) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [banners.length, lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  if (banners.length === 0) return null;

  const banner = banners[index];
  const image = publicStorageUrl("banners", banner.image_path);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-lg border border-line bg-panel2">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label={banner.title}
        >
          {image ? (
            <Image
              src={image}
              alt={banner.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-panel2" />
          )}
        </button>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="previous banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/60 p-2 text-text hover:bg-ink"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="next banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/60 p-2 text-text hover:bg-ink"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => goTo(i)}
                  aria-label={`go to banner ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full",
                    i === index ? "w-6 bg-accent" : "w-1.5 bg-text/40"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="close"
            className="absolute top-4 right-4 rounded-full bg-panel2 p-2 text-text"
          >
            <X size={20} />
          </button>
          <img
            src={image}
            alt={banner.title}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
