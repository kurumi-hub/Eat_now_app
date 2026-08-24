import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function readSecretKey() {
  const directKey = process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (directKey) return directKey;

  // Supabase Edge Functions expose new named keys as a JSON dictionary.
  // Supporting it here also keeps shared server code portable.
  const namedKeys = process.env.SUPABASE_SECRET_KEYS;
  if (!namedKeys) return null;
  try {
    const parsed = JSON.parse(namedKeys) as Record<string, unknown>;
    return typeof parsed.default === "string" ? parsed.default : null;
  } catch {
    throw new Error(
      "SUPABASE_SECRET_KEYS không phải JSON hợp lệ hoặc thiếu khóa default."
    );
  }
}

/**
 * Client dùng Supabase Secret key (hoặc service_role legacy) -- BYPASS RLS.
 *
 * Chỉ dùng ở server. Với request của người dùng, bắt buộc xác thực session và
 * kiểm tra quyền trên đúng resource bằng client theo session trước khi gọi.
 * Tuyệt đối không trả Secret key về client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = readSecretKey();

  if (!url || !secretKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SECRET_KEY " +
      "(chấp nhận SUPABASE_SERVICE_ROLE_KEY legacy)."
    );
  }

  return createSupabaseClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
