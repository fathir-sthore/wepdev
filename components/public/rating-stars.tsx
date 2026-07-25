import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= Math.round(rating) ? "fill-accent text-accent" : "text-line"
            )}
          />
        ))}
      </div>
      {typeof count === "number" && (
        <span className="text-xs font-data text-muted">({count})</span>
      )}
    </div>
  );
}
