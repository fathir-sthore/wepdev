"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const options = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid rendering theme-dependent state until mounted (SSR/client mismatch).
  useEffect(() => setMounted(true), []);

  return (
    <div className="inline-flex rounded-md border border-line p-1 gap-1">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-1.5 rounded px-3 py-1.5 font-data text-xs transition-colors",
            mounted && theme === value
              ? "bg-accent text-ink"
              : "text-muted hover:text-text"
          )}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}
