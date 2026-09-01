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

test("Restaurant detail components use MUI, Next assets, and Tailwind helpers", async () => {
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
  assert.match(component, /tailwindClasses/);
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

test("Restaurant detail Tailwind helper is imported and responsive", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );

  assert.doesNotMatch(layout, /@\/styles\/restaurant-detail\.css/);
  assert.match(helper, /restaurantDetailPageClassName/);
  assert.match(helper, /restaurantHeroClassName/);
  assert.match(helper, /restaurantBottomNavClassName/);
  assert.match(helper, /max-\[900px\]:grid-cols-1/);
  assert.match(helper, /max-\[640px\]:fixed/);
  assert.match(helper, /overflow-x-hidden/);

  await assert.rejects(
    access(join(root, "src", "styles", "restaurant-detail.css")),
    /ENOENT/
  );
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
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );
  const runtimeData = await readProjectFile(
    "src",
    "lib",
    "data",
    "restaurants.ts"
  );

  assert.match(component, /restaurantDetailActionsClassName/);
  assert.match(component, /restaurantVoucherStripClassName/);
  assert.match(component, /restaurantMenuSearchClassName/);
  assert.match(component, /restaurantCategoryPillsClassName/);
  assert.match(component, /restaurantMenuCardClassName/);
  assert.match(component, /restaurantReviewGridClassName/);
  assert.match(component, /restaurantInfoCardClassName/);
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
  assert.match(helper, /restaurantVoucherStripClassName/);
  assert.match(helper, /restaurantMenuCardClassName/);
  assert.match(helper, /restaurantReviewGridClassName/);
  assert.doesNotMatch(component, /restaurant-side-panel/);
});

test("Restaurant detail add flow opens a Size and Topping customization modal", async () => {
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
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );

  assert.match(data, /customization/);
  assert.match(data, /sizeOptions/);
  assert.match(data, /toppingOptions/);
  assert.match(data, /preferenceOptions/);
  assert.match(data, /label:\s*"S"/);
  assert.match(data, /label:\s*"M"/);
  assert.match(data, /label:\s*"L"/);
  assert.match(data, /Trứng ốp la/);
  assert.match(data, /Bì/);
  assert.match(data, /Chả trứng/);
  assert.match(data, /Lạp xưởng/);
  assert.match(data, /Ít cơm/);
  assert.match(data, /Không hành/);
  assert.match(data, /Thêm đồ chua/);
  assert.match(data, /Nước mắm riêng/);
  assert.match(component, /selectedCustomizationItem/);
  assert.match(component, /RestaurantCustomizationModal/);
  assert.match(component, /handleConfirmCustomizedItem/);
  assert.match(component, /selectedPreferenceIds/);
  assert.match(component, /customizationKey/);
  assert.match(component, /optionSummary/);
  assert.match(component, /Chọn kích cỡ/);
  assert.match(component, /Món thêm/);
  assert.match(component, /Tùy chọn món/);
  assert.match(component, /Ghi chú cho quán/);
  assert.match(component, /Thêm vào giỏ/);
  assert.match(helper, /restaurantCustomizationOverlayClassName/);
  assert.match(helper, /restaurantCustomizationModalClassName/);
  assert.match(helper, /restaurantCustomizationOptionClassName/);
});

test("Runtime restaurant detail keeps customization for Supabase menu foods", async () => {
  const runtimeData = await readProjectFile(
    "src",
    "lib",
    "data",
    "restaurants.ts"
  );

  assert.match(runtimeData, /getRestaurantMenuCustomizationForItem/);
  assert.match(runtimeData, /customization:\s*getRestaurantMenuCustomizationForItem\(/);
  assert.match(runtimeData, /categoryName/);
});

test("Runtime restaurant detail keeps best-seller dishes before add-on categories", async () => {
  const runtimeData = await readProjectFile(
    "src",
    "lib",
    "data",
    "restaurants.ts"
  );

  assert.match(runtimeData, /sortRuntimeMenuCategories/);
  assert.match(runtimeData, /getRuntimeMenuCategoryPriority/);
  assert.match(runtimeData, /ban chay/);
  assert.match(runtimeData, /mon them/);
  assert.match(runtimeData, /menuCategories:\s*sortRuntimeMenuCategories\(/);
});

test("Customization modal keeps lower options reachable without image panel", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "RestaurantDetailPage.tsx"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );

  assert.doesNotMatch(component, /restaurant-customization-media/);
  assert.doesNotMatch(helper, /restaurantCustomizationMedia/);
  assert.match(helper, /max-h-\[calc\(100dvh-32px\)\]/);
  assert.match(helper, /min-h-0/);
  assert.match(helper, /overflow-y-auto/);
  assert.match(helper, /sticky bottom-0/);
});

test("Restaurant detail shows Flash Sale metadata on sale menu items", async () => {
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
  const runtimeData = await readProjectFile(
    "src",
    "lib",
    "data",
    "restaurants.ts"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );

  assert.match(data, /RestaurantMenuSale/);
  assert.match(data, /restaurantFlashSaleCampaigns/);
  assert.match(data, /getRestaurantMenuSaleForItem/);
  assert.match(data, /name\?:\s*string \| null/);
  assert.match(data, /normalizeMenuText\(`\$\{foodId\} \$\{name \?\? ""\}/);
  assert.match(data, /sale:\s*getRestaurantMenuSaleForItem\(/);
  assert.match(runtimeData, /getRestaurantMenuSaleForItem/);
  assert.match(runtimeData, /sale:\s*getRestaurantMenuSaleForItem\(/);
  assert.match(runtimeData, /name:\s*food\.name/);
  assert.match(component, /RestaurantMenuPrice/);
  assert.match(component, /RestaurantSaleMeter/);
  assert.match(component, /restaurantMenuSaleBadgeClassName/);
  assert.match(component, /restaurantCustomizationPriceRowClassName/);
  assert.match(helper, /restaurantMenuSaleMeterClassName/);
  assert.match(helper, /restaurantMenuSaleBadgeClassName/);
  assert.match(helper, /restaurantCustomizationSaleMeterClassName/);
  assert.match(helper, /restaurantMenuPriceValueClassName/);
  assert.match(helper, /line-through/);
});
