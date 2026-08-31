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
    errorText.includes("sending confirmation email") ||
    errorText.includes("email_address_not_authorized") ||
    errorText.includes("email address not authorized") ||
    errorText.includes("email provider") ||
    errorText.includes("smtp") ||
    errorText.includes("gomail")
  ) {
    return "Không thể gửi email xác nhận. Vui lòng dùng email thật hoặc báo Bảo kiểm tra SMTP/Auth email trong Supabase.";
  }

  if (
    error.status === 429 ||
    errorText.includes("rate_limit") ||
    errorText.includes("too many") ||
    errorText.includes("rate limit")
  ) {
    return "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
  }

  if (error.status && error.status >= 500) {
    return "Supabase Auth đang trả lỗi 500. Vui lòng báo Bảo kiểm tra Auth logs, database trigger/profile hoặc email provider.";
  }

  if (
    errorText.includes("database") ||
    errorText.includes("saving new user") ||
    errorText.includes("trigger")
  ) {
    return "Không thể tạo hồ sơ người dùng trong database. Vui lòng báo Bảo kiểm tra trigger/profile ở Supabase.";
  }

  return "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.";
}

export function logSupabaseAuthError(
  context: string,
  error: SupabaseAuthErrorLike
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.error(`[auth.${context}]`, {
    status: error.status,
    code: error.code,
    message: error.message,
    name: error.name,
  });
}
