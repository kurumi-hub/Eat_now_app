import { Box, Typography } from "@mui/material";

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
      <Box className="auth-header auth-header--centered-mobile">
        <Typography component="h1" className="auth-title">
          Nhập mã xác nhận
        </Typography>
        <Typography className="auth-description">
          {email ? (
            <>
              EatNow đã gửi mã 8 số tới{" "}
              <Box component="strong" className="auth-email-highlight">
                {email}
              </Box>
            </>
          ) : (
            "Kiểm tra email để lấy mã xác nhận gồm 8 số."
          )}
        </Typography>
      </Box>
      <VerifyOtpForm email={email} />
    </AuthLayout>
  );
}
