import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTR } from "@/lib/utils/date";
import { deleteInvitation } from "./actions";

export default async function InvitationsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: invitations } = await admin
    .from("invitations")
    .select("id, slug, bride_name, groom_name, event_date, status, customer_id")
    .order("created_at", { ascending: false });

  const { data: customers } = await admin.from("customers").select("id, name");
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Davetiyeler</h1>
        <Link
          href="/admin/invitations/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          + Yeni Davetiye
        </Link>
      </div>

      {!invitations || invitations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 p-8 text-center text-foreground/50">
          Henüz davetiye yok. &quot;Yeni Davetiye&quot; ile başlayın.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-foreground/10">
          <table className="w-full text-sm">
            <thead className="border-b border-foreground/10 text-left text-foreground/60">
              <tr>
                <th className="px-4 py-3 font-medium">Çift</th>
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id} className="border-b border-foreground/5">
                  <td className="px-4 py-3 font-medium">
                    {[inv.bride_name, inv.groom_name].filter(Boolean).join(" & ") ||
                      "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {customerMap.get(inv.customer_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {formatDateTR(inv.event_date) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        inv.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-foreground/10 text-foreground/60"
                      }`}
                    >
                      {inv.status === "published" ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground/50">
                    {inv.slug}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/invitations/${inv.id}`}
                        className="text-foreground/70 hover:text-foreground"
                      >
                        Düzenle
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteInvitation(inv.id);
                        }}
                      >
                        <button className="text-red-600 hover:text-red-700">
                          Sil
                        </button>
                      </form>
                    </div>
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
