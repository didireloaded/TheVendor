
-- ==========================================
-- 1. PROFILES TRIGGER
-- ==========================================
-- Automatically create a profile when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.phone);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================
alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.collections enable row level security;

-- PROFILES POLICIES
-- Anyone can view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- VENDORS POLICIES
-- Anyone can view vendors
DROP POLICY IF EXISTS "Vendors are viewable by everyone" ON public.vendors;
create policy "Vendors are viewable by everyone"
  on public.vendors for select
  using ( true );

-- Authenticated users can insert their own vendor profile
DROP POLICY IF EXISTS "Users can insert their own vendor profile" ON public.vendors;
create policy "Users can insert their own vendor profile"
  on public.vendors for insert
  with check ( auth.uid() = user_id );

-- Users can update their own vendor profile
DROP POLICY IF EXISTS "Users can update their own vendor profile" ON public.vendors;
create policy "Users can update their own vendor profile"
  on public.vendors for update
  using ( auth.uid() = user_id );

-- Users can delete their own vendor profile
DROP POLICY IF EXISTS "Users can delete their own vendor profile" ON public.vendors;
create policy "Users can delete their own vendor profile"
  on public.vendors for delete
  using ( auth.uid() = user_id );

-- COLLECTIONS POLICIES
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
create policy "Users can view their own collections"
  on public.collections for select
  using ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can insert their own collections" ON public.collections;
create policy "Users can insert their own collections"
  on public.collections for insert
  with check ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;
create policy "Users can delete their own collections"
  on public.collections for delete
  using ( auth.uid() = user_id );
