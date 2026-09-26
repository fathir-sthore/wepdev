import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body request tidak valid" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const providerType = String(body.provider_type ?? "").trim();
  const os = String(body.os ?? "").trim();
  const cpuCores = Number(body.cpu_cores);
  const ramGb = Number(body.ram_gb);
  const diskGb = Number(body.disk_gb);
  const price = Number(body.price);
  const ipAddress = String(body.ip_address ?? "").trim();
  const port = body.port ? Number(body.port) : 22;
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const description = body.description ? String(body.description).trim() : null;
  const cpuModel = body.cpu_model ? String(body.cpu_model).trim() : null;

  const missing = [
    !title && "title",
    !providerType && "provider_type",
    !os && "os",
    !ipAddress && "ip_address",
    !username && "username",
    !password && "password",
  ].filter(Boolean);

  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Field wajib belum diisi: ${missing.join(", ")}` },
      { status: 400 }
    );
  }
  if (!Number.isFinite(cpuCores) || cpuCores <= 0) {
    return NextResponse.json({ ok: false, error: "CPU cores tidak valid" }, { status: 400 });
  }
  if (!Number.isFinite(ramGb) || ramGb <= 0) {
    return NextResponse.json({ ok: false, error: "RAM tidak valid" }, { status: 400 });
  }
  if (!Number.isFinite(diskGb) || diskGb <= 0) {
    return NextResponse.json({ ok: false, error: "Disk tidak valid" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ ok: false, error: "Harga tidak valid" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("vps_stock")
    .insert({
      uploaded_by: admin.user.id,
      title,
      description,
      provider_type: providerType,
      os,
      cpu_cores: cpuCores,
      cpu_model: cpuModel,
      ram_gb: ramGb,
      disk_gb: diskGb,
      price,
      ip_address: ipAddress,
      port,
      username,
      password,
    })
    .select("id, title")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: error?.message || "Gagal menyimpan stok VPS" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
