import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

const routeConsumers = [
  {
    route: ["src", "app", "page.tsx"],
    renderPattern:
      /<HomePage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "restaurants", "page.tsx"],
    renderPattern:
      /<RestaurantsPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "restaurants", "[restaurantId]", "page.tsx"],
    renderPattern:
      /<RestaurantDetailPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "search", "page.tsx"],
    renderPattern:
      /<SearchFilterPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "cart", "page.tsx"],
    renderPattern:
      /<CartPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "checkout", "page.tsx"],
    renderPattern:
      /<CheckoutPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "orders", "page.tsx"],
    renderPattern:
      /<OrderHistoryPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "orders", "[orderId]", "page.tsx"],
    renderPattern:
      /<OrderDetailPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "orders", "[orderId]", "tracking", "page.tsx"],
    renderPattern:
      /<OrderTrackingPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
  {
    route: ["src", "app", "vouchers", "page.tsx"],
    renderPattern:
      /<VoucherPage[\s\S]*deliveryLocationLabel=\{deliveryLocationLabel\}/,
  },
];

const headerComponents = [
  ["src", "components", "home", "HomePage.tsx"],
  ["src", "components", "restaurant", "RestaurantsPage.tsx"],
  ["src", "components", "restaurant", "RestaurantDetailPage.tsx"],
  ["src", "components", "search", "SearchFilterPage.tsx"],
  ["src", "components", "cart", "CartPage.tsx"],
  ["src", "components", "order", "CheckoutPage.tsx"],
  ["src", "components", "order", "OrderHistoryPage.tsx"],
  ["src", "components", "order", "OrderDetailPage.tsx"],
  ["src", "components", "order", "OrderTrackingPage.tsx"],
  ["src", "components", "voucher", "VoucherPage.tsx"],
  ["src", "components", "account", "AccountLayout.tsx"],
];

test("Delivery location label is resolved from backend addresses once per route", async () => {
  await access(join(root, "src", "lib", "data", "deliveryLocation.ts"));
  const helper = await readProjectFile("src", "lib", "data", "deliveryLocation.ts");

  assert.match(helper, /import "server-only"/);
  assert.match(helper, /getCurrentUserAddresses/);
  assert.match(helper, /getDeliveryLocationLabel/);
  assert.match(helper, /hasRole/);
  assert.match(helper, /getCurrentDeliveryLocationLabel/);

  for (const consumer of routeConsumers) {
    const route = await readProjectFile(...consumer.route);

    assert.match(route, /getCurrentDeliveryLocationLabel/);
    assert.match(
      route,
      /const deliveryLocationLabel = await getCurrentDeliveryLocationLabel\(user\)/
    );
    assert.match(route, consumer.renderPattern);
  }
});

test("Every customer header surface receives the backend delivery location label", async () => {
  const beforeLoginPage = await readProjectFile(
    "src",
    "components",
    "home",
    "BeforeLoginHomePage.tsx"
  );

  assert.match(beforeLoginPage, /deliveryLocationLabel\?: string/);
  assert.match(beforeLoginPage, /<span>\{deliveryLocationLabel\}<\/span>/);
  assert.doesNotMatch(beforeLoginPage, /<span>Ninh Kiều, Cần Thơ<\/span>/);

  for (const componentPath of headerComponents) {
    const component = await readProjectFile(...componentPath);

    assert.match(component, /deliveryLocationLabel\?: string/);
    assert.match(
      component,
      /deliveryLocationLabel=\{deliveryLocationLabel\}/
    );
    assert.doesNotMatch(component, /<span>Ninh Kiều, Cần Thơ<\/span>/);
  }
});

test("Search location copy uses the same backend label as the header", async () => {
  const searchComponent = await readProjectFile(
    "src",
    "components",
    "search",
    "SearchFilterPage.tsx"
  );

  assert.match(searchComponent, /Tìm kiếm quanh \{deliveryLocationLabel\}/);
  assert.match(
    searchComponent,
    /Tìm thấy \{filteredResults\.length\} \{resultLabel\} tại \{deliveryLocationLabel\}/
  );
  assert.match(searchComponent, /Khu vực \(\{deliveryLocationLabel\}\)/);
  assert.doesNotMatch(searchComponent, /Tìm kiếm quanh Ninh Kiều, Cần Thơ/);
  assert.doesNotMatch(searchComponent, /Khu vực \(Cần Thơ\)/);
  assert.doesNotMatch(searchComponent, /: "Cần Thơ"/);
});
