import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { abortMultipartUpload } from "@/lib/r2/service";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { key, uploadId } = await request.json();
  if (!key || !uploadId) {
    return NextResponse.json({ error: "key and uploadId are required" }, { status: 400 });
  }

  try {
    await abortMultipartUpload(key, uploadId, user.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "failed to abort upload" }, { status: 500 });
  }
}
