-- 1. Ensure `profiles` table has `account_type`
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'customer' CHECK (account_type IN ('customer', 'vendor', 'admin'));

-- 2. Create `quote_requests`
CREATE TABLE IF NOT EXISTS public.quote_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id uuid, -- Reference to a services table if it exists, nullable for now
    status text DEFAULT 'New',
    message text,
    budget numeric,
    event_date date,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Create `posts` for the Content System
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    title text,
    description text,
    image_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Create `analytics_events`
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Create `reviews`
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating integer CHECK (rating >= 1 AND rating <= 5),
    review text,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Create `bookings`
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_id uuid,
    status text DEFAULT 'pending',
    booking_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- 7. Create `opportunities` and `opportunity_applications`
CREATE TABLE IF NOT EXISTS public.opportunities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text,
    description text,
    location text,
    application_deadline timestamp with time zone,
    status text DEFAULT 'open',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE CASCADE,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- 8. Create `notifications`
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text,
    body text,
    type text,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 9. Create `collections` and `collection_items`
CREATE TABLE IF NOT EXISTS public.collections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(collection_id, vendor_id)
);

-- 10. Create `vendor_health_score`
CREATE TABLE IF NOT EXISTS public.vendor_health_score (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE UNIQUE,
    score numeric DEFAULT 0,
    profile_completion integer DEFAULT 0,
    review_score numeric DEFAULT 0,
    response_rate numeric DEFAULT 0,
    activity_level numeric DEFAULT 0,
    content_frequency numeric DEFAULT 0,
    service_quality numeric DEFAULT 0,
    lead_conversion numeric DEFAULT 0,
    last_calculated timestamp with time zone DEFAULT now()
);

-- 11. Add REALTIME publications
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY['quote_requests', 'bookings', 'notifications', 'reviews', 'opportunity_applications', 'analytics_events', 'messages'])
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', t);
        END IF;
    END LOOP;
END
$$;

-- Enable REPLICA IDENTITY FULL for these tables so realtime sends complete previous records on UPDATE/DELETE
ALTER TABLE public.quote_requests REPLICA IDENTITY FULL;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;
ALTER TABLE public.opportunity_applications REPLICA IDENTITY FULL;
ALTER TABLE public.analytics_events REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- 12. Create Storage Buckets (Storage schema must exist, it usually does in Supabase)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('vendor-logos', 'vendor-logos', true),
  ('vendor-covers', 'vendor-covers', true),
  ('posts', 'posts', true),
  ('products', 'products', true),
  ('services', 'services', true),
  ('documents', 'documents', false),
  ('verification-files', 'verification-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (basic public read access for public buckets)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('avatars', 'vendor-logos', 'vendor-covers', 'posts', 'products', 'services') );
