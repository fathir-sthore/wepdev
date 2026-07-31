import Link from "next/link";
import { Terminal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/public/search-bar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { HamburgerMenu } from "@/components/layout/hamburger-menu";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { username: string; avatar_url: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Terminal size={20} className="text-accent" />
          <span className="font-mono text-sm text-text hidden sm:inline">
            fathir sthore
          </span>
        </Link>

        <SearchBar className="flex-1 max-w-xl" />

        <nav className="flex items-center gap-3 shrink-0">
          {user && profile ? (
            <>
              <NotificationBell userId={user.id} />
              <Link href="/dashboard" className="flex items-center gap-2">
                <Avatar
                  src={profile.avatar_url}
                  alt={profile.username}
                  fallback={profile.username}
                  size={32}
                />
              </Link>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">register</Button>
              </Link>
            </div>
          )}

          <HamburgerMenu />
        </nav>
      </div>
    </header>
  );
}
