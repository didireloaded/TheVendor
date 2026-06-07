-- ============================================================
-- THE VENDOR — 0003 Messaging, Quotes, Bookings, Favorites
-- ============================================================

-- ============================================================
-- CONVERSATIONS
-- ============================================================
create table if not exists conversations (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references profiles(id) on delete cascade,
  vendor_id     uuid not null references vendors(id) on delete cascade,
  type          conversation_type not null default 'general',
  last_message  text,
  last_activity timestamptz not null default now(),
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (customer_id, vendor_id)
);

create index if not exists idx_conversations_customer on conversations(customer_id, last_activity desc);
create index if not exists idx_conversations_vendor on conversations(vendor_id, last_activity desc);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid references profiles(id) on delete set null,
  sender_role     user_role not null default 'customer',
  type            message_type not null default 'text',
  body            text,
  attachment_url  text,
  quote_id        uuid,           -- FK added after quote_requests exists
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_messages_conversation on messages(conversation_id, created_at);
create index if not exists idx_messages_unread on messages(conversation_id) where is_read = false;

-- Bump conversation.last_* on new message
create or replace function bump_conversation()
returns trigger
language plpgsql
as $$
begin
  update conversations
  set last_message = coalesce(new.body, new.type::text),
      last_activity = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger trg_messages_bump
  after insert on messages
  for each row execute function bump_conversation();

-- ============================================================
-- QUOTE REQUESTS  (a "lead")
-- ============================================================
create table if not exists quote_requests (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references profiles(id) on delete set null,
  vendor_id       uuid not null references vendors(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  service         text not null,
  budget          text,
  event_date      date,
  guests          int,
  location_text   text,
  notes           text,
  contact_name    text,
  contact_phone   text,
  status          quote_status not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_quotes_vendor on quote_requests(vendor_id, created_at desc);
create index if not exists idx_quotes_customer on quote_requests(customer_id, created_at desc);
create index if not exists idx_quotes_status on quote_requests(status);

create trigger trg_quotes_updated
  before update on quote_requests
  for each row execute function set_updated_at();

-- Now wire messages.quote_id -> quote_requests.id
do $$ begin
  alter table messages
    add constraint fk_messages_quote
    foreign key (quote_id) references quote_requests(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ============================================================
-- BOOKINGS  (future-ready)
-- ============================================================
create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references profiles(id) on delete set null,
  vendor_id     uuid not null references vendors(id) on delete cascade,
  quote_id      uuid references quote_requests(id) on delete set null,
  service       text not null,
  amount        numeric,
  scheduled_for timestamptz,
  status        booking_status not null default 'requested',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_bookings_vendor on bookings(vendor_id, created_at desc);
create index if not exists idx_bookings_customer on bookings(customer_id, created_at desc);

create trigger trg_bookings_updated
  before update on bookings
  for each row execute function set_updated_at();

-- ============================================================
-- FAVORITES / SAVED VENDORS  +  COLLECTIONS
-- ============================================================
create table if not exists collections (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_collections_owner on collections(owner_id);

create table if not exists favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  vendor_id     uuid not null references vendors(id) on delete cascade,
  collection_id uuid references collections(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (user_id, vendor_id)
);

create index if not exists idx_favorites_user on favorites(user_id);
create index if not exists idx_favorites_vendor on favorites(vendor_id);

-- ============================================================
-- RECENTLY VIEWED
-- ============================================================
create table if not exists recently_viewed (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  vendor_id   uuid not null references vendors(id) on delete cascade,
  viewed_at   timestamptz not null default now(),
  unique (user_id, vendor_id)
);

create index if not exists idx_recently_viewed_user on recently_viewed(user_id, viewed_at desc);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,        -- message | quote | review | promo | verified | system
  title       text not null,
  body        text,
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id) where is_read = false;
