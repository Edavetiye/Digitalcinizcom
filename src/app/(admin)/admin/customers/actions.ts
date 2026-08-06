"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  customerCreateSchema,
  customerUpdateSchema,
} from "@/lib/validations/customer";

export type CustomerResult =
  | { ok: true; tempPassword?: string }
  | { ok: false; error: string };

/** Basit, paylaşılabilir geçici şifre üretir. */
function generatePassword(): string {
  return `Dv-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createCustomer(input: unknown): Promise<CustomerResult> {
  await requireAdmin();

  const parsed = customerCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }
  const { name, email, phone, plan } = parsed.data;
  const admin = createAdminClient();

  const tempPassword = generatePassword();
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    return {
      ok: false,
      error:
        authError?.message?.includes("already")
          ? "Bu e-posta ile bir kullanıcı zaten var."
          : authError?.message ?? "Kullanıcı oluşturulamadı.",
    };
  }

  const { error: insertError } = await admin.from("customers").insert({
    name,
    email,
    phone,
    plan,
    auth_user_id: authData.user.id,
  });

  if (insertError) {
    // Kısmi durumu geri al: oluşturulan auth kullanıcısını temizle.
    await admin.auth.admin.deleteUser(authData.user.id);
    return { ok: false, error: insertError.message };
  }

  revalidatePath("/admin/customers");
  return { ok: true, tempPassword };
}

export async function updateCustomer(input: unknown): Promise<CustomerResult> {
  await requireAdmin();

  const parsed = customerUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }
  const { id, name, phone, plan } = parsed.data;
  const admin = createAdminClient();

  const { error } = await admin
    .from("customers")
    .update({ name, phone, plan })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/customers");
  return { ok: true };
}

export async function deleteCustomer(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();

  // İlgili auth kullanıcısını da temizlemek için önce kaydı oku.
  const { data: customer } = await admin
    .from("customers")
    .select("auth_user_id")
    .eq("id", id)
    .single();

  await admin.from("customers").delete().eq("id", id);

  if (customer?.auth_user_id) {
    await admin.auth.admin.deleteUser(customer.auth_user_id);
  }

  revalidatePath("/admin/customers");
}
