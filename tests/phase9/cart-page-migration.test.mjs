import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Cart route renders the migrated Cart Page as a public customer experience", async () => {
  const page = await readProjectFile("src", "app", "cart", "page.tsx");

  assert.match(page, /@\/components\/cart\/CartPage/);
  assert.match(page, /getCurrentPublicUser/);
  assert.doesNotMatch(page, /requireCurrentUser|requireAnyRole/);
  assert.doesNotMatch(page, /react-router-dom/);
});

test("Cart state is centralized in CartContext with reducer and localStorage persistence", async () => {
  const context = await readProjectFile(
    "src",
    "contexts",
    "CartContext.tsx"
  );
  const layout = await readProjectFile("src", "app", "layout.tsx");

  assert.match(context, /"use client"/);
  assert.match(context, /createContext/);
  assert.match(context, /useReducer/);
  assert.match(context, /CartProvider/);
  assert.match(context, /useCart/);
  assert.match(context, /CART_STORAGE_KEY/);
  assert.match(context, /localStorage/);
  assert.match(context, /addItem/);
  assert.match(context, /incrementQuantity/);
  assert.match(context, /decrementQuantity/);
  assert.match(context, /removeItem/);
  assert.match(context, /clearCart/);
  assert.doesNotMatch(context, /RESTAURANT_CONFLICT/);
  assert.match(layout, /CartProvider/);
});

test("Cart supports ordering items from multiple restaurants together", async () => {
  const context = await readProjectFile(
    "src",
    "contexts",
    "CartContext.tsx"
  );
  const cartComponent = await readProjectFile(
    "src",
    "components",
    "cart",
    "CartPage.tsx"
  );
  const checkoutComponent = await readProjectFile(
    "src",
    "components",
    "order",
    "CheckoutPage.tsx"
  );

  assert.match(context, /restaurantId: restaurant\.restaurantId/);
  assert.match(context, /restaurantSlug: restaurant\.restaurantSlug/);
  assert.match(context, /restaurantName: restaurant\.restaurantName/);
  assert.match(context, /getCartItemKey/);
  assert.match(context, /restaurantId\?: string/);
  assert.doesNotMatch(context, /cart\.restaurant\s*&&[\s\S]*return "RESTAURANT_CONFLICT"/);
  assert.match(cartComponent, /cartRestaurantGroups/);
  assert.match(cartComponent, /item\.restaurantName/);
  assert.match(checkoutComponent, /checkoutRestaurantGroups/);
  assert.match(checkoutComponent, /item\.restaurantName/);
});

test("Cart keeps customized menu variants separate and visible", async () => {
  const context = await readProjectFile(
    "src",
    "contexts",
    "CartContext.tsx"
  );
  const cartComponent = await readProjectFile(
    "src",
    "components",
    "cart",
    "CartPage.tsx"
  );
  const checkoutComponent = await readProjectFile(
    "src",
    "components",
    "order",
    "CheckoutPage.tsx"
  );

  assert.match(context, /customizationKey\?: string/);
  assert.match(context, /optionSummary\?: string\[\]/);
  assert.match(context, /note\?: string/);
  assert.match(context, /customizationKey \|\| "default"/);
  assert.match(cartComponent, /item\.optionSummary/);
  assert.match(cartComponent, /item\.note/);
  assert.match(checkoutComponent, /item\.optionSummary/);
  assert.match(checkoutComponent, /item\.note/);
});

test("Cart Page uses CartContext, MUI, Next assets, and context controls", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "cart",
    "CartPage.tsx"
  );

  assert.match(component, /"use client"/);
  assert.match(component, /@mui\/material/);
  assert.match(component, /from "next\/image"/);
  assert.match(component, /CustomerHeader/);
  assert.match(component, /useCart/);
  assert.match(component, /useState/);
  assert.match(component, /cartSubtotal/);
  assert.match(component, /handleIncreaseQuantity/);
  assert.match(component, /handleDecreaseQuantity/);
  assert.match(component, /handleRemoveItem/);
  assert.match(component, /cartRestaurantGroups/);
  assert.doesNotMatch(component, /mockCartItems|useState<CartItem\[\]>/);
  assert.doesNotMatch(component, /react-router-dom|localStorage|supabase|fetch\(/);
  assert.doesNotMatch(
    component,
    /className="[^"]*(?:rounded-\[|bg-\[|text-\[|(?:^|\s)(?:flex|grid)(?:\s|"))/
  );
});

test("Restaurant detail add button writes available items into CartContext", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "RestaurantDetailPage.tsx"
  );

  assert.match(component, /useCart/);
  assert.match(component, /addItem/);
  assert.match(component, /restaurantId: restaurant\.slug/);
  assert.match(component, /restaurantName: restaurant\.name/);
  assert.match(component, /foodId: item\.id/);
  assert.match(component, /price: unitPrice/);
  assert.match(component, /Đã thêm/);
  assert.doesNotMatch(component, /RESTAURANT_CONFLICT/);
  assert.doesNotMatch(component, /Tính năng thêm .* sprint tiếp theo/);
});

test("Cart CSS is imported globally and responsive", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const css = await readProjectFile("src", "styles", "cart.css");

  assert.match(layout, /@\/styles\/cart\.css/);
  assert.match(css, /\.cart-page/);
  assert.match(css, /\.cart-layout/);
  assert.match(css, /\.cart-items-card/);
  assert.match(css, /\.cart-summary-card/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /overflow-x: hidden/);
});

test("Customer header cart action links to the Cart route", async () => {
  const header = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );

  assert.match(header, /href="\/cart"/);
  assert.doesNotMatch(
    header,
    /Giá» hÃ ng sáº½ Ä‘Æ°á»£c triá»ƒn khai|Gio hang se duoc trien khai/
  );
});

test("Cart item images use existing local assets", async () => {
  await Promise.all(
    ["food-com-tam.png", "food-tra-dao.png"].map((assetName) =>
      access(join(root, "public", "images", "home", assetName))
    )
  );
});
