import AddressManager from "@/components/account/AddressManager";
import { getCurrentUserAddresses } from "@/lib/data/addresses";

export default async function AccountAddressesPage() {
  const addresses = await getCurrentUserAddresses();

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
        <AddressManager addresses={addresses} />
      </section>
    </>
  );
}
