"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Code2, Flag, Users, ArrowLeft, Image as ImageIcon, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "overview", icon: LayoutDashboard },
  { href: "/admin/scripts", label: "scripts", icon: Code2 },
  { href: "/admin/banners", label: "banners", icon: ImageIcon },
  { href: "/admin/transactions", label: "transactions", icon: Receipt },
  { href: "/admin/reports", label: "reports", icon: Flag },
  { href: "/admin/users", label: "users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-panel/60 min-h-screen p-4 flex flex-col">
      <p className="font-data text-xs text-muted mb-6 px-2">~/admin</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono transition-colors",
                active ? "bg-panel2 text-accent" : "text-muted hover:text-text hover:bg-panel2"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-sm font-mono text-muted hover:text-text hover:bg-panel2 transition-colors"
      >
        <ArrowLeft size={16} />
        back to dashboard
      </Link>
    </aside>
  );
}
