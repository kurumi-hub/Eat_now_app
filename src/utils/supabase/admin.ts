import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client dùng service_role key -- BYPASS RLS hoàn toàn.
 *
 * Chỉ dùng ở server. Với request của người dùng, bắt buộc xác thực session và
 * kiểm tra quyền trên đúng resource bằng client theo session trước khi gọi.
 * Tuyệt đối không trả service_role key về client.
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
