import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Restaurant detail route renders the migrated UI from local data", async () => {
  const page = await readProjectFile(
    "src",
    "app",
    "restaurants",
    "[restaurantId]",
    "page.tsx"
  );

  assert.match(page, /@\/components\/restaurant\/RestaurantDetailPage/);
  assert.match(page, /getRestaurantDetailBySlug/);
  assert.match(page, /notFound/);
  assert.doesNotMatch(page, /react-router-dom/);
});

test("Restaurant detail components use MUI, Next assets, and no Tailwind classes", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "RestaurantDetailPage.tsx"
  );
  const data = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "restaurantDetailData.ts"
  );

  assert.match(component, /"use client"/);
  assert.match(component, /from "next\/image"/);
  assert.match(component, /@mui\/material/);
  assert.doesNotMatch(component, /ShoppingBasketOutlinedIcon/);
  assert.doesNotMatch(component, /restaurant-cart-bar/);
  assert.doesNotMatch(component, /cartCount|Xem giỏ hàng/);
  assert.match(data, /com-tam-sau-hieu/);
  assert.match(data, /Cơm Tấm Sáu Hiếu/);
  assert.match(data, /menuCategories/);
  assert.doesNotMatch(`${component}\n${data}`, /react-router-dom/);
  assert.doesNotMatch(
    component,
    /className="[^"]*(?:rounded-\[|bg-\[|text-\[|(?:^|\s)(?:flex|grid)(?:\s|"))/
  );
});

test("Restaurant detail CSS is imported globally and responsive", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const css = await readProjectFile(
    "src",
    "styles",
    "restaurant-detail.css"
  );

  assert.match(layout, /@\/styles\/restaurant-detail\.css/);
  assert.match(css, /\.restaurant-detail-page/);
  assert.doesNotMatch(css, /\.restaurant-cart-bar/);
  assert.match(css, /\.restaurant-bottom-nav/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /overflow-x: hidden/);
});

test("Home restaurant cards link to the restaurant detail route", async () => {
  const homeData = await readProjectFile(
    "src",
    "components",
    "home",
    "homeData.ts"
  );
  const homePage = await readProjectFile(
    "src",
    "components",
    "home",
    "HomePage.tsx"
  );

  assert.match(homeData, /slug:\s*"com-tam-sau-hieu"/);
  assert.match(homePage, /href=\{`\/restaurants\/\$\{restaurant\.slug\}`\}/);
});

test("Restaurant detail local images are available", async () => {
  await Promise.all(
    [
      "restaurant-com-tam.png",
      "food-com-tam.png",
      "food-tra-dao.png",
      "food-banh-mi.png",
    ].map((assetName) => access(join(root, "public", "images", "home", assetName)))
  );
});

test("Restaurant detail follows Demo2 storefront layout", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "RestaurantDetailPage.tsx"
  );
  const data = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "restaurantDetailData.ts"
  );
  const css = await readProjectFile(
    "src",
    "styles",
    "restaurant-detail.css"
  );
  const runtimeData = await readProjectFile(
    "src",
    "lib",
    "data",
    "restaurants.ts"
  );

  assert.match(component, /restaurant-detail-actions/);
  assert.match(component, /restaurant-voucher-section/);
  assert.match(component, /restaurant-voucher-strip/);
  assert.match(component, /restaurant-menu-search/);
  assert.match(component, /restaurant-category-pills/);
  assert.match(component, /restaurant-menu-card--horizontal/);
  assert.match(component, /restaurant-menu-card--compact/);
  assert.match(component, /restaurant-review-grid/);
  assert.match(component, /restaurant-info-card/);
  assert.match(component, /FavoriteBorderOutlinedIcon/);
  assert.match(component, /ShareOutlinedIcon/);
  assert.match(component, /SearchOutlinedIcon/);
  assert.match(data, /restaurantVouchers/);
  assert.match(data, /restaurantReviews/);
  assert.match(data, /restaurantInfoItems/);
  assert.match(data, /id:\s*"rice-plates"/);
  assert.match(runtimeData, /minimumOrder/);
  assert.match(runtimeData, /restaurantVouchers/);
  assert.match(runtimeData, /restaurantReviews/);
  assert.match(runtimeData, /restaurantInfoItems/);
  assert.match(css, /\.restaurant-voucher-section/);
  assert.match(css, /\.restaurant-menu-card--compact/);
  assert.match(css, /\.restaurant-review-grid/);
  assert.doesNotMatch(component, /restaurant-side-panel/);
});
