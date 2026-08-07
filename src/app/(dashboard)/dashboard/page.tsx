import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerRsvpPage() {
  await requireUser();
  // Oturum tabanlı client: RLS sayesinde yalnızca müşterinin KENDİ
  // davetiyelerine ait RSVP kayıtları döner.
  const supabase = await createClient();
  const { data } = await supabase
    .from("rsvps")
    .select("id, full_name, attending, guest_count, guest_names, note, created_at")
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const attendingCount = rows.filter((r) => r.attending).length;
  const notAttendingCount = rows.length - attendingCount;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">RSVP Kayıtları</h1>

      {/* Özet */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-foreground/10 p-4">
          <div className="text-2xl font-bold text-green-600">{attendingCount}</div>
          <div className="mt-1 text-sm text-foreground/60">✅ Katılıyor</div>
        </div>
        <div className="rounded-xl border border-foreground/10 p-4">
          <div className="text-2xl font-bold text-red-600">{notAttendingCount}</div>
          <div className="mt-1 text-sm text-foreground/60">❌ Katılmıyor</div>
        </div>
      </div>

      {/* Kayıtlar */}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 p-8 text-center text-foreground/50">
          Henüz RSVP kaydı yok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full text-sm">
            <thead className="border-b border-foreground/10 text-left text-foreground/60">
              <tr>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Ad Soyad</th>
                <th className="px-4 py-3 font-medium">Kişi Sayısı</th>
                <th className="px-4 py-3 font-medium">Misafir İsimleri</th>
                <th className="px-4 py-3 font-medium">Not</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-foreground/5">
                  <td className="px-4 py-3">
                    {r.attending ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        ✓ Katılıyor
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        ✗ Katılmıyor
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{r.full_name}</td>
                  <td className="px-4 py-3">{r.attending ? r.guest_count : "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {r.guest_names.length > 0 ? r.guest_names.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{r.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
