"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, Download, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "profile", icon: LayoutDashboard },
  { href: "/dashboard/favorites", label: "favorites", icon: Heart },
  { href: "/dashboard/downloads", label: "downloads", icon: Download },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-panel/60 min-h-screen p-4 flex flex-col">
      <p className="font-data text-xs text-muted mb-6 px-2">~/dashboard</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono transition-colors",
                active
                  ? "bg-panel2 text-accent"
                  : "text-muted hover:text-text hover:bg-panel2"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action="/auth/signout" method="post" className="mt-auto">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-mono text-muted hover:text-danger hover:bg-panel2 transition-colors"
        >
          <LogOut size={16} />
          signout
        </button>
      </form>
    </aside>
  );
}
