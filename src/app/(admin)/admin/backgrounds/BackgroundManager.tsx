"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/form";
import { uploadBackground, removeBackground } from "./actions";

export interface BgInvitation {
  id: string;
  slug: string;
  customerName: string;
  coverImageUrl: string | null;
}

export default function BackgroundManager({
  invitations,
  appUrl,
}: {
  invitations: BgInvitation[];
  appUrl: string;
}) {
  if (invitations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-foreground/15 p-8 text-center text-foreground/50">
        Henüz davetiye yok. Önce &quot;Hızlı Link&quot; ile bir müşteri oluşturun.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {invitations.map((inv) => (
        <Row key={inv.id} inv={inv} appUrl={appUrl} />
      ))}
    </div>
  );
}

function Row({ inv, appUrl }: { inv: BgInvitation; appUrl: string }) {
  const [pending, startTransition] = useTransition();
  const [url, setUrl] = useState<string | null>(inv.coverImageUrl);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await uploadBackground(inv.id, fd);
      if (!res.ok) setError(res.error);
      else setUrl(res.url);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function onRemove() {
    startTransition(async () => {
      await removeBackground(inv.id);
      setUrl(null);
    });
  }

  const embedUrl = `${appUrl}/embed/${inv.slug}`;

  return (
    <div className="space-y-3 rounded-xl border border-foreground/10 p-4">
      <div>
        <p className="font-medium">{inv.customerName}</p>
        <p className="break-all text-xs text-foreground/50">{embedUrl}</p>
      </div>

      {/* Önizleme */}
      <div
        className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-foreground/10 bg-foreground/[0.03]"
        style={
          url
            ? {
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!url && (
          <span className="text-xs text-foreground/40">Arka plan yok</span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          disabled={pending}
          className="hidden"
          id={`file-${inv.id}`}
        />
        <Button
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
        >
          {pending ? "Yükleniyor…" : url ? "Değiştir" : "Görsel Yükle"}
        </Button>
        {url && (
          <Button variant="danger" onClick={onRemove} disabled={pending}>
            Kaldır
          </Button>
        )}
      </div>
    </div>
  );
}
