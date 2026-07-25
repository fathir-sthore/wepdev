"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCount } from "@/lib/storage";
import type { Database } from "@/types/database.types";

type ScriptRow = Database["public"]["Tables"]["scripts"]["Row"];

const statusColor: Record<string, string> = {
  draft: "text-muted",
  published: "text-signal",
  archived: "text-danger",
};

export function AdminScriptsTable({ scripts }: { scripts: ScriptRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: "draft" | "published" | "archived") {
    setBusyId(id);
    await supabase.from("scripts").update({ status }).eq("id", id);
    setBusyId(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("delete this script permanently?")) return;
    setBusyId(id);
    await supabase.from("scripts").delete().eq("id", id);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      {scripts.map((script) => (
        <Card key={script.id}>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-text truncate">{script.title}</span>
                <span className={`font-data text-[11px] uppercase ${statusColor[script.status]}`}>
                  {script.status}
                </span>
              </div>
              <p className="font-data text-[11px] text-muted mt-1">
                {formatCount(script.download_count)} downloads · {formatCount(script.view_count)} views
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={script.status}
                disabled={busyId === script.id}
                onChange={(e) => setStatus(script.id, e.target.value as "draft" | "published" | "archived")}
                className="h-8 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text"
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              <Link href={`/script/${script.slug}`} target="_blank">
                <Button variant="ghost" size="sm">view</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-danger"
                disabled={busyId === script.id}
                onClick={() => remove(script.id)}
              >
                delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
