import { S3Client } from "@aws-sdk/client-s3";

let cachedClient: S3Client | null = null;

/**
 * R2 is S3-API-compatible, so the standard AWS SDK v3 S3Client works as-is —
 * just point it at the R2 endpoint with region "auto". Server-only: never
 * import this from a Client Component.
 */
export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "R2 is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY (and optionally R2_ENDPOINT) in your environment."
    );
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return cachedClient;
}

export function getBucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured");
  return bucket;
}
