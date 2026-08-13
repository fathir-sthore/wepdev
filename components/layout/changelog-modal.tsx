"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHANGELOG, LATEST_VERSION } from "@/lib/changelog";

const STORAGE_KEY = "fathircode_changelog_seen";

/**
 * Renders the trigger (small "what's new" link/badge) and, on demand, the
 * changelog modal. Auto-opens once per browser the first time a user lands
 * after a version bump (tracked via localStorage), then stays available
 * on-demand via the trigger.
 */
export function ChangelogModal({
  trigger,
}: {
  /** Optional custom trigger content (plain JSX, no handlers needed). */
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (seen !== LATEST_VERSION) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable (private mode etc.) — just skip auto-open
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, LATEST_VERSION);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <span className="font-data text-[11px] text-accent hover:underline">
            what&apos;s new?
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4">
          <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-lg border border-accent/40 bg-panel2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <p className="text-title text-sm text-text">Changelog</p>
              </div>
              <button onClick={close} className="text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-6">
              {CHANGELOG.map((entry) => (
                <div key={entry.version}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full border border-accent bg-accent px-2 py-0.5 font-data text-[11px] text-ink font-medium">
                      v{entry.version}
                    </span>
                    <span className="font-data text-[11px] text-muted">{entry.date}</span>
                  </div>
                  <p className="text-subtitle text-sm text-text mb-2">{entry.title}</p>
                  <ul className="space-y-1.5">
                    {entry.notes.map((note, i) => (
                      <li key={i} className="flex gap-2 text-desc text-xs text-muted">
                        <span className="text-signal shrink-0">▸</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-line shrink-0">
              <Button onClick={close} className="w-full">
                Oke, mengerti
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
