import { redirect } from "next/navigation";

import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/utils/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password?error=link-het-han");
  }

  return (
    <AuthLayout variant="login">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
