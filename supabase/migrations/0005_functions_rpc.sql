-- ============================================================
-- THE VENDOR — 0005 Server-side logic: RPC & helper functions
-- All ranking, geo, search, status & analytics run in the DB.
-- ============================================================

-- ---------- Role helpers ----------
create or replace function current_role()
returns user_role
language sql stable
as $$
  select coalesce((select role from profiles where id = auth.uid()), 'customer');
$$;

create or replace function is_admin()
returns boolean
language sql stable
as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

create or replace function owns_vendor(v_id uuid)
returns boolean
language sql stable
as $$
  select exists (select 1 from vendors where id = v_id and owner_id = auth.uid());
$$;

-- ============================================================
-- OPEN-NOW STATUS  (timezone aware)
-- Returns: is_open, label, detail
-- ============================================================
create or replace function vendor_open_status(v_id uuid)
returns table (is_open boolean, label text, detail text)
language plpgsql stable
as $$
declare
  v_tz       text;
  v_now      timestamptz := now();
  v_local    timestamp;
  v_dow      int;
  v_time     time;
  h          record;
  next_h     record;
begin
  select coalesce(timezone, 'Africa/Windhoek') into v_tz from vendors where id = v_id;
  if v_tz is null then
    return query select false, 'Hours unavailable', '';
    return;
  end if;

  v_local := v_now at time zone v_tz;
  v_dow   := extract(dow from v_local)::int;
  v_time  := v_local::time;

  select * into h from vendor_hours where vendor_id = v_id and day_of_week = v_dow;

  if found and not h.is_closed and h.opens_at is not null and h.closes_at is not null then
    if (h.closes_at > h.opens_at and v_time between h.opens_at and h.closes_at)
       or (h.closes_at < h.opens_at and (v_time >= h.opens_at or v_time <= h.closes_at)) then
      return query select true, 'Open Now', 'Closes at ' || to_char(h.closes_at, 'HH24:MI');
      return;
    elsif v_time < h.opens_at then
      return query select false, 'Closed', 'Opens today at ' || to_char(h.opens_at, 'HH24:MI');
      return;
    end if;
  end if;

  -- find next open day within 7 days
  for i in 1..7 loop
    select * into next_h
    from vendor_hours
    where vendor_id = v_id
      and day_of_week = ((v_dow + i) % 7)
      and not is_closed
      and opens_at is not null;
    if found then
      return query select
        false,
        'Closed',
        case when i = 1 then 'Opens tomorrow at ' else 'Opens ' || to_char((v_local + (i || ' days')::interval), 'Dy') || ' at ' end
          || to_char(next_h.opens_at, 'HH24:MI');
      return;
    end if;
  end loop;

  return query select false, 'Closed', 'Hours unavailable';
end;
$$;

-- ============================================================
-- NEARBY VENDORS  (PostGIS radius query, server-side distance)
-- ============================================================
create or replace function get_vendors_nearby(
  user_lat      double precision,
  user_lng      double precision,
  radius_meters double precision default 25000,
  filter_category text default null,
  only_verified boolean default false,
  result_limit  int default 50
)
returns table (
  id uuid,
  business_name text,
  category text,
  city text,
  rating numeric,
  review_count int,
  verified boolean,
  verified_level verification_level,
  logo_initials text,
  logo_gradient text,
  latitude double precision,
  longitude double precision,
  distance_meters double precision
)
language sql stable
as $$
  select
    v.id, v.business_name, v.category, v.city, v.rating, v.review_count,
    v.verified, v.verified_level, v.logo_initials, v.logo_gradient,
    v.latitude, v.longitude,
    st_distance(v.location, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography) as distance_meters
  from vendors v
  where v.status = 'approved'
    and v.location is not null
    and st_dwithin(v.location, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography, radius_meters)
    and (filter_category is null or v.category = filter_category)
    and (not only_verified or v.verified = true)
  order by distance_meters asc
  limit result_limit;
$$;

-- ============================================================
-- VENDORS IN MAP VIEWPORT  (bounding box — only load what's visible)
-- ============================================================
create or replace function get_vendors_in_bounds(
  min_lng double precision,
  min_lat double precision,
  max_lng double precision,
  max_lat double precision,
  filter_category text default null,
  result_limit int default 200
)
returns setof vendors
language sql stable
as $$
  select *
  from vendors v
  where v.status = 'approved'
    and v.location is not null
    and v.location && st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
    and (filter_category is null or v.category = filter_category)
  limit result_limit;
$$;

-- ============================================================
-- FULL-TEXT / FUZZY SEARCH
-- ============================================================
create or replace function search_vendors(q text, result_limit int default 25)
returns table (
  id uuid,
  business_name text,
  category text,
  city text,
  rating numeric,
  review_count int,
  verified boolean,
  logo_initials text,
  logo_gradient text,
  relevance real
)
language sql stable
as $$
  select
    v.id, v.business_name, v.category, v.city, v.rating, v.review_count,
    v.verified, v.logo_initials, v.logo_gradient,
    greatest(
      similarity(unaccent(v.business_name), unaccent(q)),
      similarity(unaccent(coalesce(v.city, '')), unaccent(q)),
      similarity(unaccent(coalesce(v.category, '')), unaccent(q))
    ) as relevance
  from vendors v
  where v.status = 'approved'
    and (
      unaccent(v.business_name) ilike '%' || unaccent(q) || '%'
      or unaccent(coalesce(v.description, '')) ilike '%' || unaccent(q) || '%'
      or unaccent(coalesce(v.city, '')) ilike '%' || unaccent(q) || '%'
      or v.category ilike '%' || q || '%'
      or exists (select 1 from services s where s.vendor_id = v.id and s.name ilike '%' || q || '%')
    )
  order by relevance desc, v.rating desc
  limit result_limit;
$$;

-- ============================================================
-- TRENDING SCORE  (server-side, from analytics over a rolling window)
-- score = views*0.3 + quotes*0.4 + messages*0.15 + saves*0.1 + reviews*0.05
-- ============================================================
create or replace function recompute_trending_scores(window_days int default 7)
returns void
language plpgsql
as $$
begin
  with stats as (
    select
      v.id as vendor_id,
      count(*) filter (where e.event = 'profile_view')  as views,
      count(*) filter (where e.event = 'quote_request') as quotes,
      count(*) filter (where e.event = 'message_sent')  as messages,
      count(*) filter (where e.event = 'bookmark')      as saves,
      count(*) filter (where e.event = 'review_created') as reviews
    from vendors v
    left join analytics_events e
      on e.vendor_id = v.id
     and e.created_at > now() - (window_days || ' days')::interval
    group by v.id
  )
  update vendors v
  set trending_score =
        coalesce(s.views,0)   * 0.30 +
        coalesce(s.quotes,0)  * 0.40 +
        coalesce(s.messages,0)* 0.15 +
        coalesce(s.saves,0)   * 0.10 +
        coalesce(s.reviews,0) * 0.05
  from stats s
  where s.vendor_id = v.id;
end;
$$;

create or replace function get_trending_vendors(result_limit int default 8)
returns setof vendors
language sql stable
as $$
  select * from vendors
  where status = 'approved'
  order by trending_score desc, rating desc
  limit result_limit;
$$;

-- ============================================================
-- RECOMMENDATIONS  (behavioural + location, fallback popular)
-- ============================================================
create or replace function get_recommended_vendors(
  for_user uuid default auth.uid(),
  user_lat double precision default null,
  user_lng double precision default null,
  result_limit int default 6
)
returns setof vendors
language sql stable
as $$
  with prefs as (
    select distinct v.category
    from (
      select vendor_id from recently_viewed where user_id = for_user
      union
      select vendor_id from favorites where user_id = for_user
    ) seen
    join vendors v on v.id = seen.vendor_id
  )
  select v.*
  from vendors v
  where v.status = 'approved'
  order by
    (case when v.category in (select category from prefs) then 1 else 0 end) desc,
    (case
       when user_lat is not null and v.location is not null
       then st_distance(v.location, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography)
       else 999999999
     end) asc,
    v.trending_score desc,
    v.rating desc
  limit result_limit;
$$;

-- ============================================================
-- QUOTE REQUEST  → auto-create conversation + lead + notification
-- Single transactional RPC the client calls.
-- ============================================================
create or replace function create_quote_request(
  p_vendor_id uuid,
  p_service text,
  p_budget text default null,
  p_event_date date default null,
  p_guests int default null,
  p_location text default null,
  p_notes text default null,
  p_contact_name text default null,
  p_contact_phone text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_convo uuid;
  v_quote uuid;
  v_owner uuid;
begin
  -- conversation (one per customer+vendor)
  insert into conversations (customer_id, vendor_id, type)
  values (auth.uid(), p_vendor_id, 'quote')
  on conflict (customer_id, vendor_id)
  do update set type = 'quote', last_activity = now()
  returning id into v_convo;

  -- quote / lead
  insert into quote_requests (
    customer_id, vendor_id, conversation_id, service, budget,
    event_date, guests, location_text, notes, contact_name, contact_phone
  ) values (
    auth.uid(), p_vendor_id, v_convo, p_service, p_budget,
    p_event_date, p_guests, p_location, p_notes, p_contact_name, p_contact_phone
  )
  returning id into v_quote;

  -- system message in the thread
  insert into messages (conversation_id, sender_id, sender_role, type, body, quote_id)
  values (v_convo, auth.uid(), 'customer', 'quote', 'Quote request created', v_quote);

  -- analytics
  insert into analytics_events (event, vendor_id, user_id, metadata)
  values ('quote_request', p_vendor_id, auth.uid(), jsonb_build_object('quote_id', v_quote));

  -- notify vendor owner
  select owner_id into v_owner from vendors where id = p_vendor_id;
  if v_owner is not null then
    insert into notifications (user_id, type, title, body, link)
    values (v_owner, 'quote', 'New quote request',
            coalesce(p_service, 'A customer requested a quote'),
            '/conversations/' || v_convo);
  end if;

  return v_quote;
end;
$$;

-- ============================================================
-- LIGHTWEIGHT ANALYTICS LOGGER (callable from client)
-- ============================================================
create or replace function log_event(
  p_event analytics_event,
  p_vendor_id uuid default null,
  p_metadata jsonb default '{}'
)
returns void
language sql
security definer set search_path = public
as $$
  insert into analytics_events (event, vendor_id, user_id, metadata)
  values (p_event, p_vendor_id, auth.uid(), coalesce(p_metadata, '{}'));
$$;

-- ============================================================
-- VENDOR DASHBOARD METRICS  (real data)
-- ============================================================
create or replace function vendor_dashboard_metrics(p_vendor_id uuid, window_days int default 30)
returns jsonb
language sql stable
as $$
  select jsonb_build_object(
    'profile_views',  (select count(*) from analytics_events where vendor_id = p_vendor_id and event = 'profile_view' and created_at > now() - (window_days||' days')::interval),
    'messages',       (select count(*) from messages m join conversations c on c.id = m.conversation_id where c.vendor_id = p_vendor_id and m.created_at > now() - (window_days||' days')::interval),
    'quote_requests', (select count(*) from quote_requests where vendor_id = p_vendor_id and created_at > now() - (window_days||' days')::interval),
    'bookings',       (select count(*) from bookings where vendor_id = p_vendor_id and created_at > now() - (window_days||' days')::interval),
    'reviews',        (select count(*) from reviews where vendor_id = p_vendor_id),
    'rating',         (select rating from vendors where id = p_vendor_id),
    'saves',          (select count(*) from favorites where vendor_id = p_vendor_id),
    'lead_conversion',(
      select case when q.total = 0 then 0
                  else round((b.total::numeric / q.total) * 100, 1) end
      from (select count(*) total from quote_requests where vendor_id = p_vendor_id) q,
           (select count(*) total from bookings where vendor_id = p_vendor_id) b
    ),
    'response_rate',  (
      select case when c.total = 0 then 0
                  else round((r.replied::numeric / c.total) * 100, 1) end
      from (select count(*) total from conversations where vendor_id = p_vendor_id) c,
           (select count(distinct conversation_id) replied
              from messages m join conversations cv on cv.id = m.conversation_id
              where cv.vendor_id = p_vendor_id and m.sender_role = 'vendor') r
    )
  );
$$;

-- ============================================================
-- ADMIN MODERATION ACTION
-- ============================================================
create or replace function moderate_vendor(
  p_vendor_id uuid,
  p_action text,        -- approve | reject | suspend | verify | feature | delete
  p_notes text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'admin privileges required';
  end if;

  if p_action = 'approve' then
    update vendors set status = 'approved' where id = p_vendor_id;
  elsif p_action = 'reject' then
    update vendors set status = 'rejected' where id = p_vendor_id;
  elsif p_action = 'suspend' then
    update vendors set status = 'suspended' where id = p_vendor_id;
  elsif p_action = 'verify' then
    update vendors set verified = true, verification_status = 'verified',
                       verified_level = 'pro' where id = p_vendor_id;
  elsif p_action = 'feature' then
    update vendors set featured = not featured where id = p_vendor_id;
  elsif p_action = 'delete' then
    delete from vendors where id = p_vendor_id;
  end if;

  insert into moderation_log (admin_id, action, entity_type, entity_id, notes)
  values (auth.uid(), p_action, 'vendor', p_vendor_id, p_notes);
end;
$$;
