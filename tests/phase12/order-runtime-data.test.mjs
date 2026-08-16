import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Order runtime mock data matches the current temporary frontend cart data", async () => {
  const cartData = await readProjectFile("src", "components", "cart", "cartData.ts");
  const orderData = await readProjectFile("src", "components", "order", "orderData.ts");
  const restaurantData = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "restaurantDetailData.ts"
  );

  assert.match(cartData, /foodId: "tra-dao"/);
  assert.match(cartData, /name: "Trà đào"/);
  assert.match(cartData, /price: 10000/);
  assert.match(restaurantData, /id: "tra-dao"/);
  assert.match(restaurantData, /name: "Trà đào"/);
  assert.match(restaurantData, /price: 10000/);

  assert.match(orderData, /foodId: "tra-dao"/);
  assert.match(orderData, /name: "Trà đào"/);
  assert.match(orderData, /subtotal: 85000/);
  assert.match(orderData, /total: 100000/);
  assert.doesNotMatch(orderData, /tra-dao-cam-sa|Trà đào cam sả/);
});

test("Checkout runtime can use temporary frontend cart data before local cart hydration", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "order",
    "CheckoutPage.tsx"
  );
  const context = await readProjectFile("src", "contexts", "CartContext.tsx");

  assert.match(component, /mockCartItems/);
  assert.match(component, /checkoutCart/);
  assert.match(component, /cart\.items\.length > 0/);
  assert.match(context, /buildTemporaryCheckoutSnapshot/);
  assert.match(context, /mockCartItems/);
});

test("CartContext defers browser storage reads until after client hydration", async () => {
  const context = await readProjectFile("src", "contexts", "CartContext.tsx");

  assert.match(context, /useReducer\(checkoutSnapshotReducer, null\)/);
  assert.match(context, /useReducer\(lastOrderReducer, null\)/);
  assert.match(context, /useReducer\(orderHistoryReducer, \[\]\)/);
  assert.match(context, /setCheckoutSnapshot\(readStoredCheckoutSnapshot\(\)\)/);
  assert.match(context, /setLastOrder\(readStoredOrderReceipt\(\)\)/);
  assert.match(context, /setOrderHistory\(readStoredOrderHistory\(\)\)/);
  assert.doesNotMatch(
    context,
    /useState<CheckoutSnapshot \| null>\(\(\) =>\s*readStoredCheckoutSnapshot\(\)\)/
  );
  assert.doesNotMatch(
    context,
    /useState<OrderReceipt\[\]>\(\(\) =>\s*readStoredOrderHistory\(\)\)/
  );
});
