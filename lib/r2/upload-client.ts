import type { StorageFolder } from "@/lib/r2/paths";
import { PROXY_UPLOAD_THRESHOLD_BYTES } from "@/lib/r2/paths";

type ProgressCallback = (percent: number) => void;

const PART_RETRY_ATTEMPTS = 3;

/** POSTs a file to our own /api/r2/upload proxy route (browser -> our
 * server -> R2), via XHR so we still get upload progress events. Used for
 * files under PROXY_UPLOAD_THRESHOLD_BYTES — this never touches R2 directly
 * from the browser, so it works even without CORS configured on the bucket. */
function uploadViaProxy(
  file: File,
  folder: StorageFolder,
  onProgress?: (loaded: number) => void
): Promise<{ key: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/r2/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded);
    };
    xhr.onload = () => {
      let data: any = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // ignore parse failure — status check below still handles it
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.key) {
        resolve({ key: data.key });
      } else {
        reject(new Error(data.error ?? `upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("network error during upload"));
    xhr.send(form);
  });
}

/** PUTs a blob to a presigned URL via XHR (fetch has no upload progress
 * events), retrying on failure. Resolves with the response ETag header. */
function putWithProgress(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress?: (loaded: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    if (contentType) xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.getResponseHeader("ETag") ?? "");
      } else {
        reject(new Error(`upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("network error during upload"));
    xhr.send(blob);
  });
}

async function putWithRetry(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress?: (loaded: number) => void
): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= PART_RETRY_ATTEMPTS; attempt++) {
    try {
      return await putWithProgress(url, blob, contentType, onProgress);
    } catch (err) {
      lastError = err;
      if (attempt < PART_RETRY_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
  throw lastError;
}

/**
 * Uploads a file directly to R2 (browser → R2, never through our server),
 * automatically using multipart for large files. Progress is reported as an
 * overall 0-100 percent across all parts.
 */
export async function uploadFileToR2(
  file: File,
  folder: StorageFolder,
  onProgress?: ProgressCallback
): Promise<{ key: string }> {
  // Small files: proxy through our server — no CORS dependency at all.
  if (file.size <= PROXY_UPLOAD_THRESHOLD_BYTES) {
    return uploadViaProxy(file, folder, (loaded) => {
      onProgress?.(Math.round((loaded / file.size) * 100));
    });
  }

  const presignRes = await fetch("/api/r2/presign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, filename: file.name, mimeType: file.type, size: file.size }),
  });

  if (!presignRes.ok) {
    const data = await presignRes.json().catch(() => ({}));
    throw new Error(data.error ?? "failed to prepare upload");
  }

  const presigned = await presignRes.json();

  if (presigned.type === "single") {
    await putWithRetry(presigned.url, file, file.type, (loaded) => {
      onProgress?.(Math.round((loaded / file.size) * 100));
    });
    return { key: presigned.key };
  }

  // Multipart: upload parts with limited concurrency, track combined progress.
  const { key, uploadId, partSize, parts } = presigned as {
    key: string;
    uploadId: string;
    partSize: number;
    parts: { partNumber: number; url: string }[];
  };

  const loadedByPart = new Map<number, number>();
  function reportProgress() {
    const total = [...loadedByPart.values()].reduce((a, b) => a + b, 0);
    onProgress?.(Math.round((total / file.size) * 100));
  }

  const CONCURRENCY = 4;
  const results: { PartNumber: number; ETag: string }[] = [];
  const queue = [...parts];

  async function worker() {
    while (queue.length > 0) {
      const part = queue.shift();
      if (!part) return;
      const start = (part.partNumber - 1) * partSize;
      const blob = file.slice(start, Math.min(start + partSize, file.size));

      try {
        const etag = await putWithRetry(part.url, blob, file.type, (loaded) => {
          loadedByPart.set(part.partNumber, loaded);
          reportProgress();
        });
        loadedByPart.set(part.partNumber, blob.size);
        reportProgress();
        results.push({ PartNumber: part.partNumber, ETag: etag });
      } catch (err) {
        // Bail out the whole upload — abort server-side so R2 doesn't keep
        // an orphaned incomplete multipart session around.
        await fetch("/api/r2/abort-multipart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, uploadId }),
        }).catch(() => {});
        throw err;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const completeRes = await fetch("/api/r2/complete-multipart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key,
      uploadId,
      size: file.size,
      parts: results.sort((a, b) => a.PartNumber - b.PartNumber),
    }),
  });

  if (!completeRes.ok) {
    const data = await completeRes.json().catch(() => ({}));
    throw new Error(data.error ?? "failed to finalize upload");
  }

  return { key };
}
