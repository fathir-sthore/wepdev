/**
 * Bucket folder structure (single bucket, prefixed "folders"):
 *
 *   scripts/{javascript,python,php,nodejs,flutter,html,css,template,telegram,whatsapp}/
 *   images/{thumbnails,avatars,banners,screenshots}/
 *   documents/
 *   temporary/
 *   backup/
 *
 * `images/screenshots/` is one addition beyond the original spec's list —
 * script screenshots needed a home and didn't fit any of the given folders;
 * grouping them under images/ alongside thumbnails/avatars/banners keeps the
 * top-level structure exactly as specified.
 */

export const SCRIPT_SUBFOLDERS = [
  "javascript",
  "python",
  "php",
  "nodejs",
  "flutter",
  "html",
  "css",
  "template",
  "telegram",
  "whatsapp",
] as const;
export type ScriptSubfolder = (typeof SCRIPT_SUBFOLDERS)[number];

export type StorageFolder =
  | `scripts/${ScriptSubfolder}`
  | "images/thumbnails"
  | "images/avatars"
  | "images/banners"
  | "images/screenshots"
  | "documents"
  | "temporary"
  | "backup";

/** Picks the right scripts/ subfolder from a category slug (special-cased
 * for telegram/whatsapp bots) or the script's programming language,
 * defaulting to "template" when nothing matches. */
export function resolveScriptSubfolder(
  categorySlug: string | null | undefined,
  programmingLanguage: string | null | undefined
): ScriptSubfolder {
  if (categorySlug?.includes("telegram")) return "telegram";
  if (categorySlug?.includes("whatsapp")) return "whatsapp";

  const lang = programmingLanguage?.toLowerCase().trim();
  if (lang && (SCRIPT_SUBFOLDERS as readonly string[]).includes(lang)) {
    return lang as ScriptSubfolder;
  }
  if (lang === "node" || lang === "node.js") return "nodejs";
  if (lang === "dart" || lang === "flutter") return "flutter";

  return "template";
}

// ---------------------------------------------------------------------------
// File type / size validation
// ---------------------------------------------------------------------------

export type FileCategory = "archive" | "code" | "document" | "image" | "video";

const EXTENSION_RULES: Record<
  string,
  { category: FileCategory; mimeTypes: string[] }
> = {
  zip: { category: "archive", mimeTypes: ["application/zip", "application/x-zip-compressed"] },
  "7z": { category: "archive", mimeTypes: ["application/x-7z-compressed"] },
  rar: { category: "archive", mimeTypes: ["application/vnd.rar", "application/x-rar-compressed"] },
  js: { category: "code", mimeTypes: ["text/javascript", "application/javascript", "text/plain"] },
  ts: { category: "code", mimeTypes: ["text/typescript", "application/typescript", "text/plain", "video/mp2t"] },
  json: { category: "code", mimeTypes: ["application/json", "text/plain"] },
  html: { category: "code", mimeTypes: ["text/html"] },
  css: { category: "code", mimeTypes: ["text/css"] },
  php: { category: "code", mimeTypes: ["application/x-httpd-php", "text/plain", "application/x-php"] },
  py: { category: "code", mimeTypes: ["text/x-python", "text/plain", "application/x-python-code"] },
  java: { category: "code", mimeTypes: ["text/x-java-source", "text/plain"] },
  c: { category: "code", mimeTypes: ["text/x-c", "text/plain"] },
  cpp: { category: "code", mimeTypes: ["text/x-c++", "text/plain"] },
  dart: { category: "code", mimeTypes: ["text/plain", "application/dart"] },
  yaml: { category: "code", mimeTypes: ["text/yaml", "application/x-yaml", "text/plain"] },
  yml: { category: "code", mimeTypes: ["text/yaml", "application/x-yaml", "text/plain"] },
  xml: { category: "code", mimeTypes: ["application/xml", "text/xml"] },
  sql: { category: "code", mimeTypes: ["application/sql", "text/plain"] },
  txt: { category: "document", mimeTypes: ["text/plain"] },
  pdf: { category: "document", mimeTypes: ["application/pdf"] },
  png: { category: "image", mimeTypes: ["image/png"] },
  jpg: { category: "image", mimeTypes: ["image/jpeg"] },
  jpeg: { category: "image", mimeTypes: ["image/jpeg"] },
  gif: { category: "image", mimeTypes: ["image/gif"] },
  webp: { category: "image", mimeTypes: ["image/webp"] },
  svg: { category: "image", mimeTypes: ["image/svg+xml"] },
  mp4: { category: "video", mimeTypes: ["video/mp4"] },
};

const MAX_SIZE_BYTES: Record<FileCategory, number> = {
  archive: 500 * 1024 * 1024, // 500MB — script packages
  code: 10 * 1024 * 1024, // 10MB — single source files
  document: 25 * 1024 * 1024, // 25MB — docs/PDF
  image: 10 * 1024 * 1024, // 10MB — thumbnails/avatars/banners/screenshots
  video: 200 * 1024 * 1024, // 200MB — tutorial clips
};

// Above this, the upload flow uses multipart instead of a single PUT.
export const MULTIPART_THRESHOLD_BYTES = 100 * 1024 * 1024; // 100MB

export function getExtension(filename: string): string {
  return (filename.split(".").pop() ?? "").toLowerCase();
}

export function validateFile(filename: string, mimeType: string, sizeBytes: number) {
  const ext = getExtension(filename);
  const rule = EXTENSION_RULES[ext];

  if (!rule) {
    return { valid: false as const, error: `File extension ".${ext}" is not allowed` };
  }
  // MIME sniffing across browsers/OSes is inconsistent, so we check
  // permissively — but empty/octet-stream is only OK because the extension
  // allowlist above is the real gate here, not the MIME type alone.
  if (mimeType && mimeType !== "application/octet-stream" && !rule.mimeTypes.includes(mimeType)) {
    return { valid: false as const, error: `MIME type "${mimeType}" doesn't match extension ".${ext}"` };
  }
  if (sizeBytes > MAX_SIZE_BYTES[rule.category]) {
    const maxMb = Math.round(MAX_SIZE_BYTES[rule.category] / (1024 * 1024));
    return { valid: false as const, error: `File exceeds the ${maxMb}MB limit for ${rule.category} files` };
  }

  return { valid: true as const, category: rule.category };
}

/** Strips anything that isn't safe in a storage key / filesystem path. */
export function sanitizeFilename(filename: string): string {
  const ext = getExtension(filename);
  const base = filename.slice(0, filename.length - ext.length - 1);
  const cleanBase = base
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return ext ? `${cleanBase || "file"}.${ext}` : cleanBase || "file";
}

/** Builds the final object key: folder/uuid-sanitized-original-name.ext */
export function buildObjectKey(folder: StorageFolder, originalFilename: string): string {
  const safe = sanitizeFilename(originalFilename);
  return `${folder}/${crypto.randomUUID()}-${safe}`;
}
