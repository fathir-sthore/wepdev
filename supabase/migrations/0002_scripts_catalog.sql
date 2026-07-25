-- 0002_scripts_catalog.sql
-- Public pages slice: categories, tags, scripts, script_tags, reviews, views.
-- Also backfills the FK constraints on favorites/downloads that migration
-- 0001 deliberately left off (scripts didn't exist yet).

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,           -- lucide icon name, e.g. "bot", "smartphone"
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "Tags are publicly readable"
  on public.tags for select
  using (true);

-- ---------------------------------------------------------------------------
-- scripts
-- ---------------------------------------------------------------------------
create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null,
  description text not null,

  developer_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,

  version text not null default '1.0.0',
  programming_language text,
  framework text,
  license text,

  file_path text,             -- storage: scripts bucket
  file_size_bytes bigint,
  checksum_sha256 text,
  password_zip text,           -- optional, shown to buyer after purchase/download
  thumbnail_path text,          -- storage: thumbnails bucket
  screenshot_paths text[] not null default '{}',   -- storage: screenshots bucket
  documentation_path text,      -- storage: documents bucket
  video_url text,
  github_url text,
  website_url text,
  changelog text,

  is_premium boolean not null default false,
  price numeric(12,2) not null default 0,

  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),

  view_count bigint not null default 0,
  download_count bigint not null default 0,
  favorite_count bigint not null default 0,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,

  search_vector tsvector,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scripts_slug_idx on public.scripts (slug);
create index if not exists scripts_status_idx on public.scripts (status);
create index if not exists scripts_category_idx on public.scripts (category_id);
create index if not exists scripts_developer_idx on public.scripts (developer_id);
create index if not exists scripts_created_idx on public.scripts (created_at desc);
create index if not exists scripts_downloads_idx on public.scripts (download_count desc);
create index if not exists scripts_views_idx on public.scripts (view_count desc);
create index if not exists scripts_search_idx on public.scripts using gin (search_vector);

alter table public.scripts enable row level security;

create policy "Published scripts are publicly readable"
  on public.scripts for select
  using (status = 'published' or developer_id = auth.uid());

create policy "Developers manage their own scripts"
  on public.scripts for all
  using (developer_id = auth.uid())
  with check (developer_id = auth.uid());

create policy "Admins manage all scripts"
  on public.scripts for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create or replace function public.scripts_set_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.short_description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(new.programming_language, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.framework, '')), 'B');
  return new;
end;
$$;

drop trigger if exists scripts_search_vector_trigger on public.scripts;
create trigger scripts_search_vector_trigger
  before insert or update on public.scripts
  for each row execute function public.scripts_set_search_vector();

drop trigger if exists scripts_set_updated_at on public.scripts;
create trigger scripts_set_updated_at
  before update on public.scripts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- script_tags (many-to-many)
-- ---------------------------------------------------------------------------
create table if not exists public.script_tags (
  script_id uuid not null references public.scripts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (script_id, tag_id)
);

create index if not exists script_tags_tag_idx on public.script_tags (tag_id);

alter table public.script_tags enable row level security;

create policy "Script tags are publicly readable"
  on public.script_tags for select
  using (true);

create policy "Developers manage tags on their own scripts"
  on public.script_tags for all
  using (exists (
    select 1 from public.scripts s
    where s.id = script_id and s.developer_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references public.scripts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (script_id, user_id)
);

create index if not exists reviews_script_idx on public.reviews (script_id);

alter table public.reviews enable row level security;

create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Users manage their own review"
  on public.reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create or replace function public.recompute_script_rating()
returns trigger language plpgsql as $$
declare
  target_script_id uuid := coalesce(new.script_id, old.script_id);
begin
  update public.scripts s
  set rating_avg = coalesce((
        select round(avg(r.rating)::numeric, 2) from public.reviews r
        where r.script_id = target_script_id
      ), 0),
      rating_count = (
        select count(*) from public.reviews r where r.script_id = target_script_id
      )
  where s.id = target_script_id;
  return null;
end;
$$;

drop trigger if exists reviews_recompute_rating on public.reviews;
create trigger reviews_recompute_rating
  after insert or update or delete on public.reviews
  for each row execute function public.recompute_script_rating();

-- ---------------------------------------------------------------------------
-- views (raw log; scripts.view_count is the fast denormalized counter)
-- ---------------------------------------------------------------------------
create table if not exists public.views (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references public.scripts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists views_script_idx on public.views (script_id);
create index if not exists views_created_idx on public.views (created_at desc);

alter table public.views enable row level security;

create policy "Anyone can log a view"
  on public.views for insert
  with check (true);

create or replace function public.increment_script_view_count()
returns trigger language plpgsql as $$
begin
  update public.scripts set view_count = view_count + 1 where id = new.script_id;
  return new;
end;
$$;

drop trigger if exists views_increment_count on public.views;
create trigger views_increment_count
  after insert on public.views
  for each row execute function public.increment_script_view_count();

-- ---------------------------------------------------------------------------
-- reports (the script page's "Report" button)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references public.scripts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists reports_script_idx on public.reports (script_id);
create index if not exists reports_status_idx on public.reports (status);

alter table public.reports enable row level security;

create policy "Anyone can file a report"
  on public.reports for insert
  with check (true);

create policy "Admins read all reports"
  on public.reports for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------------------------------------------------------------------
-- backfill: favorites/downloads FK constraints + counters
-- ---------------------------------------------------------------------------
alter table public.favorites
  add constraint favorites_script_fk foreign key (script_id)
  references public.scripts(id) on delete cascade;

alter table public.downloads
  add constraint downloads_script_fk foreign key (script_id)
  references public.scripts(id) on delete cascade;

create or replace function public.increment_script_favorite_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.scripts set favorite_count = favorite_count + 1 where id = new.script_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.scripts set favorite_count = greatest(favorite_count - 1, 0) where id = old.script_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists favorites_adjust_count on public.favorites;
create trigger favorites_adjust_count
  after insert or delete on public.favorites
  for each row execute function public.increment_script_favorite_count();

create or replace function public.increment_script_download_count()
returns trigger language plpgsql as $$
begin
  update public.scripts set download_count = download_count + 1 where id = new.script_id;
  return new;
end;
$$;

drop trigger if exists downloads_increment_count on public.downloads;
create trigger downloads_increment_count
  after insert on public.downloads
  for each row execute function public.increment_script_download_count();

-- ---------------------------------------------------------------------------
-- seed a handful of starter categories so Home isn't empty on first deploy
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug, icon, sort_order) values
  ('Telegram Bot', 'telegram-bot', 'send', 1),
  ('WhatsApp Bot', 'whatsapp-bot', 'message-circle', 2),
  ('Flutter App', 'flutter-app', 'smartphone', 3),
  ('Web App', 'web-app', 'globe', 4),
  ('Panel & Hosting', 'panel-hosting', 'server', 5)
on conflict (slug) do nothing;
