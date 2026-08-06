/**
 * Tarih/saat yardımcıları. event_date "YYYY-MM-DD", event_time "HH:mm[:ss]".
 */

/** event_date + event_time alanlarını tek bir Date'e birleştirir. */
export function combineDateTime(
  date?: string | null,
  time?: string | null,
): Date | null {
  if (!date) return null;
  const t = time && time.length >= 5 ? time.slice(0, 5) : "00:00";
  const d = new Date(`${date}T${t}:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** Tarihi Türkçe uzun formatta yazar: "12 Haziran 2026 Cuma". */
export function formatDateTR(date?: string | null): string {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(d);
}

/** Saati "19:30" formatında yazar. */
export function formatTimeTR(time?: string | null): string {
  if (!time) return "";
  return time.slice(0, 5);
}

/** Tarih + saati birlikte yazar (RSVP listesi vb. için). */
export function formatDateTimeTR(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
