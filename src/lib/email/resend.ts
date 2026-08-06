import { Resend } from "resend";
import { formatDateTimeTR } from "@/lib/utils/date";

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@alanadim.com";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface RsvpNotification {
  to: string; // müşterinin e-postası
  coupleTitle: string; // "Ayşe & Mehmet"
  attending: boolean;
  fullName: string;
  guestCount: number;
  guestNames: string[];
  note: string | null;
  createdAt: string;
}

/**
 * Yeni bir RSVP kaydı için müşteriye bilgilendirme e-postası gönderir.
 * Gönderen her zaman RESEND_FROM_EMAIL (noreply@alanadim.com).
 * RESEND_API_KEY tanımlı değilse sessizce atlanır (kayıt yine de tutulur).
 */
export async function sendRsvpNotification(
  data: RsvpNotification,
): Promise<{ sent: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    return { sent: false, error: "RESEND_API_KEY tanımlı değil." };
  }

  const status = data.attending
    ? "✅ Katılıyor"
    : "❌ Katılmıyor";
  const guestsBlock =
    data.attending && data.guestNames.length > 0
      ? `<p><strong>Beraber gelenler:</strong> ${data.guestNames
          .map((n) => escapeHtml(n))
          .join(", ")}</p>`
      : "";
  const noteBlock = data.note
    ? `<p><strong>Not:</strong> ${escapeHtml(data.note)}</p>`
    : "";

  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
    <h2 style="margin:0 0 4px">Yeni RSVP Yanıtı</h2>
    <p style="color:#666;margin:0 0 16px">${escapeHtml(data.coupleTitle)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 0;color:#666">Durum</td><td style="padding:6px 0"><strong>${status}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#666">Ad Soyad</td><td style="padding:6px 0">${escapeHtml(data.fullName)}</td></tr>
      ${data.attending ? `<tr><td style="padding:6px 0;color:#666">Kişi Sayısı</td><td style="padding:6px 0">${data.guestCount}</td></tr>` : ""}
      <tr><td style="padding:6px 0;color:#666">Tarih</td><td style="padding:6px 0">${formatDateTimeTR(data.createdAt)}</td></tr>
    </table>
    ${guestsBlock}
    ${noteBlock}
  </div>`;

  try {
    const { error } = await client.emails.send({
      from: FROM,
      to: data.to,
      subject: `Yeni RSVP: ${data.fullName} — ${status}`,
      html,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : "Bilinmeyen hata" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
