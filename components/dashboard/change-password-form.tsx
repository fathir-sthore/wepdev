"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    fetch("/api/notify/security-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Password akunmu baru saja diubah." }),
    }).catch(() => {});
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <div>
        <Label htmlFor="new_password">Password baru</Label>
        <Input
          id="new_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="min. 8 karakter"
        />
      </div>
      {error && <p className="font-data text-xs text-danger">{error}</p>}
      {saved && <p className="font-data text-xs text-signal">password berhasil diubah</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "menyimpan..." : "ubah password"}
      </Button>
    </form>
  );
}
