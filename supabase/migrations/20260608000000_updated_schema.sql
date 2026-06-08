-- ==========================================
-- 1. EXTENSIONS & ENUMS
-- ==========================================
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- User Roles
create type public.user_role as enum ('customer', 'vendor', 'admin');

-- Quote Status
create type public.quote_status as enum ('pending', 'viewed', 'responded', 'accepted', 'rejected', 'completed');

-- Conversation Types
create type public.conversation_type as enum ('quote', 'booking', 'general', 'support');

-- Message Types
create type public.message_type as enum ('text', 'quote');

-- Lead Event Types
create type public.lead_event_type as enum ('profile_view', 'whatsapp_click', 'call_click', 'quote_request', 'direction_request');

-- Verification Status
create type public.verification_status as enum ('pending', 'approved', 'rejected');

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- Profiles (Linked to Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role public.user_role default 'customer',
  full_name text,
  phone text,
  bio text,
  location text,
  avatar_url text,
  socials jsonb default '{}'::jsonb,
  profile_completion int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vendors
create table public.vendors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  business_name text not null,
  category text,
  description text,
  rating float default 0,
  review_count int default 0,
  verified boolean default false,
  verified_level text default 'basic',
  featured boolean default false,
  latitude double precision,
  longitude double precision,
  city text,
  region text,
  cover_gradient text,
  logo_gradient text,
  logo_initials text,
  phone text,
  whatsapp text,
  email text,
  website text,
  address text,
  hours jsonb,
  response_time text,
  years_in_business int,
  accepts_eft boolean default true,
  accepts_cash boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Collections (Replaces Favorites)
create table public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Collection Items
create table public.collection_items (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid references public.collections(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  created_at timestamptz default now(),
  unique(collection_id, vendor_id)
);

-- Quote Requests
create table public.quote_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  service text,
  budget text,
  date text,
  notes text,
  status public.quote_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  type public.conversation_type default 'general',
  last_activity timestamptz default now(),
  unread_count int default 0
);

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  text text,
  type public.message_type default 'text',
  quote_id uuid references public.quote_requests(id),
  read boolean default false,
  created_at timestamptz default now()
);

-- Notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text,
  title text,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Lead Events (For Vendor Dashboard)
create table public.lead_events (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  user_id uuid references public.profiles(id),
  event_type public.lead_event_type,
  created_at timestamptz default now()
);

-- Opportunities
create table public.opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text,
  date text,
  deadline text,
  type text,
  vendor_count int default 0,
  image_url text,
  created_at timestamptz default now()
);

-- Content Posts (Explore Feed)
create table public.content_posts (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  image_url text,
  caption text,
  created_at timestamptz default now()
);

-- Vendor Verifications (Admin Moderation)
create table public.vendor_verifications (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade,
  document_type text,
  document_url text,
  status public.verification_status default 'pending',
  created_at timestamptz default now()
);

-- Content Reports
create table public.content_reports (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.content_posts(id) on delete cascade,
  user_id uuid references public.profiles(id),
  reason text,
  created_at timestamptz default now()
);

-- Admin Actions
create table public.admin_actions (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id),
  target_type text,
  target_id uuid,
  action text,
  created_at timestamptz default now()
);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==========================================
alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.quote_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.lead_events enable row level security;
alter table public.opportunities enable row level security;
alter table public.content_posts enable row level security;
alter table public.vendor_verifications enable row level security;
alter table public.content_reports enable row level security;
alter table public.admin_actions enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Vendors Policies
create policy "Vendors are viewable by everyone" on public.vendors for select using (true);
create policy "Vendors can update own business" on public.vendors for update using (auth.uid() = user_id);
create policy "Vendors can insert own business" on public.vendors for insert with check (auth.uid() = user_id);

-- Collections Policies
create policy "Users can view own collections" on public.collections for select using (auth.uid() = user_id);
create policy "Users can create own collections" on public.collections for insert with check (auth.uid() = user_id);

-- Collection Items Policies
create policy "Users can view own collection items" on public.collection_items for select using (
  collection_id in (select id from public.collections where user_id = auth.uid())
);
create policy "Users can add to own collections" on public.collection_items for insert with check (
  collection_id in (select id from public.collections where user_id = auth.uid())
);

-- Quote Requests Policies
create policy "Users can view own quotes" on public.quote_requests for select using (auth.uid() = user_id);
create policy "Vendors can view quotes for their business" on public.quote_requests for select using (
  vendor_id in (select id from public.vendors where user_id = auth.uid())
);
create policy "Users can create quotes" on public.quote_requests for insert with check (auth.uid() = user_id);

-- Conversations Policies
create policy "Users can view own conversations" on public.conversations for select using (auth.uid() = user_id);
create policy "Vendors can view conversations for their business" on public.conversations for select using (
  vendor_id in (select id from public.vendors where user_id = auth.uid())
);

-- Messages Policies
create policy "Users can view messages in their conversations" on public.messages for select using (
  conversation_id in (select id from public.conversations where user_id = auth.uid())
);
create policy "Vendors can view messages in their conversations" on public.messages for select using (
  conversation_id in (select id from public.conversations where vendor_id in (select id from public.vendors where user_id = auth.uid()))
);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- Notifications Policies
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);

-- Lead Events Policies
create policy "Vendors can view own lead events" on public.lead_events for select using (
  vendor_id in (select id from public.vendors where user_id = auth.uid())
);
create policy "Anyone can create lead events" on public.lead_events for insert with check (true);

-- Opportunities & Content Policies
create policy "Opportunities are viewable by everyone" on public.opportunities for select using (true);
create policy "Content posts are viewable by everyone" on public.content_posts for select using (true);

-- ==========================================
-- 4. TRIGGERS & FUNCTIONS
-- ==========================================

-- Handle New User Signup (Create Profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'customer');
  return new;
end;
$$ language plpgsql security definer;

-- Re-create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Calculate Profile Completion
create or replace function public.calculate_profile_completion(p_user_id uuid)
returns int as $$
declare
  v_profile public.profiles;
  v_score int := 0;
begin
  select * into v_profile from public.profiles where id = p_user_id;
  
  if v_profile.full_name is not null then v_score := v_score + 20; end if;
  if v_profile.phone is not null then v_score := v_score + 20; end if;
  if v_profile.avatar_url is not null then v_score := v_score + 20; end if;
  if v_profile.location is not null then v_score := v_score + 20; end if;
  if v_profile.bio is not null then v_score := v_score + 20; end if;
  
  update public.profiles set profile_completion = v_score, updated_at = now() where id = p_user_id;
  return v_score;
end;
$$ language plpgsql security definer;

-- Calculate Vendor Health Score
create or replace function public.calculate_vendor_health(p_vendor_id uuid)
returns json as $$
declare
  v_vendor public.vendors;
  v_score int := 0;
  v_metrics json;
begin
  select * into v_vendor from public.vendors where id = p_vendor_id;
  
  -- Profile Completion (30%)
  if v_vendor.business_name is not null then v_score := v_score + 10; end if;
  if v_vendor.description is not null then v_score := v_score + 10; end if;
  if v_vendor.logo_initials is not null then v_score := v_score + 10; end if;
  
  -- Activity & Engagement (40%)
  v_score := v_score + (select count(*) from public.lead_events where vendor_id = p_vendor_id and created_at > now() - interval '30 days') * 2;
  if v_score > 70 then v_score := 70; end if; -- Cap at 70 before reviews
  
  -- Reviews (30%)
  if v_vendor.rating >= 4.5 then v_score := v_score + 30;
  elsif v_vendor.rating >= 4.0 then v_score := v_score + 20;
  elsif v_vendor.rating >= 3.0 then v_score := v_score + 10; end if;

  v_metrics := json_build_object(
    'score', v_score,
    'profile_views', (select count(*) from public.lead_events where vendor_id = p_vendor_id and event_type = 'profile_view'),
    'total_quotes', (select count(*) from public.quote_requests where vendor_id = p_vendor_id),
    'avg_rating', v_vendor.rating
  );
  
  return v_metrics;
end;
$$ language plpgsql security definer;
