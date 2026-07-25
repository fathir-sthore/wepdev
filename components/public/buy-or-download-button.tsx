"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadButton } from "@/components/public/download-button";
import { PaymentModal } from "@/components/public/payment-modal";

export function BuyOrDownloadButton({
  scriptId,
  scriptTitle,
  price,
  userId,
  entitled,
  redirectTo,
}: {
  scriptId: string;
  scriptTitle: string;
  price: number;
  userId: string | null;
  entitled: boolean;
  redirectTo: string;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  if (entitled) {
    return <DownloadButton scriptId={scriptId} />;
  }

  function handleClick() {
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
      return;
    }
    setModalOpen(true);
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={handleClick}>
        <ShoppingCart size={16} />
        Buy — Rp {price.toLocaleString("id-ID")}
      </Button>

      {modalOpen && (
        <PaymentModal
          scriptId={scriptId}
          scriptTitle={scriptTitle}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
