export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  notes: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.1",
    date: "2026-08-10",
    title: "Futuristic Developer Marketplace",
    notes: [
      "Rebranding: resmi berganti nama dari Fathir Sthore menjadi Fathir Code.",
      "Redesign UI/UX: Futuristic Developer Dark Theme dengan aksen Electric Cyan & Hyper Purple.",
      "Hierarki tipografi baru: Bold Serif untuk judul, Italic untuk sub-judul, dan Bold Sans untuk angka/statistik.",
      "Sistem badge FREE/PREMIUM yang lebih jelas di setiap card produk & source code.",
      "Widget statistik developer baru: total upload, download, revenue, dan views di halaman My Scripts.",
      "Code preview engine: syntax highlighting JetBrains Mono ala VS Code Dark+.",
      "Optimasi aksesibilitas: empty state, error page, dan skeleton loading di seluruh halaman.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-08-04",
    title: "Peluncuran awal",
    notes: [
      "Peluncuran perdana Fathir Sthore — marketplace script & source code.",
      "Autentikasi email OTP, Google, GitHub, dan Discord.",
      "Pembayaran QRIS via Pakasir dengan polling real-time.",
      "Panel admin lengkap dengan statistik, CRUD, dan export CSV/Excel/PDF.",
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0].version;
