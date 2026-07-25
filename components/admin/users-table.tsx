"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function AdminUsersTable({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setRole(id: string, role: "user" | "developer" | "admin") {
    setBusyId(id);
    await supabase.from("profiles").update({ role }).eq("id", id);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      {users.map((u) => (
        <Card key={u.id}>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar src={u.avatar_url} alt={u.username} fallback={u.username} size={32} />
              <div className="min-w-0">
                <p className="font-mono text-sm text-text truncate">@{u.username}</p>
                <p className="font-data text-[11px] text-muted">
                  joined {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <select
              value={u.role}
              disabled={busyId === u.id || u.id === currentUserId}
              onChange={(e) => setRole(u.id, e.target.value as "user" | "developer" | "admin")}
              className="h-8 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text shrink-0"
            >
              <option value="user">user</option>
              <option value="developer">developer</option>
              <option value="admin">admin</option>
            </select>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
