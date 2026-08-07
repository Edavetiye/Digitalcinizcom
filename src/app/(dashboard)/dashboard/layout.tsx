import { requireUser } from "@/lib/auth/guards";
import { logout } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="font-semibold">Davetiyelerim</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-foreground/50 sm:inline">{user.email}</span>
            <form action={logout}>
              <button className="rounded-lg border border-foreground/20 px-3 py-1.5 hover:bg-foreground/5">
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
