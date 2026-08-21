import { notFound } from "next/navigation";

import OrderSuccessPage, { type OrderSuccessSummary } from "@/components/order/OrderSuccessPage";
import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

type OrderSuccessRouteProps = {
  searchParams: Promise<{ orderId?: string | string[] }>;
};

type OrderDetailResult = {
  id: string;
  code: string;
  status: string;
  restaurant: { name: string };
  delivery: { address: string };
  payment: { method: string; status: string } | null;
  pricing: { total: number };
};

export default async function OrderSuccessRoute({ searchParams }: OrderSuccessRouteProps) {
  const params = await searchParams;
  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
  if (!orderId) notFound();

  await requireCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_detail", { p_order_id: orderId });
  if (error || !data) {
    console.error("get_order_detail success page error:", error?.message);
    notFound();
  }

  const detail = data as OrderDetailResult;
  const order: OrderSuccessSummary = {
    id: detail.id,
    code: detail.code,
    status: detail.status,
    restaurantName: detail.restaurant?.name ?? "Nhà hàng",
    deliveryAddress: detail.delivery?.address ?? "Địa chỉ giao hàng",
    total: detail.pricing?.total ?? 0,
    paymentMethod: detail.payment?.method ?? "cod",
    paymentStatus: detail.payment?.status ?? "pending",
  };

  return <OrderSuccessPage order={order} />;
}
