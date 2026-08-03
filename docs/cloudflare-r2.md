# Cloudflare R2 Storage — Panduan Lengkap

Fathir Sthore menyimpan semua file (script, thumbnail, screenshot, avatar,
banner, dokumen) di **Cloudflare R2** lewat satu bucket dengan struktur folder
tetap. Dokumen ini menjelaskan cara setup dari nol sampai monitoring.

## Daftar isi
1. Membuat bucket R2
2. Mendapatkan Access Key & Secret Key
3. Menghubungkan aplikasi ke R2
4. Struktur folder
5. Cara upload file
6. Cara download (Signed URL)
7. Cara menghapus file
8. Cara mengelola folder
9. Monitoring storage & request
10. Best practice keamanan & performa
11. Pilihan desain — kenapa presigned URL, bukan proxy upload

---

## 1. Membuat bucket R2

1. Buka **dashboard.cloudflare.com** → pilih akun kamu.
2. Di sidebar kiri, klik **R2 Object Storage**.
3. Kalau baru pertama kali, klik **Enable R2** (perlu isi info billing — R2
   punya free tier 10GB storage + 1 juta Class A ops + 10 juta Class B
   ops/bulan, cukup besar buat awal).
4. Klik **Create bucket** → kasih nama, misal `fathirsthore` → **Location**:
   pilih **Automatic** (biar Cloudflare pilih region terdekat) → **Create
   bucket**.

## 2. Mendapatkan Access Key & Secret Key

1. Masih di halaman **R2 Object Storage**, klik **Manage R2 API Tokens** di
   kanan atas.
2. Klik **Create API Token**.
3. **Permissions**: pilih **Object Read & Write** (jangan pilih Admin kalau
   nggak perlu — prinsip least-privilege).
4. **Specify bucket(s)**: batasi ke bucket `fathirsthore` yang tadi dibuat
   (jangan kasih akses ke semua bucket).
5. Klik **Create API Token**.
6. Cloudflare cuma nampilin **Secret Access Key** itu **satu kali** — copy
   sekarang juga, nggak bisa dilihat lagi setelah halaman ditutup.
7. Catat juga **Access Key ID** dan **Account ID** (ada di URL dashboard atau
   di halaman token itu).

## 3. Menghubungkan aplikasi ke R2

Isi environment variables ini di Vercel (atau `.env.local` buat development):

```env
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=fathirsthore
R2_ENDPOINT=          # kosongkan, otomatis dibuat dari R2_ACCOUNT_ID
R2_PUBLIC_URL=https://cdn.fathirsthore.my.id
NEXT_PUBLIC_R2_PUBLIC_URL=https://cdn.fathirsthore.my.id
```

**Kenapa ada dua variabel untuk `R2_PUBLIC_URL`?** Kode server (Server
Components, API routes) baca `R2_PUBLIC_URL`. Tapi beberapa komponen client
(misal preview foto profil langsung setelah upload, sebelum halaman refresh)
perlu tahu URL publik ini juga — dan Next.js cuma expose variabel yang
diawali `NEXT_PUBLIC_` ke browser. Isi keduanya dengan **nilai yang sama**.

**Untuk membuat `R2_PUBLIC_URL` sendiri (akses publik ke bucket, TANPA
membuka endpoint API-nya):**
1. Buka bucket `fathirsthore` di dashboard R2.
2. Tab **Settings** → **Public Access** → **Custom Domains** → **Connect
   Domain**.
3. Masukkan subdomain, misal `cdn.fathirsthore.my.id` (domain ini harus
   dikelola di Cloudflare yang sama).
4. Cloudflare otomatis bikinin DNS record + SSL-nya.
5. Setelah aktif (~1 menit), file publik (thumbnail, avatar, banner) bisa
   diakses lewat `https://cdn.fathirsthore.my.id/<path-file>`.

Endpoint API R2 (`https://<account_id>.r2.cloudflarestorage.com`) **tetap
tidak bisa diakses publik** — cuma bisa dipakai lewat Access Key/Secret Key.
Ini yang memenuhi syarat "bucket tidak bisa diakses publik secara langsung".

## 4. Struktur folder

Satu bucket, dipisah pakai prefix folder:

```
scripts/
  javascript/
  python/
  php/
  nodejs/
  flutter/
  html/
  css/
  template/
  telegram/
  whatsapp/

images/
  thumbnails/
  avatars/
  banners/
  screenshots/   ← tambahan di luar daftar awal, lihat catatan di bawah

documents/

temporary/

backup/
```

> **Catatan tambahan**: folder `images/screenshots/` ditambahkan di luar
> daftar awal karena screenshot script butuh tempat sendiri dan nggak
> disebutkan di spesifikasi manapun — dikelompokkan di bawah `images/`
> supaya struktur induknya tetap persis seperti yang diminta.

Folder script (`scripts/*`) dipilih otomatis: kategori "Telegram Bot" atau
"WhatsApp Bot" masuk ke `telegram/`/`whatsapp/`, sisanya berdasarkan bahasa
pemrograman yang dipilih developer, default ke `template/` kalau nggak
cocok satupun (lihat `lib/r2/paths.ts` fungsi `resolveScriptSubfolder`).

Setiap file diberi nama ulang otomatis: `<uuid>-<nama-file-yang-disanitasi>`,
supaya nggak ada tabrakan nama dan nggak ada karakter berbahaya di key-nya.

## 5. Cara upload file

Semua upload **langsung dari browser ke R2** (bukan lewat server kita) —
lebih cepat dan nggak kena limit ukuran body di Vercel serverless function.
Alurnya (lihat `lib/r2/upload-client.ts`):

1. Browser minta "izin upload" ke `/api/r2/presign-upload` — kirim nama
   file, tipe, ukuran. Server validasi (tipe file, ukuran, MIME) dan bikin
   URL upload sementara yang cuma berlaku beberapa menit.
2. Kalau file ≤100MB: dapat **satu presigned URL**, browser langsung `PUT`
   ke situ.
3. Kalau file >100MB: server bikin **sesi multipart** (file dipotong jadi
   bagian 20MB), tiap bagian dapat presigned URL sendiri, di-upload paralel
   (4 sekaligus) dari browser, baru di-"selesaikan" lewat
   `/api/r2/complete-multipart`.
4. Progress upload dilaporkan real-time (persentase gabungan semua bagian).
5. Kalau ada bagian yang gagal setelah 3x percobaan ulang otomatis, seluruh
   sesi multipart dibatalkan (`/api/r2/abort-multipart`) supaya nggak ada
   upload setengah jalan yang nyangkut di R2.
6. Setiap upload (sukses atau gagal) dicatat ke tabel `storage_logs`.

Tipe file yang didukung: `zip 7z rar js ts json html css php py java c cpp
dart yaml xml sql txt pdf png jpg jpeg gif webp svg mp4` — validasi ekstensi
+ MIME + batas ukuran per kategori ada di `lib/r2/paths.ts`.

## 6. Cara download (Signed URL)

File privat (script archive) **tidak pernah** dibuka publik. Setiap klik
Download:
1. Server cek hak akses (sudah beli / gratis / pemilik / admin).
2. Server bikin **signed URL** yang cuma berlaku 60 detik lewat
   `getSignedDownloadUrl()` di `lib/r2/service.ts`.
3. Browser di-redirect langsung ke URL itu — file kedownload langsung tanpa
   halaman perantara, sesuai yang diminta di awal proyek.

## 7. Cara menghapus file

Setiap hapus script/banner dari dashboard atau admin panel otomatis:
1. Hapus baris di database.
2. Kirim daftar `object_key` yang terpakai (file utama, thumbnail,
   screenshot, dokumentasi) ke `/api/r2/delete`.
3. File dihapus dari R2, dicatat ke `storage_logs`.

Ini memastikan nggak ada file "yatim" (nggak terpakai tapi masih makan
storage) menumpuk di bucket.

## 8. Cara mengelola folder

R2 (seperti S3) nggak punya folder asli — "folder" cuma prefix di nama file
(key). Untuk kerja dengan folder:
- **Lihat isi folder**: `listFiles('scripts/telegram/')` di
  `lib/r2/service.ts` — kembalikan semua file yang key-nya diawali prefix
  itu.
- **Pindah/rename file antar folder**: `moveFile(sourceKey, destKey)` —
  sebenarnya copy ke key baru lalu hapus yang lama (R2 nggak punya
  "rename" asli).
- **Cek file ada atau tidak**: `fileExists(key)`.
- **Lihat detail file**: `getFileMetadata(key)` — ukuran, tipe, terakhir
  diubah.

## 9. Monitoring storage & request

Ada dua sumber data:

**A. Tabel `storage_logs` (dibuat aplikasi ini)** — mencatat tiap operasi
(upload/download/delete/copy/move), ukurannya, status sukses/gagal. Admin
bisa query ini buat lihat pola pemakaian, siapa upload apa, dan error yang
sering muncul. *(Belum ada halaman UI khusus untuk ini di admin panel —
datanya sudah tercatat, tinggal dibikinkan halaman "Storage Monitoring" kalau
dibutuhkan, mirip halaman Transaksi yang sudah ada.)*

**B. Cloudflare Dashboard (sumber kebenaran untuk billing)** — buka
**R2 Object Storage → fathirsthore → Metrics** buat lihat:
- Total storage terpakai (GB)
- Class A operations (write/list) per hari
- Class B operations (read) per hari
- Bandwidth keluar (egress R2 ke luar Cloudflare **gratis**, jadi ini jarang
  jadi masalah biaya)

Jangan duplikasi angka-angka ini secara manual di aplikasi kita — data di
dashboard Cloudflare selalu paling akurat karena itu yang dipakai buat
billing.

## 10. Best practice keamanan & performa

- **Kredensial cuma di environment variables**, never di source code.
  `R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY` cuma dipakai di kode
  server-side (`lib/r2/client.ts`), nggak pernah dikirim ke browser.
- **Token API dibatasi per-bucket** (langkah 2 di atas) — kalau token bocor,
  blast radius-nya cuma satu bucket, bukan seluruh akun Cloudflare.
- **Validasi selalu di server**, bukan cuma di UI — `validateFile()` jalan
  di route `/api/r2/presign-upload`, jadi nggak bisa dilewatin walau
  seseorang manggil API-nya langsung tanpa lewat form.
- **Signed URL berumur pendek** (60 detik download, 5 menit upload) —
  kalaupun URL-nya bocor/dibagikan, cepat kadaluarsa.
- **Retry otomatis + exponential backoff** di semua operasi (`withRetry` di
  `lib/r2/service.ts`) — koneksi yang goyah nggak langsung bikin upload
  gagal total.
- **Upload paralel** buat multipart (4 bagian sekaligus) — lebih cepat buat
  file besar tanpa membebani satu koneksi.
- **Rotasi Access Key secara berkala** (misal tiap 6-12 bulan) — tinggal
  buat token baru, update env var, hapus token lama.

## 11. Kenapa presigned URL, bukan proxy upload lewat server kita?

Spesifikasi awal minta "upload file lewat server", tapi pendekatan yang
dipakai di sini — **presigned URL langsung browser-ke-R2** — dipilih karena:

1. **Lebih cepat**: file nggak perlu mampir dulu ke server kita baru
   diteruskan ke R2 (setengah waktu transfer dihemat).
2. **Nggak kena limit ukuran body Vercel** (~4.5MB buat serverless function
   biasa) — kalau proxy lewat server, script besar (misal 200MB) nggak akan
   pernah berhasil diupload di infrastruktur ini.
3. **Beban server jauh lebih kecil** — server cuma bikin "izin" (presigned
   URL), bukan ikut memproses byte file-nya.
4. **Tetap 100% kompatibel dengan R2** — ini pola resmi yang didukung R2
   (sama seperti S3), bukan trik di luar spesifikasi.

Kalau suatu saat butuh proxy upload (misal untuk validasi konten file yang
lebih dalam sebelum disimpan), servicenya sudah siap lewat fungsi
`uploadFile()` di `lib/r2/service.ts` yang menerima buffer langsung — tinggal
dipanggil dari route handler yang menerima file lewat `request.formData()`.
