"use client";

import { useEffect, useRef } from "react";

export function SnippetViewTracker({ snippetId }: { snippetId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/code/${snippetId}/view`, { method: "POST" }).catch(() => {});
  }, [snippetId]);

  return null;
}
