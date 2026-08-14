import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const admin = createAdminClient();
  const [profile, scripts, purchases, favorites, downloads, reviews] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).single(),
    admin.from("scripts").select("*").eq("developer_id", user.id),
    admin.from("purchases").select("*").eq("user_id", user.id),
    admin.from("favorites").select("*").eq("user_id", user.id),
    admin.from("downloads").select("*").eq("user_id", user.id),
    admin.from("reviews").select("*").eq("user_id", user.id),
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
