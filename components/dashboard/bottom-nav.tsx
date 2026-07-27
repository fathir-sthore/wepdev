"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Heart, Download, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/search", label: "explore", icon: Search, exact: false },
  { href: "/dashboard/favorites", label: "favorite", icon: Heart, exact: false },
  { href: "/dashboard/downloads", label: "download", icon: Download, exact: false },
  { href: "/dashboard/profile", label: "profile", icon: User, exact: false },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-ink/95 backdrop-blur">
      <div className="grid grid-cols-5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 font-data text-[10px]",
                active ? "text-accent" : "text-muted"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
