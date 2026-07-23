"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="flex items-center gap-4">
        <Avatar
          src={profile.avatar_url}
          alt={profile.username}
          fallback={profile.username}
          size={56}
        />
        <div>
          <p className="font-mono text-text">@{profile.username}</p>
          <p className="font-data text-xs text-muted uppercase">{profile.role}</p>
        </div>
      </div>

      <div>
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Fathir"
        />
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Bot & app developer."
          className="flex w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-text font-data placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
        />
      </div>

      {error && (
        <p className="font-data text-xs text-danger" role="alert">
          error: {error}
        </p>
      )}
      {saved && (
        <p className="font-data text-xs text-signal">profile saved</p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "saving..." : "save changes"}
      </Button>
    </form>
  );
}
