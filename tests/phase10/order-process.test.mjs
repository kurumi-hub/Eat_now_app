import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Order process App Router pages are public customer checkout routes", async () => {
  const checkoutRoute = await readProjectFile("src", "app", "checkout", "page.tsx");
  const successRoute = await readProjectFile(
    "src",
    "app",
    "orders",
    "success",
    "page.tsx"
  );
  const errorRoute = await readProjectFile(
    "src",
    "app",
    "orders",
    "error",
    "page.tsx"
  );

  assert.match(checkoutRoute, /@\/components\/order\/CheckoutPage/);
  assert.match(checkoutRoute, /getCurrentPublicUser/);
  assert.match(successRoute, /@\/components\/order\/OrderSuccessPage/);
  assert.match(errorRoute, /@\/components\/order\/OrderCreationErrorPage/);
  assert.doesNotMatch(
    `${checkoutRoute}\n${successRoute}\n${errorRoute}`,
    /requireCurrentUser|requireAnyRole|react-router-dom/
  );
});

test("Cart context stores checkout snapshots and local order receipts", async () => {
  const context = await readProjectFile("src", "contexts", "CartContext.tsx");

  assert.match(context, /CHECKOUT_STORAGE_KEY/);
  assert.match(context, /ORDER_RECEIPT_STORAGE_KEY/);
  assert.match(context, /restaurantNote/);
  assert.match(context, /checkoutSnapshot/);
  assert.match(context, /lastOrder/);
  assert.match(context, /prepareCheckout/);
  assert.match(context, /updateRestaurantNote/);
  assert.match(context, /createOrder/);
  assert.match(context, /clearLastOrder/);
  assert.match(context, /CLEAR_CART/);
});

test("Cart checkout action prepares the snapshot and navigates to checkout", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "cart",
    "CartPage.tsx"
  );

  assert.match(component, /prepareCheckout/);
  assert.match(component, /updateRestaurantNote/);
  assert.match(component, /router\.push\("\/checkout"\)/);
  assert.doesNotMatch(component, /Thanh toán COD .* bước tiếp theo/i);
});

test("Checkout page implements COD form validation, submission, retry, and information-changed states", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "order",
    "CheckoutPage.tsx"
  );
  const data = await readProjectFile("src", "components", "order", "orderData.ts");

  assert.match(component, /"use client"/);
  assert.match(component, /useCart/);
  assert.match(component, /validateCheckoutValues/);
  assert.match(component, /isSubmitting/);
  assert.match(component, /informationChangedOpen/);
  assert.match(component, /createOrder/);
  assert.match(component, /paymentMethod: "cod"/);
  assert.match(component, /router\.push\(`\/orders\/success\?orderId=\$\{createdOrder\.id\}`\)/);
  assert.match(component, /router\.push\("\/orders\/error"\)/);
  assert.match(component, /orderCheckoutValidationSummaryClassName/);
  assert.match(component, /orderInformationModalClassName/);
  assert.match(data, /validateCheckoutValues/);
  assert.match(data, /normalizeCheckoutValues/);
  assert.match(data, /mockDeliveryFee/);
});

test("Checkout submission shows a branded loading card for 3 to 4 seconds", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "order",
    "CheckoutPage.tsx"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "order",
    "tailwindClasses.ts"
  );
  const globals = await readProjectFile("src", "app", "globals.css");

  assert.match(component, /SUBMISSION_LOADING_DELAY_MS\s*=\s*3500/);
  assert.match(component, /setTimeout\(resolve,\s*SUBMISSION_LOADING_DELAY_MS\)/);
  assert.match(component, /orderSubmissionCardClassName/);
  assert.match(component, /orderSubmissionSpinnerClassName/);
  assert.match(component, /orderSubmissionProgressClassName/);
  assert.match(component, /Vui lòng không đóng hoặc tải lại trang/);
  assert.match(helper, /orderSubmissionProgressBarClassName/);
  assert.match(globals, /@keyframes orderSubmissionProgress/);
});

test("Checkout keeps the loading overlay active while routing away after submit", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "order",
    "CheckoutPage.tsx"
  );

  assert.match(component, /let hasStartedNavigation = false/);
  assert.match(
    component,
    /hasStartedNavigation = true;\s*router\.push\(`\/orders\/success\?orderId=\$\{createdOrder\.id\}`\);/
  );
  assert.match(
    component,
    /finally\s*{\s*if \(!hasStartedNavigation\) {\s*setIsSubmitting\(false\);\s*}\s*}/
  );
  assert.doesNotMatch(
    component,
    /finally\s*{\s*setIsSubmitting\(false\);\s*}/
  );
});

test("Order result pages render receipt success and creation error recovery", async () => {
  const successComponent = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderSuccessPage.tsx"
  );
  const errorComponent = await readProjectFile(
    "src",
    "components",
    "order",
    "OrderCreationErrorPage.tsx"
  );

  assert.match(successComponent, /useCart/);
  assert.match(successComponent, /lastOrder/);
  assert.match(successComponent, /clearCart/);
  assert.match(successComponent, /orderResultCardClassName/);
  assert.match(successComponent, /Theo dõi đơn hàng|order-tracking/i);
  assert.match(errorComponent, /orderResultCardClassName/);
  assert.match(errorComponent, /href="\/checkout"/);
  assert.match(errorComponent, /href="\/cart"/);
});

test("Order process helper covers checkout, result, and order management surfaces", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const helper = await readProjectFile(
    "src",
    "components",
    "order",
    "tailwindClasses.ts"
  );

  assert.doesNotMatch(layout, /@\/styles\/order-process\.css/);
  assert.match(helper, /orderCheckoutLayoutClassName/);
  assert.match(helper, /orderInformationModalClassName/);
  assert.match(helper, /orderSubmissionOverlayClassName/);
  assert.match(helper, /orderResultCardClassName/);
  assert.match(helper, /orderHistoryPageClassName/);
  assert.match(helper, /orderDetailPageClassName/);
  assert.match(helper, /orderTrackingPageClassName/);
  assert.match(helper, /orderReorderModalClassName/);
  assert.match(helper, /max-\[900px\]:/);
  assert.match(helper, /max-\[640px\]:/);
});
