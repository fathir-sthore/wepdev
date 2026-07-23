-- 0001_auth_and_profiles.sql
-- Auth + user dashboard slice of the Fathir Sthore schema.
-- NOTE: `script_id` columns below are left as plain uuid (no FK yet) because
-- the `scripts` table lands in a later migration when we build script upload.
-- Once that migration exists, add:
--   alter table public.favorites add constraint favorites_script_fk
--     foreign key (script_id) references public.scripts(id) on delete cascade;
--   (same for downloads.script_id)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row, created automatically on signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'developer', 'admin')),
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth.users row appears
-- (covers email/password signup as well as OAuth: Google, GitHub, Discord).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(
      new.raw_user_meta_data->>'user_name',   -- github
      new.raw_user_meta_data->>'preferred_username', -- discord
      split_part(new.email, '@', 1)
    ),
    '[^a-zA-Z0-9_]', '', 'g'
  ));
  if base_username is null or base_username = '' then
    base_username := 'user';
  end if;

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  script_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, script_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);
create index if not exists favorites_script_idx on public.favorites (script_id);

alter table public.favorites enable row level security;

create policy "Users manage their own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- downloads (history)
-- ---------------------------------------------------------------------------
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  script_id uuid not null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists downloads_user_idx on public.downloads (user_id);
create index if not exists downloads_script_idx on public.downloads (script_id);
create index if not exists downloads_created_idx on public.downloads (created_at desc);

alter table public.downloads enable row level security;

create policy "Users read their own download history"
  on public.downloads for select
  using (auth.uid() = user_id);

create policy "Anyone can log a download"
  on public.downloads for insert
  with check (true);
