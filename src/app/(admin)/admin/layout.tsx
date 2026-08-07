import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-foreground/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold">
              Admin Panel
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/quick" className="font-medium text-foreground hover:text-foreground">
                Hızlı Link
              </Link>
              <Link href="/admin/customers" className="text-foreground/70 hover:text-foreground">
                Müşteriler
              </Link>
              <Link href="/admin/invitations" className="text-foreground/70 hover:text-foreground">
                Davetiyeler
              </Link>
            </nav>
          </div>
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
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
