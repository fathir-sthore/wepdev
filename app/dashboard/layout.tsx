import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { GlobalBottomNav } from "@/components/layout/global-bottom-nav";
import { HamburgerMenu } from "@/components/layout/hamburger-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";

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

  const isAdmin = profile?.role === "admin";

  return (
    <div className="flex min-h-screen">
      {/* adminHref is computed server-side and only passed down when the
          viewer is actually an admin, so the secret path string never ends
          up in the shared client bundle every dashboard user downloads. */}
      <DashboardSidebar isAdmin={isAdmin} adminHref={isAdmin ? `/${ADMIN_BASE_PATH}` : undefined} />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-end gap-2 border-b border-line px-6 py-2 md:px-10">
          <NotificationBell userId={user.id} />
          <HamburgerMenu />
        </div>
        <div className="flex-1 p-6 md:p-10 pb-24 md:pb-10">{children}</div>
      </div>
      <GlobalBottomNav />
    </div>
  );
}
