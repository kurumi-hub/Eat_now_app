import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const homeAssetNames = [
  "hero.png",
  "restaurant-com-tam.png",
  "restaurant-pho.png",
  "restaurant-bun.png",
  "restaurant-banh-mi.png",
  "food-com-tam.png",
  "food-pho.png",
  "food-bun-bo.png",
  "food-banh-mi.png",
  "food-goi-cuon.png",
  "food-tra-dao.png",
  "recipe-com-tam.png",
  "recipe-pho.png",
  "recipe-goi-cuon.png",
];

test("Home route delegates to migrated Next.js Home components", async () => {
  const page = await readFile(join(root, "src", "app", "page.tsx"), "utf8");

  assert.match(page, /@\/components\/home\/HomePage/);
  assert.doesNotMatch(page, /className="[^"]*(?:flex|grid|rounded-\[|bg-\[|text-\[)/);
});

test("Home components use Next navigation and no React Router imports", async () => {
  const homePage = await readFile(
    join(root, "src", "components", "home", "HomePage.tsx"),
    "utf8"
  );
  const customerHeader = await readFile(
    join(root, "src", "components", "home", "CustomerHeader.tsx"),
    "utf8"
  );

  assert.match(`${homePage}\n${customerHeader}`, /from "next\/link"/);
  assert.doesNotMatch(`${homePage}\n${customerHeader}`, /react-router-dom/);
  assert.doesNotMatch(`${homePage}\n${customerHeader}`, /useNavigate|RouterLink/);
});

test("Home CSS is global plain CSS imported from the root layout", async () => {
  const layout = await readFile(join(root, "src", "app", "layout.tsx"), "utf8");
  const homeCss = await readFile(join(root, "src", "styles", "home.css"), "utf8");

  assert.match(layout, /@\/styles\/home\.css/);
  assert.match(homeCss, /@media \(max-width: 1024px\)/);
  assert.match(homeCss, /@media \(max-width: 760px\)/);
  assert.match(homeCss, /overflow-x: hidden/);
});

test("Home image assets are available from public/images/home", async () => {
  await Promise.all(
    homeAssetNames.map((assetName) =>
      access(join(root, "public", "images", "home", assetName))
    )
  );
});

test("Home page renders Flash Sale between featured categories and restaurants", async () => {
  const homePage = await readFile(
    join(root, "src", "components", "home", "HomePage.tsx"),
    "utf8"
  );
  const homeData = await readFile(
    join(root, "src", "components", "home", "homeData.ts"),
    "utf8"
  );
  const homeCss = await readFile(join(root, "src", "styles", "home.css"), "utf8");

  assert.match(homeData, /flashSaleItems/);
  assert.match(homePage, /home-flash-sale/);
  assert.match(homePage, /Flash Sale - Giá sốc hôm nay/);
  assert.match(homePage, /home-flash-progress/);
  assert.ok(
    homePage.indexOf('id="featured-categories"') <
      homePage.indexOf('id="flash-sale"') &&
      homePage.indexOf('id="flash-sale"') <
        homePage.indexOf('id="featured-restaurants"')
  );
  assert.match(homeCss, /\.home-flash-sale-grid/);
  assert.match(homeCss, /\.home-flash-progress/);
});
