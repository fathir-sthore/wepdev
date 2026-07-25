import { createHash } from "crypto";

/** One-way hash of an IP so we can dedupe/rate-limit without storing raw IPs. */
export function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
