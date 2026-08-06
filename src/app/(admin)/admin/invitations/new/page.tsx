import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import InvitationEditor from "../InvitationEditor";

export default async function NewInvitationPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: customers } = await admin
    .from("customers")
    .select("id, name, email")
    .order("name");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (!customers || customers.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Yeni Davetiye</h1>
        <p className="rounded-xl border border-dashed border-foreground/15 p-8 text-center text-foreground/60">
          Önce en az bir müşteri oluşturmalısınız.{" "}
          <Link href="/admin/customers" className="underline">
            Müşteriler
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Yeni Davetiye</h1>
      <InvitationEditor customers={customers} initial={{}} appUrl={appUrl} />
    </div>
  );
}
