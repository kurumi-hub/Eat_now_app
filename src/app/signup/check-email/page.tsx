<<<<<<< HEAD
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
=======
import Link from "next/link";
import AuthShell from "@/app/auth/AuthShell";

export default function CheckEmailPage() {
  return (
    <AuthShell
      title="Kiểm tra email của bạn"
      subtitle="EatNow đã gửi một liên kết xác nhận"
      footer={
        <Link href="/login" className="font-semibold text-pink-600">
          Quay lại đăng nhập
        </Link>
      }
    >
      <p className="text-center text-[14.5px] leading-relaxed text-ink-soft">
        Bấm vào liên kết trong email để kích hoạt tài khoản. Không thấy
        email? Kiểm tra thư mục spam hoặc thử đăng ký lại sau ít phút.
      </p>
    </AuthShell>
>>>>>>> parent of cd34bf0 (page update)
  );
}
