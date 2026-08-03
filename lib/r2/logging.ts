import { createAdminClient } from "@/lib/supabase/admin";

export type StorageAction = "upload" | "download" | "delete" | "copy" | "move" | "multipart_complete" | "multipart_abort";

export async function logStorageEvent(params: {
  action: StorageAction;
  objectKey: string;
  sizeBytes?: number;
  status: "success" | "error";
  errorMessage?: string;
  userId?: string | null;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("storage_logs").insert({
      action: params.action,
      object_key: params.objectKey,
      size_bytes: params.sizeBytes ?? null,
      status: params.status,
      error_message: params.errorMessage ?? null,
      user_id: params.userId ?? null,
    });
  } catch (err) {
    // Logging must never break the actual storage operation.
    console.error("failed to write storage log", err);
  }
}
