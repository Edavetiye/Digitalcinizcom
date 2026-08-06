import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Tarayıcı (client component) tarafında kullanılan Supabase client'ı.
 * Yalnızca anon key kullanır; RLS politikaları geçerlidir.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
