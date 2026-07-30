"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CommentForm({ snippetId, userId }: { snippetId: string; userId: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userId) {
    return (
      <p className="font-data text-xs text-muted">
        <a href="/login" className="text-accent hover:underline">login</a> buat kasih rating & komentar.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("pilih rating dulu");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("code_snippet_comments")
      .upsert({ snippet_id: snippetId, user_id: userId!, rating, comment: comment || null });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    fetch("/api/notify/snippet-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snippetId, rating, comment: comment || null }),
    }).catch(() => {});

    setComment("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
            <Star size={20} className={cn(i <= (hover || rating) ? "fill-accent text-accent" : "text-line")} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="komentar soal kode ini (opsional)"
        rows={3}
        className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-data text-text placeholder:text-muted/70"
      />
      {error && <p className="font-data text-xs text-danger">{error}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "mengirim..." : "kirim komentar"}
      </Button>
    </form>
  );
}
