import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import RsvpWidget from "@/components/embed/RsvpWidget";

// Canva içine gömülü çalışır; içerik güncel kalsın.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Katılım" };

export default async function GuestRsvpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("id, rsvp_enabled, status")
    .eq("slug", slug)
    .single();

  if (!invitation || invitation.status !== "published") notFound();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      {invitation.rsvp_enabled ? (
        <RsvpWidget invitationId={invitation.id} />
      ) : (
        <p className="text-sm text-foreground/60">Katılım şu an kapalı.</p>
      )}
    </main>
  );
}
