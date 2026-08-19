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
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [
    { email = "", next = "", reset = "", error = "" },
    user,
  ] = await Promise.all([searchParams, getCurrentPublicUser()]);

  if (user) {
    redirect(getPostLoginRedirectPath(user.roles, next));
  }

  return (
    <AuthLayout variant="login">
      <LoginForm
        initialEmail={email}
        nextPath={next}
        statusMessage={
          reset === "success"
            ? "Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
            : ""
        }
        initialError={
          error === "link-het-han"
            ? "Liên kết xác nhận không hợp lệ hoặc đã hết hạn."
            : ""
        }
      />
    </AuthLayout>
  );
}
