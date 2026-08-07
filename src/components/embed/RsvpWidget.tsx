"use client";

import { useEffect, useState } from "react";
import { getTheme } from "@/lib/themes";

type Mode = null | "yes" | "no";

export default function RsvpWidget({
  invitationId,
  theme: themeId,
}: {
  invitationId: string;
  theme?: string | null;
}) {
  const theme = getTheme(themeId);
  const [mode, setMode] = useState<Mode>(null);
  const [fullName, setFullName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [countInput, setCountInput] = useState("1");
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const attending = mode === "yes";

  // Kişi sayısı değiştikçe "beraber gelen" isim kutularını (count-1) ayarla.
  useEffect(() => {
    const needed = Math.max(0, guestCount - 1);
    setGuestNames((prev) =>
      Array.from({ length: needed }, (_, i) => prev[i] ?? ""),
    );
  }, [guestCount]);

  function close() {
    setMode(null);
    setError(null);
  }

  async function submit() {
    setError(null);
    if (fullName.trim().length < 2) {
      setError("Lütfen ad soyad girin.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_id: invitationId,
          attending,
          full_name: fullName,
          guest_count: attending ? guestCount : 1,
          guest_names: attending ? guestNames : [],
          note,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Bir hata oluştu.");
        return;
      }
      setDone(true);
      setMode(null);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-1 text-center">
        <p className="text-lg font-medium" style={{ color: theme.accent }}>
          Teşekkürler! 💌
        </p>
        <p className="text-sm" style={{ color: theme.muted }}>
          Yanıtınız kaydedildi.
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    borderColor: `${theme.text}22`,
    background: theme.panel,
    color: theme.text,
  };

  return (
    <div className="space-y-2 text-center">
      <p className="text-sm font-medium">Katılım Durumu</p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setMode("yes")}
          className="rounded-lg px-5 py-2 text-sm font-medium transition-transform active:scale-95"
          style={{ background: theme.accent, color: theme.accentText }}
        >
          ✅ Katılıyorum
        </button>
        <button
          type="button"
          onClick={() => setMode("no")}
          className="rounded-lg border px-5 py-2 text-sm font-medium transition-transform active:scale-95"
          style={{ borderColor: theme.accent, color: theme.accent }}
        >
          ❌ Katılmıyorum
        </button>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={close}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 text-left shadow-xl"
            style={{ background: theme.panel, color: theme.text }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {attending ? "Katılıyorum" : "Katılmıyorum"}
              </h3>
              <button
                type="button"
                onClick={close}
                className="text-lg leading-none"
                style={{ color: theme.muted }}
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm" style={{ color: theme.muted }}>
                  Ad Soyad
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                  autoFocus
                />
              </label>

              {attending && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm" style={{ color: theme.muted }}>
                      Kişi Sayısı
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={50}
                      value={countInput}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setCountInput(raw);
                        if (raw === "") return; // yazarken boş bırakmaya izin ver
                        const n = parseInt(raw, 10);
                        if (!Number.isNaN(n)) {
                          setGuestCount(Math.min(50, Math.max(1, n)));
                        }
                      }}
                      onBlur={() => {
                        const n = Math.min(
                          50,
                          Math.max(1, parseInt(countInput || "1", 10) || 1),
                        );
                        setGuestCount(n);
                        setCountInput(String(n));
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={inputStyle}
                    />
                  </label>

                  {guestCount > 1 && (
                    <div className="space-y-2">
                      <span className="block text-sm" style={{ color: theme.muted }}>
                        Beraber Gelenlerin İsimleri
                      </span>
                      {guestNames.map((name, i) => (
                        <input
                          key={i}
                          value={name}
                          placeholder={`Misafir ${i + 1}`}
                          onChange={(e) => {
                            const next = [...guestNames];
                            next[i] = e.target.value;
                            setGuestNames(next);
                          }}
                          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                          style={inputStyle}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              <label className="block">
                <span className="mb-1 block text-sm" style={{ color: theme.muted }}>
                  Not (opsiyonel)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={inputStyle}
                />
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ background: theme.accent, color: theme.accentText }}
              >
                {submitting ? "Gönderiliyor…" : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
