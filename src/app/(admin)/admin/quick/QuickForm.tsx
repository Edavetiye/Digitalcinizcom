"use client";

import { useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui/form";
import { createQuickInvitation, type QuickResult } from "./actions";

export default function QuickForm({ appUrl }: { appUrl: string }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [slugHint, setSlugHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<QuickResult, { ok: true }> | null>(
    null,
  );
  const [copied, setCopied] = useState<string | null>(null);

  function submit() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await createQuickInvitation({
        customerName: name,
        customerEmail: email,
        slugHint,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res);
      setName("");
      setEmail("");
      setSlugHint("");
    });
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const embedUrl = result ? `${appUrl}${result.embedPath}` : "";
  const loginUrl = `${appUrl}/login`;

  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-4 rounded-xl border border-foreground/10 p-5">
        <Field label="Müşteri Adı">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Müşteri E-posta" hint="Müşterinin giriş için kullanacağı e-posta.">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field
          label="Link Adı (opsiyonel)"
          hint="Boş bırakılırsa müşteri adından otomatik üretilir. Örn: ayse-mehmet"
        >
          <Input value={slugHint} onChange={(e) => setSlugHint(e.target.value)} />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={submit} disabled={pending}>
          {pending ? "Oluşturuluyor…" : "Oluştur"}
        </Button>
      </div>

      {result && (
        <div className="space-y-4 rounded-xl border border-green-500/30 bg-green-500/5 p-5">
          <h2 className="font-semibold text-green-700">Hazır! ✅</h2>

          <div className="space-y-1">
            <span className="text-sm font-medium">
              Canva Embed Linki (bunu Canva tasarımına yapıştır)
            </span>
            <div className="flex gap-2">
              <Input readOnly value={embedUrl} onFocus={(e) => e.target.select()} />
              <Button variant="secondary" onClick={() => copy(embedUrl, "embed")}>
                {copied === "embed" ? "Kopyalandı" : "Kopyala"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-foreground/10 p-3 text-sm">
            <p className="mb-2 font-medium">Müşteri Giriş Bilgileri</p>
            <p className="text-foreground/70">
              Giriş adresi:{" "}
              <button
                onClick={() => copy(loginUrl, "login")}
                className="underline"
              >
                {loginUrl}
              </button>
              {copied === "login" && (
                <span className="ml-2 text-green-600">kopyalandı</span>
              )}
            </p>
            <p className="text-foreground/70">E-posta: {result.email}</p>
            {result.tempPassword ? (
              <p className="text-foreground/70">
                Geçici şifre:{" "}
                <span className="font-mono font-medium">{result.tempPassword}</span>{" "}
                <button
                  onClick={() => copy(result.tempPassword!, "pw")}
                  className="underline"
                >
                  kopyala
                </button>
                {copied === "pw" && (
                  <span className="ml-2 text-green-600">kopyalandı</span>
                )}
              </p>
            ) : (
              <p className="text-foreground/60">
                Bu müşteri zaten kayıtlı — mevcut şifresiyle giriş yapar.
              </p>
            )}
          </div>

          <p className="text-xs text-foreground/50">
            Müşteri bu adreste yalnızca kendi RSVP kayıtlarını görür.
          </p>
        </div>
      )}
    </div>
  );
}
