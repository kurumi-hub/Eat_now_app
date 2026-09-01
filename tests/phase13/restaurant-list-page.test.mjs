import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Restaurants route renders the Restaurant list experience from design", async () => {
  const page = await readProjectFile("src", "app", "restaurants", "page.tsx");
  const component = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "RestaurantsPage.tsx"
  );
  const data = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "restaurantPageData.ts"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const header = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );
  const homePage = await readProjectFile(
    "src",
    "components",
    "home",
    "HomePage.tsx"
  );

  assert.match(page, /@\/components\/restaurant\/RestaurantsPage/);
  assert.match(page, /getCurrentPublicUser/);
  assert.match(component, /"use client"/);
  assert.match(component, /Khám phá Nhà hàng/);
  assert.match(component, /Danh mục phổ biến/);
  assert.match(component, /Nhà hàng phù hợp với bạn/);
  assert.match(component, /Xem thêm nhà hàng/);
  assert.match(component, /tailwindClasses/);
  assert.match(component, /restaurantListCategoryButtonClassName/);
  assert.match(component, /restaurantListFilterPanelClassName/);
  assert.match(component, /restaurantListGridClassName/);
  assert.match(component, /RestaurantCard/);
  assert.match(data, /restaurantListItems/);
  assert.match(data, /Phở 2000 - Bến Thành/);
  assert.match(data, /Bún/);
  assert.match(data, /tag:\s*"Giảm 20%"/);
  assert.match(helper, /restaurantListPageClassName/);
  assert.match(helper, /restaurantListCardClassName/);
  assert.match(helper, /restaurantListBottomNavClassName/);
  assert.match(helper, /max-\[900px\]:/);
  assert.match(helper, /max-\[640px\]:/);
  assert.doesNotMatch(layout, /@\/styles\/restaurant-page\.css/);
  assert.match(header, /href:\s*"\/restaurants"/);
  assert.match(homePage, /router\.push\("\/restaurants"\)/);
  assert.doesNotMatch(`${component}\n${data}`, /react-router-dom|axios|fetch\(/);
  assert.doesNotMatch(
    component,
    /className="[^"]*(?:rounded-\[|bg-\[|text-\[|(?:^|\s)(?:flex|grid)(?:\s|"))/
  );

  await assert.rejects(
    access(join(root, "src", "styles", "restaurant-page.css")),
    /ENOENT/
  );
});

test("Restaurant list page reuses local food and restaurant image assets", async () => {
  await Promise.all(
    [
      "restaurant-pho.png",
      "restaurant-com-tam.png",
      "restaurant-banh-mi.png",
      "restaurant-bun.png",
      "food-goi-cuon.png",
      "food-tra-dao.png",
    ].map((assetName) => access(join(root, "public", "images", "home", assetName)))
  );
});

test("Restaurant list filters update categories, quick chips, and visible counts", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "RestaurantsPage.tsx"
  );
  const data = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "restaurantPageData.ts"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );

  assert.match(data, /export type RestaurantFilterId/);
  assert.match(data, /restaurantQuickFilters/);
  assert.match(data, /filterRestaurantListItems/);
  assert.match(data, /categoryIds/);
  assert.match(data, /hasFreeship/);
  assert.match(data, /hasPromotion/);
  assert.match(data, /distanceKm/);
  assert.match(component, /activeCategoryId/);
  assert.match(component, /activeFilterIds/);
  assert.match(component, /toggleRestaurantFilter/);
  assert.match(component, /filterRestaurantListItems\(/);
  assert.match(component, /filteredRestaurants\.length/);
  assert.match(component, /aria-pressed=\{isActive\}/);
  assert.match(component, /data-active=\{isActive\}/);
  assert.match(helper, /restaurantListEmptyClassName/);
  assert.match(helper, /data-\[active=true\]:border-\[#7a3000\]/);
  assert.doesNotMatch(
    component,
    /Danh mục .*bước tiếp theo|Bộ lọc .*bước tiếp theo|kết nối dữ liệu/
  );
});

test("Restaurant list starts with no selected category", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "RestaurantsPage.tsx"
  );
  const data = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "restaurantPageData.ts"
  );

  assert.match(
    component,
    /const \[activeCategoryId, setActiveCategoryId\] = useState\(""\)/
  );
  assert.match(component, /const isActive = activeCategoryId === category\.id/);
  assert.match(component, /restaurantListCategoryButtonClassName\(\s*isActive\s*\)/);
  assert.match(component, /aria-pressed=\{isActive\}/);
  assert.doesNotMatch(
    `${component}\n${data}`,
    /category\.isActive|isActive:\s*true|isActive\?:/
  );
});
