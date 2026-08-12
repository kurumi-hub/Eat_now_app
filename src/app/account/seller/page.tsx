import { requireAnyRole } from "@/utils/auth/guards";

export default async function AccountSellerPage() {
  const user = await requireAnyRole(["CUSTOMER", "RESTAURANT_OWNER"]);

  return (
    <>
      <header className="account-page-heading">
        <p className="account-page-heading__eyebrow">Tài khoản</p>
        <h1 className="account-page-heading__title">Bán hàng cùng EatNow</h1>
        <p className="account-page-heading__description">
          Theo dõi trạng thái đăng ký mở quán và truy cập kênh người bán.
        </p>
      </header>

      <section className="account-card">
        <dl className="account-details">
          <div className="account-details__item">
            <dt className="account-details__label">Trạng thái người bán</dt>
            <dd className="account-details__value">
              {user.sellerStatus || "NOT_APPLIED"}
            </dd>
          </div>
        </dl>
        <p className="account-placeholder-note">
          Frontend không tự cấp quyền RESTAURANT_OWNER. Luồng đăng ký người bán
          sẽ được migrate ở Phase 6 sau khi backend chốt nguồn role.
        </p>
      </section>
    </>
  );
}
