export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 prose-invert">
      <h1 className="text-title text-2xl text-text mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <p>Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}</p>

        <h2 className="text-title text-lg text-text pt-4">Data yang kami kumpulkan</h2>
        <p>
          Kami mengumpulkan informasi akun (email, username), aktivitas di platform (download,
          favorit, review), dan data pembayaran yang diperlukan untuk memproses transaksi script
          premium melalui Pakasir.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Bagaimana kami menggunakan data</h2>
        <p>
          Data digunakan untuk mengoperasikan layanan: memproses login, menampilkan riwayat
          download/favorit, memproses pembayaran, dan mengirim notifikasi terkait akun kamu.
          Kami tidak menjual data pribadi ke pihak ketiga.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Penyimpanan &amp; keamanan</h2>
        <p>
          Data disimpan di Supabase (PostgreSQL) dengan Row Level Security aktif di setiap
          tabel, dan file (script, gambar) disimpan di Supabase Storage. IP address disimpan
          dalam bentuk hash, bukan alamat mentah.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Hak kamu</h2>
        <p>
          Kamu bisa mengunduh salinan seluruh data akunmu atau menghapus akun secara permanen
          kapan saja lewat halaman Profile &amp; Settings → Privasi.
        </p>

        <h2 className="text-title text-lg text-text pt-4">Kontak</h2>
        <p>
          Pertanyaan seputar privasi bisa dikirim ke{" "}
          <a href="mailto:fathirsthore@gmail.com" className="text-accent hover:underline">
            fathirsthore@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
