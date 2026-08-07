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
    .select("id, rsvp_enabled, status, cover_image_url")
    .eq("slug", slug)
    .single();

  if (!invitation || invitation.status !== "published") notFound();

  const bg = invitation.cover_image_url;

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={
        bg
          ? {
              backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${bg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "scroll",
            }
          : undefined
      }
    >
      <div className="w-full max-w-sm rounded-2xl bg-white/95 p-6 shadow-xl">
        {invitation.rsvp_enabled ? (
          <RsvpWidget invitationId={invitation.id} />
        ) : (
          <p className="text-center text-sm text-black/60">
            Katılım şu an kapalı.
          </p>
        )}
      </div>
    </main>
  );
}
