"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "dark" | "light" | "auto";
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile CAPTCHA widget. Renders nothing (and reports itself
 * "not configured") if NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set, so local
 * dev without a Turnstile key doesn't break the auth forms.
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !siteKey || !ref.current || !window.turnstile) return;
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady, siteKey]);

  if (!siteKey) {
    // Not configured — don't block the form in environments without a key.
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={ref} />
    </>
  );
}

/** True only when a site key is actually configured — forms use this to
 * decide whether a captcha token is required before submitting. */
export const CAPTCHA_ENABLED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
