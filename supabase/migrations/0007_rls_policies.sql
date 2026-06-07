-- ============================================================
-- THE VENDOR — 0007 Row Level Security
-- ============================================================

-- Enable RLS everywhere
alter table profiles                enable row level security;
alter table categories              enable row level security;
alter table vendors                 enable row level security;
alter table vendor_hours            enable row level security;
alter table services                enable row level security;
alter table vendor_gallery          enable row level security;
alter table reviews                 enable row level security;
alter table conversations           enable row level security;
alter table messages                enable row level security;
alter table quote_requests          enable row level security;
alter table bookings                enable row level security;
alter table collections             enable row level security;
alter table favorites               enable row level security;
alter table recently_viewed         enable row level security;
alter table notifications           enable row level security;
alter table content_posts           enable row level security;
alter table content_likes           enable row level security;
alter table opportunities           enable row level security;
alter table opportunity_applications enable row level security;
alter table analytics_events        enable row level security;
alter table reports                 enable row level security;
alter table moderation_log          enable row level security;

-- ---------- PROFILES ----------
create policy "profiles read own" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles update own" on profiles
  for update using (auth.uid() = id);

-- ---------- CATEGORIES (public read) ----------
create policy "categories public read" on categories
  for select using (true);
create policy "categories admin write" on categories
  for all using (is_admin()) with check (is_admin());

-- ---------- VENDORS ----------
create policy "vendors public read approved" on vendors
  for select using (status = 'approved' or owner_id = auth.uid() or is_admin());
create policy "vendors owner insert" on vendors
  for insert with check (owner_id = auth.uid());
create policy "vendors owner update" on vendors
  for update using (owner_id = auth.uid() or is_admin());
create policy "vendors admin delete" on vendors
  for delete using (is_admin());

-- ---------- VENDOR HOURS / SERVICES / GALLERY ----------
create policy "hours public read" on vendor_hours for select using (true);
create policy "hours owner write" on vendor_hours
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

create policy "services public read" on services for select using (true);
create policy "services owner write" on services
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

create policy "gallery public read" on vendor_gallery for select using (true);
create policy "gallery owner write" on vendor_gallery
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

-- ---------- REVIEWS ----------
create policy "reviews public read" on reviews for select using (true);
create policy "reviews author insert" on reviews
  for insert with check (author_id = auth.uid());
create policy "reviews author update" on reviews
  for update using (author_id = auth.uid());
create policy "reviews author or owner delete" on reviews
  for delete using (author_id = auth.uid() or owns_vendor(vendor_id) or is_admin());

-- ---------- CONVERSATIONS / MESSAGES ----------
create policy "conversations participant read" on conversations
  for select using (customer_id = auth.uid() or owns_vendor(vendor_id) or is_admin());
create policy "conversations customer insert" on conversations
  for insert with check (customer_id = auth.uid());
create policy "conversations participant update" on conversations
  for update using (customer_id = auth.uid() or owns_vendor(vendor_id));

create policy "messages participant read" on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or owns_vendor(c.vendor_id) or is_admin())
    )
  );
create policy "messages participant insert" on messages
  for insert with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or owns_vendor(c.vendor_id))
    )
  );
create policy "messages participant update" on messages
  for update using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or owns_vendor(c.vendor_id))
    )
  );

-- ---------- QUOTE REQUESTS / BOOKINGS ----------
create policy "quotes participant read" on quote_requests
  for select using (customer_id = auth.uid() or owns_vendor(vendor_id) or is_admin());
create policy "quotes customer insert" on quote_requests
  for insert with check (customer_id = auth.uid());
create policy "quotes participant update" on quote_requests
  for update using (customer_id = auth.uid() or owns_vendor(vendor_id));

create policy "bookings participant read" on bookings
  for select using (customer_id = auth.uid() or owns_vendor(vendor_id) or is_admin());
create policy "bookings participant write" on bookings
  for all using (customer_id = auth.uid() or owns_vendor(vendor_id))
  with check (customer_id = auth.uid() or owns_vendor(vendor_id));

-- ---------- COLLECTIONS / FAVORITES / RECENTLY VIEWED ----------
create policy "collections own" on collections
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "favorites own" on favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "recently viewed own" on recently_viewed
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- NOTIFICATIONS ----------
create policy "notifications own read" on notifications
  for select using (user_id = auth.uid());
create policy "notifications own update" on notifications
  for update using (user_id = auth.uid());

-- ---------- CONTENT ----------
create policy "content public read" on content_posts
  for select using (status = 'published' or owns_vendor(vendor_id) or is_admin());
create policy "content owner write" on content_posts
  for all using (owns_vendor(vendor_id) or is_admin())
  with check (owns_vendor(vendor_id) or is_admin());

create policy "content likes read" on content_likes for select using (true);
create policy "content likes own" on content_likes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- OPPORTUNITIES ----------
create policy "opportunities public read" on opportunities for select using (true);
create policy "opportunities admin write" on opportunities
  for all using (is_admin()) with check (is_admin());

create policy "opp apps read" on opportunity_applications
  for select using (owns_vendor(vendor_id) or is_admin());
create policy "opp apps vendor write" on opportunity_applications
  for all using (owns_vendor(vendor_id)) with check (owns_vendor(vendor_id));

-- ---------- ANALYTICS (insert-only for users, read for admins/owners) ----------
create policy "analytics insert" on analytics_events
  for insert with check (true);
create policy "analytics owner read" on analytics_events
  for select using (owns_vendor(vendor_id) or is_admin());

-- ---------- REPORTS / MODERATION ----------
create policy "reports insert" on reports
  for insert with check (reporter_id = auth.uid());
create policy "reports admin read" on reports
  for select using (is_admin() or reporter_id = auth.uid());
create policy "reports admin update" on reports
  for update using (is_admin());

create policy "modlog admin read" on moderation_log
  for select using (is_admin());
