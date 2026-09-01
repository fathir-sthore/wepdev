import Link from "next/link";
import Image from "next/image";
import { Download, Star, User } from "lucide-react";
import { RatingStars } from "@/components/public/rating-stars";
import { publicStorageUrl, formatCount } from "@/lib/storage";
import { computeBadges } from "@/lib/badges";
import { cn } from "@/lib/utils";
import type { ScriptWithRelations } from "@/lib/queries/scripts";

const badgeStyles: Record<string, string> = {
  NEW: "bg-signal/10 text-signal border-signal/30",
  UPDATED: "bg-accent/10 text-accent border-accent/30",
  HOT: "bg-danger/10 text-danger border-danger/30",
};

export function ScriptCard({ script, hot }: { script: ScriptWithRelations; hot?: boolean }) {
  const thumbnail = publicStorageUrl("thumbnails", script.thumbnail_path);
  const badges = computeBadges({ ...script, hot }).filter((b) => b !== "FREE" && b !== "PREMIUM");
  const techStack = [script.programming_language, script.framework].filter(Boolean) as string[];

  return (
    <Link href={`/script/${script.slug}`} className="group block">
      <div className="glass overflow-hidden h-full flex flex-col rounded-2xl transition-colors group-hover:border-accent/50">
        <div className="relative aspect-video bg-panel">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={script.title}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-data text-xs text-muted">
              no preview
            </div>
          )}

          {/* Status badge — FREE (Neon Mint) or PREMIUM (Cyber Amber) + price */}
          <span
            className={cn(
              "absolute top-2 right-2 rounded-full bg-panel/90 backdrop-blur-sm px-2.5 py-0.5",
              "font-data text-[11px] font-medium border",
              script.is_premium
                ? "text-premium border-premium/40"
                : "text-free border-free/40"
            )}
          >
            {script.is_premium ? `Rp ${script.price.toLocaleString("id-ID")}` : "FREE"}
          </span>

          {badges.length > 0 && (
            <div className="absolute top-2 left-2 flex gap-1">
              {badges.map((b) => (
                <span
                  key={b}
                  className={cn("rounded-full border bg-panel/90 backdrop-blur-sm px-2 py-0.5 font-data text-[10px]", badgeStyles[b])}
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
          {script.category && (
            <span className="text-xs text-signal">
              {script.category.name}
            </span>
          )}

          <h3 className="text-title text-sm text-text line-clamp-1">{script.title}</h3>

          {/* Author */}
          <div className="flex items-center gap-1.5 text-muted">
            {script.developer?.avatar_url ? (
              <Image
                src={script.developer.avatar_url}
                alt={script.developer.username}
                width={14}
                height={14}
                className="rounded-full object-cover"
              />
            ) : (
              <User size={12} />
            )}
            <span className="font-data text-[11px] truncate">
              @{script.developer?.username ?? "unknown"}
            </span>
          </div>

          <p className="text-desc text-xs text-muted line-clamp-2 flex-1">
            {script.short_description}
          </p>

          {/* Tech stack tags */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {techStack.map((t) => (
                <span
                  key={t}
                  className="rounded border border-line bg-panel px-1.5 py-0.5 font-data text-[10px] text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-line">
            <RatingStars rating={script.rating_avg} count={script.rating_count} size={12} />
            <span className="flex items-center gap-1 font-data text-[11px] text-muted">
              <Download size={12} /> {formatCount(script.download_count)}
            </span>
          </div>

          {/* CTA */}
          <div
            className={cn(
              "mt-1 flex items-center justify-center gap-1.5 rounded-md py-1.5",
              "font-data text-[11px] font-medium border border-accent/30 text-accent",
              "group-hover:bg-accent/10 transition-colors"
            )}
          >
            {script.is_premium ? (
              <>
                <Star size={12} /> Lihat detail
              </>
            ) : (
              <>
                <Download size={12} /> Download gratis
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
