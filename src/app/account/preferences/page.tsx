import { requireCurrentUser } from "@/utils/auth/guards";

export default async function AccountPreferencesPage() {
  await requireCurrentUser();

  return (
    <>
      <header className="account-page-heading">
        <p className="account-page-heading__eyebrow">Tài khoản</p>
        <h1 className="account-page-heading__title">Cài đặt</h1>
        <p className="account-page-heading__description">
          Thiết lập thông báo, giao diện và ngôn ngữ hiển thị.
        </p>
      </header>

      <section className="account-card">
        <p className="account-placeholder-note">
          Giao diện cài đặt tài khoản sẽ được migrate ở Phase 6.
        </p>
      </section>
    </>
  );
}
