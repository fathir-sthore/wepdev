import Link from "next/link";
import { TerminalSquare, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full border border-line bg-panel2 p-4 mb-6 text-accent">
        <TerminalSquare size={32} />
      </div>

      <h1 className="text-title text-4xl text-text mb-2">404</h1>
      <p className="text-desc text-sm text-muted max-w-sm mb-8">
        Halaman yang kamu cari nggak ketemu — mungkin sudah dipindah, dihapus, atau memang belum
        pernah ada.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home size={16} /> Kembali ke home
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="outline" className="gap-2">
            <Search size={16} /> Cari script
          </Button>
        </Link>
      </div>
    </div>
  );
}
