import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: middleware already protects /dashboard,
  // but Server Components should never trust that alone.
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar isAdmin={profile?.role === "admin"} />
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end border-b border-line px-6 py-2 md:px-10">
          <NotificationBell userId={user.id} />
        </div>
        <div className="flex-1 p-6 md:p-10 pb-20 md:pb-10">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
