import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils/auth";

/**
 * Giriş yapmış kullanıcıyı döndürür; yoksa /login'e yönlendirir.
 */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Kullanıcının admin olmasını zorunlu kılar. Admin değilse /dashboard'a,
 * giriş yoksa /login'e yönlendirir. Hem sayfalarda hem server action'larda
 * kullanılır (defense-in-depth: middleware'e ek olarak).
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) redirect("/dashboard");
  return user;
}
