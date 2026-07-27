"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicStorageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Banner = Database["public"]["Tables"]["banners"]["Row"];

const AUTOPLAY_MS = 5000;

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback(
    (next: number) => {
      setDirection(next > index ? 1 : -1);
      setIndex((next + banners.length) % banners.length);
    },
    [index, banners.length]
  );

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % banners.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[index];
  const image = publicStorageUrl("banners", banner.image_path);

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-6">
      <div className="relative aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-xl border border-line bg-panel2">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={banner.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Link href={`/banner/${banner.id}`} className="block h-full w-full">
              {image ? (
                <Image src={image} alt={banner.title} fill priority className="object-cover" />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(242,179,61,0.25), transparent 45%), radial-gradient(circle at 80% 70%, rgba(51,224,194,0.2), transparent 45%), linear-gradient(160deg, #0B0D12 0%, #12151C 60%, #1A1E27 100%)",
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-xl">
                {banner.subtitle && (
                  <p className="font-data text-xs uppercase tracking-widest text-signal mb-2">
                    {banner.subtitle}
                  </p>
                )}
                <h2 className="font-mono text-xl md:text-3xl text-text leading-tight">
                  {banner.title}
                </h2>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="previous banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-ink/70 p-2 text-text hover:bg-ink"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="next banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-ink/70 p-2 text-text hover:bg-ink"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => goTo(i)}
                  aria-label={`go to banner ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-6 bg-accent" : "w-1.5 bg-text/40"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
