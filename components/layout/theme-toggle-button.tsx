"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/** Compact light/dark flip for the navbar — visible to everyone, logged
 * in or not. The full 3-way (Light/Dark/System) control still lives in
 * Dashboard > Profile for people who want to follow their OS setting. */
export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Ganti tema terang/gelap"
      className="rounded-full p-2 text-muted hover:text-text hover:bg-panel2 transition-colors"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
