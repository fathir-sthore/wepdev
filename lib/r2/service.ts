import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getBucketName } from "@/lib/r2/client";
import { logStorageEvent } from "@/lib/r2/logging";

const DEFAULT_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;
const DEFAULT_TIMEOUT_MS = 30_000;

/** Wraps any R2 operation with automatic retry (exponential backoff) and a
 * hard timeout per attempt. Every one of the exported functions below goes
 * through this. */
async function withRetry<T>(fn: () => Promise<T>, retries = DEFAULT_RETRIES): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await withTimeout(fn(), DEFAULT_TIMEOUT_MS);
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }
  throw lastError;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`R2 operation timed out after ${ms}ms`)), ms)),
  ]);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Upload (single PUT — used directly for small server-generated files; the
// app's actual upload UI uses the presigned URL below instead)
// ---------------------------------------------------------------------------
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  userId?: string | null
) {
  try {
    await withRetry(() =>
      getR2Client().send(
        new PutObjectCommand({
          Bucket: getBucketName(),
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      )
    );
    await logStorageEvent({ action: "upload", objectKey: key, sizeBytes: body.byteLength, status: "success", userId });
    return { key };
  } catch (err: any) {
    await logStorageEvent({ action: "upload", objectKey: key, status: "error", errorMessage: err.message, userId });
    throw err;
  }
}

/** Presigned PUT URL so the browser can upload directly to R2 — avoids
 * routing file bytes through our own serverless function (faster, and
 * sidesteps Vercel's request body size limits). This is the primary upload
 * path used by the app. */
export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
  const command = new PutObjectCommand({ Bucket: getBucketName(), Key: key, ContentType: contentType });
  return getSignedUrl(getR2Client(), command, { expiresIn });
}

// ---------------------------------------------------------------------------
// Multipart upload — used for files over MULTIPART_THRESHOLD_BYTES. Each
// part gets its own presigned URL so parts upload directly from the browser
// too, with independent retry per part.
// ---------------------------------------------------------------------------
export async function initiateMultipartUpload(key: string, contentType: string) {
  const result = await withRetry(() =>
    getR2Client().send(
      new CreateMultipartUploadCommand({ Bucket: getBucketName(), Key: key, ContentType: contentType })
    )
  );
  return { uploadId: result.UploadId! };
}

export async function getPresignedPartUrl(key: string, uploadId: string, partNumber: number, expiresIn = 600) {
  const command = new UploadPartCommand({
    Bucket: getBucketName(),
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  return getSignedUrl(getR2Client(), command, { expiresIn });
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[],
  userId?: string | null,
  sizeBytes?: number
) {
  try {
    await withRetry(() =>
      getR2Client().send(
        new CompleteMultipartUploadCommand({
          Bucket: getBucketName(),
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        })
      )
    );
    await logStorageEvent({ action: "multipart_complete", objectKey: key, sizeBytes, status: "success", userId });
    return { key };
  } catch (err: any) {
    await logStorageEvent({ action: "multipart_complete", objectKey: key, status: "error", errorMessage: err.message, userId });
    throw err;
  }
}

export async function abortMultipartUpload(key: string, uploadId: string, userId?: string | null) {
  try {
    await withRetry(() =>
      getR2Client().send(new AbortMultipartUploadCommand({ Bucket: getBucketName(), Key: key, UploadId: uploadId }))
    );
    await logStorageEvent({ action: "multipart_abort", objectKey: key, status: "success", userId });
  } catch (err: any) {
    await logStorageEvent({ action: "multipart_abort", objectKey: key, status: "error", errorMessage: err.message, userId });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Download (signed URL — the bucket itself is never public, see paths.ts doc)
// ---------------------------------------------------------------------------
export async function getSignedDownloadUrl(key: string, expiresIn = 60, userId?: string | null) {
  try {
    const command = new GetObjectCommand({ Bucket: getBucketName(), Key: key });
    const url = await getSignedUrl(getR2Client(), command, { expiresIn });
    await logStorageEvent({ action: "download", objectKey: key, status: "success", userId });
    return url;
  } catch (err: any) {
    await logStorageEvent({ action: "download", objectKey: key, status: "error", errorMessage: err.message, userId });
    throw err;
  }
}

/** Public URL for objects meant to be publicly viewable (thumbnails,
 * avatars, banners) — requires R2_PUBLIC_URL (or NEXT_PUBLIC_R2_PUBLIC_URL)
 * to be configured, pointing at a custom domain connected to the bucket's
 * "Public Access" setting in the Cloudflare dashboard — never the raw R2 API
 * endpoint, which stays access-key-gated. */
export function getPublicUrl(key: string): string | null {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${key}`;
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
export async function deleteFile(key: string, userId?: string | null) {
  try {
    await withRetry(() => getR2Client().send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key })));
    await logStorageEvent({ action: "delete", objectKey: key, status: "success", userId });
  } catch (err: any) {
    await logStorageEvent({ action: "delete", objectKey: key, status: "error", errorMessage: err.message, userId });
    throw err;
  }
}

export async function deleteFiles(keys: string[], userId?: string | null) {
  await Promise.all(keys.map((key) => deleteFile(key, userId)));
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------
export async function listFiles(prefix: string, maxKeys = 1000) {
  const result = await withRetry(() =>
    getR2Client().send(new ListObjectsV2Command({ Bucket: getBucketName(), Prefix: prefix, MaxKeys: maxKeys }))
  );
  return (result.Contents ?? []).map((obj) => ({
    key: obj.Key!,
    size: obj.Size ?? 0,
    lastModified: obj.LastModified,
  }));
}

// ---------------------------------------------------------------------------
// Metadata / existence
// ---------------------------------------------------------------------------
export async function getFileMetadata(key: string) {
  const result = await withRetry(() =>
    getR2Client().send(new HeadObjectCommand({ Bucket: getBucketName(), Key: key }))
  );
  return {
    size: result.ContentLength ?? 0,
    contentType: result.ContentType,
    lastModified: result.LastModified,
    etag: result.ETag,
  };
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: getBucketName(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Copy / move
// ---------------------------------------------------------------------------
export async function copyFile(sourceKey: string, destKey: string, userId?: string | null) {
  try {
    await withRetry(() =>
      getR2Client().send(
        new CopyObjectCommand({
          Bucket: getBucketName(),
          CopySource: `${getBucketName()}/${sourceKey}`,
          Key: destKey,
        })
      )
    );
    await logStorageEvent({ action: "copy", objectKey: destKey, status: "success", userId });
  } catch (err: any) {
    await logStorageEvent({ action: "copy", objectKey: destKey, status: "error", errorMessage: err.message, userId });
    throw err;
  }
}

export async function moveFile(sourceKey: string, destKey: string, userId?: string | null) {
  await copyFile(sourceKey, destKey, userId);
  await deleteFile(sourceKey, userId);
  await logStorageEvent({ action: "move", objectKey: destKey, status: "success", userId });
}
