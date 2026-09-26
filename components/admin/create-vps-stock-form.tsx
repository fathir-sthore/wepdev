"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle2, X } from "lucide-react";

const PROVIDER_SUGGESTIONS = ["DigitalOcean", "NAT", "Legal", "AWS", "GCP", "Vultr", "Contabo"];

export function CreateVpsStockForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    provider_type: "",
    os: "",
    cpu_cores: "",
    cpu_model: "",
    ram_gb: "",
    disk_gb: "",
    price: "",
    ip_address: "",
    port: "22",
    username: "",
    password: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm({
      title: "",
      description: "",
      provider_type: "",
      os: "",
      cpu_cores: "",
      cpu_model: "",
      ram_gb: "",
      disk_gb: "",
      price: "",
      ip_address: "",
      port: "22",
      username: "",
      password: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/vps-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error || "Gagal menyimpan stok VPS");
        return;
      }

      setSuccess(`Stok "${json.data.title}" berhasil ditambahkan`);
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {success && (
        <div className="mb-3 flex items-start gap-3 rounded-lg border border-free/30 bg-free/10 px-4 py-3">
          <CheckCircle2 size={18} className="text-free shrink-0 mt-0.5" />
          <p className="flex-1 text-sm text-text">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-muted hover:text-text shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {!open && (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus size={14} />
          Tambah stok VPS
        </Button>
      )}

      {open && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="vps-title">Judul listing</Label>
                <Input
                  id="vps-title"
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="VPS DigitalOcean 2GB NAT"
                />
              </div>

              <div>
                <Label htmlFor="vps-provider">Jenis VPS</Label>
                <Input
                  id="vps-provider"
                  required
                  list="vps-provider-suggestions"
                  value={form.provider_type}
                  onChange={(e) => update("provider_type", e.target.value)}
                  placeholder="DO, NAT, Legal, dll"
                />
                <datalist id="vps-provider-suggestions">
                  {PROVIDER_SUGGESTIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="vps-os">Sistem operasi</Label>
                <Input
                  id="vps-os"
                  required
                  value={form.os}
                  onChange={(e) => update("os", e.target.value)}
                  placeholder="Ubuntu 22.04"
                />
              </div>

              <div>
                <Label htmlFor="vps-cpu-cores">CPU (core)</Label>
                <Input
                  id="vps-cpu-cores"
                  type="number"
                  min={1}
                  required
                  value={form.cpu_cores}
                  onChange={(e) => update("cpu_cores", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vps-cpu-model">Model CPU (opsional)</Label>
                <Input
                  id="vps-cpu-model"
                  value={form.cpu_model}
                  onChange={(e) => update("cpu_model", e.target.value)}
                  placeholder="Xeon E5-2680"
                />
              </div>

              <div>
                <Label htmlFor="vps-ram">RAM (GB)</Label>
                <Input
                  id="vps-ram"
                  type="number"
                  min={1}
                  required
                  value={form.ram_gb}
                  onChange={(e) => update("ram_gb", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vps-disk">Disk (GB)</Label>
                <Input
                  id="vps-disk"
                  type="number"
                  min={1}
                  required
                  value={form.disk_gb}
                  onChange={(e) => update("disk_gb", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="vps-price">Harga (Rp)</Label>
                <Input
                  id="vps-price"
                  type="number"
                  min={0}
                  required
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="vps-desc">Deskripsi (opsional)</Label>
                <Input
                  id="vps-desc"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 border-t border-line pt-3 mt-1">
                <p className="text-xs text-muted mb-2">
                  Kredensial login — hanya admin & pembeli (setelah bayar) yang bisa lihat ini.
                </p>
              </div>

              <div>
                <Label htmlFor="vps-ip">IP Address</Label>
                <Input
                  id="vps-ip"
                  required
                  value={form.ip_address}
                  onChange={(e) => update("ip_address", e.target.value)}
                  placeholder="123.45.67.89"
                />
              </div>
              <div>
                <Label htmlFor="vps-port">Port</Label>
                <Input
                  id="vps-port"
                  type="number"
                  value={form.port}
                  onChange={(e) => update("port", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="vps-username">Username</Label>
                <Input
                  id="vps-username"
                  required
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  placeholder="root"
                />
              </div>
              <div>
                <Label htmlFor="vps-password">Password</Label>
                <Input
                  id="vps-password"
                  required
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </div>

              {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}

              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan stok"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
