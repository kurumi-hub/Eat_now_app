import { Box, Typography } from "@mui/material";

import AuthLayout from "@/components/auth/AuthLayout";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";

type VerifyPageProps = {
  searchParams: Promise<{
    email?: string;
    next?: string;
    reason?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email = "", next = "", reason = "" } = await searchParams;
  const isFromLogin = reason === "chua-active";

  return (
    <AuthLayout variant="register">
      <Box className="auth-header auth-header--centered-mobile">
        <Typography component="h1" className="auth-title">
          Nhập mã xác nhận
        </Typography>
        <Typography className="auth-description">
          {isFromLogin
            ? "Tài khoản của bạn chưa được kích hoạt. "
            : ""}
          {email ? (
            <>
              EatNow đã gửi mã 8 số tới{" "}
              <Box component="strong" className="auth-email-highlight">
                {email}
              </Box>{" "}
              để bạn kích hoạt tài khoản.
            </>
          ) : (
            "Kiểm tra email để lấy mã xác nhận gồm 8 số."
          )}
        </Typography>
      </Box>
      <VerifyOtpForm email={email} nextPath={next} />
    </AuthLayout>
  );
}
