import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    email?: string;
    error?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { email = "", error = "" } = await searchParams;

  return (
    <AuthLayout variant="login">
      <ForgotPasswordForm initialEmail={email} initialError={error} />
    </AuthLayout>
  );
}
