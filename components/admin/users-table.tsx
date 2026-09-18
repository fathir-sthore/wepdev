"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "@/components/admin/create-user-form";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  banned_until: string | null;
};

function isBanned(bannedUntil: string | null) {
  return !!bannedUntil && new Date(bannedUntil) > new Date();
}

export function AdminUsersTable({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setRole(id: string, role: "user" | "developer" | "admin") {
    setBusyId(id);
    await supabase.from("profiles").update({ role }).eq("id", id);
    setBusyId(null);
    router.refresh();
  }

  async function toggleSuspend(id: string, currentlyBanned: boolean) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: currentlyBanned ? "unsuspend" : "suspend" }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Gagal mengubah status akun");
        return;
      }
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <CreateUserForm onCreated={() => router.refresh()} />

      {error && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {users.map((u) => {
          const banned = isBanned(u.banned_until);
          const isSelf = u.id === currentUserId;
          return (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={u.avatar_url} alt={u.username} fallback={u.username} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate flex items-center gap-2">
                      @{u.username}
                      {banned && (
                        <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] text-danger">
                          Disuspend
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      Bergabung {new Date(u.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={u.role}
                    disabled={busyId === u.id || isSelf}
                    onChange={(e) => setRole(u.id, e.target.value as "user" | "developer" | "admin")}
                    className="h-8 rounded-md border border-line bg-panel2 px-2 text-xs text-text"
                  >
                    <option value="user">user</option>
                    <option value="developer">developer</option>
                    <option value="admin">admin</option>
                  </select>

                  <Button
                    size="sm"
                    variant={banned ? "default" : "outline"}
                    disabled={busyId === u.id || isSelf}
                    onClick={() => toggleSuspend(u.id, banned)}
                  >
                    {banned ? "Aktifkan" : "Suspend"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
