import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * SERVICE ROLE client'ı — RLS'yi baypas eder. YALNIZCA sunucu tarafında,
 * admin işlemleri (müşteri oluştur/sil, auth kullanıcısı yönet) için kullanılır.
 * Bu anahtar asla client'a sızdırılmamalıdır.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
