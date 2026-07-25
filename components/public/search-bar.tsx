"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

type Suggestion = { slug: string; title: string };

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from("scripts")
        .select("slug, title")
        .eq("status", "published")
        .textSearch("search_vector", q.trim(), { type: "websearch", config: "simple" })
        .limit(5);
      setSuggestions(data ?? []);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className ?? ""}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="search scripts, bots, panels..."
        className="pl-9"
      />

      {open && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-line bg-panel shadow-glow overflow-hidden">
          {suggestions.map((s) => (
            <Link
              key={s.slug}
              href={`/script/${s.slug}`}
              className="block px-3 py-2 text-sm font-data text-text hover:bg-panel2"
            >
              {s.title}
            </Link>
          ))}
        </div>
      )}
    </form>
  );
}
