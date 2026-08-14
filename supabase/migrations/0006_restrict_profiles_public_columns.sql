-- SECURITY FIX: "Profiles are publicly readable" RLS policy allows SELECT
-- on ALL rows (needed — public pages show any developer's username/avatar
-- without login) but that combined with a blanket table-level GRANT meant
-- ALL COLUMNS were exposed too, including bio, email_notifications,
-- theme_preference, language_preference, updated_at — for every user, to
-- anyone with just the public anon key (no login required), via a direct
-- REST call like GET /rest/v1/profiles?select=*.
--
-- RLS is row-level only; column exposure is controlled separately via
-- GRANT/REVOKE. Row-level policy (qual: true) is intentionally left as-is
-- since public author display is a real feature — only the column grant
-- is narrowed here.
--
-- "role" is kept publicly selectable because several OTHER tables' RLS
-- policies do `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND
-- role = 'admin')` — revoking it would break those admin checks.
-- "created_at" (join date) is low-sensitivity and commonly shown as
-- "member since", kept public too.

REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (id, username, display_name, avatar_url, role, created_at)
  ON public.profiles TO anon, authenticated;
