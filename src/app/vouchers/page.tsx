import VoucherPage from "@/components/voucher/VoucherPage";
import { getPublicVouchers } from "@/lib/data/vouchers";

export default async function VouchersRoute() {
  return <VoucherPage vouchers={await getPublicVouchers()} />;
}
