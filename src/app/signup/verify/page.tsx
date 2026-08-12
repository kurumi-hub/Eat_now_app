import { Typography } from "@mui/material";

import AuthLayout from "@/components/auth/AuthLayout";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";

type VerifyPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email = "" } = await searchParams;

  return (
    <AuthLayout variant="register">
      <Typography component="h1" className="auth-title">
        Nhập mã xác nhận
      </Typography>
      <Typography className="auth-description" sx={{ mb: 3 }}>
        {email
          ? `EatNow đã gửi mã 6 số tới ${email}`
          : "Kiểm tra email để lấy mã 6 số."}
      </Typography>
      <VerifyOtpForm email={email} />
    </AuthLayout>
  );
}
