"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Provider = "google" | "github" | "discord";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "discord", label: "Discord" },
];

export function OAuthButtons({ next }: { next?: string }) {
  const [loading, setLoading] = useState<Provider | null>(null);
  const supabase = createClient();

  async function handleOAuth(provider: Provider) {
    setLoading(provider);
    const redirectTo = `${window.location.origin}/auth/callback${
      next ? `?next=${encodeURIComponent(next)}` : ""
    }`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) setLoading(null);
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {PROVIDERS.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => handleOAuth(p.id)}
          className="font-data"
        >
          {loading === p.id ? "..." : p.label}
        </Button>
      ))}
    </div>
  );
}
