import { requireAdmin } from "@/lib/auth/guards";
import QuickForm from "./QuickForm";

export default async function QuickPage() {
  await requireAdmin();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Hızlı Link Üret</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Müşteri bilgisini gir; sistem müşteriyi, girişini ve yayında bir
          davetiye linkini otomatik oluşturur. Linki Canva tasarımına yapıştır.
        </p>
      </div>
      <QuickForm appUrl={appUrl} />
    </div>
  );
}
