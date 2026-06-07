-- ============================================================
-- THE VENDOR — 0008 RLS Hardening
-- Fixes any missing grants, adds indexes, and ensures
-- every table is fully protected.
-- ============================================================

-- Ensure RLS is enabled on ALL tables (idempotent)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles','categories','vendors','vendor_hours','services','vendor_gallery',
      'reviews','conversations','messages','quote_requests','bookings',
      'collections','favorites','recently_viewed','notifications',
      'content_posts','content_likes','opportunities','opportunity_applications',
      'analytics_events','reports','moderation_log'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END;
$$;

-- ============================================================
-- Missing or corrected policies
-- ============================================================

-- PROFILES: allow insert on signup (auth trigger handles this)
DO $$ BEGIN
  CREATE POLICY "profiles allow signup" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CATEGORIES: ensure admin can insert/update/delete
DO $$ BEGIN
  CREATE POLICY "categories admin insert" ON categories
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "categories admin update" ON categories
    FOR UPDATE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "categories admin delete" ON categories
    FOR DELETE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- VENDORS: ensure admin insert
DO $$ BEGIN
  CREATE POLICY "vendors admin insert" ON vendors
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- VENDOR_HOURS: ensure admin insert
DO $$ BEGIN
  CREATE POLICY "hours admin insert" ON vendor_hours
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SERVICES: ensure admin insert
DO $$ BEGIN
  CREATE POLICY "services admin insert" ON services
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- VENDOR_GALLERY: ensure admin insert
DO $$ BEGIN
  CREATE POLICY "gallery admin insert" ON vendor_gallery
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- REVIEWS: admin can delete any
DO $$ BEGIN
  CREATE POLICY "reviews admin delete" ON reviews
    FOR DELETE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CONVERSATIONS: admin can read all
DO $$ BEGIN
  CREATE POLICY "conversations admin read" ON conversations
    FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- MESSAGES: admin can read all
DO $$ BEGIN
  CREATE POLICY "messages admin read" ON messages
    FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- QUOTE_REQUESTS: admin can read all
DO $$ BEGIN
  CREATE POLICY "quotes admin read" ON quote_requests
    FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- BOOKINGS: admin can read all
DO $$ BEGIN
  CREATE POLICY "bookings admin read" ON bookings
    FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTIFICATIONS: admin can insert (for system notifications)
DO $$ BEGIN
  CREATE POLICY "notifications system insert" ON notifications
    FOR INSERT WITH CHECK (is_admin() OR auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CONTENT_POSTS: admin can insert (for moderation)
DO $$ BEGIN
  CREATE POLICY "content admin insert" ON content_posts
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CONTENT_LIKES: admin can delete (for moderation)
DO $$ BEGIN
  CREATE POLICY "content likes admin delete" ON content_likes
    FOR DELETE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- OPPORTUNITIES: admin can insert
DO $$ BEGIN
  CREATE POLICY "opportunities admin insert" ON opportunities
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- OPPORTUNITY_APPLICATIONS: admin can read all
DO $$ BEGIN
  CREATE POLICY "opp apps admin read" ON opportunity_applications
    FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- REPORTS: admin can update
DO $$ BEGIN
  CREATE POLICY "reports admin update" ON reports
    FOR UPDATE USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- MODERATION_LOG: admin can insert
DO $$ BEGIN
  CREATE POLICY "modlog admin insert" ON moderation_log
    FOR INSERT WITH CHECK (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ANALYTICS: admin can read all
DO $$ BEGIN
  CREATE POLICY "analytics admin read all" ON analytics_events
    FOR SELECT USING (is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- Performance indexes (if not already present)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON conversations(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_posts_created ON content_posts(created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_vendors_city_category ON vendors(city, category) WHERE status = 'approved';
