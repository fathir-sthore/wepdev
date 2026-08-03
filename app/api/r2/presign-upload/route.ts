import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateFile,
  buildObjectKey,
  MULTIPART_THRESHOLD_BYTES,
  type StorageFolder,
} from "@/lib/r2/paths";
import {
  getPresignedUploadUrl,
  initiateMultipartUpload,
  getPresignedPartUrl,
} from "@/lib/r2/service";

const PART_SIZE_BYTES = 20 * 1024 * 1024; // 20MB per part

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { folder, filename, mimeType, size } = await request.json();
  if (!folder || !filename || typeof size !== "number") {
    return NextResponse.json({ error: "folder, filename, and size are required" }, { status: 400 });
  }

  const validation = validateFile(filename, mimeType ?? "", size);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const key = buildObjectKey(folder as StorageFolder, filename);

  try {
    if (size <= MULTIPART_THRESHOLD_BYTES) {
      const url = await getPresignedUploadUrl(key, mimeType || "application/octet-stream");
      return NextResponse.json({ type: "single", key, url });
    }

    // Large file: initiate multipart and pre-sign every part's URL up front
    // so the browser can upload parts in parallel.
    const { uploadId } = await initiateMultipartUpload(key, mimeType || "application/octet-stream");
    const partCount = Math.ceil(size / PART_SIZE_BYTES);
    const parts = await Promise.all(
      Array.from({ length: partCount }, (_, i) => i + 1).map(async (partNumber) => ({
        partNumber,
        url: await getPresignedPartUrl(key, uploadId, partNumber),
      }))
    );

    return NextResponse.json({ type: "multipart", key, uploadId, partSize: PART_SIZE_BYTES, parts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "failed to presign upload" }, { status: 500 });
  }
}
