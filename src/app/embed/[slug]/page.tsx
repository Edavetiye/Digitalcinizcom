import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTheme } from "@/lib/themes";
import InvitationPreview from "@/components/invitation/InvitationPreview";
import RsvpWidget from "@/components/embed/RsvpWidget";

// Embed içeriği güncel kalsın; edge cache'e takılmasın.
export const dynamic = "force-dynamic";

async function getInvitation(slug: string) {
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!invitation) return null;

  const [{ data: events }, { data: links }] = await Promise.all([
    admin
      .from("events")
      .select("title, start_time, description")
      .eq("invitation_id", invitation.id)
      .order("start_time"),
    admin
      .from("links")
      .select("type, title, url")
      .eq("invitation_id", invitation.id),
  ]);

  return { invitation, events: events ?? [], links: links ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getInvitation(slug);
  if (!result) return { title: "Davetiye" };
  const couple =
    [result.invitation.bride_name, result.invitation.groom_name]
      .filter(Boolean)
      .join(" & ") || "Davetiye";
  return { title: couple };
}

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getInvitation(slug);
  if (!result) notFound();

  const { invitation, events, links } = result;
  const theme = getTheme(invitation.theme);

  return (
    <div
      className="flex min-h-screen items-start justify-center p-4"
      style={{ background: theme.bg }}
    >
      <InvitationPreview
        data={invitation}
        events={events}
        links={links}
        rsvpSlot={
          invitation.rsvp_enabled ? (
            <RsvpWidget invitationId={invitation.id} theme={invitation.theme} />
          ) : undefined
        }
      />
    </div>
  );
}
