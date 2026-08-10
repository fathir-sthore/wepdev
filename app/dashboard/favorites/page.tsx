import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { publicStorageUrl } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart } from "lucide-react";

export const metadata = { title: "Favorites — Dashboard" };

export default async function DashboardFavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: favorites } = await supabase
    .from("favorites")
    .select("id, created_at, script_id")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const scriptIds = (favorites ?? []).map((f) => f.script_id);
  const { data: scripts } = scriptIds.length
    ? await supabase.from("scripts").select("id, slug, title, thumbnail_path").in("id", scriptIds)
    : { data: [] };
  const scriptMap = new Map((scripts ?? []).map((s) => [s.id, s]));

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir favorites --list</p>
      <h1 className="text-title text-2xl text-text mb-6">Favorites</h1>

      {!favorites || favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Belum ada favorit"
          description="Tap ikon hati di script mana pun buat nyimpennya di sini."
          actionLabel="Jelajahi script"
          actionHref="/search"
        />
      ) : (
        <div className="grid gap-3">
          {favorites.map((fav) => {
            const script = scriptMap.get(fav.script_id);
            const thumbnail = script ? publicStorageUrl("thumbnails", script.thumbnail_path) : null;
            return (
              <Link key={fav.id} href={script ? `/script/${script.slug}` : "#"}>
                <Card className="hover:border-accent/50 transition-colors">
                  <CardContent className="flex items-center gap-3">
                    <div className="relative h-12 w-20 shrink-0 rounded bg-panel2 overflow-hidden">
                      {thumbnail && (
                        <Image src={thumbnail} alt={script?.title ?? ""} fill className="object-cover" />
                      )}
                    </div>
                    <span className="font-mono text-sm text-text flex-1">
                      {script?.title ?? "script no longer available"}
                    </span>
                    <span className="font-data text-xs text-muted">
                      {new Date(fav.created_at).toLocaleDateString()}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
