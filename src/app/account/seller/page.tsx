import { requireAnyRole } from "@/utils/auth/guards";

export default async function AccountSellerPage() {
  const user = await requireAnyRole([
    "CUSTOMER",
    "RESTAURANT_OWNER",
    "RESTAURANT_STAFF",
  ]);

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
          Frontend không tự cấp quyền người bán. Mọi thay đổi vai trò đều phải
          được thực hiện bởi backend qua RPC có kiểm tra quyền.
        </p>
      </section>
    </>
  );
}
