"use client";

import { useEffect, useRef } from "react";

export function ViewTracker({ scriptId }: { scriptId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/scripts/${scriptId}/view`, { method: "POST" }).catch(() => {});
  }, [scriptId]);

  return null;
}
