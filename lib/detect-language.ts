export type DetectedLanguage = "javascript" | "python" | "json" | "dart" | "shell" | "html";

const EXT_MAP: Record<string, DetectedLanguage> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  json: "json",
  dart: "dart",
  sh: "shell",
  bash: "shell",
  html: "html",
  htm: "html",
};

export function detectLanguageFromFilename(filename: string): DetectedLanguage | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? EXT_MAP[ext] ?? null : null;
}

/** Best-effort detection from raw code content when there's no filename to
 * go by (pasted/typed code). Order matters — checks go from most
 * structurally distinctive to least. */
export function detectLanguageFromContent(code: string): DetectedLanguage {
  const trimmed = code.trim();

  // JSON: must actually parse
  if (/^[{\[]/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // not valid JSON, fall through
    }
  }

  // HTML
  if (/^<!doctype html/i.test(trimmed) || /<html[\s>]/i.test(trimmed) || /<\/?(div|span|body|head)[\s>]/i.test(trimmed)) {
    return "html";
  }

  // Shell
  if (/^#!.*\b(bash|sh|zsh)\b/.test(trimmed) || /\b(echo|apt-get|sudo|chmod|export)\s/.test(trimmed.split("\n")[0] ?? "")) {
    return "shell";
  }

  // Dart (check before generic JS since Dart syntax overlaps with JS/C-family)
  if (/\bimport\s+['"]package:/.test(trimmed) || /\bvoid\s+main\s*\(/.test(trimmed) || /extends\s+StatelessWidget|StatefulWidget/.test(trimmed)) {
    return "dart";
  }

  // Python
  if (/^\s*(def |class |import |from )\S/m.test(trimmed) && /:\s*$/m.test(trimmed)) {
    return "python";
  }
  if (/\bprint\(.*\)/.test(trimmed) && !/;\s*$/m.test(trimmed)) {
    return "python";
  }

  // Default to JavaScript — the most common catch-all among these six
  return "javascript";
}

export const LANGUAGE_LABELS: Record<DetectedLanguage, string> = {
  javascript: "JavaScript",
  python: "Python",
  json: "JSON",
  dart: "Dart",
  shell: "Shell",
  html: "HTML",
};
