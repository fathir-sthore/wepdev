import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeMultipartUpload } from "@/lib/r2/service";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { key, uploadId, parts, size } = await request.json();
  if (!key || !uploadId || !Array.isArray(parts)) {
    return NextResponse.json({ error: "key, uploadId, and parts are required" }, { status: 400 });
  }

  try {
    await completeMultipartUpload(key, uploadId, parts, user.id, size);
    return NextResponse.json({ ok: true, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "failed to complete upload" }, { status: 500 });
  }
}
