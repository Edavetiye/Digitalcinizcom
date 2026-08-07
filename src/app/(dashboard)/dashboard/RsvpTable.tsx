"use client";

import { useMemo, useState } from "react";
import { formatDateTimeTR } from "@/lib/utils/date";

export interface DashboardRsvp {
  id: string;
  invitationId: string;
  couple: string;
  attending: boolean;
  fullName: string;
  guestCount: number;
  guestNames: string[];
  note: string | null;
  createdAt: string;
}

export default function RsvpTable({
  rows,
  invitations,
}: {
  rows: DashboardRsvp[];
  invitations: { id: string; label: string }[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.invitationId === filter)),
    [rows, filter],
  );

  const stats = useMemo(() => {
    const yes = visible.filter((r) => r.attending);
    const no = visible.filter((r) => !r.attending);
    const guests = yes.reduce((sum, r) => sum + r.guestCount, 0);
    return { yes: yes.length, no: no.length, guests };
  }, [visible]);

  const exportQuery =
    filter === "all" ? "" : `&invitation=${encodeURIComponent(filter)}`;

  return (
    <div className="space-y-4">
      {/* Özet */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="✅ Katılıyor" value={stats.yes} />
        <StatCard label="❌ Katılmıyor" value={stats.no} />
        <StatCard label="👥 Toplam Kişi" value={stats.guests} />
      </div>

      {/* Araç çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {invitations.length > 1 ? (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
          >
            <option value="all">Tüm davetiyeler</option>
            {invitations.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
        ) : (
          <span />
        )}

        <div className="flex gap-2">
          <a
            href={`/api/export?format=csv${exportQuery}`}
            className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
          >
            CSV indir
          </a>
          <a
            href={`/api/export?format=xlsx${exportQuery}`}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Excel indir
          </a>
        </div>
      </div>

      {/* Tablo */}
      {visible.length === 0 ? (
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
                <th className="px-4 py-3 font-medium">Kişi</th>
                <th className="px-4 py-3 font-medium">Beraber Gelenler</th>
                <th className="px-4 py-3 font-medium">Not</th>
                <th className="px-4 py-3 font-medium">Davetiye</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
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
                  <td className="px-4 py-3 font-medium">{r.fullName}</td>
                  <td className="px-4 py-3">{r.attending ? r.guestCount : "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {r.guestNames.length > 0 ? r.guestNames.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{r.note ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">{r.couple}</td>
                  <td className="px-4 py-3 text-foreground/60">
                    {formatDateTimeTR(r.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-foreground/10 p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-foreground/60">{label}</div>
    </div>
  );
}
