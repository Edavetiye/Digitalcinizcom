import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GEÇİCİ kurulum uç noktası — test verisi oluşturur. Token ile korunur.
// Kurulum tamamlanınca kaldırılacaktır.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();

  if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!email) {
    return NextResponse.json({ error: "email parametresi gerekli." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1) Auth kullanıcısını e-postaya göre bul.
  let authUserId: string | null = null;
  for (let page = 1; page <= 10 && !authUserId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const found = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === email,
    );
    if (found) authUserId = found.id;
    if (data.users.length === 0) break;
  }
  if (!authUserId) {
    return NextResponse.json(
      { error: `Auth kullanıcısı bulunamadı: ${email}. Önce Supabase Auth'ta ekleyin.` },
      { status: 404 },
    );
  }

  // 2) Müşteri kaydı (e-postaya göre upsert).
  let customerId: string;
  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingCustomer) {
    customerId = existingCustomer.id;
    await admin
      .from("customers")
      .update({ auth_user_id: authUserId })
      .eq("id", customerId);
  } else {
    const { data, error } = await admin
      .from("customers")
      .insert({
        name: "Demo Müşteri",
        email,
        phone: null,
        auth_user_id: authUserId,
        plan: "free",
      })
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "customer" }, { status: 500 });
    }
    customerId = data.id;
  }

  // 3) Yayında demo davetiye (slug'a göre upsert).
  let invitationId: string;
  const { data: existingInv } = await admin
    .from("invitations")
    .select("id")
    .eq("slug", "demo-dugun")
    .maybeSingle();
  if (existingInv) {
    invitationId = existingInv.id;
    await admin
      .from("invitations")
      .update({ customer_id: customerId, status: "published", rsvp_enabled: true })
      .eq("id", invitationId);
  } else {
    const { data, error } = await admin
      .from("invitations")
      .insert({
        slug: "demo-dugun",
        customer_id: customerId,
        bride_name: "Ayşe",
        groom_name: "Mehmet",
        event_date: null,
        event_time: null,
        location_name: "Örnek Düğün Salonu",
        location_address: null,
        location_map_url: null,
        cover_image_url: null,
        music_url: null,
        theme: "classic",
        welcome_text: null,
        story: null,
        dress_code: null,
        countdown_enabled: true,
        rsvp_enabled: true,
        status: "published",
      })
      .select("id")
      .single();
    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "invitation" }, { status: 500 });
    }
    invitationId = data.id;
  }

  // 4) Örnek RSVP'ler (henüz yoksa).
  const { count } = await admin
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("invitation_id", invitationId);
  if (!count) {
    await admin.from("rsvps").insert([
      {
        invitation_id: invitationId,
        full_name: "Ahmet Yılmaz",
        attending: true,
        guest_count: 3,
        guest_names: ["Ayşe Yılmaz", "Mehmet Yılmaz"],
        note: "Sabırsızlıkla bekliyoruz!",
      },
      {
        invitation_id: invitationId,
        full_name: "Zeynep Kaya",
        attending: false,
        guest_count: 1,
        guest_names: [],
        note: "Maalesef katılamayacağım.",
      },
    ]);
  }

  return NextResponse.json({
    ok: true,
    email,
    customerId,
    invitationId,
    guestUrl: "/embed/demo-dugun",
    customerLogin: "/login",
    message: "Demo veri hazır.",
  });
}
