-- Migration to create social feed tables (posts, stories, reels)

-- 1. Posts (Masonry Grid)
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "vendorId" TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    "imageGradient" TEXT,
    "imageUrl" TEXT,
    height INTEGER DEFAULT 250,
    caption TEXT,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on posts" ON public.posts FOR SELECT TO public USING (true);

-- 2. Stories
CREATE TABLE IF NOT EXISTS public.stories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "vendorId" TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    "hasUnseen" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "expiresAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on stories" ON public.stories FOR SELECT TO public USING (true);

-- 3. Reels
CREATE TABLE IF NOT EXISTS public.reels (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "vendorId" TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    "videoUrl" TEXT,
    "coverGradient" TEXT,
    "coverUrl" TEXT,
    views INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on reels" ON public.reels FOR SELECT TO public USING (true);
