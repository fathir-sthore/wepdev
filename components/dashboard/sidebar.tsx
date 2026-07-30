"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Heart, Download, LogOut, Code2, ShieldCheck, Receipt, User, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/search", label: "explore", icon: Search, exact: false },
  { href: "/dashboard/favorites", label: "favorites", icon: Heart, exact: false },
  { href: "/dashboard/downloads", label: "downloads", icon: Download, exact: false },
  { href: "/dashboard/purchases", label: "purchases", icon: Receipt, exact: false },
  { href: "/dashboard/scripts", label: "my scripts", icon: Code2, exact: false },
  { href: "/dashboard/code", label: "kode saya", icon: FileCode, exact: false },
  { href: "/dashboard/profile", label: "profile & settings", icon: User, exact: false },
];

export function DashboardSidebar({ isAdmin, adminHref }: { isAdmin: boolean; adminHref?: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 border-r border-line bg-panel/60 min-h-screen p-4 flex-col">
      <p className="font-data text-xs text-muted mb-6 px-2">~/dashboard</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
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

        {isAdmin && adminHref && (
          <Link
            href={adminHref}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono text-signal hover:bg-panel2 transition-colors mt-2 border-t border-line pt-4"
          >
            <ShieldCheck size={16} />
            admin panel
          </Link>
        )}
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
