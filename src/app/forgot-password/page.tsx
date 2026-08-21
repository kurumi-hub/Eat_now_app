import { redirect } from "next/navigation";

import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function ForgotPasswordPage() {
  const user = await getCurrentPublicUser();

  if (user) {
    redirect("/account/security");
  }

  return (
    <AuthLayout variant="login">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
