"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils/auth";

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-posta ve şifre zorunludur." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-posta veya şifre hatalı." };
  }

  redirect(isAdminEmail(email) ? "/admin" : "/dashboard");
}
