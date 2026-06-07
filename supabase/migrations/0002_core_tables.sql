-- ============================================================
-- THE VENDOR — 0002 Core Tables
-- ============================================================

-- ---------- Shared updated_at trigger ----------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES  (1:1 with auth.users)
-- ============================================================
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  avatar_url    text,
  role          user_role not null default 'customer',
  city          text,
  region        text,
  suburb        text,
  location      geography(point, 4326),
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  profile_completion int not null default 0,
  language      text not null default 'en',
  dark_mode     boolean not null default false,
  member_since  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_location on profiles using gist(location);

create trigger trg_profiles_updated
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id          text primary key,            -- 'photography', 'catering', ...
  name        text not null,
  icon        text not null,
  color       text not null,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- vendor_count is derived; expose via the categories_with_counts view (0006)

-- ============================================================
-- VENDORS
-- ============================================================
create table if not exists vendors (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid references profiles(id) on delete set null,
  business_name       text not null,
  slug                text unique,
  category            text not null references categories(id),
  description         text,
  logo_initials       text,
  logo_gradient       text,
  cover_gradient      text,
  cover_url           text,

  -- contact
  phone               text,
  whatsapp            text,
  email               text,
  website             text,

  -- location
  address             text,
  city                text,
  region              text,
  suburb              text,
  latitude            double precision,
  longitude           double precision,
  location            geography(point, 4326),
  timezone            text not null default 'Africa/Windhoek',

  -- trust & ranking
  rating              numeric(2,1) not null default 0,
  review_count        int not null default 0,
  years_in_business   int not null default 0,
  response_time       text,
  verified            boolean not null default false,
  verified_level      verification_level not null default 'none',
  verification_status verification_status not null default 'unverified',
  featured            boolean not null default false,
  trending_score      numeric not null default 0,

  -- payments
  accepts_eft         boolean not null default true,
  accepts_cash        boolean not null default true,

  -- lifecycle
  status              vendor_status not null default 'pending_review',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_vendors_category on vendors(category);
create index if not exists idx_vendors_status on vendors(status);
create index if not exists idx_vendors_city on vendors(city);
create index if not exists idx_vendors_featured on vendors(featured) where featured = true;
create index if not exists idx_vendors_location on vendors using gist(location);
create index if not exists idx_vendors_trending on vendors(trending_score desc);
create index if not exists idx_vendors_name_trgm on vendors using gin (business_name gin_trgm_ops);
create index if not exists idx_vendors_owner on vendors(owner_id);

create trigger trg_vendors_updated
  before update on vendors
  for each row execute function set_updated_at();

-- Keep geography column in sync with lat/lng + auto-slug
create or replace function vendors_sync_derived()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.location = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  end if;
  if new.slug is null and new.business_name is not null then
    new.slug = lower(regexp_replace(new.business_name, '[^a-zA-Z0-9]+', '-', 'g'))
               || '-' || substr(new.id::text, 1, 6);
  end if;
  return new;
end;
$$;

create trigger trg_vendors_sync
  before insert or update on vendors
  for each row execute function vendors_sync_derived();

-- ============================================================
-- BUSINESS HOURS  (one row per weekday)
-- ============================================================
create table if not exists vendor_hours (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references vendors(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),  -- 0 = Sunday
  is_closed   boolean not null default false,
  opens_at    time,
  closes_at   time,
  unique (vendor_id, day_of_week)
);

create index if not exists idx_vendor_hours_vendor on vendor_hours(vendor_id);

-- ============================================================
-- SERVICES
-- ============================================================
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references vendors(id) on delete cascade,
  name        text not null,
  description text,
  price       text,
  price_from  numeric,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_services_vendor on services(vendor_id);

-- ============================================================
-- GALLERY / PORTFOLIO IMAGES
-- ============================================================
create table if not exists vendor_gallery (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references vendors(id) on delete cascade,
  image_url   text not null,
  caption     text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_gallery_vendor on vendor_gallery(vendor_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  vendor_id   uuid not null references vendors(id) on delete cascade,
  author_id   uuid references profiles(id) on delete set null,
  author_name text not null,
  rating      int not null check (rating between 1 and 5),
  text        text,
  has_photos  boolean not null default false,
  photo_urls  text[] default '{}',
  reply       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_reviews_vendor on reviews(vendor_id);
create index if not exists idx_reviews_author on reviews(author_id);
create unique index if not exists uq_review_per_user_vendor
  on reviews(vendor_id, author_id) where author_id is not null;

create trigger trg_reviews_updated
  before update on reviews
  for each row execute function set_updated_at();

-- Recalculate vendor rating + count whenever reviews change
create or replace function recalc_vendor_rating()
returns trigger
language plpgsql
as $$
declare
  v_id uuid := coalesce(new.vendor_id, old.vendor_id);
begin
  update vendors v
  set
    rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where vendor_id = v_id), 0),
    review_count = (select count(*) from reviews where vendor_id = v_id)
  where v.id = v_id;
  return null;
end;
$$;

create trigger trg_reviews_recalc
  after insert or update or delete on reviews
  for each row execute function recalc_vendor_rating();
