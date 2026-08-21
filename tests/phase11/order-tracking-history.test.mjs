import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Order history, detail, and tracking routes render public customer order pages", async () => {
  const historyRoute = await readProjectFile("src", "app", "orders", "page.tsx");
  const detailRoute = await readProjectFile(
    "src",
    "app",
    "orders",
    "[orderId]",
    "page.tsx"
  );
  const trackingRoute = await readProjectFile(
    "src",
    "app",
    "orders",
    "[orderId]",
    "tracking",
    "page.tsx"
  );

  assert.match(historyRoute, /@\/components\/order\/OrderHistoryPage/);
  assert.match(detailRoute, /@\/components\/order\/OrderDetailPage/);
  assert.match(trackingRoute, /@\/components\/order\/OrderTrackingPage/);
  assert.match(`${historyRoute}\n${detailRoute}\n${trackingRoute}`, /getCurrentPublicUser/);
  assert.doesNotMatch(
    `${historyRoute}\n${detailRoute}\n${trackingRoute}`,
    /requireCurrentUser|requireAnyRole|react-router-dom/
  );
});

test("CartContext persists local order history and can find orders by id", async () => {
  const context = await readProjectFile("src", "contexts", "CartContext.tsx");

  assert.match(context, /ORDER_HISTORY_STORAGE_KEY/);
  assert.match(context, /orderHistory/);
  assert.match(context, /addOrderToHistory/);
  assert.match(context, /getOrderById/);
  assert.match(context, /OrderStatus/);
  assert.match(context, /status: "pending"/);
  assert.match(context, /setOrderHistory/);
});

test("Order data exposes local and mock order records for pending detail, tracking, and history", async () => {
  const data = await readProjectFile("src", "components", "order", "orderData.ts");

  assert.match(data, /OrderDisplayRecord/);
  assert.match(data, /mockOrderHistory/);
  assert.match(data, /mockPendingOrder/);
  assert.match(data, /mockTrackingOrder/);
  assert.match(data, /getMergedOrderHistory/);
  assert.match(data, /findOrderRecordById/);
  assert.match(data, /orderTimelineSteps/);
  assert.match(data, /formatOrderDateTime/);
});

test("Local multi-restaurant orders keep restaurant labels across receipt and reorder", async () => {
  const data = await readProjectFile("src", "components", "order", "orderData.ts");
  const success = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderSuccessPage.tsx"
  );
  const history = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderHistoryPage.tsx"
  );

  assert.match(data, /getOrderRestaurantLabel/);
  assert.match(data, /item\.restaurantName/);
  assert.match(success, /getReceiptRestaurantLabel/);
  assert.match(success, /lastOrder\.items/);
  assert.match(history, /item\.restaurantSlug \|\| order\.restaurantSlug/);
  assert.doesNotMatch(history, /if \(index === 0\)/);
});

test("Order history page includes filters, status chips, detail links, and reorder actions", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderHistoryPage.tsx"
  );

  assert.match(component, /"use client"/);
  assert.match(component, /CustomerHeader/);
  assert.match(component, /getMergedOrderHistory/);
  assert.match(component, /order-history-page/);
  assert.match(component, /order-history-filter-panel/);
  assert.match(component, /order-history-card/);
  assert.match(component, /href=\{`\/orders\/\$\{order\.id\}`\}/);
  assert.match(component, /Đặt lại|Reorder/i);
});

test("Order detail pending page renders pending status, timeline, items, delivery address, and cancel action", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderDetailPage.tsx"
  );

  assert.match(component, /"use client"/);
  assert.match(component, /findOrderRecordById/);
  assert.match(component, /order-detail-page/);
  assert.match(component, /order-detail-status-card/);
  assert.match(component, /Chờ xác nhận/);
  assert.match(component, /order-detail-timeline/);
  assert.match(component, /order-detail-cancel-button/);
  assert.match(component, /href=\{`\/orders\/\$\{order\.id\}\/tracking`\}/);
});

test("Order tracking page renders ETA map, timeline, summary, and support action", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderTrackingPage.tsx"
  );

  assert.match(component, /"use client"/);
  assert.match(component, /mockTrackingOrder/);
  assert.match(component, /order-tracking-page/);
  assert.match(component, /order-tracking-map/);
  assert.match(component, /order-tracking-eta-card/);
  assert.match(component, /order-tracking-timeline/);
  assert.match(component, /order-tracking-summary-card/);
  assert.match(component, /Hỗ trợ/);
});

test("Success and shared customer navigation link into order tracking and history", async () => {
  const success = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderSuccessPage.tsx"
  );
  const header = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );

  assert.match(success, /href=\{`\/orders\/\$\{lastOrder\.id\}\/tracking`\}/);
  assert.doesNotMatch(success, /Theo dõi đơn hàng sẽ được bổ sung/);
  assert.match(header, /href="\/orders"/);
  assert.doesNotMatch(header, /Đơn hàng sẽ được triển khai ở sprint tiếp theo/);
});

test("Order process CSS covers history detail and tracking responsive layouts", async () => {
  const css = await readProjectFile("src", "styles", "order-process.css");

  assert.match(css, /\.order-history-page/);
  assert.match(css, /\.order-history-layout/);
  assert.match(css, /\.order-detail-page/);
  assert.match(css, /\.order-detail-layout/);
  assert.match(css, /\.order-tracking-page/);
  assert.match(css, /\.order-tracking-layout/);
  assert.match(css, /\.order-tracking-map/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
});
