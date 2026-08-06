import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import CustomerManager from "./CustomerManager";

export default async function CustomersPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: customers } = await admin
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Müşteriler</h1>
      <CustomerManager customers={customers ?? []} />
    </div>
  );
}
