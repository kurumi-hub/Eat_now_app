import CustomerOrderHistoryPage from "@/components/order/CustomerOrderHistoryPage";
import { EMPTY_CUSTOMER_ORDERS, parseCustomerOrders } from "@/lib/data/customerOrders";
import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

type OrdersPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await requireCurrentUser();
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("api_list_customer_orders", {
    p_status: null, p_search: null, p_limit: 100, p_offset: 0,
  });
  if (error) console.error("[orders] Không thể tải lịch sử đơn", error.message);
  const payment = first(params.payment);
  const paymentNotice = payment === "invalid"
    ? "Kết quả thanh toán không hợp lệ. Hãy mở đơn gần nhất để kiểm tra trạng thái."
    : payment === "failed"
      ? "Thanh toán chưa thành công. Đơn liên quan sẽ hiển thị trạng thái mới nhất."
      : undefined;
  return <CustomerOrderHistoryPage
    user={user}
    data={error ? EMPTY_CUSTOMER_ORDERS : parseCustomerOrders(data)}
    loadError={error ? "Không thể tải lịch sử đơn hàng. Hãy chạy SQL 40 và thử lại." : undefined}
    paymentNotice={paymentNotice}
  />;
}
