export const metadata = { title: "Terms of Service" };

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-title text-2xl text-text mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <p>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>

        <h2 className="text-title text-lg text-text pt-4">Penggunaan layanan</h2>
        <p>
          Fathir Code adalah platform download dan jual-beli script digital. Dengan
          menggunakan layanan ini, kamu setuju untuk tidak mengunggah script yang melanggar
          hukum, mengandung malware, atau melanggar hak cipta pihak lain.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Script premium &amp; pembayaran</h2>
        <p>
          Pembayaran script premium diproses lewat Pakasir (QRIS). Setelah pembayaran
          terkonfirmasi, kamu mendapatkan akses download permanen untuk script tersebut.
          Tidak ada refund otomatis kecuali ada kesalahan sistem yang terverifikasi.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Konten developer</h2>
        <p>
          Developer bertanggung jawab penuh atas script yang mereka unggah. Fathir Code
          berhak menghapus atau mengarsipkan script yang dilaporkan melanggar ketentuan ini.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Pembatasan tanggung jawab</h2>
        <p>
          Script disediakan "apa adanya". Kami tidak bertanggung jawab atas kerusakan yang
          timbul dari penggunaan script yang diunduh dari platform ini.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Perubahan ketentuan</h2>
        <p>
          Ketentuan ini dapat berubah sewaktu-waktu. Perubahan signifikan akan diumumkan di
          halaman ini.
        </p>
      </div>
    </div>
  );
}
