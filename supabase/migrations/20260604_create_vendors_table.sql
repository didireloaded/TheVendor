-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    "businessName" TEXT NOT NULL,
    category TEXT,
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
    services JSONB,
    tags JSONB,
    rating DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "verificationStatus" TEXT,
    "vendorQualityScore" INTEGER,
    status TEXT DEFAULT 'pending_review',
    source TEXT,
    "discoveredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "reviewedAt" TIMESTAMP WITH TIME ZONE,
    "reviewedBy" TEXT,
    notes TEXT,
    photos JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access" ON public.vendors
    FOR SELECT
    TO anon
    USING (true);

-- Allow anonymous insert (TEMPORARY FOR SEEDING)
CREATE POLICY "Allow anonymous insert for seeding" ON public.vendors
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous update (TEMPORARY FOR ADMIN/DASHBOARD MIGRATION)
CREATE POLICY "Allow anonymous update" ON public.vendors
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous delete (TEMPORARY FOR ADMIN/DASHBOARD MIGRATION)
CREATE POLICY "Allow anonymous delete" ON public.vendors
    FOR DELETE
    TO anon
    USING (true);
