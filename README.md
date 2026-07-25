# Fathir Sthore — Full Stack: Auth, Public Pages, Admin/Developer Dashboard, Payments

This build has four layered slices:

1. **Auth + user dashboard** — signup/login, OAuth, profile, favorites, downloads.
2. **Public pages** — home, search/browse, and the script detail page, backed
   by a real `scripts` catalog schema (categories, tags, reviews, view/download
   tracking).
3. **Admin + developer dashboard** — upload/edit/delete your own scripts,
   plus a site-wide admin panel (stats, charts, manage all scripts, reports,
   users).
4. **Payments** — Pakasir QRIS integration gating premium script downloads.

## What's included (slice 4: payments)

Payment provider: **Pakasir** (`https://pakasir.com`) — matches the QRIS
integration pattern used across other Fathir Sthore projects. Docs fetched
live from `https://pakasir.com/p/docs` (updated 21 Jul 2026) while building
this, so the request/response shapes below are current as of that date —
worth a quick recheck against their docs before going live, since payment
APIs do change.

- `lib/payments/pakasir.ts`: thin server-only client for Pakasir's
  `transactioncreate`, `transactiondetail`, and `transactioncancel` endpoints.
- **Important security detail, straight from Pakasir's own docs**: they
  explicitly recommend re-verifying a transaction via `transactiondetail`
  rather than trusting the webhook POST body alone. `lib/payments/sync.ts`
  implements that — the webhook route only *triggers* a re-check, it never
  writes a status based on the webhook body directly. The same re-check
  function backs the client-side status-poll route, so payments still work
  correctly even if you haven't configured (or can't yet reach) a public
  webhook URL — e.g. during local development.
- **Purchase flow**: script page's Buy button → `POST /api/payments/create`
  (creates/reuses a `purchases` row + opens a Pakasir QRIS transaction) →
  `PaymentModal` renders the QR client-side (`qrcode` package, no third-party
  image service) → polls `GET /api/payments/[orderId]/status` every 3s →
  on `completed`, reveals the real download button.
- **Download gating**: `/api/scripts/[id]/download` now checks — for premium
  scripts — that the requester is the script's developer, an admin, or has a
  `completed` row in `purchases` for that script, before signing a URL.
- **Dashboard**: `/dashboard/purchases` lists purchase history with status.
- One `completed` purchase per user per script is enforced with a partial
  unique index (`purchases_one_completed_per_user_script`), so a user can't
  end up with two overlapping "you bought this" rows even under retries.

## Setup additions for this slice

1. Run `supabase/migrations/0005_payments.sql`.
2. Create a project at `https://app.pakasir.com`, copy its **Slug** and
   **API Key** into `PAKASIR_PROJECT_SLUG` / `PAKASIR_API_KEY` (server-only,
   no `NEXT_PUBLIC_` prefix — never expose these to the browser).
3. In the Pakasir project settings, set **Webhook URL** to
   `https://fathirsthore.my.id/api/payments/webhook` (or your dev tunnel URL).
   Payments still work without this configured — see the note above — but
   it makes status updates near-instant instead of relying on the 3-second
   poll.
4. If your Pakasir project is in Sandbox mode, use their
   `/api/paymentsimulation` endpoint (not wired into this app, but documented
   at `https://pakasir.com/p/docs`) to simulate a completed payment while
   testing, or just wait for the poll to catch a real sandbox payment.

## Design notes

Visual direction: a "terminal window" aesthetic — dark editor-style background,
JetBrains Mono headers, IBM Plex Mono for data/inputs, amber accent as the
"cursor" color, teal as the "success/signal" color. The payment modal keeps
the `$ fathir pay --qris` command-line framing consistent with the rest of
the product.

## Known gaps (intentional — possible next steps)

- Only QRIS is wired up, though Pakasir also supports several bank Virtual
  Accounts (`bni_va`, `bri_va`, `cimb_niaga_va`, etc. — see
  `PakasirPaymentMethod` in `lib/payments/pakasir.ts`); adding a payment
  method picker to `PaymentModal` is a small extension if needed.
- No refund flow — Pakasir's docs don't document one either as of this
  writing; cancellation before payment is supported (`transactioncancel`),
  used by the modal's "cancel payment" button.
- No email/notification on successful purchase — the person has to notice
  the modal flip to "payment successful" or check `/dashboard/purchases`.
- No first-admin bootstrapping UI/CLI — promote via SQL editor:
  `update profiles set role = 'admin' where username = '...'`.
- Deleting a script removes the database row but not its uploaded files in
  Storage (orphaned objects) — fine at this scale, add a cleanup job/edge
  function later if storage costs matter.
- No rate limiting / CAPTCHA yet on auth, upload, or report forms — add
  Cloudflare Turnstile at the security-hardening pass.
- Search uses Postgres full-text search (`tsvector`/`websearch_to_tsquery`),
  not a separate search service — fine at this scale, revisit if the catalog
  grows very large.

