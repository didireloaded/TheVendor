-- ============================================================
-- THE VENDOR — 0006 Views (frontend-ready, denormalized reads)
-- ============================================================

-- Categories with live vendor counts
create or replace view categories_with_counts as
select
  c.*,
  coalesce(vc.cnt, 0) as vendor_count
from categories c
left join (
  select category, count(*) cnt
  from vendors
  where status = 'approved'
  group by category
) vc on vc.category = c.id
order by c.sort_order;

-- Full vendor card payload (everything the app needs in one row)
create or replace view vendor_cards as
select
  v.id,
  v.business_name,
  v.slug,
  v.category,
  c.name  as category_name,
  c.color as category_color,
  v.description,
  v.logo_initials,
  v.logo_gradient,
  v.cover_gradient,
  v.cover_url,
  v.phone,
  v.whatsapp,
  v.email,
  v.website,
  v.address,
  v.city,
  v.region,
  v.latitude,
  v.longitude,
  v.rating,
  v.review_count,
  v.years_in_business,
  v.response_time,
  v.verified,
  v.verified_level,
  v.featured,
  v.trending_score,
  v.accepts_eft,
  v.accepts_cash,
  v.status,
  (st.is_open)  as is_open,
  (st.label)    as open_label,
  (st.detail)   as open_detail,
  coalesce(svc.services, '[]'::json)  as services,
  coalesce(gal.gallery,  '[]'::json)  as gallery
from vendors v
join categories c on c.id = v.category
left join lateral vendor_open_status(v.id) st on true
left join lateral (
  select json_agg(json_build_object(
    'id', s.id, 'name', s.name, 'description', s.description, 'price', s.price
  ) order by s.sort_order) as services
  from services s where s.vendor_id = v.id
) svc on true
left join lateral (
  select json_agg(g.image_url order by g.sort_order) as gallery
  from vendor_gallery g where g.vendor_id = v.id
) gal on true
where v.status = 'approved';

-- Vendor full profile (cards + reviews)
create or replace view vendor_profiles as
select
  vc.*,
  coalesce(rv.reviews, '[]'::json) as reviews
from vendor_cards vc
left join lateral (
  select json_agg(json_build_object(
    'id', r.id,
    'author', r.author_name,
    'rating', r.rating,
    'text', r.text,
    'has_photos', r.has_photos,
    'photo_urls', r.photo_urls,
    'reply', r.reply,
    'created_at', r.created_at
  ) order by r.created_at desc) as reviews
  from reviews r where r.vendor_id = vc.id
) rv on true;

-- Admin moderation queue
create or replace view moderation_queue as
select
  v.id,
  v.business_name,
  v.category,
  v.city,
  v.address,
  v.description,
  v.logo_initials,
  v.logo_gradient,
  v.status,
  v.created_at,
  p.full_name as owner_name
from vendors v
left join profiles p on p.id = v.owner_id
where v.status = 'pending_review'
order by v.created_at asc;

-- Conversation list (per participant) with unread counts
create or replace view conversation_summaries as
select
  c.id,
  c.customer_id,
  c.vendor_id,
  c.type,
  c.last_message,
  c.last_activity,
  c.archived,
  v.business_name as vendor_name,
  v.logo_initials as vendor_logo,
  v.logo_gradient as vendor_color,
  v.verified,
  v.verified_level,
  (select count(*) from messages m
     where m.conversation_id = c.id and m.is_read = false
       and m.sender_role <> 'customer') as unread_customer,
  (select count(*) from messages m
     where m.conversation_id = c.id and m.is_read = false
       and m.sender_role = 'customer') as unread_vendor
from conversations c
join vendors v on v.id = c.vendor_id;

-- Explore feed (published content joined to vendor)
create or replace view explore_feed as
select
  cp.id,
  cp.image_url,
  cp.caption,
  cp.tags,
  cp.city,
  cp.likes_count,
  cp.comments_count,
  cp.saves_count,
  cp.created_at,
  v.id   as vendor_id,
  v.business_name as vendor_name,
  v.logo_initials as vendor_logo,
  v.logo_gradient as vendor_color,
  v.category,
  c.name as category_name
from content_posts cp
join vendors v on v.id = cp.vendor_id
join categories c on c.id = v.category
where cp.status = 'published' and v.status = 'approved'
order by cp.created_at desc;
