"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, CheckCircle2, X } from "lucide-react";

type CreatedUser = { id: string; email: string; username?: string };

export function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedUser | null>(null);

  function reset() {
    setEmail("");
    setPassword("");
    setUsername("");
    setDisplayName("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username: username || undefined,
          display_name: displayName || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Gagal membuat akun");
        return;
      }

      setCreated(json.data);
      if (json.warning) setNotice(json.warning);
      reset();
      setOpen(false);
      onCreated();
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4">
      {created && (
        <div className="mb-3 flex items-start gap-3 rounded-lg border border-free/30 bg-free/10 px-4 py-3">
          <CheckCircle2 size={18} className="text-free shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 text-sm">
            <p className="text-text font-medium">Akun berhasil dibuat</p>
            <p className="text-muted">
              {created.email}
              {created.username ? ` — @${created.username}` : ""}
            </p>
            {notice && <p className="text-premium mt-1">{notice}</p>}
          </div>
          <button onClick={() => setCreated(null)} className="text-muted hover:text-text shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {!open && (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <UserPlus size={14} />
          Buat user
        </Button>
      )}

      {open && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="new-user-password">Password</Label>
                <Input
                  id="new-user-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div>
                <Label htmlFor="new-user-username">Username (opsional)</Label>
                <Input
                  id="new-user-username"
                  minLength={3}
                  pattern="[a-zA-Z0-9_]+"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Otomatis dari email jika kosong"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="new-user-display-name">Nama tampilan (opsional)</Label>
                <Input
                  id="new-user-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}

              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? "Membuat..." : "Buat akun"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
