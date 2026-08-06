"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Select } from "@/components/ui/form";
import { createCustomer, updateCustomer, deleteCustomer } from "./actions";
import type { Customer, Plan } from "@/types/database";

const EMPTY = { name: "", email: "", phone: "", plan: "free" as Plan };

export default function CustomerManager({
  customers,
}: {
  customers: Customer[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function resetForm() {
    setForm(EMPTY);
    setEditingId(null);
    setError(null);
  }

  function startEdit(c: Customer) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone ?? "",
      plan: c.plan,
    });
    setError(null);
    setNotice(null);
  }

  function handleSubmit() {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      if (editingId) {
        const res = await updateCustomer({
          id: editingId,
          name: form.name,
          phone: form.phone,
          plan: form.plan,
        });
        if (!res.ok) return setError(res.error);
        setNotice("Müşteri güncellendi.");
      } else {
        const res = await createCustomer(form);
        if (!res.ok) return setError(res.error);
        setNotice(
          `Müşteri oluşturuldu. Geçici şifre: ${res.tempPassword} — müşteriyle paylaşın.`,
        );
      }
      resetForm();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Müşteri ve tüm davetiyeleri silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      await deleteCustomer(id);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Liste */}
      <div className="overflow-x-auto rounded-xl border border-foreground/10">
        <table className="w-full text-sm">
          <thead className="border-b border-foreground/10 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  Henüz müşteri yok.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b border-foreground/5">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-foreground/70">{c.email}</td>
                  <td className="px-4 py-3 text-foreground/70">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs uppercase">
                      {c.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => startEdit(c)}
                        className="text-foreground/70 hover:text-foreground"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form */}
      <div className="space-y-4 rounded-xl border border-foreground/10 p-5">
        <h2 className="font-semibold">
          {editingId ? "Müşteri Düzenle" : "Yeni Müşteri"}
        </h2>
        <Field label="Ad Soyad">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field
          label="E-posta"
          hint={editingId ? "E-posta değiştirilemez." : "Giriş için kullanılır."}
        >
          <Input
            type="email"
            value={form.email}
            disabled={Boolean(editingId)}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Telefon">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </Field>
        <Field label="Plan">
          <Select
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value as Plan })}
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </Select>
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-600">{notice}</p>}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "İşleniyor…" : editingId ? "Güncelle" : "Oluştur"}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={resetForm} disabled={pending}>
              İptal
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
