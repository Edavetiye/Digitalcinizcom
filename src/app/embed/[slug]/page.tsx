import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import RsvpWidget from "@/components/embed/RsvpWidget";

// İçerik güncel kalsın.
export const dynamic = "force-dynamic";

async function getInvitation(slug: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("invitations")
    .select("id, bride_name, groom_name, rsvp_enabled, status")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const inv = await getInvitation(slug);
  const title =
    [inv?.bride_name, inv?.groom_name].filter(Boolean).join(" & ") || "Davetiye";
  return { title };
}

export default async function GuestRsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const invitation = await getInvitation(slug);
  if (!invitation || invitation.status !== "published") notFound();

  const title =
    [invitation.bride_name, invitation.groom_name].filter(Boolean).join(" & ") ||
    "Davetiye";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-foreground/10 p-8 text-center shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">{title}</h1>
        <p className="mb-6 text-sm text-foreground/60">
          Lütfen katılım durumunuzu bildirin
        </p>
        {invitation.rsvp_enabled ? (
          <RsvpWidget invitationId={invitation.id} />
        ) : (
          <p className="text-sm text-foreground/60">Katılım şu an kapalı.</p>
        )}
      </div>
    </main>
  );
}
