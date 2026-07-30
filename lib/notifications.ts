import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "purchase_completed"
  | "review_received"
  | "report_filed"
  | "security_alert";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  linkUrl?: string;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message ?? null,
      link_url: params.linkUrl ?? null,
    });
  } catch (err) {
    // Never let a notification failure break the calling flow.
    console.error("failed to create notification", err);
  }
}
