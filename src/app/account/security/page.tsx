import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountSecurityPage() {
  await requireCurrentUser();

  return (
    <>
      <header className="account-page-heading">
        <p className="account-page-heading__eyebrow">Tài khoản</p>
        <h1 className="account-page-heading__title">Bảo mật</h1>
        <p className="account-page-heading__description">
          Quản lý mật khẩu và phiên đăng nhập của tài khoản EatNow.
        </p>
      </header>

      <section className="account-card">
        <p className="account-placeholder-note">
          Giao diện đổi mật khẩu sẽ được migrate ở Phase 6.
        </p>
      </section>
    </>
  );
}
