-- ============================================================
-- THE VENDOR — Seed data (Namibian categories + sample vendors)
-- Run after migrations:  supabase db reset  (or psql -f seed.sql)
-- ============================================================

-- ---------- Categories ----------
insert into categories (id, name, icon, color, sort_order) values
  ('photography',  'Photography',          'Camera',          '#E91E63', 1),
  ('catering',     'Catering & Food',      'UtensilsCrossed', '#FF9800', 2),
  ('beauty',       'Beauty & Makeup',      'Sparkles',        '#9C27B0', 3),
  ('events',       'Events & DJs',         'Music',           '#2196F3', 4),
  ('automotive',   'Automotive',           'Car',             '#607D8B', 5),
  ('home',         'Home Services',        'Wrench',          '#4CAF50', 6),
  ('tech',         'Technology',           'Monitor',         '#3F51B5', 7),
  ('health',       'Health & Wellness',    'Heart',           '#F44336', 8),
  ('fashion',      'Fashion & Design',     'Shirt',           '#E040FB', 9),
  ('education',    'Education',            'GraduationCap',   '#00BCD4', 10),
  ('construction', 'Construction',         'HardHat',         '#795548', 11),
  ('transport',    'Transport & Logistics','Truck',           '#FF5722', 12)
on conflict (id) do nothing;

-- ---------- Sample vendors ----------
-- Note: location is auto-derived from lat/lng by trigger.
insert into vendors (
  id, business_name, category, description, logo_initials, logo_gradient, cover_gradient,
  phone, whatsapp, email, website, address, city, region,
  latitude, longitude, rating, review_count, years_in_business, response_time,
  verified, verified_level, verification_status, featured, status,
  accepts_eft, accepts_cash
) values
(
  '11111111-1111-1111-1111-111111111111',
  'Namibia Lens Studio', 'photography',
  'Award-winning photography studio capturing the beauty of Namibia, from Sossusvlei to your wedding day.',
  'NL', 'linear-gradient(135deg, #E91E63, #880E4F)', 'linear-gradient(135deg, #E91E63, #AD1457)',
  '+264 61 234 5678', '264812345678', 'info@namibialens.com.na', 'www.namibialens.com.na',
  '42 Independence Ave, Windhoek', 'Windhoek', 'Khomas',
  -22.5609, 17.0658, 4.9, 187, 8, 'Responds within 2 hours',
  true, 'pro', 'verified', true, 'approved', true, true
),
(
  '22222222-2222-2222-2222-222222222222',
  'Savanna Catering Co.', 'catering',
  'Authentic Namibian flavours with international flair. Famous for oryx potjie and braai catering.',
  'SC', 'linear-gradient(135deg, #FF9800, #BF360C)', 'linear-gradient(135deg, #FF9800, #E65100)',
  '+264 61 345 6789', '264823456789', 'hello@savannacatering.na', 'www.savannacatering.na',
  '15 Sam Nujoma Drive, Klein Windhoek', 'Windhoek', 'Khomas',
  -22.5700, 17.0836, 4.8, 243, 10, 'Usually replies in 1 hour',
  true, 'pro', 'verified', true, 'approved', true, true
),
(
  '33333333-3333-3333-3333-333333333333',
  'Swakop Surf School', 'events',
  'Learn to surf on the cold Atlantic with certified instructors. Wetsuits and boards included.',
  'SS', 'linear-gradient(135deg, #06B6D4, #0E7490)', 'linear-gradient(135deg, #06B6D4, #0E7490)',
  '+264 64 405 123', '264814051230', 'surf@swakopsurf.na', 'www.swakopsurf.na',
  'Tigerball Beach, Swakopmund', 'Swakopmund', 'Erongo',
  -22.6792, 14.5272, 4.8, 96, 6, 'Responds within 3 hours',
  true, 'pro', 'verified', true, 'approved', true, true
)
on conflict (id) do nothing;

-- ---------- Business hours (Mon–Sun, 0 = Sunday) ----------
insert into vendor_hours (vendor_id, day_of_week, is_closed, opens_at, closes_at)
select v.id, d.dow,
       case when d.dow = 0 then true else false end,
       case when d.dow = 0 then null else time '08:00' end,
       case when d.dow = 0 then null else time '17:00' end
from vendors v
cross join generate_series(0,6) as d(dow)
where v.id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
on conflict (vendor_id, day_of_week) do nothing;

-- ---------- Services ----------
insert into services (vendor_id, name, description, price, sort_order) values
('11111111-1111-1111-1111-111111111111', 'Wedding Photography', 'Full day coverage + edited gallery', 'N$ 12,000', 1),
('11111111-1111-1111-1111-111111111111', 'Portrait Session',    '1-hour studio or outdoor shoot',     'N$ 1,800', 2),
('22222222-2222-2222-2222-222222222222', 'Wedding Catering',     'Per plate, min. 50 guests',          'N$ 285',   1),
('22222222-2222-2222-2222-222222222222', 'Braai Package',        'Full braai setup for 25 people',     'N$ 3,500', 2),
('33333333-3333-3333-3333-333333333333', 'Beginner Lesson',      '2 hours incl. board + wetsuit',      'N$ 850',   1)
on conflict do nothing;

-- ---------- Reviews (trigger recalculates vendor rating) ----------
insert into reviews (vendor_id, author_name, rating, text, has_photos) values
('11111111-1111-1111-1111-111111111111', 'Tangeni N.', 5, 'Stunning work at our wedding at Heja Lodge!', true),
('22222222-2222-2222-2222-222222222222', 'Ndapewa H.', 5, 'The oryx potjie was the highlight of the night.', true),
('33333333-3333-3333-3333-333333333333', 'Petrus K.', 5, 'Surfed for the first time — patient instructors!', false)
on conflict do nothing;

-- ---------- Opportunities ----------
insert into opportunities (title, description, location_text, city, region, event_date, deadline, status) values
('Windhoek Wedding Expo', 'Showcase your services to engaged couples.', 'Windhoek Country Club', 'Windhoek', 'Khomas', date '2026-08-24', date '2026-08-10', 'open'),
('Coastal Food Festival', 'Namibia''s biggest coastal food celebration.', 'Swakopmund Mole', 'Swakopmund', 'Erongo', date '2026-09-12', date '2026-08-30', 'closing_soon')
on conflict do nothing;
