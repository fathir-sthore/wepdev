"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Apakah semua script gratis?",
    a: "Sebagian script gratis, sebagian premium. Setiap halaman script menampilkan status FREE atau harga premium secara jelas.",
  },
  {
    q: "Bagaimana cara upload script?",
    a: "Daftar sebagai developer, lalu upload lewat Dashboard Developer setelah akun kamu aktif.",
  },
  {
    q: "Apakah script diperiksa sebelum publish?",
    a: "Ya, setiap script premium melalui proses review sebelum berstatus published dan tampil di pencarian.",
  },
  {
    q: "Bagaimana jika ada script yang bermasalah?",
    a: "Gunakan tombol Report di halaman script untuk melaporkan ke tim kami.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="font-mono text-lg text-text mb-4">FAQ</h2>
      <div className="divide-y divide-line border-y border-line">
        {faqs.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="font-mono text-sm text-text">{item.q}</span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-muted transition-transform shrink-0 ml-4",
                  openIndex === i && "rotate-180"
                )}
              />
            </button>
            {openIndex === i && (
              <p className="pb-4 text-sm text-muted">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
