"use client";

import { useEffect, useState } from "react";
import { getTheme } from "@/lib/themes";
import { combineDateTime, formatDateTR, formatTimeTR } from "@/lib/utils/date";
import type { GalleryItem, LinkType } from "@/types/database";

export interface PreviewEvent {
  title: string;
  start_time?: string | null;
  description?: string | null;
}

export interface PreviewLink {
  type: LinkType;
  title?: string | null;
  url: string;
}

export interface InvitationPreviewData {
  bride_name?: string | null;
  groom_name?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  location_map_url?: string | null;
  cover_image_url?: string | null;
  gallery?: GalleryItem[];
  theme?: string | null;
  welcome_text?: string | null;
  story?: string | null;
  dress_code?: string | null;
  countdown_enabled?: boolean;
  rsvp_enabled?: boolean;
}

const LINK_LABELS: Record<LinkType, string> = {
  instagram: "Instagram",
  website: "Web Sitesi",
  whatsapp: "WhatsApp",
  gallery: "Galeri",
  maps: "Konum",
};

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;
  const diff = target.getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function InvitationPreview({
  data,
  events = [],
  links = [],
  interactive = false,
}: {
  data: InvitationPreviewData;
  events?: PreviewEvent[];
  links?: PreviewLink[];
  /** true ise RSVP butonları görünür (embed); false ise yalnızca örnek gösterim. */
  interactive?: boolean;
}) {
  const theme = getTheme(data.theme);
  const target =
    data.countdown_enabled !== false
      ? combineDateTime(data.event_date, data.event_time)
      : null;
  const countdown = useCountdown(target);

  const couple =
    [data.bride_name, data.groom_name].filter(Boolean).join(" & ") ||
    "Gelin & Damat";

  return (
    <div
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl shadow-sm"
      style={{ background: theme.panel, color: theme.text }}
    >
      {/* Kapak */}
      <div
        className="relative flex h-56 items-end justify-center"
        style={{
          background: data.cover_image_url
            ? `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${data.cover_image_url}) center/cover`
            : `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}55)`,
        }}
      >
        <div className="w-full px-6 pb-6 text-center">
          {data.welcome_text && (
            <p
              className="mb-2 text-xs uppercase tracking-[0.2em]"
              style={{ color: data.cover_image_url ? "#fff" : theme.muted }}
            >
              {data.welcome_text}
            </p>
          )}
          <h1
            className="text-3xl font-semibold leading-tight"
            style={{
              fontFamily: theme.heading,
              color: data.cover_image_url ? "#fff" : theme.text,
            }}
          >
            {couple}
          </h1>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 text-center">
        {/* Tarih & saat */}
        {(data.event_date || data.event_time) && (
          <div>
            <p className="text-base font-medium">
              {formatDateTR(data.event_date)}
            </p>
            {data.event_time && (
              <p className="text-sm" style={{ color: theme.muted }}>
                {formatTimeTR(data.event_time)}
              </p>
            )}
          </div>
        )}

        {/* Geri sayım */}
        {countdown && (
          <div className="flex justify-center gap-3">
            {[
              { v: countdown.days, l: "Gün" },
              { v: countdown.hours, l: "Saat" },
              { v: countdown.minutes, l: "Dk" },
              { v: countdown.seconds, l: "Sn" },
            ].map((u) => (
              <div
                key={u.l}
                className="min-w-[52px] rounded-lg px-2 py-2"
                style={{ background: `${theme.accent}18` }}
              >
                <div
                  className="text-xl font-bold tabular-nums"
                  style={{ color: theme.accent }}
                >
                  {String(u.v).padStart(2, "0")}
                </div>
                <div className="text-[10px]" style={{ color: theme.muted }}>
                  {u.l}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hikaye */}
        {data.story && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: theme.muted }}
          >
            {data.story}
          </p>
        )}

        {/* Program (events) */}
        {events.length > 0 && (
          <div className="space-y-3 text-left">
            <h2
              className="text-center text-sm font-semibold uppercase tracking-wider"
              style={{ color: theme.accent }}
            >
              Program
            </h2>
            {events.map((e, i) => (
              <div
                key={i}
                className="rounded-lg border px-4 py-3"
                style={{ borderColor: `${theme.accent}33` }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{e.title}</span>
                  {e.start_time && (
                    <span className="text-xs" style={{ color: theme.muted }}>
                      {new Date(e.start_time).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                {e.description && (
                  <p className="mt-1 text-xs" style={{ color: theme.muted }}>
                    {e.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Konum */}
        {(data.location_name || data.location_address) && (
          <div>
            <h2
              className="mb-1 text-sm font-semibold uppercase tracking-wider"
              style={{ color: theme.accent }}
            >
              Konum
            </h2>
            {data.location_name && (
              <p className="font-medium">{data.location_name}</p>
            )}
            {data.location_address && (
              <p className="text-sm" style={{ color: theme.muted }}>
                {data.location_address}
              </p>
            )}
            {data.location_map_url && (
              <a
                href={data.location_map_url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm underline"
                style={{ color: theme.accent }}
              >
                Haritada Aç
              </a>
            )}
          </div>
        )}

        {/* Kıyafet */}
        {data.dress_code && (
          <div>
            <h2
              className="mb-1 text-sm font-semibold uppercase tracking-wider"
              style={{ color: theme.accent }}
            >
              Kıyafet
            </h2>
            <p className="text-sm" style={{ color: theme.muted }}>
              {data.dress_code}
            </p>
          </div>
        )}

        {/* Galeri */}
        {data.gallery && data.gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {data.gallery.slice(0, 6).map((g, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={g.url}
                alt={g.alt ?? ""}
                className="h-20 w-full rounded-md object-cover"
              />
            ))}
          </div>
        )}

        {/* Linkler */}
        {links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {links.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border px-4 py-1.5 text-sm"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                {l.title || LINK_LABELS[l.type]}
              </a>
            ))}
          </div>
        )}

        {/* RSVP */}
        {data.rsvp_enabled !== false && (
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Katılım Durumu</p>
            <div className="flex justify-center gap-3">
              <span
                className="rounded-lg px-5 py-2 text-sm font-medium"
                style={{ background: theme.accent, color: theme.accentText }}
              >
                ✅ Katılıyorum
              </span>
              <span
                className="rounded-lg border px-5 py-2 text-sm font-medium"
                style={{ borderColor: theme.accent, color: theme.accent }}
              >
                ❌ Katılmıyorum
              </span>
            </div>
            {!interactive && (
              <p className="text-[11px]" style={{ color: theme.muted }}>
                (Önizleme — butonlar yayınlanan sayfada çalışır)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
