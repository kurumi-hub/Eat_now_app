import type {
  CustomerOrderEvent,
  CustomerOrderJourney,
  CustomerOrderList,
  CustomerOrderSummary,
} from "@/types/customerOrders";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? value as UnknownRecord : {};
const text = (value: unknown, fallback = "") => typeof value === "string" ? value : fallback;
const optionalText = (value: unknown) => typeof value === "string" && value ? value : undefined;
const number = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function parseItems(value: unknown): CustomerOrderSummary["items"] {
  return Array.isArray(value) ? value.flatMap((raw) => {
    const item = record(raw);
    if (!text(item.id) || !text(item.name)) return [];
    return [{
      id: text(item.id),
      foodId: optionalText(item.food_id),
      name: text(item.name),
      size: optionalText(item.size),
      quantity: number(item.quantity),
      lineTotal: number(item.line_total),
      note: optionalText(item.note),
      imageUrl: optionalText(item.image_url),
    }];
  }) : [];
}

function parseSummary(value: unknown): CustomerOrderSummary | null {
  const item = record(value);
  if (!text(item.id) || !text(item.code)) return null;
  const restaurant = record(item.restaurant);
  const delivery = record(item.delivery);
  const payment = record(item.payment);
  const pricing = record(item.pricing);
  return {
    id: text(item.id), code: text(item.code), status: text(item.status),
    deliveryStatus: text(item.delivery_status), createdAt: text(item.created_at),
    updatedAt: text(item.updated_at), deliveredAt: optionalText(item.delivered_at),
    restaurant: {
      id: text(restaurant.id), slug: text(restaurant.slug), name: text(restaurant.name),
      address: text(restaurant.address), imageUrl: optionalText(restaurant.image_url),
    },
    delivery: {
      receiver: text(delivery.receiver), phone: text(delivery.phone), address: text(delivery.address),
    },
    payment: { method: text(payment.method), status: text(payment.status) },
    pricing: {
      subtotal: number(pricing.subtotal), shippingFee: number(pricing.shipping_fee),
      discount: number(pricing.discount), total: number(pricing.total),
    },
    items: parseItems(item.items),
  };
}

export const EMPTY_CUSTOMER_ORDERS: CustomerOrderList = { items: [], total: 0, limit: 50, offset: 0 };

export function customerOrderStatus(order: Pick<CustomerOrderSummary, "status" | "deliveryStatus">) {
  if (["delivery_review", "disputed", "failed"].includes(order.deliveryStatus)) {
    return { label: "Đơn cần hỗ trợ", tone: "issue" } as const;
  }
  if (["proof_submitted", "awaiting_customer_confirmation"].includes(order.deliveryStatus)) {
    return { label: "Chờ bạn xác nhận", tone: "active" } as const;
  }
  const delivery: Record<string, string> = {
    searching: "Đang tìm tài xế", assigned: "Đã có tài xế", arrived_at_restaurant: "Tài xế đã đến quán",
    picked_up: "Tài xế đã lấy món", delivering: "Đang giao đến bạn", delivered: "Đã giao",
  };
  if (delivery[order.deliveryStatus]) {
    return {
      label: delivery[order.deliveryStatus],
      tone: order.deliveryStatus === "delivered" ? "completed" : "active",
    } as const;
  }
  const status: Record<string, string> = {
    pending: "Chờ quán xác nhận", confirmed: "Quán đã nhận đơn", preparing: "Đang chuẩn bị món",
    ready: "Món đã sẵn sàng", delivering: "Đang giao đến bạn", completed: "Đã hoàn thành", cancelled: "Đã hủy",
  };
  return {
    label: status[order.status] || order.status,
    tone: order.status === "completed" ? "completed" : order.status === "cancelled" ? "cancelled" : "active",
  } as const;
}

export function parseCustomerOrders(value: unknown): CustomerOrderList {
  const source = record(value);
  return {
    items: Array.isArray(source.items) ? source.items.flatMap((raw) => {
      const item = parseSummary(raw);
      return item ? [item] : [];
    }) : [],
    total: number(source.total), limit: number(source.limit) || 50, offset: number(source.offset),
  };
}

function parseEvents(value: unknown): CustomerOrderEvent[] {
  return Array.isArray(value) ? value.flatMap((raw) => {
    const item = record(raw);
    if (item.id == null || !text(item.event_type)) return [];
    return [{
      id: String(item.id), eventType: text(item.event_type),
      fromOrderStatus: optionalText(item.from_order_status),
      toOrderStatus: optionalText(item.to_order_status),
      fromDeliveryStatus: optionalText(item.from_delivery_status),
      toDeliveryStatus: optionalText(item.to_delivery_status),
      source: text(item.source), note: optionalText(item.note), createdAt: text(item.created_at),
    }];
  }) : [];
}

export function parseCustomerOrderJourney(value: unknown): CustomerOrderJourney | null {
  const source = record(value);
  if (!text(source.order_id) || !text(source.code)) return null;
  return {
    orderId: text(source.order_id), code: text(source.code), status: text(source.status),
    deliveryStatus: text(source.delivery_status), createdAt: text(source.created_at),
    updatedAt: text(source.updated_at), acceptedAt: optionalText(source.accepted_at),
    preparingAt: optionalText(source.preparing_at), readyAt: optionalText(source.ready_at),
    shipperAssignedAt: optionalText(source.shipper_assigned_at),
    shipperArrivedAt: optionalText(source.shipper_arrived_at),
    pickupConfirmationRequestedAt: optionalText(source.pickup_confirmation_requested_at),
    pickupConfirmedAt: optionalText(source.pickup_confirmed_at), pickedUpAt: optionalText(source.picked_up_at),
    proofSubmittedAt: optionalText(source.proof_submitted_at), deliveredAt: optionalText(source.delivered_at),
    cancelReason: optionalText(source.cancel_reason), incidentStatus: text(source.incident_status, "none"),
    incidentReason: optionalText(source.incident_reason), responseDueAt: optionalText(source.response_due_at),
    preparationDueAt: optionalText(source.preparation_due_at),
    restaurantImageUrl: optionalText(source.restaurant_image_url),
    itemImages: Array.isArray(source.item_images) ? source.item_images.flatMap((raw) => {
      const item = record(raw);
      return text(item.order_item_id) ? [{
        orderItemId: text(item.order_item_id), foodId: optionalText(item.food_id),
        imageUrl: optionalText(item.image_url),
      }] : [];
    }) : [],
    events: parseEvents(source.events),
  };
}
