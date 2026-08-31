import AccountHeader from "@/components/account/AccountHeader";
import AddressBookPanel from "@/components/account/AddressBookPanel";
import { getCurrentUserAddresses } from "@/lib/data/addresses";
import { requireAnyRole } from "@/utils/auth/guards";

export default async function AccountAddressesPage() {
  const user = await requireAnyRole(["CUSTOMER"]);
  const addresses = await getCurrentUserAddresses();

  return (
    <>
      <AccountHeader
        title="Địa chỉ giao hàng"
        description="Danh sách địa chỉ dùng cho đơn hàng của khách hàng."
      />
      <AddressBookPanel user={user} initialAddresses={addresses} />
    </>
  );
}
