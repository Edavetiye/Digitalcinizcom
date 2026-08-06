-- ============================================================================
-- Modül 2 (ek) — RSVP: katılan kişi isimleri
-- ============================================================================
-- "Katılıyorum" seçilip kişi sayısı 1'den fazla olduğunda, davetlinin yanında
-- gelen kişilerin isimleri saklanır. jsonb text dizisi olarak tutulur.
-- Tam katılımcı listesi: [full_name, ...guest_names]
-- ============================================================================

alter table public.rsvps
  add column if not exists guest_names jsonb not null default '[]'::jsonb;
