# Fathir Sthore — Auth + User Dashboard slice

This is slice 1 of the full Fathir Sthore Script Download Center build:
**authentication and the user dashboard.** Public browsing/search, script
upload, and the admin dashboard are separate build slices layered on top of
this one.

## What's included

- Email/password signup + login (Supabase Auth)
- OAuth: Google, GitHub, Discord
- Forgot password / reset password flow
- Auto-created `profiles` row on signup (via a Postgres trigger — works for
  every signup method, no app code needed)
- Protected `/dashboard` routes (enforced in middleware + double-checked in
  the dashboard layout)
- Dashboard: edit profile, view favorites, view download history
- Row Level Security on every table from day one

## Setup (no terminal required — works from Acode / github.dev too)

1. Create a Supabase project.
2. In the SQL Editor, run `supabase/migrations/0001_auth_and_profiles.sql`.
3. In **Authentication > Providers**, enable Google, GitHub, and Discord and
   fill in each provider's client id/secret (get these from each provider's
   developer console).
4. In **Authentication > URL Configuration**, add your site's `/auth/callback`
   URL as a redirect URL.
5. Copy `.env.example` to `.env.local` and fill in your Supabase URL + anon key.
6. Push to GitHub → import the repo in Vercel → add the same two env vars in
   Vercel's dashboard → deploy.

## Design notes

Visual direction: a "terminal window" aesthetic — dark editor-style background,
JetBrains Mono headers, IBM Plex Mono for data/inputs, amber accent as the
"cursor" color, teal as the "success/signal" color. The auth card is styled
like a terminal window running `fathir auth --login`, with a blinking caret,
so the login screen itself reads as a piece of the product (a script tool)
rather than a generic form.

## Known gaps (intentional — later slices)

- `favorites` / `downloads` currently show raw script IDs, not titles or
  thumbnails — that data joins in once the `scripts` table (script catalog
  slice) exists. The FK constraints are commented in the migration for when
  that lands.
- No rate limiting / CAPTCHA yet on auth forms — add Cloudflare Turnstile at
  the security-hardening pass.
