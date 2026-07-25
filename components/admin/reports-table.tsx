"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  script: { title: string; slug: string } | null;
};

const statusColor: Record<string, string> = {
  open: "text-danger",
  reviewed: "text-signal",
  dismissed: "text-muted",
};

export function AdminReportsTable({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: "open" | "reviewed" | "dismissed") {
    setBusyId(id);
    await supabase.from("reports").update({ status }).eq("id", id);
    setBusyId(null);
    router.refresh();
  }

  if (reports.length === 0) {
    return <p className="font-data text-sm text-muted">no reports yet.</p>;
  }

  return (
    <div className="grid gap-3">
      {reports.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {r.script ? (
                  <Link href={`/script/${r.script.slug}`} target="_blank" className="font-mono text-sm text-text hover:text-accent">
                    {r.script.title}
                  </Link>
                ) : (
                  <span className="font-mono text-sm text-muted">script deleted</span>
                )}
                <span className={`font-data text-[11px] uppercase ${statusColor[r.status]}`}>
                  {r.status}
                </span>
              </div>
              <p className="font-data text-xs text-text mt-1">{r.reason}</p>
              {r.details && <p className="text-xs text-muted mt-1">{r.details}</p>}
              <p className="font-data text-[11px] text-muted mt-1">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </div>
            <select
              value={r.status}
              disabled={busyId === r.id}
              onChange={(e) => setStatus(r.id, e.target.value as "open" | "reviewed" | "dismissed")}
              className="h-8 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text shrink-0"
            >
              <option value="open">open</option>
              <option value="reviewed">reviewed</option>
              <option value="dismissed">dismissed</option>
            </select>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
