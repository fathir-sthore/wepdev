"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Download, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXT_MAP: Record<string, string> = {
  javascript: "js",
  python: "py",
  json: "json",
  dart: "dart",
  shell: "sh",
  html: "html",
};

// Maps our detected language ids to Prism's language identifiers.
const PRISM_LANG: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  json: "json",
  dart: "dart",
  shell: "bash",
  html: "markup",
};

export function CodeBlock({
  content,
  language,
  fileName,
}: {
  content: string;
  language: string;
  fileName?: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      const Prism = (await import("prismjs")).default;
      // Core language dependencies, then the language we actually need.
      await import("prismjs/components/prism-clike" as any);
      await import("prismjs/components/prism-markup" as any);
      await import("prismjs/components/prism-javascript" as any);
      await import("prismjs/components/prism-python" as any);
      await import("prismjs/components/prism-json" as any);
      await import("prismjs/components/prism-bash" as any);
      await import("prismjs/components/prism-dart" as any);

      if (!cancelled && codeRef.current) {
        Prism.highlightElement(codeRef.current);
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [content, language]);

  // Expand mode traps scroll/escape so the rest of the page stays put —
  // only the code container itself goes fullscreen (see spec item 14).
  useEffect(() => {
    if (!expanded) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const ext = EXT_MAP[language] ?? "txt";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const prismLang = PRISM_LANG[language] ?? "javascript";

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-50 flex flex-col rounded-none border-0 bg-[#1e1e1e]"
          : "rounded-md border border-line overflow-hidden max-w-full"
      }
    >
      <div className="flex items-center justify-between bg-panel2 px-3 py-2 border-b border-line shrink-0">
        <span className="font-data text-[11px] text-muted truncate">{fileName || "code"}</span>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "disalin" : "salin"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download size={13} />
            download
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            {expanded ? "tutup" : "expand"}
          </Button>
        </div>
      </div>
      {/* Isolated scroll container: only this box scrolls (both axes),
          the rest of the page/header/buttons above stay fixed in place.
          overscroll-contain stops the scroll from "leaking" into the page
          once the code area hits its own top/bottom edge. */}
      <pre
        className={
          (expanded ? "flex-1 " : "max-h-[420px] ") +
          "overflow-auto overscroll-contain p-4 text-xs bg-[#1e1e1e] max-w-full"
        }
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <code ref={codeRef} className={`language-${prismLang}`}>
          {content}
        </code>
      </pre>
    </div>
  );
}
