"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Code2, LayoutDashboard, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const sideLinks = [
  { href: "/", label: "home", icon: Home, exact: true, position: "left" as const },
  { href: "/search", label: "all script", icon: Search, exact: false, position: "left" as const },
  { href: "/code", label: "code", icon: Code2, exact: false, position: "right" as const },
  { href: "/dashboard/profile", label: "profile", icon: User, exact: false, position: "right" as const },
];

export function GlobalBottomNav() {
  const pathname = usePathname();
  const leftLinks = sideLinks.filter((l) => l.position === "left");
  const rightLinks = sideLinks.filter((l) => l.position === "right");

  function isActive(link: (typeof sideLinks)[number]) {
    return link.exact ? pathname === link.href : pathname.startsWith(link.href);
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-ink">
      <div className="relative grid grid-cols-5 items-end">
        {leftLinks.map((link) => {
          const active = isActive(link);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 font-data text-[10px]",
                active ? "text-accent" : "text-muted"
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}

        {/* Dashboard — raised, prominent center button */}
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="relative -top-4 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-accent text-ink border-4 border-ink"
          >
            <LayoutDashboard size={22} />
          </Link>
        </div>

        {rightLinks.map((link) => {
          const active = isActive(link);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 font-data text-[10px]",
                active ? "text-accent" : "text-muted"
              )}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
