import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata = { title: "Profile — Dashboard" };

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile) {
    return (
      <p className="font-data text-sm text-danger">
        error: profile not found. try signing in again.
      </p>
    );
  }

  return (
    <div>
      <p className="font-data text-xs text-signal mb-2">$ fathir profile --edit</p>
      <h1 className="font-mono text-2xl text-text mb-6">Your profile</h1>
      <ProfileForm profile={profile} />
    </div>
  );
}
