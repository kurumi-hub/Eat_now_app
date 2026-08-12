import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client dùng Secret key (sb_secret_..., tương đương service_role của hệ
 * key cũ) -- BYPASS RLS hoàn toàn.
 *
 * CHỈ dùng trong các route server-to-server không gắn với session của user
 * cụ thể nào (vd: webhook/IPN từ VNPay). KHÔNG import file này vào bất kỳ
 * Server Component / Server Action nào chạy trong request của người dùng,
 * và KHÔNG bao giờ thêm prefix NEXT_PUBLIC_ cho biến SUPABASE_SECRET_KEY.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SECRET_KEY."
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
