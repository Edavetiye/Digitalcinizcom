-- ============================================================================
-- Modül 2 — Supabase Şeması (Tablolar, İndeksler, Trigger'lar)
-- ============================================================================
-- Tablolar:
--   customers    : Admin tarafından yönetilen müşteriler
--   invitations  : Her müşteriye ait dijital davetiyeler
--   rsvps        : Davetlilerin katılım yanıtları
--   events       : Bir davetiyeye ait alt etkinlikler (Nikah, Kokteyl, Yemek)
--   links        : Davetiyeye ait dinamik butonlar (Instagram, WhatsApp, vb.)
-- ============================================================================

-- gen_random_uuid() için gereklidir (Supabase'de genelde hazır gelir).
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Ortak: updated_at alanını otomatik güncelleyen trigger fonksiyonu
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  phone         text,
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  plan          text not null default 'free' check (plan in ('free', 'pro')),
  created_at    timestamptz not null default now()
);

create index if not exists idx_customers_auth_user_id on public.customers (auth_user_id);

-- ---------------------------------------------------------------------------
-- invitations
-- ---------------------------------------------------------------------------
create table if not exists public.invitations (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  customer_id        uuid not null references public.customers (id) on delete cascade,
  bride_name         text,
  groom_name         text,
  event_date         date,
  event_time         time,
  location_name      text,
  location_address   text,
  location_map_url   text,
  cover_image_url    text,
  gallery            jsonb not null default '[]'::jsonb,
  music_url          text,
  theme              text not null default 'classic',
  welcome_text       text,
  story              text,
  dress_code         text,
  countdown_enabled  boolean not null default true,
  rsvp_enabled       boolean not null default true,
  status             text not null default 'draft' check (status in ('draft', 'published')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_invitations_customer_id on public.invitations (customer_id);
create index if not exists idx_invitations_slug on public.invitations (slug);
create index if not exists idx_invitations_status on public.invitations (status);

create trigger trg_invitations_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- rsvps
-- ---------------------------------------------------------------------------
create table if not exists public.rsvps (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  full_name      text not null,
  phone          text,
  guest_count    integer not null default 1 check (guest_count >= 1),
  attending      boolean not null,
  note           text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_rsvps_invitation_id on public.rsvps (invitation_id);

-- ---------------------------------------------------------------------------
-- events (Nikah, Kokteyl, Yemek gibi alt etkinlikler)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  title          text not null,
  start_time     timestamptz,
  description    text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_events_invitation_id on public.events (invitation_id);

-- ---------------------------------------------------------------------------
-- links (dinamik butonlar: Instagram, website, WhatsApp, gallery, maps)
-- ---------------------------------------------------------------------------
create table if not exists public.links (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  type           text not null check (type in ('instagram', 'website', 'whatsapp', 'gallery', 'maps')),
  title          text,
  url            text not null,
  created_at     timestamptz not null default now()
);

create index if not exists idx_links_invitation_id on public.links (invitation_id);
