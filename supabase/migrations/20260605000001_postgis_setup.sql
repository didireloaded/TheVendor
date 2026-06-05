-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Assuming there is a vendors table, add a geography column for location
-- (If the table doesn't exist yet, this should be modified or run after vendor table creation)

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'vendors') THEN
        ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS location extensions.geography(Point, 4326);
        
        -- Create a spatial index for efficient radius and bounding box queries
        CREATE INDEX IF NOT EXISTS vendors_location_idx ON public.vendors USING GIST (location);

        -- Populate geography column from existing lat/lng if they exist
        UPDATE public.vendors
        SET location = extensions.ST_SetSRID(extensions.ST_MakePoint(longitude, latitude), 4326)::extensions.geography
        WHERE longitude IS NOT NULL AND latitude IS NOT NULL;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_vendor_location()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.location := extensions.ST_SetSRID(
      extensions.ST_MakePoint(NEW.longitude, NEW.latitude),
      4326
    )::extensions.geography;
  ELSE
    NEW.location := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_vendor_location_before_write ON public.vendors;
CREATE TRIGGER set_vendor_location_before_write
BEFORE INSERT OR UPDATE OF latitude, longitude ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.set_vendor_location();

-- RPC for finding nearby vendors within a certain radius (meters)
CREATE OR REPLACE FUNCTION get_vendors_nearby(
    user_lat double precision,
    user_lng double precision,
    radius_meters double precision DEFAULT 5000
)
RETURNS SETOF public.vendors
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT *
  FROM public.vendors
  WHERE status = 'approved'
  AND location IS NOT NULL
  AND extensions.ST_DWithin(
    location,
    extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography,
    radius_meters
  )
  ORDER BY location <-> extensions.ST_SetSRID(extensions.ST_MakePoint(user_lng, user_lat), 4326)::extensions.geography;
$$;
