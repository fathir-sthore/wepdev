import { createClient } from "@/lib/supabase/server";
import { getAvailableVpsStock } from "@/lib/queries/vps";
import { VpsCard } from "@/components/public/vps-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";

export const metadata = {
  title: "Panel & Hosting — VPS | Fathir Code",
  description: "Sewa VPS siap pakai — berbagai spesifikasi dan provider, aktif langsung setelah pembayaran.",
  alternates: { canonical: "/panel-hosting" },
};

export default async function PanelHostingPage() {
  const supabase = await createClient();
  const listings = await getAvailableVpsStock(supabase);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-title text-3xl text-text mb-3">Panel & Hosting</h1>
        <p className="text-sm text-muted">
          VPS siap pakai dengan berbagai spesifikasi. Kredensial login langsung tersedia begitu
          pembayaran berhasil.
        </p>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={Server}
          title="Belum ada VPS tersedia"
          description="Stok VPS sedang kosong — cek lagi nanti."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((vps) => (
            <VpsCard key={vps.id} vps={vps} />
          ))}
        </div>
      )}
    </div>
  );
}
