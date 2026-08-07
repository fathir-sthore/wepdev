import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile } from "@/lib/r2/service";
import { buildObjectKey, resolveScriptSubfolder, type StorageFolder } from "@/lib/r2/paths";

// A path already looks like an R2 key if it starts with one of our folder
// prefixes — anything else is assumed to be a leftover Supabase Storage
// path from before the migration.
function isR2Key(path: string) {
  return /^(scripts|images|documents|temporary|backup)\//.test(path);
}

async function migrateOne(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  oldPath: string,
  destFolder: StorageFolder,
  userId: string
): Promise<string | null> {
  if (isR2Key(oldPath)) return oldPath; // already migrated

  const { data: blob, error } = await admin.storage.from(bucket).download(oldPath);
  if (error || !blob) {
    console.error(`migrate: failed to download ${bucket}/${oldPath}`, error);
    return null;
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const filename = oldPath.split("/").pop() ?? "file";
  const newKey = buildObjectKey(destFolder, filename);

  await uploadFile(newKey, buffer, blob.type || "application/octet-stream", userId);
  return newKey;
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "login required" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "admin only" }, { status: 403 });

  const admin = createAdminClient();
  const summary = { scripts: 0, banners: 0, avatars: 0, failed: [] as string[] };

  // --- scripts ---------------------------------------------------------
  const { data: scripts } = await admin
    .from("scripts")
    .select("id, title, file_path, thumbnail_path, screenshot_paths, documentation_path, category_id, programming_language");

  for (const script of scripts ?? []) {
    let categorySlug: string | null = null;
    if (script.category_id) {
      const { data: cat } = await admin.from("categories").select("slug").eq("id", script.category_id).maybeSingle();
      categorySlug = cat?.slug ?? null;
    }
    const scriptFolder = `scripts/${resolveScriptSubfolder(categorySlug, script.programming_language)}` as StorageFolder;

    const updates: {
      file_path?: string;
      thumbnail_path?: string;
      documentation_path?: string;
      screenshot_paths?: string[];
    } = {};
    let changed = false;

    if (script.file_path && !isR2Key(script.file_path)) {
      const newKey = await migrateOne(admin, "scripts", script.file_path, scriptFolder, user.id);
      if (newKey) { updates.file_path = newKey; changed = true; } else summary.failed.push(`${script.title} (file)`);
    }
    if (script.thumbnail_path && !isR2Key(script.thumbnail_path)) {
      const newKey = await migrateOne(admin, "thumbnails", script.thumbnail_path, "images/thumbnails", user.id);
      if (newKey) { updates.thumbnail_path = newKey; changed = true; } else summary.failed.push(`${script.title} (thumbnail)`);
    }
    if (script.documentation_path && !isR2Key(script.documentation_path)) {
      const newKey = await migrateOne(admin, "documents", script.documentation_path, "documents", user.id);
      if (newKey) { updates.documentation_path = newKey; changed = true; } else summary.failed.push(`${script.title} (docs)`);
    }
    if (script.screenshot_paths?.length) {
      const needsMigration = script.screenshot_paths.some((p: string) => !isR2Key(p));
      if (needsMigration) {
        const newPaths = await Promise.all(
          script.screenshot_paths.map((p: string) => migrateOne(admin, "screenshots", p, "images/screenshots", user.id))
        );
        if (newPaths.every(Boolean)) {
          updates.screenshot_paths = newPaths as string[];
          changed = true;
        } else {
          summary.failed.push(`${script.title} (screenshots)`);
        }
      }
    }

    if (changed) {
      await admin.from("scripts").update(updates).eq("id", script.id);
      summary.scripts++;
    }
  }

  // --- banners -----------------------------------------------------------
  const { data: banners } = await admin.from("banners").select("id, title, image_path");
  for (const banner of banners ?? []) {
    if (banner.image_path && !isR2Key(banner.image_path)) {
      const newKey = await migrateOne(admin, "banners", banner.image_path, "images/banners", user.id);
      if (newKey) {
        await admin.from("banners").update({ image_path: newKey }).eq("id", banner.id);
        summary.banners++;
      } else {
        summary.failed.push(`banner: ${banner.title}`);
      }
    }
  }

  // --- avatars (stored as full Supabase Storage URLs) --------------------
  const { data: profiles } = await admin.from("profiles").select("id, username, avatar_url");
  for (const p of profiles ?? []) {
    if (p.avatar_url?.includes("/storage/v1/object/public/avatars/")) {
      const oldPath = p.avatar_url.split("/storage/v1/object/public/avatars/")[1];
      const newKey = await migrateOne(admin, "avatars", oldPath, "images/avatars", user.id);
      if (newKey) {
        const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;
        await admin.from("profiles").update({ avatar_url: `${publicBase}/${newKey}` }).eq("id", p.id);
        summary.avatars++;
      } else {
        summary.failed.push(`avatar: ${p.username}`);
      }
    }
  }

  return NextResponse.json({ ok: true, summary });
}
