import { redirect } from "next/navigation";

import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentPublicUser } from "@/utils/auth/guards";

export default async function RegisterPage() {
  const user = await getCurrentPublicUser();

  if (user) {
    redirect("/");
  }

  return (
    <AuthLayout variant="register">
      <RegisterForm />
    </AuthLayout>
  );
}
