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
  stock,
  passwordProtected,
}: {
  scriptId: string;
  scriptTitle: string;
  price: number;
  userId: string | null;
  entitled: boolean;
  redirectTo: string;
  stock?: number | null;
  passwordProtected?: boolean;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  if (entitled) {
    return <DownloadButton scriptId={scriptId} passwordProtected={passwordProtected} />;
  }

  const soldOut = stock !== null && stock !== undefined && stock <= 0;

  function handleClick() {
    if (!userId) {
      router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
      return;
    }
    setModalOpen(true);
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={handleClick} disabled={soldOut}>
        <ShoppingCart size={16} />
        {soldOut ? "Stok Habis" : `Buy — Rp ${price.toLocaleString("id-ID")}`}
      </Button>
      {!soldOut && typeof stock === "number" && (
        <p className="text-center font-data text-[11px] text-muted mt-1">
          sisa stok: {stock}
        </p>
      )}

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
