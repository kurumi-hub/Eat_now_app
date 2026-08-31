import { Typography } from "@mui/material";
import NextLink from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";
import {
  buttonLinkClassName,
  otpCopyClassName,
  titleClassName,
} from "@/components/auth/tailwindClasses";

export default function CheckEmailPage() {
  return (
    <AuthLayout variant="register">
      <Typography component="h1" className={titleClassName}>
        Kiểm tra email của bạn
      </Typography>
      <Typography className={otpCopyClassName} sx={{ mb: 3 }}>
        EatNow đã gửi hướng dẫn xác nhận tài khoản. Nếu chưa thấy email, hãy
        kiểm tra thư mục spam hoặc thử đăng ký lại sau ít phút.
      </Typography>
      <NextLink className={buttonLinkClassName} href="/login">
        Quay lại đăng nhập
      </NextLink>
    </AuthLayout>
  );
}
