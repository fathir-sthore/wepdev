import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateFile, buildObjectKey, PROXY_UPLOAD_THRESHOLD_BYTES, type StorageFolder } from "@/lib/r2/paths";
import { uploadFile } from "@/lib/r2/service";

/**
 * Server-proxied upload: browser -> this route -> R2 (via our own R2
 * credentials, server-side). Used for files under PROXY_UPLOAD_THRESHOLD_BYTES
 * so uploads work without needing CORS configured on the R2 bucket — the
 * browser only ever talks to our own origin. Larger files still go through
 * the presigned direct-to-R2 flow (see /api/r2/presign-upload), which does
 * require R2 bucket CORS to be set up for PUT from this site's origin.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");

  if (!(file instanceof File) || typeof folder !== "string") {
    return NextResponse.json({ error: "file and folder are required" }, { status: 400 });
  }

  if (file.size > PROXY_UPLOAD_THRESHOLD_BYTES) {
    return NextResponse.json(
      { error: "file too large for proxy upload — use the presigned upload flow instead" },
      { status: 413 }
    );
  }

  const validation = validateFile(file.name, file.type, file.size);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const key = buildObjectKey(folder as StorageFolder, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadFile(key, buffer, file.type || "application/octet-stream", user.id);
    return NextResponse.json({ key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "upload failed" }, { status: 500 });
  }
}
