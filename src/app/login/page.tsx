import { redirect } from "next/navigation";

import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentPublicUser } from "@/utils/auth/guards";
import { getPostLoginRedirectPath } from "@/utils/auth/redirects";

type LoginPageProps = {
  searchParams: Promise<{
    email?: string;
    next?: string;
    reset?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ email = "", next = "", reset = "" }, user] = await Promise.all([
    searchParams,
    getCurrentPublicUser(),
  ]);

  if (user) {
    redirect(getPostLoginRedirectPath(user.roles, next));
  }

  return (
    <AuthLayout variant="login">
      <LoginForm
        initialEmail={email}
        nextPath={next}
        passwordResetSuccess={reset === "success"}
      />
    </AuthLayout>
  );
}
