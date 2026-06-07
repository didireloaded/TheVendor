-- ============================================================
-- THE VENDOR — 0001 Extensions & Enums
-- Namibia's vendor discovery platform
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";       -- gen_random_uuid()
create extension if not exists "postgis";         -- geography / geometry
create extension if not exists "pg_trgm";         -- fuzzy text search
create extension if not exists "unaccent";        -- accent-insensitive search

-- ---------- Enumerated types ----------
do $$ begin
  create type user_role as enum ('customer', 'vendor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vendor_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_level as enum ('none', 'basic', 'pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type conversation_type as enum ('general', 'quote', 'booking', 'support');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_type as enum ('text', 'image', 'location', 'document', 'quote', 'booking', 'system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type quote_status as enum ('pending', 'viewed', 'responded', 'accepted', 'declined', 'completed', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type opportunity_status as enum ('open', 'closing_soon', 'closed', 'invite_only');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum ('draft', 'published', 'flagged', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type analytics_event as enum (
    'profile_view', 'search', 'search_result_click', 'category_view',
    'contact_click', 'whatsapp_click', 'call_click', 'directions_click',
    'quote_request', 'message_sent', 'review_created', 'bookmark', 'content_view',
    'content_like', 'content_save', 'content_share'
  );
exception when duplicate_object then null; end $$;
