"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select, Textarea, Toggle } from "@/components/ui/form";
import InvitationPreview from "@/components/invitation/InvitationPreview";
import { THEME_OPTIONS } from "@/lib/themes";
import { slugify } from "@/lib/utils/slug";
import { saveInvitation, deleteInvitation } from "./actions";
import type { InvitationInput, LinkInput } from "@/lib/validations/invitation";
import type { GalleryItem, LinkType } from "@/types/database";

interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

type EventRow = { title: string; start_time: string; description: string };

export type EditorInitial = Partial<InvitationInput> & {
  gallery?: GalleryItem[];
};

const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "website", label: "Web Sitesi" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "gallery", label: "Galeri" },
  { value: "maps", label: "Konum" },
];

export default function InvitationEditor({
  customers,
  initial,
  appUrl,
}: {
  customers: CustomerOption[];
  initial: EditorInitial;
  appUrl: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [id] = useState(initial.id);
  const [customerId, setCustomerId] = useState(initial.customer_id ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [brideName, setBrideName] = useState(initial.bride_name ?? "");
  const [groomName, setGroomName] = useState(initial.groom_name ?? "");
  const [eventDate, setEventDate] = useState(initial.event_date ?? "");
  const [eventTime, setEventTime] = useState(initial.event_time?.slice(0, 5) ?? "");
  const [locationName, setLocationName] = useState(initial.location_name ?? "");
  const [locationAddress, setLocationAddress] = useState(initial.location_address ?? "");
  const [locationMapUrl, setLocationMapUrl] = useState(initial.location_map_url ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial.cover_image_url ?? "");
  const [musicUrl, setMusicUrl] = useState(initial.music_url ?? "");
  const [theme, setTheme] = useState(initial.theme ?? "classic");
  const [welcomeText, setWelcomeText] = useState(initial.welcome_text ?? "");
  const [story, setStory] = useState(initial.story ?? "");
  const [dressCode, setDressCode] = useState(initial.dress_code ?? "");
  const [countdownEnabled, setCountdownEnabled] = useState(initial.countdown_enabled ?? true);
  const [rsvpEnabled, setRsvpEnabled] = useState(initial.rsvp_enabled ?? true);
  const [status, setStatus] = useState<"draft" | "published">(initial.status ?? "draft");
  const [gallery, setGallery] = useState<GalleryItem[]>(initial.gallery ?? []);
  const [events, setEvents] = useState<EventRow[]>(
    (initial.events ?? []).map((e) => ({
      title: e.title,
      start_time: e.start_time ?? "",
      description: e.description ?? "",
    })),
  );
  const [links, setLinks] = useState<LinkInput[]>(
    (initial.links ?? []).map((l) => ({
      type: l.type,
      title: l.title ?? "",
      url: l.url,
    })),
  );

  // Yeni davetiyede slug'ı isimlerden otomatik üret (kullanıcı elle değiştirmediyse).
  function onNamesChange(bride: string, groom: string) {
    if (!slugTouched) {
      const auto = slugify([bride, groom].filter(Boolean).join("-"));
      setSlug(auto);
    }
  }

  const previewData = useMemo(
    () => ({
      bride_name: brideName,
      groom_name: groomName,
      event_date: eventDate,
      event_time: eventTime,
      location_name: locationName,
      location_address: locationAddress,
      location_map_url: locationMapUrl,
      cover_image_url: coverImageUrl,
      gallery,
      theme,
      welcome_text: welcomeText,
      story,
      dress_code: dressCode,
      countdown_enabled: countdownEnabled,
      rsvp_enabled: rsvpEnabled,
    }),
    [brideName, groomName, eventDate, eventTime, locationName, locationAddress,
     locationMapUrl, coverImageUrl, gallery, theme, welcomeText, story,
     dressCode, countdownEnabled, rsvpEnabled],
  );

  function handleSave() {
    setMessage(null);
    setError(null);
    const payload: InvitationInput = {
      id,
      customer_id: customerId,
      slug,
      bride_name: brideName || null,
      groom_name: groomName || null,
      event_date: eventDate || null,
      event_time: eventTime || null,
      location_name: locationName || null,
      location_address: locationAddress || null,
      location_map_url: locationMapUrl || null,
      cover_image_url: coverImageUrl || null,
      gallery,
      music_url: musicUrl || null,
      theme,
      welcome_text: welcomeText || null,
      story: story || null,
      dress_code: dressCode || null,
      countdown_enabled: countdownEnabled,
      rsvp_enabled: rsvpEnabled,
      status,
      events: events
        .filter((e) => e.title.trim())
        .map((e) => ({
          title: e.title,
          start_time: e.start_time || null,
          description: e.description || null,
        })),
      links: links.filter((l) => l.url.trim()),
    };

    startTransition(async () => {
      const res = await saveInvitation(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage("Kaydedildi.");
      if (!id) {
        router.push(`/admin/invitations/${res.id}`);
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!id) return;
    if (!confirm("Bu davetiyeyi silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteInvitation(id);
      router.push("/admin/invitations");
    });
  }

  const embedUrl = slug ? `${appUrl}/embed/${slug}` : "";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* SOL: Form */}
      <div className="space-y-6">
        <div className="space-y-4 rounded-xl border border-foreground/10 p-5">
          <h2 className="font-semibold">Temel Bilgiler</h2>
          <Field label="Müşteri">
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Müşteri seçin…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gelin Adı">
              <Input
                value={brideName}
                onChange={(e) => {
                  setBrideName(e.target.value);
                  onNamesChange(e.target.value, groomName);
                }}
              />
            </Field>
            <Field label="Damat Adı">
              <Input
                value={groomName}
                onChange={(e) => {
                  setGroomName(e.target.value);
                  onNamesChange(brideName, e.target.value);
                }}
              />
            </Field>
          </div>
          <Field label="Slug" hint={embedUrl ? `Embed: ${embedUrl}` : "URL adresi"}>
            <Input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Etkinlik Tarihi">
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </Field>
            <Field label="Etkinlik Saati">
              <Input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Tema">
            <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {THEME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-foreground/10 p-5">
          <h2 className="font-semibold">İçerik</h2>
          <Field label="Karşılama Metni" hint="Örn: Düğünümüze davetlisiniz">
            <Input
              value={welcomeText}
              onChange={(e) => setWelcomeText(e.target.value)}
            />
          </Field>
          <Field label="Hikaye / Açıklama">
            <Textarea value={story} onChange={(e) => setStory(e.target.value)} />
          </Field>
          <Field label="Kıyafet Kuralı (Dress Code)">
            <Input
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
            />
          </Field>
          <Field label="Kapak Görseli URL">
            <Input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Müzik URL (opsiyonel)">
            <Input
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-foreground/10 p-5">
          <h2 className="font-semibold">Konum</h2>
          <Field label="Mekan Adı">
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </Field>
          <Field label="Adres">
            <Textarea
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
            />
          </Field>
          <Field label="Harita Bağlantısı (Google Maps URL)">
            <Input
              value={locationMapUrl}
              onChange={(e) => setLocationMapUrl(e.target.value)}
              placeholder="https://maps.google.com/…"
            />
          </Field>
        </div>

        {/* Galeri */}
        <div className="space-y-3 rounded-xl border border-foreground/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Galeri</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setGallery([...gallery, { url: "" }])}
            >
              + Görsel
            </Button>
          </div>
          {gallery.map((g, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={g.url}
                placeholder="https://… görsel URL"
                onChange={(e) => {
                  const next = [...gallery];
                  next[i] = { ...next[i], url: e.target.value };
                  setGallery(next);
                }}
              />
              <Button
                type="button"
                variant="danger"
                onClick={() => setGallery(gallery.filter((_, j) => j !== i))}
              >
                Sil
              </Button>
            </div>
          ))}
        </div>

        {/* Program (events) */}
        <div className="space-y-3 rounded-xl border border-foreground/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Program (Nikah, Kokteyl, Yemek…)</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setEvents([...events, { title: "", start_time: "", description: "" }])
              }
            >
              + Etkinlik
            </Button>
          </div>
          {events.map((ev, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-foreground/10 p-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Başlık (Nikah)"
                  value={ev.title}
                  onChange={(e) => {
                    const next = [...events];
                    next[i] = { ...next[i], title: e.target.value };
                    setEvents(next);
                  }}
                />
                <Input
                  type="datetime-local"
                  value={ev.start_time}
                  onChange={(e) => {
                    const next = [...events];
                    next[i] = { ...next[i], start_time: e.target.value };
                    setEvents(next);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Açıklama (opsiyonel)"
                  value={ev.description}
                  onChange={(e) => {
                    const next = [...events];
                    next[i] = { ...next[i], description: e.target.value };
                    setEvents(next);
                  }}
                />
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => setEvents(events.filter((_, j) => j !== i))}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Linkler */}
        <div className="space-y-3 rounded-xl border border-foreground/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Butonlar / Linkler</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setLinks([...links, { type: "instagram", title: "", url: "" }])
              }
            >
              + Link
            </Button>
          </div>
          {links.map((l, i) => (
            <div key={i} className="grid grid-cols-[120px_1fr_1fr_auto] gap-2">
              <Select
                value={l.type}
                onChange={(e) => {
                  const next = [...links];
                  next[i] = { ...next[i], type: e.target.value as LinkType };
                  setLinks(next);
                }}
              >
                {LINK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Başlık"
                value={l.title ?? ""}
                onChange={(e) => {
                  const next = [...links];
                  next[i] = { ...next[i], title: e.target.value };
                  setLinks(next);
                }}
              />
              <Input
                placeholder="https://…"
                value={l.url}
                onChange={(e) => {
                  const next = [...links];
                  next[i] = { ...next[i], url: e.target.value };
                  setLinks(next);
                }}
              />
              <Button
                type="button"
                variant="danger"
                onClick={() => setLinks(links.filter((_, j) => j !== i))}
              >
                Sil
              </Button>
            </div>
          ))}
        </div>

        {/* Ayarlar */}
        <div className="space-y-4 rounded-xl border border-foreground/10 p-5">
          <h2 className="font-semibold">Ayarlar</h2>
          <Toggle
            checked={countdownEnabled}
            onChange={setCountdownEnabled}
            label="Geri sayım göster"
          />
          <Toggle
            checked={rsvpEnabled}
            onChange={setRsvpEnabled}
            label="RSVP (katılım) aktif"
          />
          <Field label="Durum">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            >
              <option value="draft">Taslak</option>
              <option value="published">Yayında</option>
            </Select>
          </Field>
        </div>
      </div>

      {/* SAĞ: Canlı Önizleme */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground/60">
            Canlı Önizleme
          </span>
          <div className="flex items-center gap-2">
            {error && <span className="text-sm text-red-600">{error}</span>}
            {message && <span className="text-sm text-green-600">{message}</span>}
            {id && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={pending}>
                Sil
              </Button>
            )}
            <Button type="button" onClick={handleSave} disabled={pending}>
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
        </div>
        <div className="rounded-2xl bg-foreground/[0.03] p-4">
          <InvitationPreview
            data={previewData}
            events={events
              .filter((e) => e.title.trim())
              .map((e) => ({
                title: e.title,
                start_time: e.start_time || null,
                description: e.description || null,
              }))}
            links={links.filter((l) => l.url.trim())}
          />
        </div>
        {status === "published" && embedUrl && (
          <p className="mt-3 break-all text-center text-xs text-foreground/50">
            Canva embed adresi: {embedUrl}
          </p>
        )}
      </div>
    </div>
  );
}
