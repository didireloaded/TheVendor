CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    count INTEGER DEFAULT 0
);

CREATE TABLE public.vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT REFERENCES public.categories(id),
    category_name TEXT,
    description TEXT,
    rating NUMERIC(3,1) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    verified_level TEXT,
    featured BOOLEAN DEFAULT false,
    premium BOOLEAN DEFAULT false,
    lat NUMERIC(10,6),
    lng NUMERIC(10,6),
    address TEXT,
    distance NUMERIC(5,1),
    is_open BOOLEAN DEFAULT true,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    instagram TEXT,
    facebook TEXT,
    cover_gradient TEXT,
    logo_gradient TEXT,
    logo_initials TEXT,
    gallery_colors JSONB,
    hours JSONB
);

CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT,
    color TEXT
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    avatar TEXT,
    avatar_color TEXT,
    rating INTEGER,
    date TEXT,
    text TEXT,
    reply TEXT,
    has_photos BOOLEAN DEFAULT false,
    photo_colors JSONB
);

-- Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.services FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.reviews FOR SELECT USING (true);
