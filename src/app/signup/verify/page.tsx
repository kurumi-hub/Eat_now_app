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
      <h1 className="auth-title">Nhập mã xác nhận</h1>
      <p className="auth-description mb-6">
        {email
          ? `EatNow đã gửi mã 6 số tới ${email}`
          : "Kiểm tra email để lấy mã 6 số."}
      </p>
      <VerifyOtpForm email={email} />
    </AuthLayout>
  );
}
