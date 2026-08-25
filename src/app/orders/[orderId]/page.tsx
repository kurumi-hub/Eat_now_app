import { notFound } from "next/navigation";

import CustomerOrderDetailPage, { type CustomerOrderDetailView } from "@/components/order/CustomerOrderDetailPage";
import type { CustomerDeliveryData } from "@/components/order/CustomerDeliveryPanel";
import { parseCustomerOrderJourney } from "@/lib/data/customerOrders";
import type { CustomerOrderJourney } from "@/types/customerOrders";
import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";

type OrderDetailRouteProps = { params: Promise<{ orderId: string }> };

type RawOrderDetail = {
  id: string;
  code: string;
  status: string;
  created_at: string;
  delivered_at: string | null;
  restaurant: { id: string; name: string; address: string; phone: string | null };
  shipper: {
    id: string; name: string; phone: string | null; vehicle: string | null;
    plate: string | null; lat: number | null; lon: number | null;
  } | null;
  delivery: { address: string; receiver: string; phone: string; note: string | null; distance_km: number | null };
  items: Array<{
    id?: string; food_id?: string | null; name: string; size: string | null;
    quantity: number; unit_price: number; line_total: number; note: string | null;
    toppings: Array<{ name: string; price: number }>;
  }>;
  payment: { method: string; status: string; amount: number; paid_at: string | null } | null;
  pricing: {
    subtotal: number; shipping_fee: number; packaging_fee?: number; service_fee?: number;
    small_order_fee?: number; payment_fee?: number; other_fee?: number; tax_amount?: number;
    tip_amount?: number; discount: number; total: number;
  };
  charges?: Array<{ type: string; code: string; name: string; amount: number }>;
  timeline: Array<{ status: string; at: string; note: string | null }>;
};

function object(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function fallbackJourney(order: RawOrderDetail, deliveryStatus: string): CustomerOrderJourney {
  const at = (status: string) => order.timeline.find((item) => item.status === status)?.at;
  return {
    orderId: order.id, code: order.code, status: order.status, deliveryStatus,
    createdAt: order.created_at, updatedAt: order.delivered_at || order.created_at,
    acceptedAt: at("confirmed"), preparingAt: at("preparing"), readyAt: at("ready"),
    deliveredAt: order.delivered_at || at("completed"), incidentStatus: "none",
    itemImages: [], events: order.timeline.map((item, index) => ({
      id: `legacy-${index}`, eventType: "legacy_status", toOrderStatus: item.status,
      source: "legacy", note: item.note || undefined, createdAt: item.at,
    })),
  };
}

export default async function OrderDetailRoute({ params }: OrderDetailRouteProps) {
  const { orderId } = await params;
  const user = await requireCurrentUser();
  const supabase = await createClient();
  const [detailResult, journeyResult, deliveryResult] = await Promise.all([
    supabase.rpc("get_order_detail", { p_order_id: orderId }),
    supabase.rpc("api_get_customer_order_journey", { p_order_id: orderId }),
    supabase.rpc("api_get_customer_delivery", { p_order_id: orderId }),
  ]);
  if (detailResult.error || !detailResult.data) {
    console.error("[orders] get_order_detail thất bại", detailResult.error?.message);
    notFound();
  }
  if (journeyResult.error) console.error("[orders] Không tải được hành trình SQL 40", journeyResult.error.message);
  if (deliveryResult.error) console.error("[orders] Không tải được tracking", deliveryResult.error.message);

  const rawOrder = detailResult.data as RawOrderDetail;
  const deliverySource = object(deliveryResult.data);
  const deliveryStatus = typeof deliverySource.delivery_status === "string"
    ? deliverySource.delivery_status : rawOrder.status === "completed" ? "delivered" : rawOrder.status;
  const journey = parseCustomerOrderJourney(journeyResult.data)
    || fallbackJourney(rawOrder, deliveryStatus);
  const imageByOrderItem = new Map(journey.itemImages.map((item) => [item.orderItemId, item.imageUrl]));
  const imageByFood = new Map(journey.itemImages.flatMap((item) => item.foodId ? [[item.foodId, item.imageUrl] as const] : []));
  const voucherCharges = (rawOrder.charges ?? []).filter(
    (charge) => charge.type === "voucher_discount" && charge.amount < 0
  );
  const view: CustomerOrderDetailView = {
    id: rawOrder.id, code: rawOrder.code, status: rawOrder.status,
    deliveryStatus: journey.deliveryStatus || deliveryStatus, createdAt: rawOrder.created_at,
    restaurant: {
      id: rawOrder.restaurant.id, name: rawOrder.restaurant.name,
      address: rawOrder.restaurant.address, phone: rawOrder.restaurant.phone || undefined,
      imageUrl: journey.restaurantImageUrl,
    },
    shipper: rawOrder.shipper ? {
      name: rawOrder.shipper.name, phone: rawOrder.shipper.phone || undefined,
      vehicle: rawOrder.shipper.vehicle || undefined, plate: rawOrder.shipper.plate || undefined,
    } : null,
    delivery: {
      address: rawOrder.delivery.address, receiver: rawOrder.delivery.receiver,
      phone: rawOrder.delivery.phone, note: rawOrder.delivery.note || undefined,
    },
    items: rawOrder.items.map((item, index) => {
      const id = item.id || `item-${index}`;
      return {
        id, foodId: item.food_id || undefined, name: item.name, size: item.size || undefined,
        quantity: Number(item.quantity), unitPrice: Number(item.unit_price), lineTotal: Number(item.line_total),
        note: item.note || undefined,
        imageUrl: imageByOrderItem.get(id) || (item.food_id ? imageByFood.get(item.food_id) : undefined),
        toppings: Array.isArray(item.toppings) ? item.toppings.map((topping) => ({
          name: topping.name, price: Number(topping.price),
        })) : [],
      };
    }),
    payment: rawOrder.payment ? {
      method: rawOrder.payment.method, status: rawOrder.payment.status,
      paidAt: rawOrder.payment.paid_at || undefined,
    } : null,
    pricing: {
      subtotal: Number(rawOrder.pricing.subtotal), shippingFee: Number(rawOrder.pricing.shipping_fee),
      packagingFee: Number(rawOrder.pricing.packaging_fee || 0), serviceFee: Number(rawOrder.pricing.service_fee || 0),
      smallOrderFee: Number(rawOrder.pricing.small_order_fee || 0), paymentFee: Number(rawOrder.pricing.payment_fee || 0),
      otherFee: Number(rawOrder.pricing.other_fee || 0), taxAmount: Number(rawOrder.pricing.tax_amount || 0),
      tipAmount: Number(rawOrder.pricing.tip_amount || 0), discount: Number(rawOrder.pricing.discount),
      total: Number(rawOrder.pricing.total),
    },
    voucherCharges: voucherCharges.map((charge) => ({
      code: charge.code, name: charge.name, amount: Number(charge.amount),
    })),
  };

  const proofSource = object(deliverySource.proof);
  const locationSource = object(deliverySource.latest_location);
  let proofUrl: string | undefined;
  if (typeof proofSource.object_path === "string") {
    const { data } = await supabase.storage.from("delivery-proof")
      .createSignedUrl(proofSource.object_path, 600);
    proofUrl = data?.signedUrl;
  }
  const lat = Number(locationSource.lat); const lon = Number(locationSource.lon);
  const deliveryPanel: CustomerDeliveryData | null = typeof deliverySource.delivery_status === "string" ? {
    orderId, deliveryStatus: deliverySource.delivery_status,
    canConfirm: deliverySource.can_confirm === true,
    proof: typeof proofSource.status === "string" ? {
      note: typeof proofSource.note === "string" ? proofSource.note : undefined,
      status: proofSource.status, submittedAt: String(proofSource.submitted_at || ""),
    } : null,
    proofUrl,
    latestLocation: Number.isFinite(lat) && Number.isFinite(lon) ? {
      lat, lon, accuracyM: locationSource.accuracy_m == null ? undefined : Number(locationSource.accuracy_m),
      recordedAt: String(locationSource.recorded_at || ""),
    } : null,
  } : null;

  return <CustomerOrderDetailPage user={user} order={view} journey={journey} deliveryPanel={deliveryPanel} />;
}
