import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rsvpSubmitSchema } from "@/lib/validations/rsvp";
import { sendRsvpNotification } from "@/lib/email/resend";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = rsvpSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const admin = createAdminClient();

  // Davetiyenin yayında ve RSVP'nin açık olduğunu doğrula; müşteri e-postasını al.
  const { data: invitation, error: invError } = await admin
    .from("invitations")
    .select(
      "id, status, rsvp_enabled, bride_name, groom_name, customer_id",
    )
    .eq("id", input.invitation_id)
    .single();

  if (invError || !invitation) {
    return NextResponse.json({ error: "Davetiye bulunamadı." }, { status: 404 });
  }
  if (invitation.status !== "published" || !invitation.rsvp_enabled) {
    return NextResponse.json(
      { error: "Bu davetiye için katılım kapalı." },
      { status: 403 },
    );
  }

  // Kaydı ekle.
  const { data: rsvp, error: insertError } = await admin
    .from("rsvps")
    .insert({
      invitation_id: input.invitation_id,
      full_name: input.full_name,
      guest_count: input.guest_count,
      guest_names: input.guest_names,
      attending: input.attending,
      note: input.note,
    })
    .select("created_at")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Kayıt oluşturulamadı." },
      { status: 500 },
    );
  }

  // Müşteri e-postasına bildirim gönder (best-effort; kaydı etkilemez).
  const { data: customer } = await admin
    .from("customers")
    .select("email")
    .eq("id", invitation.customer_id)
    .single();

  if (customer?.email) {
    const coupleTitle =
      [invitation.bride_name, invitation.groom_name]
        .filter(Boolean)
        .join(" & ") || "Davetiye";
    await sendRsvpNotification({
      to: customer.email,
      coupleTitle,
      attending: input.attending,
      fullName: input.full_name,
      guestCount: input.guest_count,
      guestNames: input.guest_names,
      note: input.note,
      createdAt: rsvp?.created_at ?? new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
