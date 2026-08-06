-- ============================================================================
-- Modül 2 — Row Level Security (RLS) Politikaları
-- ============================================================================
-- Kurallar:
--   * Müşteri (authenticated) yalnızca KENDİ kayıtlarını görebilir/düzenleyebilir.
--   * Embed sayfası (anon) yayınlanmış davetiyeleri okuyabilir ve RSVP ekleyebilir.
--   * Update/Delete yalnızca giriş yapmış sahibi müşteri tarafından yapılabilir.
--   * Admin işlemleri SERVICE ROLE anahtarı ile yapılır ve RLS'yi baypas eder.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Yardımcı: Giriş yapan kullanıcının customer.id'sini döndürür.
-- security definer -> customers tablosuna RLS'e takılmadan erişir.
-- ---------------------------------------------------------------------------
create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.customers where auth_user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- RLS'i tüm tablolarda etkinleştir
-- ---------------------------------------------------------------------------
alter table public.customers   enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvps       enable row level security;
alter table public.events      enable row level security;
alter table public.links       enable row level security;

-- ===========================================================================
-- customers
-- ===========================================================================
-- Müşteri yalnızca kendi profilini görebilir.
create policy "customers_select_own"
  on public.customers for select
  to authenticated
  using (auth_user_id = auth.uid());

-- ===========================================================================
-- invitations
-- ===========================================================================
-- Herkes (anon + authenticated) yayınlanmış davetiyeleri görebilir (embed için).
create policy "invitations_select_published"
  on public.invitations for select
  to anon, authenticated
  using (status = 'published');

-- Müşteri kendi davetiyelerini (taslak dahil) görebilir.
create policy "invitations_select_own"
  on public.invitations for select
  to authenticated
  using (customer_id = public.current_customer_id());

-- Müşteri kendi davetiyelerini oluşturabilir.
create policy "invitations_insert_own"
  on public.invitations for insert
  to authenticated
  with check (customer_id = public.current_customer_id());

-- Müşteri yalnızca kendi davetiyelerini güncelleyebilir.
create policy "invitations_update_own"
  on public.invitations for update
  to authenticated
  using (customer_id = public.current_customer_id())
  with check (customer_id = public.current_customer_id());

-- Müşteri yalnızca kendi davetiyelerini silebilir.
create policy "invitations_delete_own"
  on public.invitations for delete
  to authenticated
  using (customer_id = public.current_customer_id());

-- ===========================================================================
-- rsvps
-- ===========================================================================
-- Embed sayfasından anonim RSVP eklenebilir (yalnızca yayınlanmış & RSVP açık davetiyelere).
create policy "rsvps_insert_public"
  on public.rsvps for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.status = 'published'
        and i.rsvp_enabled = true
    )
  );

-- Müşteri yalnızca kendi davetiyelerine gelen RSVP'leri görebilir.
create policy "rsvps_select_own"
  on public.rsvps for select
  to authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.customer_id = public.current_customer_id()
    )
  );

-- Müşteri yalnızca kendi davetiyelerine gelen RSVP'leri silebilir.
create policy "rsvps_delete_own"
  on public.rsvps for delete
  to authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.customer_id = public.current_customer_id()
    )
  );

-- ===========================================================================
-- events
-- ===========================================================================
-- Yayınlanmış davetiyelerin etkinlikleri herkese açık okunur (embed için).
create policy "events_select_published"
  on public.events for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.status = 'published'
    )
  );

-- Müşteri kendi davetiyelerinin etkinliklerini tam yönetir.
create policy "events_manage_own"
  on public.events for all
  to authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.customer_id = public.current_customer_id()
    )
  )
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.customer_id = public.current_customer_id()
    )
  );

-- ===========================================================================
-- links
-- ===========================================================================
-- Yayınlanmış davetiyelerin linkleri herkese açık okunur (embed için).
create policy "links_select_published"
  on public.links for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.status = 'published'
    )
  );

-- Müşteri kendi davetiyelerinin linklerini tam yönetir.
create policy "links_manage_own"
  on public.links for all
  to authenticated
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.customer_id = public.current_customer_id()
    )
  )
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.customer_id = public.current_customer_id()
    )
  );
