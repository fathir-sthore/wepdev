import { getAllVpsStockAdmin } from "@/lib/queries/vps";
import { CreateVpsStockForm } from "@/components/admin/create-vps-stock-form";
import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, Cpu, MemoryStick } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  available: "bg-free/15 text-free",
  reserved: "bg-premium/15 text-premium",
  sold: "bg-muted/15 text-muted",
};

export default async function AdminVpsStockPage() {
  const { stock, total } = await getAllVpsStockAdmin({});

  return (
    <div>
      <h1 className="text-title text-2xl text-text mb-6">VPS Stock</h1>
      <p className="text-sm text-muted mb-4">{total} unit</p>

      <CreateVpsStockForm />

      <div className="grid gap-3 mt-6">
        {stock.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text flex items-center gap-2">
                  {v.title}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${STATUS_STYLE[v.status]}`}>
                    {v.status}
                  </span>
                </p>
                <p className="text-xs text-muted">
                  {v.provider_type} — {v.os}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Cpu size={12} /> {v.cpu_cores} core
                  </span>
                  <span className="flex items-center gap-1">
                    <MemoryStick size={12} /> {v.ram_gb} GB
                  </span>
                  <span className="flex items-center gap-1">
                    <HardDrive size={12} /> {v.disk_gb} GB
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {v.ip_address}:{v.port}
                </p>
              </div>
              <p className="text-sm font-semibold text-accent shrink-0">
                Rp {v.price.toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}
        {stock.length === 0 && <p className="text-sm text-muted">Belum ada stok VPS.</p>}
      </div>
    </div>
  );
}
