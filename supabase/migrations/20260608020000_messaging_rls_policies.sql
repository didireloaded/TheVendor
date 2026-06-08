
-- ==========================================
-- ROW LEVEL SECURITY (RLS) FOR MESSAGING
-- ==========================================
alter table public.quote_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Enable Realtime for these tables
alter publication supabase_realtime add table public.quote_requests;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;


-- ==========================================
-- QUOTE REQUESTS POLICIES
-- ==========================================

-- Users can view quotes they requested, OR vendors can view quotes sent to their business
DROP POLICY IF EXISTS "Users and Vendors can view relevant quotes" ON public.quote_requests;
create policy "Users and Vendors can view relevant quotes"
  on public.quote_requests for select
  using (
    auth.uid() = user_id OR
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

-- Users can insert their own quote requests
DROP POLICY IF EXISTS "Users can insert their own quote requests" ON public.quote_requests;
create policy "Users can insert their own quote requests"
  on public.quote_requests for insert
  with check ( auth.uid() = user_id );

-- Vendors can update the status of quotes sent to their business
DROP POLICY IF EXISTS "Vendors can update quotes sent to their business" ON public.quote_requests;
create policy "Vendors can update quotes sent to their business"
  on public.quote_requests for update
  using ( exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid()) );


-- ==========================================
-- CONVERSATIONS POLICIES
-- ==========================================

-- Users and Vendors can view their relevant conversations
DROP POLICY IF EXISTS "Users and Vendors can view relevant conversations" ON public.conversations;
create policy "Users and Vendors can view relevant conversations"
  on public.conversations for select
  using (
    auth.uid() = user_id OR
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

-- Users can insert their own conversations
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
create policy "Users can insert conversations"
  on public.conversations for insert
  with check ( auth.uid() = user_id );

-- Both parties can update conversations (e.g. unread count, last activity)
DROP POLICY IF EXISTS "Users and Vendors can update relevant conversations" ON public.conversations;
create policy "Users and Vendors can update relevant conversations"
  on public.conversations for update
  using (
    auth.uid() = user_id OR
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );


-- ==========================================
-- MESSAGES POLICIES
-- ==========================================

-- Users and Vendors can view messages in their relevant conversations
DROP POLICY IF EXISTS "Users and Vendors can view relevant messages" ON public.messages;
create policy "Users and Vendors can view relevant messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c 
      where c.id = conversation_id and (
        c.user_id = auth.uid() OR
        exists (select 1 from public.vendors v where v.id = c.vendor_id and v.user_id = auth.uid())
      )
    )
  );

-- Users and Vendors can insert messages into their relevant conversations
DROP POLICY IF EXISTS "Users and Vendors can insert relevant messages" ON public.messages;
create policy "Users and Vendors can insert relevant messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c 
      where c.id = conversation_id and (
        c.user_id = auth.uid() OR
        exists (select 1 from public.vendors v where v.id = c.vendor_id and v.user_id = auth.uid())
      )
    )
  );
