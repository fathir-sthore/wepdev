"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const typeIcon: Record<string, string> = {
  purchase_completed: "💰",
  review_received: "⭐",
  report_filed: "🚩",
  security_alert: "🔒",
};

export function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (mounted && data) setNotifications(data);
      });

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-muted hover:text-text hover:bg-panel2"
        aria-label="notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 font-data text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-md border border-line bg-panel shadow-glow z-40">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="font-mono text-xs text-text">Notifikasi</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 font-data text-[11px] text-accent hover:underline"
              >
                <Check size={12} /> tandai semua dibaca
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 font-data text-xs text-muted text-center">belum ada notifikasi.</p>
          ) : (
            <div className="divide-y divide-line">
              {notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link_url ?? "#"}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "flex gap-2 px-3 py-2.5 hover:bg-panel2 transition-colors",
                    !n.is_read && "bg-panel2/50"
                  )}
                >
                  <span className="text-sm shrink-0">{typeIcon[n.type] ?? "🔔"}</span>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-text truncate">{n.title}</p>
                    {n.message && (
                      <p className="font-data text-[11px] text-muted line-clamp-2">{n.message}</p>
                    )}
                    <p className="font-data text-[10px] text-muted mt-0.5">
                      {new Date(n.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                  {!n.is_read && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-1" />}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
