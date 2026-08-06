# Dijital Davetiye SaaS

Canva'da hazırlanan davetiyelere gömülebilen (Embed) profesyonel RSVP sistemi.

## Teknolojiler

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Veritabanı + Auth + Row Level Security)
- **Resend** (E-posta gönderimi)
- **Vercel** (Yayın)

## Sistem Özeti

| Rol | Yetkiler |
| --- | --- |
| **Admin** | Müşteri oluştur / düzenle / sil, davetiye oluştur |
| **Müşteri** | Yalnızca kendi davetiyelerini ve RSVP kayıtlarını görür, Excel/CSV indirir |
| **Davetli** | `/embed/{slug}` üzerinden Katılıyorum / Katılmıyorum yanıtı verir |

## Klasör Yapısı

```
digital-invitation-saas/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Kök layout
│   │   ├── page.tsx                # Ana sayfa
│   │   ├── globals.css             # Global stiller (Tailwind)
│   │   │
│   │   ├── (auth)/                 # Kimlik doğrulama rotaları
│   │   │   └── login/              # Giriş sayfası
│   │   │
│   │   ├── (admin)/                # Admin paneli (korumalı)
│   │   │   └── admin/
│   │   │       ├── customers/      # Müşteri yönetimi
│   │   │       └── invitations/    # Davetiye yönetimi
│   │   │
│   │   ├── (dashboard)/            # Müşteri paneli (korumalı)
│   │   │   └── dashboard/          # RSVP kayıtları görünümü
│   │   │
│   │   ├── embed/
│   │   │   └── [slug]/             # Canva'ya gömülecek RSVP sayfası
│   │   │
│   │   └── api/
│   │       ├── rsvp/               # RSVP gönderim endpoint'i
│   │       └── export/             # Excel / CSV dışa aktarma
│   │
│   ├── components/
│   │   ├── ui/                     # Yeniden kullanılabilir UI bileşenleri
│   │   ├── admin/                  # Admin paneline özel bileşenler
│   │   ├── dashboard/              # Müşteri paneline özel bileşenler
│   │   └── embed/                  # RSVP embed bileşenleri
│   │
│   ├── lib/
│   │   ├── supabase/               # Supabase client (browser/server/admin)
│   │   ├── email/                  # Resend e-posta gönderimi
│   │   ├── validations/            # Zod şemaları
│   │   └── utils/                  # Yardımcı fonksiyonlar (slug, tarih, vb.)
│   │
│   └── types/                      # TypeScript tipleri (DB tipleri dahil)
│
├── supabase/
│   └── migrations/                 # SQL şema ve RLS politikaları
│
├── .env.example                    # Ortam değişkenleri şablonu
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Kurulum (modüller tamamlandıktan sonra)

```bash
npm install
cp .env.example .env.local   # değerleri doldur
npm run dev
```

## Geliştirme Planı (modül modül)

1. ✅ **Klasör yapısı** — proje iskeleti ve dizin ağacı
2. ✅ **Supabase şeması** — tablolar (customers, invitations, rsvps, events, links) + RLS
3. ✅ **Authentication** — Supabase Auth (minimal), giriş, middleware koruması
4. ✅ **Admin Paneli** — müşteri CRUD + davetiye editörü + canlı önizleme
5. ✅ **RSVP** — `/embed/[slug]` sayfası, popup form, Resend e-posta bildirimi
6. ⬜ **Müşteri Paneli** — RSVP listesi, Excel/CSV indirme

> Her modül tamamlandığında durulur ve onay beklenir.
