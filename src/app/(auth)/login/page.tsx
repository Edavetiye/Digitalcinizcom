"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-foreground/10 p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">Giriş Yap</h1>
        <p className="mb-6 text-sm text-foreground/60">
          Dijital Davetiye yönetim paneli
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
            />
          </div>

          {state.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
          >
            {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </main>
  );
}
