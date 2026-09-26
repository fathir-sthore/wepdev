"use client";

import { useState } from "react";
import { Cpu, MemoryStick, HardDrive, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/public/payment-modal";

type VpsListing = {
  id: string;
  title: string;
  description: string | null;
  provider_type: string;
  os: string;
  cpu_cores: number;
  cpu_model: string | null;
  ram_gb: number;
  disk_gb: number;
  price: number;
};

export function VpsCard({ vps }: { vps: VpsListing }) {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <div className="glass rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-signal" />
          <span className="text-xs text-signal">{vps.provider_type}</span>
        </div>

        <h3 className="text-title text-base text-text">{vps.title}</h3>
        {vps.description && <p className="text-xs text-muted line-clamp-2">{vps.description}</p>}

        <div className="grid grid-cols-2 gap-2 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Cpu size={13} /> {vps.cpu_cores} core{vps.cpu_model ? ` (${vps.cpu_model})` : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <MemoryStick size={13} /> {vps.ram_gb} GB RAM
          </span>
          <span className="flex items-center gap-1.5">
            <HardDrive size={13} /> {vps.disk_gb} GB Disk
          </span>
          <span className="flex items-center gap-1.5">{vps.os}</span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-line">
          <p className="text-stat text-lg text-accent">Rp {vps.price.toLocaleString("id-ID")}</p>
          <Button size="sm" onClick={() => setShowPayment(true)}>
            Beli
          </Button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          kind="vps"
          scriptId={vps.id}
          scriptTitle={vps.title}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
