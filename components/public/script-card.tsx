import Link from "next/link";
import Image from "next/image";
import { Download, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RatingStars } from "@/components/public/rating-stars";
import { publicStorageUrl, formatCount } from "@/lib/storage";
import type { ScriptWithRelations } from "@/lib/queries/scripts";

export function ScriptCard({ script }: { script: ScriptWithRelations }) {
  const thumbnail = publicStorageUrl("thumbnails", script.thumbnail_path);

  return (
    <Link href={`/script/${script.slug}`} className="group block">
      <Card className="overflow-hidden h-full flex flex-col transition-colors group-hover:border-accent/50">
        <div className="relative aspect-video bg-panel2">
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
          <span className="absolute top-2 right-2 rounded bg-ink/80 backdrop-blur px-2 py-0.5 font-data text-[11px] text-accent border border-line">
            {script.is_premium ? `Rp ${script.price.toLocaleString("id-ID")}` : "FREE"}
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
          {script.category && (
            <span className="font-data text-[11px] uppercase tracking-wide text-signal">
              {script.category.name}
            </span>
          )}
          <h3 className="font-mono text-sm text-text line-clamp-1">{script.title}</h3>
          <p className="text-xs text-muted line-clamp-2 flex-1">
            {script.short_description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-line">
            <RatingStars rating={script.rating_avg} count={script.rating_count} size={12} />
            <div className="flex items-center gap-3 text-muted">
              <span className="flex items-center gap-1 font-data text-[11px]">
                <Download size={12} /> {formatCount(script.download_count)}
              </span>
              <span className="flex items-center gap-1 font-data text-[11px]">
                <Eye size={12} /> {formatCount(script.view_count)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
