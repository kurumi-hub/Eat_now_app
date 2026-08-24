import type { AdminOrderList } from "@/types/admin";

type Row = Record<string, unknown>;
const row = (value: unknown): Row => typeof value === "object" && value !== null && !Array.isArray(value) ? value as Row : {};
const text = (value: unknown) => typeof value === "string" ? value : "";
const optional = (value: unknown) => typeof value === "string" && value ? value : undefined;
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
export const EMPTY_ADMIN_ORDERS: AdminOrderList = { items: [], total: 0, limit: 30, offset: 0 };
export function parseAdminOrders(value: unknown): AdminOrderList {
  const source = row(value); const items = Array.isArray(source.items) ? source.items.flatMap((raw) => {
    const item = row(raw); if (!text(item.id)) return [];
    const sla = row(item.sla);
    return [{ id: text(item.id), code: text(item.code), status: text(item.status),
      deliveryStatus: text(item.delivery_status), version: number(item.version),
      restaurantName: text(item.restaurant_name), customerName: text(item.customer_name),
      customerPhone: text(item.customer_phone), shipperName: optional(item.shipper_name),
      totalPrice: number(item.total_price), paymentMethod: text(item.payment_method),
      paymentStatus: text(item.payment_status), transactionId: optional(item.transaction_id),
      incidentStatus: text(item.incident_status), incidentReason: optional(item.incident_reason),
      createdAt: text(item.created_at), slaState: (["running","overdue"].includes(text(sla.state)) ? text(sla.state) : "ok") as "ok" | "running" | "overdue",
      slaCode: optional(sla.code), slaDueAt: optional(sla.due_at), slaOverdueMinutes: number(sla.overdue_minutes),
      events: Array.isArray(item.events) ? item.events.map((rawEvent) => {
        const event = row(rawEvent); return { id: text(event.id), eventType: text(event.event_type),
          fromOrderStatus: optional(event.from_order_status), toOrderStatus: optional(event.to_order_status),
          fromDeliveryStatus: optional(event.from_delivery_status), toDeliveryStatus: optional(event.to_delivery_status),
          source: text(event.source), note: optional(event.note), createdAt: text(event.created_at) }; }) : [] }];
  }) : [];
  return { items, total: number(source.total), limit: number(source.limit) || 30, offset: number(source.offset) };
}
