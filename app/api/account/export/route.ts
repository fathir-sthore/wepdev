import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const [profile, scripts, purchases, favorites, downloads, reviews] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("scripts").select("*").eq("developer_id", user.id),
    supabase.from("purchases").select("*").eq("user_id", user.id),
    supabase.from("favorites").select("*").eq("user_id", user.id),
    supabase.from("downloads").select("*").eq("user_id", user.id),
    supabase.from("reviews").select("*").eq("user_id", user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, created_at: user.created_at },
    profile: profile.data,
    scripts_uploaded: scripts.data ?? [],
    purchases: purchases.data ?? [],
    favorites: favorites.data ?? [],
    downloads: downloads.data ?? [],
    reviews: reviews.data ?? [],
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="fathircode-data-${user.id}.json"`,
    },
  });
}
