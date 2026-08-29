"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, ArrowLeftCircle, Code2, Search, Settings, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function HamburgerMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  const links = [
    isHome
      ? { href: "/dashboard", label: "dashboard", icon: LayoutDashboard }
      : { href: "/", label: "menu utama", icon: ArrowLeftCircle },
    { href: "/code", label: "code", icon: Code2 },
    { href: "/downloader", label: "downloader", icon: Download },
    { href: "/search", label: "all script", icon: Search },
    { href: "/dashboard/profile", label: "pengaturan", icon: Settings },
  ];

  return (
    <div className="relative hidden md:block" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-2 text-muted hover:text-text hover:bg-panel2"
        aria-label="menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-line bg-panel z-40 overflow-hidden">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 font-mono text-sm transition-colors",
                  active ? "text-accent bg-panel2" : "text-text hover:bg-panel2"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
