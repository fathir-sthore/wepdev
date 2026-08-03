"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { publicStorageUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import type { Database } from "@/types/database.types";

type Banner = Database["public"]["Tables"]["banners"]["Row"];

export function AdminBannersTable({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: "draft" | "published") {
    setBusyId(id);
    await supabase.from("banners").update({ status }).eq("id", id);
    setBusyId(null);
    router.refresh();
  }

  async function remove(banner: Banner) {
    if (!confirm("hapus banner ini?")) return;
    setBusyId(banner.id);
    await supabase.from("banners").delete().eq("id", banner.id);

    if (banner.image_path) {
      await fetch("/api/r2/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: banner.image_path }),
      }).catch(() => {});
    }

    setBusyId(null);
    router.refresh();
  }

  async function swapOrder(a: Banner, b: Banner) {
    setBusyId(a.id);
    await Promise.all([
      supabase.from("banners").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("banners").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    setBusyId(null);
    router.refresh();
  }

  if (banners.length === 0) {
    return <p className="font-data text-sm text-muted">belum ada banner.</p>;
  }

  return (
    <div className="grid gap-3">
      {banners.map((banner, i) => {
        const image = publicStorageUrl("banners", banner.image_path);
        return (
          <Card key={banner.id}>
            <CardContent className="flex items-center gap-4">
              <div className="relative h-14 w-24 shrink-0 rounded bg-panel2 overflow-hidden">
                {image && <img src={image} alt={banner.title} className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-text truncate">{banner.title}</p>
                <p className="font-data text-[11px] text-muted">
                  urutan {banner.sort_order} ·{" "}
                  <span className={banner.status === "published" ? "text-signal" : "text-muted"}>
                    {banner.status}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={i === 0 || busyId === banner.id}
                  onClick={() => swapOrder(banner, banners[i - 1])}
                >
                  <ArrowUp size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={i === banners.length - 1 || busyId === banner.id}
                  onClick={() => swapOrder(banner, banners[i + 1])}
                >
                  <ArrowDown size={14} />
                </Button>
                <select
                  value={banner.status}
                  disabled={busyId === banner.id}
                  onChange={(e) => setStatus(banner.id, e.target.value as "draft" | "published")}
                  className="h-8 rounded-md border border-line bg-panel2 px-2 text-xs font-data text-text"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
                <Link href={`/${ADMIN_BASE_PATH}/banners/${banner.id}/edit`}>
                  <Button variant="outline" size="sm">edit</Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  disabled={busyId === banner.id}
                  onClick={() => remove(banner)}
                >
                  hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
