import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import BackgroundManager, { type BgInvitation } from "./BackgroundManager";

export const dynamic = "force-dynamic";

export default async function BackgroundsPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: invitations } = await admin
    .from("invitations")
    .select("id, slug, cover_image_url, customer_id")
    .order("created_at", { ascending: false });

  const { data: customers } = await admin.from("customers").select("id, name");
  const customerMap = new Map((customers ?? []).map((c) => [c.id, c.name]));

  const rows: BgInvitation[] = (invitations ?? []).map((inv) => ({
    id: inv.id,
    slug: inv.slug,
    customerName: customerMap.get(inv.customer_id) ?? "—",
    coverImageUrl: inv.cover_image_url,
  }));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Arka Planlar</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Her müşterinin davetli sayfası için arka plan görseli yükleyin.
          Davetli linki açtığında bu görseli görür.
        </p>
      </div>
      <BackgroundManager invitations={rows} appUrl={appUrl} />
    </div>
  );
}
