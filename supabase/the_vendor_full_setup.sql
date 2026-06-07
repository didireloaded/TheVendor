-- ============================================================================
-- THE VENDOR — COMPLETE SUPABASE SETUP (single file)
-- Paste this entire file into Supabase → SQL Editor → Run.
-- Safe to re-run (idempotent where possible).
-- ============================================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";
create extension if not exists "postgis";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- ============================================================
-- 2. ENUM TYPES
-- ============================================================
do $$ begin create type user_role as enum ('customer','vendor','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type vendor_status as enum ('draft','pending_review','approved','rejected','suspended'); exception when duplicate_object then null; end $$;
do $$ begin create type verification_level as enum ('none','basic','pro'); exception when duplicate_object then null; end $$;
do $$ begin create type verification_status as enum ('unverified','pending','verified','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type conversation_type as enum ('general','quote','booking','support'); exception when duplicate_object then null; end $$;
do $$ begin create type message_type as enum ('text','image','location','document','quote','booking','system'); exception when duplicate_object then null; end $$;
do $$ begin create type quote_status as enum ('pending','viewed','responded','accepted','declined','completed','expired'); exception when duplicate_object then null; end $$;
do $$ begin create type booking_status as enum ('requested','confirmed','in_progress','completed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type opportunity_status as enum ('open','closing_soon','closed','invite_only'); exception when duplicate_object then null; end $$;
do $$ begin create type content_status as enum ('draft','published','flagged','removed'); exception when duplicate_object then null; end $$;
do $$ begin create type report_status as enum ('open','reviewing','resolved','dismissed'); exception when duplicate_object then null; end $$;
do $$ begin
  create type analytics_event as enum (
    'profile_view','search','search_result_click','category_view',
    'contact_click','whatsapp_click','call_click','directions_click',
    'quote_request','message_sent','review_created','bookmark','content_view',
    'content_like','content_save','content_share'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- 3. SHARED TRIGGER FUNCTION
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ============================================================
-- 4. PROFILES
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
  location      geography(point,4326),
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
drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- ============================================================
-- 5. CATEGORIES
-- ============================================================
create table if not exists categories (
  id text primary key,
  name text not null,
  icon text not null,
  color text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 6. VENDORS
-- ============================================================
create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete set null,
  business_name text not null,
  slug text unique,
  category text not null references categories(id),
  description text,
  logo_initials text,
  logo_gradient text,
  cover_gradient text,
  cover_url text,
  phone text, whatsapp text, email text, website text,
  address text, city text, region text, suburb text,
  latitude double precision, longitude double precision,
  location geography(point,4326),
  timezone text not null default 'Africa/Windhoek',
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  years_in_business int not null default 0,
  response_time text,
  verified boolean not null default false,
  verified_level verification_level not null default 'none',
  verification_status verification_status not null default 'unverified',
  featured boolean not null default false,
  trending_score numeric not null default 0,
  accepts_eft boolean not null default true,
  accepts_cash boolean not null default true,
  status vendor_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_vendors_category on vendors(category);
create index if not exists idx_vendors_status on vendors(status);
create index if not exists idx_vendors_city on vendors(city);
create index if not exists idx_vendors_featured on vendors(featured) where featured = true;
create index if not exists idx_vendors_location on vendors using gist(location);
create index if not exists idx_vendors_trending on vendors(trending_score desc);
create index if not exists idx_vendors_name_trgm on vendors using gin (business_name gin_trgm_ops);
create index if not exists idx_vendors_owner on vendors(owner_id);
drop trigger if exists trg_vendors_updated on vendors;
create trigger trg_vendors_updated before update on vendors for each row execute function set_updated_at();

create or replace function vendors_sync_derived()
returns trigger language plpgsql as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.location = st_setsrid(st_makepoint(new.longitude,new.latitude),4326)::geography;
  end if;
  if new.slug is null and new.business_name is not null then
    new.slug = lower(regexp_replace(new.business_name,'[^a-zA-Z0-9]+','-','g')) || '-' || substr(new.id::text,1,6);
  end if;
  return new;
end; $$;
drop trigger if exists trg_vendors_sync on vendors;
create trigger trg_vendors_sync before insert or update on vendors for each row execute function vendors_sync_derived();

-- ============================================================
-- 7. VENDOR HOURS / SERVICES / GALLERY / REVIEWS
-- ============================================================
create table if not exists vendor_hours (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  is_closed boolean not null default false,
  opens_at time, closes_at time,
  unique (vendor_id, day_of_week)
);
create index if not exists idx_vendor_hours_vendor on vendor_hours(vendor_id);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null, description text, price text, price_from numeric,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_services_vendor on services(vendor_id);

create table if not exists vendor_gallery (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  image_url text not null, caption text, sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_gallery_vendor on vendor_gallery(vendor_id);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  text text, has_photos boolean not null default false,
  photo_urls text[] default '{}', reply text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reviews_vendor on reviews(vendor_id);
create index if not exists idx_reviews_author on reviews(author_id);
create unique index if not exists uq_review_per_user_vendor on reviews(vendor_id, author_id) where author_id is not null;
drop trigger if exists trg_reviews_updated on reviews;
create trigger trg_reviews_updated before update on reviews for each row execute function set_updated_at();

create or replace function recalc_vendor_rating()
returns trigger language plpgsql as $$
declare v_id uuid := coalesce(new.vendor_id, old.vendor_id);
begin
  update vendors v set
    rating = coalesce((select round(avg(rating)::numeric,1) from reviews where vendor_id = v_id),0),
    review_count = (select count(*) from reviews where vendor_id = v_id)
  where v.id = v_id;
  return null;
end; $$;
drop trigger if exists trg_reviews_recalc on reviews;
create trigger trg_reviews_recalc after insert or update or delete on reviews for each row execute function recalc_vendor_rating();

-- ============================================================
-- 8. CONVERSATIONS / MESSAGES / QUOTES / BOOKINGS
-- ============================================================
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  type conversation_type not null default 'general',
  last_message text, last_activity timestamptz not null default now(),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (customer_id, vendor_id)
);
create index if not exists idx_conversations_customer on conversations(customer_id, last_activity desc);
create index if not exists idx_conversations_vendor on conversations(vendor_id, last_activity desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  sender_role user_role not null default 'customer',
  type message_type not null default 'text',
  body text, attachment_url text, quote_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_conversation on messages(conversation_id, created_at);
create index if not exists idx_messages_unread on messages(conversation_id) where is_read = false;

create or replace function bump_conversation()
returns trigger language plpgsql as $$
begin
  update conversations set last_message = coalesce(new.body,new.type::text), last_activity = new.created_at
  where id = new.conversation_id;
  return new;
end; $$;
drop trigger if exists trg_messages_bump on messages;
create trigger trg_messages_bump after insert on messages for each row execute function bump_conversation();

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete set null,
  vendor_id uuid not null references vendors(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  service text not null, budget text, event_date date, guests int,
  location_text text, notes text, contact_name text, contact_phone text,
  status quote_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_quotes_vendor on quote_requests(vendor_id, created_at desc);
create index if not exists idx_quotes_customer on quote_requests(customer_id, created_at desc);
create index if not exists idx_quotes_status on quote_requests(status);
drop trigger if exists trg_quotes_updated on quote_requests;
create trigger trg_quotes_updated before update on quote_requests for each row execute function set_updated_at();

do $$ begin
  alter table messages add constraint fk_messages_quote foreign key (quote_id) references quote_requests(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id) on delete set null,
  vendor_id uuid not null references vendors(id) on delete cascade,
  quote_id uuid references quote_requests(id) on delete set null,
  service text not null, amount numeric, scheduled_for timestamptz,
  status booking_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_bookings_vendor on bookings(vendor_id, created_at desc);
create index if not exists idx_bookings_customer on bookings(customer_id, created_at desc);
drop trigger if exists trg_bookings_updated on bookings;
create trigger trg_bookings_updated before update on bookings for each row execute function set_updated_at();

-- ============================================================
-- 9. COLLECTIONS / FAVORITES / RECENTLY VIEWED / NOTIFICATIONS
-- ============================================================
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null, created_at timestamptz not null default now()
);
create index if not exists idx_collections_owner on collections(owner_id);

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  collection_id uuid references collections(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, vendor_id)
);
create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_favorites_vendor on favorites(vendor_id);

create table if not exists recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, vendor_id)
);
create index if not exists idx_recently_viewed_user on recently_viewed(user_id, viewed_at desc);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null, title text not null, body text, link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id) where is_read = false;

-- ============================================================
-- 10. CONTENT / OPPORTUNITIES / ANALYTICS / MODERATION
-- ============================================================
create table if not exists content_posts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  image_url text not null, caption text, tags text[] default '{}',
  city text, region text,
  likes_count int not null default 0, comments_count int not null default 0,
  saves_count int not null default 0, views_count int not null default 0,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);
create index if not exists idx_content_vendor on content_posts(vendor_id, created_at desc);
create index if not exists idx_content_status on content_posts(status);
create index if not exists idx_content_tags on content_posts using gin(tags);

create table if not exists content_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references content_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create or replace function recalc_content_likes()
returns trigger language plpgsql as $$
declare p_id uuid := coalesce(new.post_id, old.post_id);
begin
  update content_posts set likes_count = (select count(*) from content_likes where post_id = p_id) where id = p_id;
  return null;
end; $$;
drop trigger if exists trg_content_likes on content_likes;
create trigger trg_content_likes after insert or delete on content_likes for each row execute function recalc_content_likes();

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, location_text text,
  city text, region text, latitude double precision, longitude double precision,
  event_date date, deadline date,
  status opportunity_status not null default 'open',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_opportunities_status on opportunities(status, event_date);

create table if not exists opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  status text not null default 'applied',
  created_at timestamptz not null default now(),
  unique (opportunity_id, vendor_id)
);

create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  event analytics_event not null,
  vendor_id uuid references vendors(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_analytics_vendor on analytics_events(vendor_id, created_at desc);
create index if not exists idx_analytics_event on analytics_events(event, created_at desc);
create index if not exists idx_analytics_created on analytics_events(created_at desc);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete set null,
  vendor_id uuid references vendors(id) on delete cascade,
  post_id uuid references content_posts(id) on delete cascade,
  reason text not null, details text,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz, resolved_by uuid references profiles(id) on delete set null
);
create index if not exists idx_reports_status on reports(status, created_at desc);

create table if not exists moderation_log (
  id bigint generated always as identity primary key,
  admin_id uuid references profiles(id) on delete set null,
  action text not null, entity_type text not null, entity_id uuid, notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_modlog_created on moderation_log(created_at desc);

-- ============================================================
-- 11. ROLE HELPERS
-- ============================================================
create or replace function is_admin()
returns boolean language sql stable as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

create or replace function owns_vendor(v_id uuid)
returns boolean language sql stable as $$
  select exists (select 1 from vendors where id = v_id and owner_id = auth.uid());
$$;

-- ============================================================
-- 12. OPEN-NOW STATUS (timezone aware)
-- ============================================================
create or replace function vendor_open_status(v_id uuid)
returns table (is_open boolean, label text, detail text)
language plpgsql stable as $$
declare
  v_tz text; v_local timestamp; v_dow int; v_time time;
  h record; next_h record;
begin
  select coalesce(timezone,'Africa/Windhoek') into v_tz from vendors where id = v_id;
  if v_tz is null then return query select false,'Hours unavailable',''; return; end if;
  v_local := now() at time zone v_tz;
  v_dow := extract(dow from v_local)::int;
  v_time := v_local::time;
  select * into h from vendor_hours where vendor_id = v_id and day_of_week = v_dow;
  if found and not h.is_closed and h.opens_at is not null and h.closes_at is not null then
    if (h.closes_at > h.opens_at and v_time between h.opens_at and h.closes_at)
       or (h.closes_at < h.opens_at and (v_time >= h.opens_at or v_time <= h.closes_at)) then
      return query select true,'Open Now','Closes at ' || to_char(h.closes_at,'HH24:MI'); return;
    elsif v_time < h.opens_at then
      return query select false,'Closed','Opens today at ' || to_char(h.opens_at,'HH24:MI'); return;
    end if;
  end if;
  for i in 1..7 loop
    select * into next_h from vendor_hours
    where vendor_id = v_id and day_of_week = ((v_dow + i) % 7) and not is_closed and opens_at is not null;
    if found then
      return query select false,'Closed',
        case when i = 1 then 'Opens tomorrow at ' else 'Opens ' || to_char((v_local + (i||' days')::interval),'Dy') || ' at ' end
        || to_char(next_h.opens_at,'HH24:MI');
      return;
    end if;
  end loop;
  return query select false,'Closed','Hours unavailable';
end; $$;

-- ============================================================
-- 13. GEO: NEARBY + VIEWPORT + SEARCH
-- ============================================================
create or replace function get_vendors_nearby(
  user_lat double precision, user_lng double precision,
  radius_meters double precision default 25000,
  filter_category text default null, only_verified boolean default false,
  result_limit int default 50
)
returns table (
  id uuid, business_name text, category text, city text,
  rating numeric, review_count int, verified boolean, verified_level verification_level,
  logo_initials text, logo_gradient text,
  latitude double precision, longitude double precision, distance_meters double precision
) language sql stable as $$
  select v.id,v.business_name,v.category,v.city,v.rating,v.review_count,
         v.verified,v.verified_level,v.logo_initials,v.logo_gradient,v.latitude,v.longitude,
         st_distance(v.location, st_setsrid(st_makepoint(user_lng,user_lat),4326)::geography) as distance_meters
  from vendors v
  where v.status = 'approved' and v.location is not null
    and st_dwithin(v.location, st_setsrid(st_makepoint(user_lng,user_lat),4326)::geography, radius_meters)
    and (filter_category is null or v.category = filter_category)
    and (not only_verified or v.verified = true)
  order by distance_meters asc limit result_limit;
$$;

create or replace function get_vendors_in_bounds(
  min_lng double precision, min_lat double precision,
  max_lng double precision, max_lat double precision,
  filter_category text default null, result_limit int default 200
)
returns setof vendors language sql stable as $$
  select * from vendors v
  where v.status = 'approved' and v.location is not null
    and v.location && st_makeenvelope(min_lng,min_lat,max_lng,max_lat,4326)::geography
    and (filter_category is null or v.category = filter_category)
  limit result_limit;
$$;

create or replace function search_vendors(q text, result_limit int default 25)
returns table (
  id uuid, business_name text, category text, city text,
  rating numeric, review_count int, verified boolean,
  logo_initials text, logo_gradient text, relevance real
) language sql stable as $$
  select v.id,v.business_name,v.category,v.city,v.rating,v.review_count,
         v.verified,v.logo_initials,v.logo_gradient,
         greatest(
           similarity(unaccent(v.business_name),unaccent(q)),
           similarity(unaccent(coalesce(v.city,'')),unaccent(q)),
           similarity(unaccent(coalesce(v.category,'')),unaccent(q))
         ) as relevance
  from vendors v
  where v.status = 'approved' and (
    unaccent(v.business_name) ilike '%'||unaccent(q)||'%'
    or unaccent(coalesce(v.description,'')) ilike '%'||unaccent(q)||'%'
    or unaccent(coalesce(v.city,'')) ilike '%'||unaccent(q)||'%'
    or v.category ilike '%'||q||'%'
    or exists (select 1 from services s where s.vendor_id = v.id and s.name ilike '%'||q||'%')
  )
  order by relevance desc, v.rating desc limit result_limit;
$$;

-- ============================================================
-- 14. TRENDING + RECOMMENDATIONS
-- ============================================================
create or replace function recompute_trending_scores(window_days int default 7)
returns void language plpgsql as $$
begin
  with stats as (
    select v.id as vendor_id,
      count(*) filter (where e.event='profile_view')  as views,
      count(*) filter (where e.event='quote_request') as quotes,
      count(*) filter (where e.event='message_sent')  as messages,
      count(*) filter (where e.event='bookmark')      as saves,
      count(*) filter (where e.event='review_created') as reviews
    from vendors v
    left join analytics_events e on e.vendor_id = v.id and e.created_at > now() - (window_days||' days')::interval
    group by v.id
  )
  update vendors v set trending_score =
    coalesce(s.views,0)*0.30 + coalesce(s.quotes,0)*0.40 + coalesce(s.messages,0)*0.15
    + coalesce(s.saves,0)*0.10 + coalesce(s.reviews,0)*0.05
  from stats s where s.vendor_id = v.id;
end; $$;

create or replace function get_trending_vendors(result_limit int default 8)
returns setof vendors language sql stable as $$
  select * from vendors where status = 'approved'
  order by trending_score desc, rating desc limit result_limit;
$$;

create or replace function get_recommended_vendors(
  for_user uuid default auth.uid(),
  user_lat double precision default null, user_lng double precision default null,
  result_limit int default 6
)
returns setof vendors language sql stable as $$
  with prefs as (
    select distinct v.category from (
      select vendor_id from recently_viewed where user_id = for_user
      union select vendor_id from favorites where user_id = for_user
    ) seen join vendors v on v.id = seen.vendor_id
  )
  select v.* from vendors v
  where v.status = 'approved'
  order by
    (case when v.category in (select category from prefs) then 1 else 0 end) desc,
    (case when user_lat is not null and v.location is not null
          then st_distance(v.location, st_setsrid(st_makepoint(user_lng,user_lat),4326)::geography)
          else 999999999 end) asc,
    v.trending_score desc, v.rating desc
  limit result_limit;
$$;

-- ============================================================
-- 15. QUOTE RPC + ANALYTICS + DASHBOARD + MODERATION
-- ============================================================
create or replace function create_quote_request(
  p_vendor_id uuid, p_service text, p_budget text default null,
  p_event_date date default null, p_guests int default null,
  p_location text default null, p_notes text default null,
  p_contact_name text default null, p_contact_phone text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_convo uuid; v_quote uuid; v_owner uuid;
begin
  insert into conversations (customer_id, vendor_id, type)
  values (auth.uid(), p_vendor_id, 'quote')
  on conflict (customer_id, vendor_id) do update set type='quote', last_activity=now()
  returning id into v_convo;

  insert into quote_requests (customer_id,vendor_id,conversation_id,service,budget,event_date,guests,location_text,notes,contact_name,contact_phone)
  values (auth.uid(),p_vendor_id,v_convo,p_service,p_budget,p_event_date,p_guests,p_location,p_notes,p_contact_name,p_contact_phone)
  returning id into v_quote;

  insert into messages (conversation_id,sender_id,sender_role,type,body,quote_id)
  values (v_convo,auth.uid(),'customer','quote','Quote request created',v_quote);

  insert into analytics_events (event,vendor_id,user_id,metadata)
  values ('quote_request',p_vendor_id,auth.uid(),jsonb_build_object('quote_id',v_quote));

  select owner_id into v_owner from vendors where id = p_vendor_id;
  if v_owner is not null then
    insert into notifications (user_id,type,title,body,link)
    values (v_owner,'quote','New quote request',coalesce(p_service,'A customer requested a quote'),'/conversations/'||v_convo);
  end if;
  return v_quote;
end; $$;

create or replace function log_event(
  p_event analytics_event, p_vendor_id uuid default null, p_metadata jsonb default '{}'
)
returns void language sql security definer set search_path = public as $$
  insert into analytics_events (event,vendor_id,user_id,metadata)
  values (p_event,p_vendor_id,auth.uid(),coalesce(p_metadata,'{}'));
$$;

create or replace function vendor_dashboard_metrics(p_vendor_id uuid, window_days int default 30)
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'profile_views',(select count(*) from analytics_events where vendor_id=p_vendor_id and event='profile_view' and created_at>now()-(window_days||' days')::interval),
    'messages',(select count(*) from messages m join conversations c on c.id=m.conversation_id where c.vendor_id=p_vendor_id and m.created_at>now()-(window_days||' days')::interval),
    'quote_requests',(select count(*) from quote_requests where vendor_id=p_vendor_id and created_at>now()-(window_days||' days')::interval),
    'bookings',(select count(*) from bookings where vendor_id=p_vendor_id and created_at>now()-(window_days||' days')::interval),
    'reviews',(select count(*) from reviews where vendor_id=p_vendor_id),
    'rating',(select rating from vendors where id=p_vendor_id),
    'saves',(select count(*) from favorites where vendor_id=p_vendor_id),
    'lead_conversion',(select case when q.total=0 then 0 else round((b.total::numeric/q.total)*100,1) end
       from (select count(*) total from quote_requests where vendor_id=p_vendor_id) q,
            (select count(*) total from bookings where vendor_id=p_vendor_id) b),
    'response_rate',(select case when c.total=0 then 0 else round((r.replied::numeric/c.total)*100,1) end
       from (select count(*) total from conversations where vendor_id=p_vendor_id) c,
            (select count(distinct conversation_id) replied from messages m join conversations cv on cv.id=m.conversation_id
               where cv.vendor_id=p_vendor_id and m.sender_role='vendor') r)
  );
$$;

create or replace function moderate_vendor(p_vendor_id uuid, p_action text, p_notes text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'admin privileges required'; end if;
  if p_action='approve' then update vendors set status='approved' where id=p_vendor_id;
  elsif p_action='reject' then update vendors set status='rejected' where id=p_vendor_id;
  elsif p_action='suspend' then update vendors set status='suspended' where id=p_vendor_id;
  elsif p_action='verify' then update vendors set verified=true, verification_status='verified', verified_level='pro' where id=p_vendor_id;
  elsif p_action='feature' then update vendors set featured=not featured where id=p_vendor_id;
  elsif p_action='delete' then delete from vendors where id=p_vendor_id;
  end if;
  insert into moderation_log (admin_id,action,entity_type,entity_id,notes)
  values (auth.uid(),p_action,'vendor',p_vendor_id,p_notes);
end; $$;

-- ============================================================
-- 16. VIEWS (frontend-ready)
-- ============================================================
create or replace view categories_with_counts as
select c.*, coalesce(vc.cnt,0) as vendor_count
from categories c
left join (select category, count(*) cnt from vendors where status='approved' group by category) vc on vc.category = c.id
order by c.sort_order;

create or replace view vendor_cards as
select v.id, v.business_name, v.slug, v.category,
  c.name as category_name, c.color as category_color,
  v.description, v.logo_initials, v.logo_gradient, v.cover_gradient, v.cover_url,
  v.phone, v.whatsapp, v.email, v.website,
  v.address, v.city, v.region, v.latitude, v.longitude,
  v.rating, v.review_count, v.years_in_business, v.response_time,
  v.verified, v.verified_level, v.featured, v.trending_score,
  v.accepts_eft, v.accepts_cash, v.status,
  st.is_open, st.label as open_label, st.detail as open_detail,
  coalesce(svc.services,'[]'::json) as services,
  coalesce(gal.gallery,'[]'::json) as gallery
from vendors v
join categories c on c.id = v.category
left join lateral vendor_open_status(v.id) st on true
left join lateral (
  select json_agg(json_build_object('id',s.id,'name',s.name,'description',s.description,'price',s.price) order by s.sort_order) as services
  from services s where s.vendor_id = v.id
) svc on true
left join lateral (
  select json_agg(g.image_url order by g.sort_order) as gallery
  from vendor_gallery g where g.vendor_id = v.id
) gal on true
where v.status = 'approved';

create or replace view vendor_profiles as
select vc.*, coalesce(rv.reviews,'[]'::json) as reviews
from vendor_cards vc
left join lateral (
  select json_agg(json_build_object('id',r.id,'author',r.author_name,'rating',r.rating,'text',r.text,
    'has_photos',r.has_photos,'photo_urls',r.photo_urls,'reply',r.reply,'created_at',r.created_at) order by r.created_at desc) as reviews
  from reviews r where r.vendor_id = vc.id
) rv on true;

create or replace view moderation_queue as
select v.id, v.business_name, v.category, v.city, v.address, v.description,
  v.logo_initials, v.logo_gradient, v.status, v.created_at, p.full_name as owner_name
from vendors v left join profiles p on p.id = v.owner_id
where v.status = 'pending_review' order by v.created_at asc;

create or replace view conversation_summaries as
select c.id, c.customer_id, c.vendor_id, c.type, c.last_message, c.last_activity, c.archived,
  v.business_name as vendor_name, v.logo_initials as vendor_logo, v.logo_gradient as vendor_color,
  v.verified, v.verified_level,
  (select count(*) from messages m where m.conversation_id=c.id and m.is_read=false and m.sender_role<>'customer') as unread_customer,
  (select count(*) from messages m where m.conversation_id=c.id and m.is_read=false and m.sender_role='customer') as unread_vendor
from conversations c join vendors v on v.id = c.vendor_id;

create or replace view explore_feed as
select cp.id, cp.image_url, cp.caption, cp.tags, cp.city,
  cp.likes_count, cp.comments_count, cp.saves_count, cp.created_at,
  v.id as vendor_id, v.business_name as vendor_name, v.logo_initials as vendor_logo,
  v.logo_gradient as vendor_color, v.category, c.name as category_name
from content_posts cp
join vendors v on v.id = cp.vendor_id
join categories c on c.id = v.category
where cp.status='published' and v.status='approved'
order by cp.created_at desc;

-- ============================================================
-- 17. ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table vendors enable row level security;
alter table vendor_hours enable row level security;
alter table services enable row level security;
alter table vendor_gallery enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table quote_requests enable row level security;
alter table bookings enable row level security;
alter table collections enable row level security;
alter table favorites enable row level security;
alter table recently_viewed enable row level security;
alter table notifications enable row level security;
alter table content_posts enable row level security;
alter table content_likes enable row level security;
alter table opportunities enable row level security;
alter table opportunity_applications enable row level security;
alter table analytics_events enable row level security;
alter table reports enable row level security;
alter table moderation_log enable row level security;

drop policy if exists "profiles read own" on profiles;
create policy "profiles read own" on profiles for select using (auth.uid() = id or is_admin());
drop policy if exists "profiles update own" on profiles;
create policy "profiles update own" on profiles for update using (auth.uid() = id);

drop policy if exists "categories public read" on categories;
create policy "categories public read" on categories for select using (true);
drop policy if exists "categories admin write" on categories;
create policy "categories admin write" on categories for all using (is_admin()) with check (is_admin());

drop policy if exists "vendors public read approved" on vendors;
create policy "vendors public read approved" on vendors for select using (status='approved' or owner_id=auth.uid() or is_admin());
drop policy if exists "vendors owner insert" on vendors;
create policy "vendors owner insert" on vendors for insert with check (owner_id=auth.uid());
drop policy if exists "vendors owner update" on vendors;
create policy "vendors owner update" on vendors for update using (owner_id=auth.uid() or is_admin());
drop policy if exists "vendors admin delete" on vendors;
create policy "vendors admin delete" on vendors for delete using (is_admin());

drop policy if exists "hours public read" on vendor_hours;
create policy "hours public read" on vendor_hours for select using (true);
drop policy if exists "hours owner write" on vendor_hours;
create policy "hours owner write" on vendor_hours for all using (owns_vendor(vendor_id) or is_admin()) with check (owns_vendor(vendor_id) or is_admin());

drop policy if exists "services public read" on services;
create policy "services public read" on services for select using (true);
drop policy if exists "services owner write" on services;
create policy "services owner write" on services for all using (owns_vendor(vendor_id) or is_admin()) with check (owns_vendor(vendor_id) or is_admin());

drop policy if exists "gallery public read" on vendor_gallery;
create policy "gallery public read" on vendor_gallery for select using (true);
drop policy if exists "gallery owner write" on vendor_gallery;
create policy "gallery owner write" on vendor_gallery for all using (owns_vendor(vendor_id) or is_admin()) with check (owns_vendor(vendor_id) or is_admin());

drop policy if exists "reviews public read" on reviews;
create policy "reviews public read" on reviews for select using (true);
drop policy if exists "reviews author insert" on reviews;
create policy "reviews author insert" on reviews for insert with check (author_id=auth.uid());
drop policy if exists "reviews author update" on reviews;
create policy "reviews author update" on reviews for update using (author_id=auth.uid());
drop policy if exists "reviews author or owner delete" on reviews;
create policy "reviews author or owner delete" on reviews for delete using (author_id=auth.uid() or owns_vendor(vendor_id) or is_admin());

drop policy if exists "conversations participant read" on conversations;
create policy "conversations participant read" on conversations for select using (customer_id=auth.uid() or owns_vendor(vendor_id) or is_admin());
drop policy if exists "conversations customer insert" on conversations;
create policy "conversations customer insert" on conversations for insert with check (customer_id=auth.uid());
drop policy if exists "conversations participant update" on conversations;
create policy "conversations participant update" on conversations for update using (customer_id=auth.uid() or owns_vendor(vendor_id));

drop policy if exists "messages participant read" on messages;
create policy "messages participant read" on messages for select using (
  exists (select 1 from conversations c where c.id=conversation_id and (c.customer_id=auth.uid() or owns_vendor(c.vendor_id) or is_admin())));
drop policy if exists "messages participant insert" on messages;
create policy "messages participant insert" on messages for insert with check (
  exists (select 1 from conversations c where c.id=conversation_id and (c.customer_id=auth.uid() or owns_vendor(c.vendor_id))));
drop policy if exists "messages participant update" on messages;
create policy "messages participant update" on messages for update using (
  exists (select 1 from conversations c where c.id=conversation_id and (c.customer_id=auth.uid() or owns_vendor(c.vendor_id))));

drop policy if exists "quotes participant read" on quote_requests;
create policy "quotes participant read" on quote_requests for select using (customer_id=auth.uid() or owns_vendor(vendor_id) or is_admin());
drop policy if exists "quotes customer insert" on quote_requests;
create policy "quotes customer insert" on quote_requests for insert with check (customer_id=auth.uid());
drop policy if exists "quotes participant update" on quote_requests;
create policy "quotes participant update" on quote_requests for update using (customer_id=auth.uid() or owns_vendor(vendor_id));

drop policy if exists "bookings participant read" on bookings;
create policy "bookings participant read" on bookings for select using (customer_id=auth.uid() or owns_vendor(vendor_id) or is_admin());
drop policy if exists "bookings participant write" on bookings;
create policy "bookings participant write" on bookings for all using (customer_id=auth.uid() or owns_vendor(vendor_id)) with check (customer_id=auth.uid() or owns_vendor(vendor_id));

drop policy if exists "collections own" on collections;
create policy "collections own" on collections for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
drop policy if exists "favorites own" on favorites;
create policy "favorites own" on favorites for all using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "recently viewed own" on recently_viewed;
create policy "recently viewed own" on recently_viewed for all using (user_id=auth.uid()) with check (user_id=auth.uid());

drop policy if exists "notifications own read" on notifications;
create policy "notifications own read" on notifications for select using (user_id=auth.uid());
drop policy if exists "notifications own update" on notifications;
create policy "notifications own update" on notifications for update using (user_id=auth.uid());

drop policy if exists "content public read" on content_posts;
create policy "content public read" on content_posts for select using (status='published' or owns_vendor(vendor_id) or is_admin());
drop policy if exists "content owner write" on content_posts;
create policy "content owner write" on content_posts for all using (owns_vendor(vendor_id) or is_admin()) with check (owns_vendor(vendor_id) or is_admin());

drop policy if exists "content likes read" on content_likes;
create policy "content likes read" on content_likes for select using (true);
drop policy if exists "content likes own" on content_likes;
create policy "content likes own" on content_likes for all using (user_id=auth.uid()) with check (user_id=auth.uid());

drop policy if exists "opportunities public read" on opportunities;
create policy "opportunities public read" on opportunities for select using (true);
drop policy if exists "opportunities admin write" on opportunities;
create policy "opportunities admin write" on opportunities for all using (is_admin()) with check (is_admin());

drop policy if exists "opp apps read" on opportunity_applications;
create policy "opp apps read" on opportunity_applications for select using (owns_vendor(vendor_id) or is_admin());
drop policy if exists "opp apps vendor write" on opportunity_applications;
create policy "opp apps vendor write" on opportunity_applications for all using (owns_vendor(vendor_id)) with check (owns_vendor(vendor_id));

drop policy if exists "analytics insert" on analytics_events;
create policy "analytics insert" on analytics_events for insert with check (true);
drop policy if exists "analytics owner read" on analytics_events;
create policy "analytics owner read" on analytics_events for select using (owns_vendor(vendor_id) or is_admin());

drop policy if exists "reports insert" on reports;
create policy "reports insert" on reports for insert with check (reporter_id=auth.uid());
drop policy if exists "reports admin read" on reports;
create policy "reports admin read" on reports for select using (is_admin() or reporter_id=auth.uid());
drop policy if exists "reports admin update" on reports;
create policy "reports admin update" on reports for update using (is_admin());

drop policy if exists "modlog admin read" on moderation_log;
create policy "modlog admin read" on moderation_log for select using (is_admin());

-- ============================================================
-- 18. SEED DATA (categories + sample Namibian vendors)
-- ============================================================
insert into categories (id,name,icon,color,sort_order) values
  ('photography','Photography','Camera','#E91E63',1),
  ('catering','Catering & Food','UtensilsCrossed','#FF9800',2),
  ('beauty','Beauty & Makeup','Sparkles','#9C27B0',3),
  ('events','Events & DJs','Music','#2196F3',4),
  ('automotive','Automotive','Car','#607D8B',5),
  ('home','Home Services','Wrench','#4CAF50',6),
  ('tech','Technology','Monitor','#3F51B5',7),
  ('health','Health & Wellness','Heart','#F44336',8),
  ('fashion','Fashion & Design','Shirt','#E040FB',9),
  ('education','Education','GraduationCap','#00BCD4',10),
  ('construction','Construction','HardHat','#795548',11),
  ('transport','Transport & Logistics','Truck','#FF5722',12)
on conflict (id) do nothing;

insert into vendors (
  id,business_name,category,description,logo_initials,logo_gradient,cover_gradient,
  phone,whatsapp,email,website,address,city,region,latitude,longitude,
  rating,review_count,years_in_business,response_time,
  verified,verified_level,verification_status,featured,status,accepts_eft,accepts_cash
) values
('11111111-1111-1111-1111-111111111111','Namibia Lens Studio','photography',
 'Award-winning photography studio capturing the beauty of Namibia, from Sossusvlei to your wedding day.',
 'NL','linear-gradient(135deg,#E91E63,#880E4F)','linear-gradient(135deg,#E91E63,#AD1457)',
 '+264 61 234 5678','264812345678','info@namibialens.com.na','www.namibialens.com.na',
 '42 Independence Ave, Windhoek','Windhoek','Khomas',-22.5609,17.0658,
 4.9,187,8,'Responds within 2 hours',true,'pro','verified',true,'approved',true,true),
('22222222-2222-2222-2222-222222222222','Savanna Catering Co.','catering',
 'Authentic Namibian flavours with international flair. Famous for oryx potjie and braai catering.',
 'SC','linear-gradient(135deg,#FF9800,#BF360C)','linear-gradient(135deg,#FF9800,#E65100)',
 '+264 61 345 6789','264823456789','hello@savannacatering.na','www.savannacatering.na',
 '15 Sam Nujoma Drive, Klein Windhoek','Windhoek','Khomas',-22.5700,17.0836,
 4.8,243,10,'Usually replies in 1 hour',true,'pro','verified',true,'approved',true,true),
('33333333-3333-3333-3333-333333333333','Swakop Surf School','events',
 'Learn to surf on the cold Atlantic with certified instructors. Wetsuits and boards included.',
 'SS','linear-gradient(135deg,#06B6D4,#0E7490)','linear-gradient(135deg,#06B6D4,#0E7490)',
 '+264 64 405 123','264814051230','surf@swakopsurf.na','www.swakopsurf.na',
 'Tigerball Beach, Swakopmund','Swakopmund','Erongo',-22.6792,14.5272,
 4.8,96,6,'Responds within 3 hours',true,'pro','verified',true,'approved',true,true)
on conflict (id) do nothing;

insert into vendor_hours (vendor_id,day_of_week,is_closed,opens_at,closes_at)
select v.id, d.dow,
  case when d.dow=0 then true else false end,
  case when d.dow=0 then null else time '08:00' end,
  case when d.dow=0 then null else time '17:00' end
from vendors v cross join generate_series(0,6) as d(dow)
where v.id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333')
on conflict (vendor_id,day_of_week) do nothing;

insert into services (vendor_id,name,description,price,sort_order) values
('11111111-1111-1111-1111-111111111111','Wedding Photography','Full day coverage + edited gallery','N$ 12,000',1),
('11111111-1111-1111-1111-111111111111','Portrait Session','1-hour studio or outdoor shoot','N$ 1,800',2),
('22222222-2222-2222-2222-222222222222','Wedding Catering','Per plate, min. 50 guests','N$ 285',1),
('22222222-2222-2222-2222-222222222222','Braai Package','Full braai setup for 25 people','N$ 3,500',2),
('33333333-3333-3333-3333-333333333333','Beginner Lesson','2 hours incl. board + wetsuit','N$ 850',1)
on conflict do nothing;

insert into reviews (vendor_id,author_name,rating,text,has_photos) values
('11111111-1111-1111-1111-111111111111','Tangeni N.',5,'Stunning work at our wedding at Heja Lodge!',true),
('22222222-2222-2222-2222-222222222222','Ndapewa H.',5,'The oryx potjie was the highlight of the night.',true),
('33333333-3333-3333-3333-333333333333','Petrus K.',5,'Surfed for the first time — patient instructors!',false)
on conflict do nothing;

insert into opportunities (title,description,location_text,city,region,event_date,deadline,status) values
('Windhoek Wedding Expo','Showcase your services to engaged couples.','Windhoek Country Club','Windhoek','Khomas',date '2026-08-24',date '2026-08-10','open'),
('Coastal Food Festival','Namibia''s biggest coastal food celebration.','Swakopmund Mole','Swakopmund','Erongo',date '2026-09-12',date '2026-08-30','closing_soon')
on conflict do nothing;

-- ============================================================
-- DONE.  Optional: schedule trending recompute with pg_cron
--   select cron.schedule('recompute-trending','0 * * * *', $$ select recompute_trending_scores(7); $$);
-- ============================================================
