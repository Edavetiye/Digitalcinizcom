export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-40 animate-pulse rounded bg-foreground/10" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-20 animate-pulse rounded-xl bg-foreground/5" />
        <div className="h-20 animate-pulse rounded-xl bg-foreground/5" />
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-foreground/5" />
      <p className="text-center text-sm text-foreground/40">Yükleniyor…</p>
    </div>
  );
}
