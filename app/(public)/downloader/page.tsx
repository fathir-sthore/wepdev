import { DownloaderPanel } from "@/components/public/downloader-panel";

export const metadata = {
  title: "Downloader — TikTok, YouTube & Spotify | Fathir Code",
  description:
    "Unduh video TikTok tanpa watermark, video/audio YouTube, dan lagu Spotify — gratis, cepat, tanpa aplikasi tambahan.",
  alternates: { canonical: "/downloader" },
};

export default function DownloaderPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-title text-3xl sm:text-4xl text-text">
          Satu tempat, semua unduhan
        </h1>
        <p className="text-sm sm:text-base text-muted mt-3">
          Tempel link TikTok, YouTube, atau Spotify — dapatkan file video atau audionya
          langsung, tanpa watermark, tanpa iklan berlebih.
        </p>
      </div>

      <DownloaderPanel />

      <p className="text-center text-xs text-muted mt-10 max-w-xl mx-auto">
        Gunakan secara bertanggung jawab — unduh hanya konten yang kamu punya hak untuk
        menyimpannya, dan hormati hak cipta pembuat aslinya.
      </p>
    </div>
  );
}
