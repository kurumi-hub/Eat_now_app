import NextLink from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";

export default function CheckEmailPage() {
  return (
    <AuthLayout variant="register">
      <h1 className="auth-title">Kiểm tra email của bạn</h1>
      <p className="auth-otp-copy mb-6">
        EatNow đã gửi hướng dẫn xác nhận tài khoản. Nếu chưa thấy email, hãy
        kiểm tra thư mục spam hoặc thử đăng ký lại sau ít phút.
      </p>
      <NextLink className="auth-button-link" href="/login">
        Quay lại đăng nhập
      </NextLink>
    </AuthLayout>
  );
}
