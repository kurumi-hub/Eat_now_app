import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Search route renders the migrated Search Filter UI", async () => {
  const page = await readProjectFile("src", "app", "search", "page.tsx");

  assert.match(page, /@\/components\/search\/SearchFilterPage/);
  assert.match(page, /getCurrentPublicUser/);
  assert.match(page, /searchParams/);
  assert.doesNotMatch(page, /react-router-dom/);
});

test("Search Filter component uses URL-backed filters and frontend mock data", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "search",
    "SearchFilterPage.tsx"
  );
  const data = await readProjectFile(
    "src",
    "components",
    "search",
    "searchFilterData.ts"
  );

  assert.match(component, /"use client"/);
  assert.match(component, /useSearchParams/);
  assert.match(component, /useRouter/);
  assert.match(component, /@mui\/material/);
  assert.match(component, /from "next\/image"/);
  assert.match(component, /filterSearchResults/);
  assert.match(data, /searchResultItems/);
  assert.match(data, /priceFilters/);
  assert.match(data, /areaFilters/);
  assert.match(data, /Bún Bò Đặc Biệt/);
  assert.match(data, /Phở Tái Nạm/);
  assert.match(data, /filterSearchResults/);
  assert.match(data, /sortSearchResults/);
  assert.doesNotMatch(`${component}\n${data}`, /react-router-dom|axios|supabase|fetch\(/);
  assert.doesNotMatch(
    component,
    /className="[^"]*(?:rounded-\[|bg-\[|text-\[|(?:^|\s)(?:flex|grid)(?:\s|"))/
  );
});

test("Bare Search route starts as discovery without demo query or default filters", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "search",
    "SearchFilterPage.tsx"
  );

  assert.doesNotMatch(component, /defaultSearchQuery/);
  assert.doesNotMatch(component, /hasAnyParam/);
  assert.doesNotMatch(component, /\["50-100"\]|\["ninh-kieu"\]/);
  assert.match(
    component,
    /const query = searchParams\.get\("q"\)\?\.trim\(\) \|\| ""/
  );
});

test("Customer header search submits to the Search route", async () => {
  const header = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );

  assert.match(header, /useRouter/);
  assert.match(header, /router\.push\(`\/search\?/);
  assert.match(header, /searchValue/);
  assert.doesNotMatch(
    header,
    /Tính năng tìm kiếm sẽ được triển khai ở sprint tiếp theo/
  );
});

test("Search Filter CSS is imported globally and responsive", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const css = await readProjectFile("src", "styles", "search-filter.css");

  assert.match(layout, /@\/styles\/search-filter\.css/);
  assert.match(css, /\.search-filter-page/);
  assert.match(css, /\.search-filter-shell/);
  assert.match(css, /\.search-filter-sidebar/);
  assert.match(css, /\.search-results-grid/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /overflow-x: hidden/);
});

test("Search Filter uses local food and restaurant image assets", async () => {
  await Promise.all(
    [
      "food-bun-bo.png",
      "food-pho.png",
      "restaurant-bun.png",
      "restaurant-pho.png",
    ].map((assetName) => access(join(root, "public", "images", "home", assetName)))
  );
});

test("Search and restaurant viewing remain public guest experiences", async () => {
  const searchPage = await readProjectFile("src", "app", "search", "page.tsx");
  const restaurantPage = await readProjectFile(
    "src",
    "app",
    "restaurants",
    "[restaurantId]",
    "page.tsx"
  );
  const searchComponent = await readProjectFile(
    "src",
    "components",
    "search",
    "SearchFilterPage.tsx"
  );
  const middleware = await readProjectFile(
    "src",
    "utils",
    "supabase",
    "middleware.ts"
  );

  assert.doesNotMatch(`${searchPage}\n${restaurantPage}`, /requireCurrentUser|requireAnyRole/);
  assert.doesNotMatch(middleware, /"\/search"|"\/restaurants"/);
  assert.match(searchComponent, /href=\{`\/restaurants\/\$\{item\.restaurantSlug\}`\}/);
  assert.doesNotMatch(searchComponent, /router\.push\("\/login|href="\/login/);
});

test("Food result cards expose public restaurant detail links", async () => {
  const searchComponent = await readProjectFile(
    "src",
    "components",
    "search",
    "SearchFilterPage.tsx"
  );

  assert.match(searchComponent, /search-result-card__restaurant-link/);
  assert.match(searchComponent, /href=\{`\/restaurants\/\$\{item\.restaurantSlug\}`\}/);
});

test("Food search results add available items into CartContext", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "search",
    "SearchFilterPage.tsx"
  );

  assert.match(component, /useCart/);
  assert.match(component, /addItem/);
  assert.match(component, /item\.type !== "food"/);
  assert.match(component, /restaurantId: item\.restaurantSlug/);
  assert.match(component, /restaurantName: item\.restaurantName/);
  assert.match(component, /foodId: item\.id/);
  assert.match(component, /price: item\.price/);
  assert.match(component, /Đã thêm/);
  assert.doesNotMatch(component, /RESTAURANT_CONFLICT/);
  assert.doesNotMatch(
    component,
    /Tính năng thêm vào giỏ sẽ được triển khai ở sprint tiếp theo/
  );
});
