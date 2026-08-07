"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";

const schema = z.object({
  customerName: z.string().trim().min(2, "Müşteri adı en az 2 karakter olmalı."),
  customerEmail: z.string().trim().email("Geçerli bir e-posta girin."),
  slugHint: z.string().trim().optional().or(z.literal("")),
});

export type QuickResult =
  | {
      ok: true;
      slug: string;
      embedPath: string;
      email: string;
      tempPassword?: string;
      isNewCustomer: boolean;
    }
  | { ok: false; error: string };

function generatePassword(): string {
  return `Dv-${crypto.randomUUID().slice(0, 8)}`;
}

async function uniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  base: string,
): Promise<string> {
  const root = slugify(base) || `davetiye-${crypto.randomUUID().slice(0, 6)}`;
  let candidate = root;
  let n = 1;
  for (;;) {
    const { data } = await admin
      .from("invitations")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (!data || data.length === 0) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
}

export async function createQuickInvitation(
  input: unknown,
): Promise<QuickResult> {
  await requireAdmin();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }
  const { customerName, customerEmail, slugHint } = parsed.data;
  const email = customerEmail.toLowerCase();
  const admin = createAdminClient();

  // 1) Müşteri: e-posta varsa yeniden kullan, yoksa auth kullanıcısı + kayıt oluştur.
  let customerId: string;
  let tempPassword: string | undefined;
  let isNewCustomer = false;

  const { data: existing } = await admin
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    customerId = existing.id;
  } else {
    isNewCustomer = true;
    tempPassword = generatePassword();
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });
    if (authError || !authData.user) {
      return {
        ok: false,
        error: authError?.message?.includes("already")
          ? "Bu e-posta ile bir kullanıcı zaten var."
          : authError?.message ?? "Kullanıcı oluşturulamadı.",
      };
    }
    const { data: cust, error: custError } = await admin
      .from("customers")
      .insert({
        name: customerName,
        email,
        phone: null,
        auth_user_id: authData.user.id,
        plan: "free",
      })
      .select("id")
      .single();
    if (custError || !cust) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return { ok: false, error: custError?.message ?? "Müşteri oluşturulamadı." };
    }
    customerId = cust.id;
  }

  // 2) Yayında davetiye + benzersiz slug (tasarım Canva'da olduğu için içerik boş).
  const slug = await uniqueSlug(admin, slugHint || customerName);
  const { error: invError } = await admin.from("invitations").insert({
    slug,
    customer_id: customerId,
    bride_name: null,
    groom_name: null,
    event_date: null,
    event_time: null,
    location_name: null,
    location_address: null,
    location_map_url: null,
    cover_image_url: null,
    music_url: null,
    theme: "classic",
    welcome_text: null,
    story: null,
    dress_code: null,
    countdown_enabled: false,
    rsvp_enabled: true,
    status: "published",
  });
  if (invError) {
    return { ok: false, error: invError.message };
  }

  revalidatePath("/admin/invitations");

  return {
    ok: true,
    slug,
    embedPath: `/embed/${slug}`,
    email,
    tempPassword,
    isNewCustomer,
  };
}
