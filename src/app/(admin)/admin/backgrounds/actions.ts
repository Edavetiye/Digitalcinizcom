"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "backgrounds";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Public 'backgrounds' bucket'ının var olduğundan emin olur. */
async function ensureBucket(admin: ReturnType<typeof createAdminClient>) {
  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "8MB",
  });
  // Zaten varsa hatayı yok say.
  if (error && !/exist/i.test(error.message)) {
    throw new Error(error.message);
  }
}

export async function uploadBackground(
  invitationId: string,
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Görsel seçilmedi." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Yalnızca görsel dosyası yükleyin." };
  }

  const admin = createAdminClient();
  try {
    await ensureBucket(admin);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Bucket hatası." };
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${invitationId}/${Date.now()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  });
  if (upErr) return { ok: false, error: upErr.message };

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = data.publicUrl;

  const { error: updErr } = await admin
    .from("invitations")
    .update({ cover_image_url: publicUrl })
    .eq("id", invitationId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/admin/backgrounds");
  return { ok: true, url: publicUrl };
}

export async function removeBackground(invitationId: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("invitations")
    .update({ cover_image_url: null })
    .eq("id", invitationId);
  revalidatePath("/admin/backgrounds");
}
