import { requireAnyRole } from "@/utils/auth/guards";

export default async function AccountAddressesPage() {
  await requireAnyRole(["CUSTOMER"]);

  return (
    <>
      <header className="account-page-heading">
        <p className="account-page-heading__eyebrow">Tài khoản</p>
        <h1 className="account-page-heading__title">Địa chỉ giao hàng</h1>
        <p className="account-page-heading__description">
          Danh sách địa chỉ dùng cho đơn hàng của khách hàng.
        </p>
      </header>

      <section className="account-card">
        <p className="account-placeholder-note">
          Giao diện quản lý địa chỉ sẽ được migrate ở Phase 6.
        </p>
      </section>
    </>
  );
}
