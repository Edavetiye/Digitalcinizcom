import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHomePage() {
  await requireAdmin();
  const admin = createAdminClient();

  const [{ count: customerCount }, { count: invitationCount }, { count: rsvpCount }] =
    await Promise.all([
      admin.from("customers").select("*", { count: "exact", head: true }),
      admin.from("invitations").select("*", { count: "exact", head: true }),
      admin.from("rsvps").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Müşteri", value: customerCount ?? 0, href: "/admin/customers" },
    { label: "Davetiye", value: invitationCount ?? 0, href: "/admin/invitations" },
    { label: "RSVP", value: rsvpCount ?? 0, href: "/admin/invitations" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Genel Bakış</h1>
        <Link
          href="/admin/invitations/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          + Yeni Davetiye
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-foreground/10 p-5 transition-colors hover:bg-foreground/5"
          >
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="mt-1 text-sm text-foreground/60">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
