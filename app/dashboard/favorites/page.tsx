import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Favorites — Dashboard" };

export default async function DashboardFavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: favorites } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir favorites --list</p>
      <h1 className="font-mono text-2xl text-text mb-6">Favorites</h1>

      {!favorites || favorites.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted font-data">
            no favorites yet. once script pages ship, tap the heart on any
            script to save it here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {favorites.map((fav) => (
            <Card key={fav.id}>
              <CardContent className="flex items-center justify-between">
                <span className="font-data text-sm text-text">
                  script #{fav.script_id.slice(0, 8)}
                </span>
                <span className="font-data text-xs text-muted">
                  {new Date(fav.created_at).toLocaleDateString()}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs font-data text-muted">
        note: titles and thumbnails appear once the script catalog slice is built.
      </p>
    </div>
  );
}
