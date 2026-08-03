const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

/** Builds a public URL for a file stored in R2 (thumbnails, screenshots,
 * avatars, banners). The `bucket` param is kept for call-site compatibility
 * but unused — R2 uses one bucket with the folder baked into the stored key
 * itself (e.g. "images/thumbnails/uuid-name.jpg"). */
export function publicStorageUrl(_bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (!R2_PUBLIC_URL) return null;
  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${path}`;
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

export function formatCount(n: number | null | undefined) {
  if (!n) return "0";
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}
