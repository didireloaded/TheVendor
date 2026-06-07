# The Vendor — Database

Complete PostgreSQL + PostGIS schema for The Vendor (Supabase).

## Structure

| File | Purpose |
|------|---------|
| `migrations/0001_extensions_and_enums.sql` | Extensions (PostGIS, pg_trgm, unaccent, pgcrypto) + enums |
| `migrations/0002_core_tables.sql` | profiles, categories, vendors, hours, services, gallery, reviews |
| `migrations/0003_messaging_and_leads.sql` | conversations, messages, quotes, bookings, favorites, collections, recently viewed, notifications |
| `migrations/0004_content_opportunities_analytics.sql` | content_posts, opportunities, analytics_events, reports, moderation_log |
| `migrations/0005_functions_rpc.sql` | All server-side logic: geo radius, bounds, search, trending, recommendations, quote RPC, dashboard metrics, moderation |
| `migrations/0006_views.sql` | Frontend-ready denormalized views |
| `migrations/0007_rls_policies.sql` | Row Level Security for every table |
| `seed.sql` | Categories + sample Namibian vendors |

## Apply

```bash
# Using the Supabase CLI
supabase db reset                 # runs migrations + seed.sql
# or push to a linked project
supabase db push
```

Or run the files in order against any Postgres 15+ with PostGIS:

```bash
for f in supabase/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
psql "$DATABASE_URL" -f supabase/seed.sql
```

## Key RPC functions (call from the client)

```ts
// Nearby (PostGIS, server-side distance)
supabase.rpc('get_vendors_nearby', { user_lat, user_lng, radius_meters: 25000 })

// Map viewport (only load visible vendors)
supabase.rpc('get_vendors_in_bounds', { min_lng, min_lat, max_lng, max_lat })

// Search (fuzzy / accent-insensitive)
supabase.rpc('search_vendors', { q: 'photographer', result_limit: 25 })

// Trending (computed from analytics)
supabase.rpc('get_trending_vendors', { result_limit: 8 })

// Personalised recommendations
supabase.rpc('get_recommended_vendors', { user_lat, user_lng })

// Quote → auto-creates conversation + lead + notification
supabase.rpc('create_quote_request', {
  p_vendor_id, p_service, p_budget, p_event_date,
  p_guests, p_location, p_notes, p_contact_name, p_contact_phone
})

// Open/closed status (timezone aware)
supabase.rpc('vendor_open_status', { v_id })

// Lightweight analytics
supabase.rpc('log_event', { p_event: 'profile_view', p_vendor_id })

// Vendor dashboard metrics (real data)
supabase.rpc('vendor_dashboard_metrics', { p_vendor_id, window_days: 30 })

// Admin moderation
supabase.rpc('moderate_vendor', { p_vendor_id, p_action: 'approve' })
```

## Scheduled job (recommended)

Recompute trending scores hourly via pg_cron:

```sql
select cron.schedule('recompute-trending', '0 * * * *',
  $$ select recompute_trending_scores(7); $$);
```

## Frontend-ready views

- `categories_with_counts` — categories + live vendor counts
- `vendor_cards` — everything for a vendor card incl. open status, services, gallery
- `vendor_profiles` — vendor_cards + reviews
- `moderation_queue` — pending vendors for admin
- `conversation_summaries` — chat list with unread counts
- `explore_feed` — published content joined to vendors

## Security

Row Level Security is enabled on every table:
- Public can read approved vendors, categories, reviews, published content, opportunities.
- Customers manage their own favorites, collections, conversations, quotes, notifications.
- Vendor owners manage their own vendor, services, hours, gallery, content, and read their leads/analytics.
- Admins (profiles.role = 'admin') can moderate everything.
