-- Create extensions
-- using built-in gen_random_uuid()

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    count INTEGER DEFAULT 0,
    description TEXT,
    "parentCategory" TEXT,
    subcategories JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT TO public USING (true);

-- 2. Vendors
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    "businessName" TEXT NOT NULL,
    category TEXT REFERENCES public.categories(id),
    subcategory TEXT,
    description TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    facebook TEXT,
    instagram TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    city TEXT,
    region TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    rating DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "verificationStatus" TEXT,
    "vendorQualityScore" INTEGER,
    status TEXT DEFAULT 'pending_review',
    source TEXT,
    "discoveredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "reviewedAt" TIMESTAMP WITH TIME ZONE,
    "reviewedBy" TEXT,
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    hours JSONB DEFAULT '{}'::jsonb,
    "coverGradient" TEXT,
    "logoGradient" TEXT,
    "logoInitials" TEXT,
    "coverImage" TEXT,
    "logoImage" TEXT,
    "galleryColors" JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on vendors" ON public.vendors FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert on vendors" ON public.vendors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow vendor owner update on vendors" ON public.vendors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow vendor owner delete on vendors" ON public.vendors FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow admin update on vendors" ON public.vendors FOR UPDATE TO authenticated
USING (
  COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 3. Services
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on services" ON public.services FOR SELECT TO public USING (true);
CREATE POLICY "Allow vendor owner insert on services" ON public.services FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);
CREATE POLICY "Allow vendor owner update on services" ON public.services FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);
CREATE POLICY "Allow vendor owner delete on services" ON public.services FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);

-- 4. Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    author TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    date TEXT,
    "avatarColor" TEXT,
    "hasPhotos" BOOLEAN DEFAULT false,
    "photoColors" JSONB DEFAULT '[]'::jsonb,
    reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on reviews" ON public.reviews FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated insert on reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    details TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- Vendors can only see leads for their own business
CREATE POLICY "Allow vendor owner select on leads" ON public.leads FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);
-- Vendors can update their leads
CREATE POLICY "Allow vendor owner update on leads" ON public.leads FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);
-- Anyone can insert a lead (e.g. quote request form without login)
CREATE POLICY "Allow public insert on leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert on leads (auth)" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
