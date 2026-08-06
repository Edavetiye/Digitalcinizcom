import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import InvitationEditor, {
  type EditorInitial,
} from "../InvitationEditor";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("id", id)
    .single();

  if (!invitation) notFound();

  const [{ data: customers }, { data: events }, { data: links }] =
    await Promise.all([
      admin.from("customers").select("id, name, email").order("name"),
      admin
        .from("events")
        .select("title, start_time, description")
        .eq("invitation_id", id)
        .order("start_time"),
      admin
        .from("links")
        .select("type, title, url")
        .eq("invitation_id", id),
    ]);

  const initial: EditorInitial = {
    ...invitation,
    events: (events ?? []).map((e) => ({
      title: e.title,
      // datetime-local input "YYYY-MM-DDTHH:mm" bekler.
      start_time: e.start_time ? e.start_time.slice(0, 16) : null,
      description: e.description,
    })),
    links: links ?? [],
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Davetiye Düzenle</h1>
      <InvitationEditor
        customers={customers ?? []}
        initial={initial}
        appUrl={appUrl}
      />
    </div>
  );
}
