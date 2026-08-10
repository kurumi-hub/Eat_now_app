import { Typography } from "@mui/material";
import NextLink from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";

export default function CheckEmailPage() {
  return (
    <AuthLayout variant="register">
      <Typography component="h1" className="auth-title">
        Kiểm tra email của bạn
      </Typography>
      <Typography className="auth-otp-copy" sx={{ mb: 3 }}>
        EatNow đã gửi hướng dẫn xác nhận tài khoản. Nếu chưa thấy email, hãy
        kiểm tra thư mục spam hoặc thử đăng ký lại sau ít phút.
      </Typography>
      <NextLink className="auth-button-link" href="/login">
        Quay lại đăng nhập
      </NextLink>
    </AuthLayout>
  );
}
