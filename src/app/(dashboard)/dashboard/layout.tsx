import { logout } from "@/lib/actions/auth";

// Kimlik doğrulama middleware tarafından yapılır; burada getUser çağırmayarak
// layout'un anında render olmasını sağlıyoruz (koyu boş ekran/gecikme azalır).
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-semibold">Davetiyelerim</span>
          <form action={logout}>
            <button className="rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5">
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
