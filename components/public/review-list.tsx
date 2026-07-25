import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/public/rating-stars";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author: { username: string; avatar_url: string | null } | null;
};

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="font-data text-xs text-muted">no reviews yet — be the first.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="flex gap-3">
          <Avatar
            src={r.author?.avatar_url}
            alt={r.author?.username ?? "user"}
            fallback={r.author?.username ?? "u"}
            size={36}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-text">
                @{r.author?.username ?? "deleted user"}
              </span>
              <RatingStars rating={r.rating} size={12} />
            </div>
            {r.comment && <p className="text-sm text-muted mt-1">{r.comment}</p>}
            <p className="font-data text-[11px] text-muted mt-1">
              {new Date(r.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
