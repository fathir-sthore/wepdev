# FATHIR CODE v1.0.2 — Laporan Perubahan

Commit: `b56b731` · Deploy: `https://fathirsthore.my.id` (production, READY)
Base: v1.0.1 (`74304cc`) — ini update inkremental, bukan rebuild.

---

## Changed (file yang diubah)

| File | Perubahan |
|---|---|
| `components/code/code-block.tsx` | Isolated scroll container + mode expand fullscreen |
| `app/(public)/code/[slug]/page.tsx` | Tambah `min-w-0` di grid column kiri |
| `components/auth/login-form.tsx` | Wiring CAPTCHA |
| `components/auth/register-form.tsx` | Wiring CAPTCHA + `emailRedirectTo` eksplisit |
| `components/auth/forgot-password-form.tsx` | Wiring CAPTCHA + `redirectTo` eksplisit |
| `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `lib/email/templates.ts` | Pakai `SITE_URL` dari `lib/site-url.ts`, hapus hardcode |
| `app/api/notify/review-received/route.ts`, `report-filed/route.ts`, `snippet-report/route.ts`, `snippet-comment/route.ts` | Pakai `SITE_URL` |
| `lib/payments/sync.ts` | Pakai `SITE_URL` |
| `.env.example` | Tambah 3 env var baru (lihat bagian Environment Variables) |
| `package.json`, `components/layout/footer.tsx`, `app/dashboard/profile/page.tsx`, `lib/changelog.ts` | Bump versi 1.0.1 → 1.0.2 |

## Added (file baru)

| File | Fungsi |
|---|---|
| `lib/site-url.ts` | Single source of truth URL production, baca dari `NEXT_PUBLIC_SITE_URL` |
| `components/auth/turnstile-widget.tsx` | Widget Cloudflare Turnstile, tidak render apa-apa kalau site key belum di-set |
| `app/api/captcha/verify/route.ts` | Verifikasi token Turnstile server-side (secret key aman di server) |
| `lib/captcha-client.ts` | Helper fetch bersama dipakai 3 form auth |

## Fixed (bug yang diperbaiki)

1. **Code viewer ikut scroll seluruh halaman** — sebelumnya `<pre>` cuma punya `overflow-x-auto`, jadi kode panjang bikin seluruh halaman jadi tinggi (nggak ada batas vertikal). Sekarang `<pre>` punya `max-h-[420px] overflow-auto overscroll-contain` — cuma area kode yang bisa digeser, halaman utama diam. `overscroll-contain` juga mastiin scroll nggak "bocor" ke halaman pas nyampe ujung atas/bawah kode. Ditambah `min-w-0` di parent grid biar baris kode yang sangat panjang nggak maksa layout 2-kolom-nya melebar.
2. **URL production tidak konsisten** — `SITE_URL` sebelumnya di-hardcode terpisah di 3 file (`layout.tsx`, `sitemap.ts`, `email/templates.ts`) plus 6 lokasi lain (`robots.ts`, 4 route notifikasi, `payments/sync.ts`). Sekarang semua nunjuk ke satu konstanta di `lib/site-url.ts`.

## Authentication — Perubahan Redirect Supabase

- **`signUp()`** sekarang eksplisit kirim `emailRedirectTo: ${origin}/auth/callback` — sebelumnya nggak dikirim sama sekali, jadi kalau template email Supabase pakai link konfirmasi, itu bakal fallback ke "Site URL" default di dashboard Supabase (yang bisa aja salah/belum di-set).
- **`resetPasswordForEmail()`** sekarang eksplisit kirim `redirectTo: ${origin}/forgot-password`.
- **Catatan penting:** alur signup verification & reset password di app ini sebenarnya **pakai kode OTP 8 digit** (`verifyOtp`), bukan klik link — jadi secara fungsional ini sebelumnya *tidak* benar-benar rusak. Tapi kalau template email di dashboard Supabase kamu ternyata masih menyertakan link konfirmasi juga, sekarang link itu bakal ngarah ke tempat yang benar kalau ada user yang salah klik link alih-alih masukin kode.
- **OAuth callback** (`app/auth/callback/route.ts`) sudah pakai origin dinamis dari request yang masuk — sudah benar dari awal, tidak diubah.
- ⚠️ **Yang perlu kamu cek manual di dashboard Supabase** (Authentication → URL Configuration): pastikan **Site URL** = `https://fathirsthore.my.id` dan **Redirect URLs** menyertakan `https://fathirsthore.my.id/auth/callback` — aku nggak punya akses ke dashboard Supabase Auth settings buat verifikasi/ubah ini langsung.

## CAPTCHA

- Pakai **Cloudflare Turnstile** (sesuai prioritas di brief — cocok karena situs sudah pakai ekosistem Cloudflare buat R2).
- Dipasang di 3 halaman: Register, Login, Forgot Password.
- Submit form ke-disable sampai widget captcha selesai diverifikasi user, dan sebelum proses auth beneran jalan, token diverifikasi dulu ke server (`/api/captcha/verify`) yang manggil `siteverify` API Cloudflare pakai secret key.
- **Fail-open by design**: kalau env var belum di-set, widget nggak muncul dan form tetap bisa dipakai normal (supaya nggak ngerusak yang lagi jalan pas kamu belum sempat setup key).

### ⚠️ Langkah yang HARUS kamu lakukan biar CAPTCHA aktif:

1. Buka **dashboard Cloudflare** → menu **Turnstile** → **Add a site**
2. Domain: `fathirsthore.my.id`
3. Widget mode: **Managed** (rekomendasi default)
4. Setelah dibuat, kamu dapat 2 key:
   - **Site Key** (public)
   - **Secret Key** (rahasia)
5. Tambahin ke **Vercel** → Project `wepdev` → Settings → Environment Variables:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = site key tadi
   - `TURNSTILE_SECRET_KEY` = secret key tadi
6. Redeploy (atau tunggu deploy berikutnya)

## URL — Canonical Production URL

- **Canonical URL: `https://fathirsthore.my.id`** (non-www) — dipertahankan sesuai instruksi "jangan ganti ke www sembarangan". Ini yang sudah dipakai konsisten di Supabase, dokumentasi, dan semua tempat lain sejak awal.
- Domain `www.fathirsthore.my.id` juga terdaftar di Vercel tapi statusnya cuma alias/domain tambahan — bukan canonical.
- Semua metadata (title, OG, Twitter Card, JSON-LD), `sitemap.xml`, `robots.txt`, dan link internal sekarang konsisten pakai `https://` + domain yang sama, nggak ada campuran http/https atau www/non-www lagi.

## Environment Variables — WAJIB ditambahkan

Tambahin ini di **Vercel → Settings → Environment Variables** (Production):

| Variable | Wajib? | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Disarankan | `https://fathirsthore.my.id` — kalau nggak di-set, otomatis fallback ke domain ini juga, tapi lebih baik di-set eksplisit |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Wajib buat CAPTCHA aktif** | Dari dashboard Cloudflare Turnstile (public, aman di browser) |
| `TURNSTILE_SECRET_KEY` | **Wajib buat CAPTCHA aktif** | Dari dashboard Cloudflare Turnstile — **JANGAN pernah expose ke frontend** |

Semua env var lama (Supabase, R2, Pakasir, Brevo) **tidak berubah**.

## Testing

**Yang sudah divalidasi:**
- ✅ `npx tsc --noEmit` — 0 error di seluruh project setelah semua perubahan
- ✅ Deploy production sukses (`b56b731`, status READY)
- ✅ Audit kode: tidak ada lagi string `https://fathirsthore.my.id` hardcoded di luar `lib/site-url.ts`
- ✅ Review manual middleware — tidak ada risiko redirect loop pada route protected (`/dashboard`)
- ✅ Review manual OAuth callback — sudah pakai origin dinamis, aman

**Yang BELUM bisa aku test langsung** (karena butuh akses browser interaktif / kredensial CAPTCHA yang belum ada):
- ⏳ Klik-test CAPTCHA di form asli (baru bisa full-test setelah kamu pasang Turnstile key di Vercel)
- ⏳ Klik-test flow reset password end-to-end (kirim email → masukin kode → password baru)
- ⏳ Test manual scroll/swipe code viewer di HP asli (logic-nya sudah benar secara kode, tapi rekomendasi: coba buka salah satu halaman `/code/[slug]` dengan snippet yang panjang buat mastiin feel-nya oke)

**Rekomendasi testing manual kamu setelah baca laporan ini:**
1. Buka halaman Source Code yang isinya banyak baris → coba scroll di dalam kode, pastikan halaman nggak ikut geser
2. Klik tombol "expand" di code viewer → pastikan cuma area kode yang fullscreen
3. Setelah pasang Turnstile key: coba register/login/forgot-password, pastikan widget captcha muncul dan submit ke-block kalau captcha belum diselesaikan

## Version

**FATHIR CODE v1.0.2**
