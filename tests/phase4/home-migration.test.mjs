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

test("Home route shows the before-login landing before the signed-in home", async () => {
  const page = await readFile(join(root, "src", "app", "page.tsx"), "utf8");
  const beforeLoginPage = await readFile(
    join(root, "src", "components", "home", "BeforeLoginHomePage.tsx"),
    "utf8"
  );
  const homeCss = await readFile(join(root, "src", "styles", "home.css"), "utf8");

  assert.match(page, /@\/components\/home\/BeforeLoginHomePage/);
  assert.match(page, /if\s*\(!user\)\s*{\s*return <BeforeLoginHomePage/);
  assert.match(page, /return <HomePage user=\{user\}/);
  assert.match(beforeLoginPage, /home-before-login-page/);
  assert.match(beforeLoginPage, /home-before-hero/);
  assert.match(beforeLoginPage, /home-before-category-grid/);
  assert.match(beforeLoginPage, /home-before-partner-section/);
  assert.match(beforeLoginPage, /home-before-faq-section/);
  assert.match(beforeLoginPage, /href="\/login"/);
  assert.match(beforeLoginPage, /href="\/register"/);
  assert.match(beforeLoginPage, /Đăng nhập|ÄÄƒng nháº­p/);
  assert.match(beforeLoginPage, /Đăng ký ngay|ÄÄƒng kÃ½ ngay/);
  assert.doesNotMatch(beforeLoginPage, /CustomerHeader|home-search|home-cart-link|CartContext/);
  assert.match(homeCss, /\.home-before-login-page/);
  assert.match(homeCss, /\.home-before-hero/);
  assert.match(homeCss, /\.home-before-faq-card/);
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
