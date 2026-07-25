"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  scriptId,
  userId,
  initialFavorited,
  redirectTo,
}: {
  scriptId: string;
  userId: string | null;
  initialFavorited: boolean;
  redirectTo: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
      return;
    }
    setLoading(true);

    if (favorited) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("script_id", scriptId);
      setFavorited(false);
    } else {
      await supabase.from("favorites").insert({ user_id: userId, script_id: scriptId });
      setFavorited(true);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={toggle} disabled={loading} className="w-full">
      <Heart size={16} className={cn(favorited && "fill-danger text-danger")} />
      {favorited ? "favorited" : "favorite"}
    </Button>
  );
}
