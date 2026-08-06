/**
 * Bir e-postanın admin olup olmadığını belirler.
 * Admin e-postaları ADMIN_EMAILS ortam değişkeninde virgülle ayrılır.
 * (Minimal auth: rol tablosu yerine env tabanlı admin listesi kullanılır.)
 */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}
