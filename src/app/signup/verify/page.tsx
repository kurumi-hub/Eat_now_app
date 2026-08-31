import { Typography } from "@mui/material";

import AuthLayout from "@/components/auth/AuthLayout";
import VerifyOtpForm from "@/components/auth/VerifyOtpForm";
import {
  descriptionClassName,
  titleClassName,
} from "@/components/auth/tailwindClasses";

type VerifyPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const { email = "" } = await searchParams;

  return (
    <AuthLayout variant="register">
      <Typography component="h1" className={titleClassName}>
        Nhập mã xác nhận
      </Typography>
      <Typography className={descriptionClassName} sx={{ mb: 3 }}>
        {email
          ? `EatNow đã gửi mã 8 số tới ${email}`
          : "Kiểm tra email để lấy mã 8 số."}
      </Typography>
      <VerifyOtpForm email={email} />
    </AuthLayout>
  );
}
