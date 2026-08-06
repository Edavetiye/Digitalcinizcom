"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  invitationInputSchema,
  type InvitationInput,
} from "@/lib/validations/invitation";

export type SaveResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

/** Slug'ı benzersiz hale getirir (kendisi hariç). */
async function ensureUniqueSlug(
  admin: ReturnType<typeof createAdminClient>,
  slug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = slug;
  let n = 1;
  // Küçük ölçekte döngü yeterli; her turda tek satır sorgulanır.
  for (;;) {
    const query = admin
      .from("invitations")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    const { data } = await query;
    const clash = data?.[0];
    if (!clash || clash.id === excludeId) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

export async function saveInvitation(
  input: InvitationInput,
): Promise<SaveResult> {
  await requireAdmin();

  const parsed = invitationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }
  const { id, events, links, slug, ...fields } = parsed.data;

  const admin = createAdminClient();
  const uniqueSlug = await ensureUniqueSlug(admin, slug, id);

  let invitationId = id;

  if (id) {
    const { error } = await admin
      .from("invitations")
      .update({ ...fields, slug: uniqueSlug })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await admin
      .from("invitations")
      .insert({ ...fields, slug: uniqueSlug })
      .select("id")
      .single();
    if (error || !data) {
      return { ok: false, error: error?.message ?? "Davetiye oluşturulamadı." };
    }
    invitationId = data.id;
  }

  if (!invitationId) return { ok: false, error: "Davetiye kimliği alınamadı." };

  // Events ve links: basit ve doğru yaklaşım — mevcutları sil, yenilerini ekle.
  await admin.from("events").delete().eq("invitation_id", invitationId);
  if (events.length > 0) {
    const { error } = await admin.from("events").insert(
      events.map((e) => ({ ...e, invitation_id: invitationId! })),
    );
    if (error) return { ok: false, error: error.message };
  }

  await admin.from("links").delete().eq("invitation_id", invitationId);
  if (links.length > 0) {
    const { error } = await admin.from("links").insert(
      links.map((l) => ({ ...l, invitation_id: invitationId! })),
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/invitations");
  revalidatePath(`/admin/invitations/${invitationId}`);
  revalidatePath(`/embed/${uniqueSlug}`);

  return { ok: true, id: invitationId, slug: uniqueSlug };
}

export async function deleteInvitation(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("invitations").delete().eq("id", id);
  revalidatePath("/admin/invitations");
}
