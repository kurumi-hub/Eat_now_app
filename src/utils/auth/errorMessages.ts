export type SupabaseAuthErrorLike = {
  status?: number;
  code?: string;
  message?: string;
  name?: string;
};

function getErrorText(error: SupabaseAuthErrorLike) {
  return `${error.code ?? ""} ${error.message ?? ""} ${error.name ?? ""}`
    .trim()
    .toLowerCase();
}

export function isEmailNotConfirmedError(error: SupabaseAuthErrorLike) {
  const errorText = getErrorText(error);

  return (
    error.code === "email_not_confirmed" ||
    errorText.includes("email_not_confirmed") ||
    errorText.includes("email not confirmed") ||
    errorText.includes("email chưa được xác nhận")
  );
}

export function mapSignupAuthError(error: SupabaseAuthErrorLike) {
  const errorText = getErrorText(error);

  if (
    errorText.includes("user_already_exists") ||
    errorText.includes("already registered") ||
    errorText.includes("already been registered") ||
    errorText.includes("already exists")
  ) {
    return "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.";
  }

  if (
    errorText.includes("signup_disabled") ||
    errorText.includes("signup is disabled") ||
    errorText.includes("signups not allowed") ||
    errorText.includes("email signups are disabled")
  ) {
    return "Đăng ký bằng email đang bị tắt trong Supabase. Vui lòng liên hệ backend.";
  }

  if (errorText.includes("captcha")) {
    return "Supabase đang yêu cầu CAPTCHA. Frontend cần cấu hình CAPTCHA trước khi đăng ký.";
  }

  if (
    error.status === 429 ||
    errorText.includes("rate_limit") ||
    errorText.includes("too many") ||
    errorText.includes("rate limit")
  ) {
    return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
  }

  if (
    errorText.includes("database") ||
    errorText.includes("saving new user") ||
    errorText.includes("trigger")
  ) {
    return "Không thể tạo hồ sơ người dùng. Hãy kiểm tra số điện thoại đã được dùng hoặc chạy migration sửa trigger đăng ký.";
  }

  if (error.status && error.status >= 500) {
    return "Dịch vụ đăng ký đang tạm thời gặp lỗi. Vui lòng thử lại; nếu vẫn lỗi, kiểm tra Supabase Auth logs và email provider.";
  }

  return "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.";
}

export function logSupabaseAuthError(
  context: string,
  error: SupabaseAuthErrorLike
) {
  console.error(`[auth.${context}]`, {
    status: error.status,
    code: error.code,
    message: error.message,
    name: error.name,
  });
}
