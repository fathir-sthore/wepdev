import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/public/rating-stars";

type Comment = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author: { username: string; avatar_url: string | null } | null;
};

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p className="font-data text-xs text-muted">belum ada komentar — jadi yang pertama.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          <Avatar src={c.author?.avatar_url} alt={c.author?.username ?? "u"} fallback={c.author?.username ?? "u"} size={32} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-text">@{c.author?.username ?? "deleted user"}</span>
              <RatingStars rating={c.rating} size={12} />
            </div>
            {c.comment && <p className="text-sm text-muted mt-1">{c.comment}</p>}
            <p className="font-data text-[11px] text-muted mt-1">{new Date(c.created_at).toLocaleDateString("id-ID")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
