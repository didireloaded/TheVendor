-- ============================================================
-- THE VENDOR — 0004 Explore Content, Opportunities, Analytics, Moderation
-- ============================================================

-- ============================================================
-- EXPLORE CONTENT  (vendor posts — images only, phase 1)
-- ============================================================
create table if not exists content_posts (
  id            uuid primary key default gen_random_uuid(),
  vendor_id     uuid not null references vendors(id) on delete cascade,
  image_url     text not null,
  caption       text,
  tags          text[] default '{}',
  city          text,
  region        text,
  likes_count   int not null default 0,
  comments_count int not null default 0,
  saves_count   int not null default 0,
  views_count   int not null default 0,
  status        content_status not null default 'published',
  created_at    timestamptz not null default now()
);

create index if not exists idx_content_vendor on content_posts(vendor_id, created_at desc);
create index if not exists idx_content_status on content_posts(status);
create index if not exists idx_content_tags on content_posts using gin(tags);
create index if not exists idx_content_recent on content_posts(created_at desc) where status = 'published';

create table if not exists content_likes (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references content_posts(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (post_id, user_id)
);

create or replace function recalc_content_likes()
returns trigger
language plpgsql
as $$
declare p_id uuid := coalesce(new.post_id, old.post_id);
begin
  update content_posts
  set likes_count = (select count(*) from content_likes where post_id = p_id)
  where id = p_id;
  return null;
end;
$$;

create trigger trg_content_likes
  after insert or delete on content_likes
  for each row execute function recalc_content_likes();

-- ============================================================
-- OPPORTUNITIES  (events / expos / markets)
-- ============================================================
create table if not exists opportunities (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  location_text   text,
  city            text,
  region          text,
  latitude        double precision,
  longitude       double precision,
  event_date      date,
  deadline        date,
  status          opportunity_status not null default 'open',
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_opportunities_status on opportunities(status, event_date);

create table if not exists opportunity_applications (
  id              uuid primary key default gen_random_uuid(),
  opportunity_id  uuid not null references opportunities(id) on delete cascade,
  vendor_id       uuid not null references vendors(id) on delete cascade,
  status          text not null default 'applied',  -- applied | accepted | rejected
  created_at      timestamptz not null default now(),
  unique (opportunity_id, vendor_id)
);

-- ============================================================
-- ANALYTICS EVENTS  (raw stream — power dashboards & trending)
-- ============================================================
create table if not exists analytics_events (
  id          bigint generated always as identity primary key,
  event       analytics_event not null,
  vendor_id   uuid references vendors(id) on delete cascade,
  user_id     uuid references profiles(id) on delete set null,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists idx_analytics_vendor on analytics_events(vendor_id, created_at desc);
create index if not exists idx_analytics_event on analytics_events(event, created_at desc);
create index if not exists idx_analytics_created on analytics_events(created_at desc);

-- ============================================================
-- MODERATION  — reports for vendors & content
-- ============================================================
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid references profiles(id) on delete set null,
  vendor_id     uuid references vendors(id) on delete cascade,
  post_id       uuid references content_posts(id) on delete cascade,
  reason        text not null,
  details       text,
  status        report_status not null default 'open',
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolved_by   uuid references profiles(id) on delete set null
);

create index if not exists idx_reports_status on reports(status, created_at desc);

-- Admin moderation audit log
create table if not exists moderation_log (
  id          bigint generated always as identity primary key,
  admin_id    uuid references profiles(id) on delete set null,
  action      text not null,           -- approve | reject | suspend | verify | feature | delete | flag
  entity_type text not null,           -- vendor | content | report | user
  entity_id   uuid,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_modlog_created on moderation_log(created_at desc);
