ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
