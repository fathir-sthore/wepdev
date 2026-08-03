import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFile, deleteFiles } from "@/lib/r2/service";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "login required" }, { status: 401 });
  }

  const { key, keys } = await request.json();

  try {
    if (Array.isArray(keys) && keys.length > 0) {
      await deleteFiles(keys, user.id);
    } else if (key) {
      await deleteFile(key, user.id);
    } else {
      return NextResponse.json({ error: "key or keys is required" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "failed to delete file" }, { status: 500 });
  }
}
