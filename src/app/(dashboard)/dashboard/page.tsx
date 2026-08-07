import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import RsvpTable, { type DashboardRsvp } from "./RsvpTable";

export default async function DashboardPage() {
  await requireUser();
  // Oturum tabanlı client: RLS sayesinde yalnızca kendi kayıtları döner.
  const supabase = await createClient();

  const [{ data: rsvps }, { data: invitations }] = await Promise.all([
    supabase
      .from("rsvps")
      .select(
        "id, invitation_id, full_name, attending, guest_count, guest_names, note, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase.from("invitations").select("id, bride_name, groom_name"),
  ]);

  const coupleMap = new Map(
    (invitations ?? []).map((i) => [
      i.id,
      [i.bride_name, i.groom_name].filter(Boolean).join(" & ") || "—",
    ]),
  );

  const rows: DashboardRsvp[] = (rsvps ?? []).map((r) => ({
    id: r.id,
    invitationId: r.invitation_id,
    couple: coupleMap.get(r.invitation_id) ?? "—",
    attending: r.attending,
    fullName: r.full_name,
    guestCount: r.guest_count,
    guestNames: r.guest_names,
    note: r.note,
    createdAt: r.created_at,
  }));

  const invitationOptions = (invitations ?? []).map((i) => ({
    id: i.id,
    label: [i.bride_name, i.groom_name].filter(Boolean).join(" & ") || "—",
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">RSVP Kayıtları</h1>
      <RsvpTable rows={rows} invitations={invitationOptions} />
    </div>
  );
}
