type JourneyEvent = {
  toOrderStatus?: string;
  toDeliveryStatus?: string;
  createdAt: string;
};

type JourneyStep = { value: string; label: string };

const ORDER_STEPS: JourneyStep[] = [
  { value: "pending", label: "Đơn mới" },
  { value: "confirmed", label: "Đã nhận" },
  { value: "preparing", label: "Chuẩn bị" },
  { value: "ready", label: "Sẵn sàng" },
  { value: "delivering", label: "Đang giao" },
  { value: "completed", label: "Hoàn tất" },
];

const DELIVERY_STEPS: JourneyStep[] = [
  { value: "searching", label: "Tìm tài xế" },
  { value: "assigned", label: "Đã nhận chuyến" },
  { value: "arrived_at_restaurant", label: "Đến quán" },
  { value: "picked_up", label: "Đã lấy món" },
  { value: "delivering", label: "Đang giao" },
  { value: "proof_submitted", label: "Chờ xác nhận" },
  { value: "delivered", label: "Đã giao" },
];

function reachedIndex(steps: JourneyStep[], status: string) {
  if (status === "unassigned") return -1;
  if (status === "awaiting_customer_confirmation") status = "proof_submitted";
  const index = steps.findIndex((step) => step.value === status);
  return index;
}

function eventTime(events: JourneyEvent[], kind: "order" | "delivery", value: string) {
  const event = events.find((item) =>
    kind === "order" ? item.toOrderStatus === value : item.toDeliveryStatus === value
  );
  if (!event) return undefined;
  const parsed = new Date(event.createdAt);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function JourneyLane({
  title,
  steps,
  status,
  kind,
  events,
}: {
  title: string;
  steps: JourneyStep[];
  status: string;
  kind: "order" | "delivery";
  events: JourneyEvent[];
}) {
  const current = reachedIndex(steps, status);
  const stopped = ["cancelled", "failed", "delivery_review", "disputed"].includes(status);

  return (
    <div className="order-journey__lane">
      <strong>{title}</strong>
      <ol>
        {steps.map((step, index) => {
          const done = !stopped && index <= current;
          const active = !stopped && index === current;
          const reachedAt = eventTime(events, kind, step.value);
          return (
            <li key={step.value} className={`${done ? "is-done" : ""}${active ? " is-active" : ""}`}>
              <i aria-hidden="true" />
              <span>{step.label}</span>
              {reachedAt ? <small>{reachedAt}</small> : null}
            </li>
          );
        })}
      </ol>
      {stopped ? <p>Luồng đang dừng ở trạng thái: {status}</p> : null}
    </div>
  );
}

export default function OrderJourneyTimeline({
  orderStatus,
  deliveryStatus,
  events = [],
}: {
  orderStatus: string;
  deliveryStatus: string;
  events?: JourneyEvent[];
}) {
  return (
    <section className="order-journey" aria-label="Hành trình đơn hàng">
      <JourneyLane title="Nhà hàng" steps={ORDER_STEPS} status={orderStatus} kind="order" events={events} />
      <JourneyLane title="Tài xế" steps={DELIVERY_STEPS} status={deliveryStatus} kind="delivery" events={events} />
    </section>
  );
}
