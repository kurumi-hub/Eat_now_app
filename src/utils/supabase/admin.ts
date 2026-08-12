import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client dùng service_role key -- BYPASS RLS hoàn toàn.
 *
 * CHỈ dùng trong các route server-to-server không gắn với session của user
 * cụ thể nào (vd: webhook/IPN từ VNPay). KHÔNG import file này vào bất kỳ
 * Server Component / Server Action nào chạy trong request của người dùng.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
