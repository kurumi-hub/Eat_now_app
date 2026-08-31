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

  assert.match(page, /@\/components\/home\/BeforeLoginHomePage/);
  assert.match(page, /if\s*\(!user\)\s*{\s*return <BeforeLoginHomePage/);
  assert.match(page, /return <HomePage user=\{user\}/);
  assert.match(beforeLoginPage, /tailwindClasses/);
  assert.match(beforeLoginPage, /beforeHeroClassName/);
  assert.match(beforeLoginPage, /beforeCategoryGridClassName/);
  assert.match(beforeLoginPage, /beforePartnerSectionClassName/);
  assert.match(beforeLoginPage, /beforeFaqSectionClassName/);
  assert.match(beforeLoginPage, /href="\/login"/);
  assert.match(beforeLoginPage, /href="\/register"/);
  assert.match(beforeLoginPage, /Đăng nhập|ÄÄƒng nháº­p/);
  assert.match(beforeLoginPage, /Đăng ký ngay|ÄÄƒng kÃ½ ngay/);
  assert.doesNotMatch(beforeLoginPage, /CustomerHeader|searchFormClassName|cartLinkClassName|CartContext/);
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

test("Home surfaces use Tailwind helpers instead of a global CSS file", async () => {
  const layout = await readFile(join(root, "src", "app", "layout.tsx"), "utf8");
  const tailwindClasses = await readFile(
    join(root, "src", "components", "home", "tailwindClasses.ts"),
    "utf8"
  );

  assert.doesNotMatch(layout, /@\/styles\/home\.css/);
  assert.match(tailwindClasses, /max-\[1024px\]:grid-cols-2/);
  assert.match(tailwindClasses, /max-\[760px\]:fixed/);
  assert.match(tailwindClasses, /overflow-x-hidden/);
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
  const tailwindClasses = await readFile(
    join(root, "src", "components", "home", "tailwindClasses.ts"),
    "utf8"
  );

  assert.match(homeData, /flashSaleItems/);
  assert.match(homePage, /flashGridClassName/);
  assert.match(homePage, /Flash Sale - Giá sốc hôm nay/);
  assert.match(homePage, /flashProgressClassName/);
  assert.ok(
    homePage.indexOf('id="featured-categories"') <
      homePage.indexOf('id="flash-sale"') &&
      homePage.indexOf('id="flash-sale"') <
        homePage.indexOf('id="featured-restaurants"')
  );
  assert.match(tailwindClasses, /export const flashGridClassName/);
  assert.match(tailwindClasses, /export const flashProgressClassName/);
});

test("Home Flash Sale countdown updates on the client", async () => {
  const homePage = await readFile(
    join(root, "src", "components", "home", "HomePage.tsx"),
    "utf8"
  );

  assert.match(homePage, /useEffect/);
  assert.match(homePage, /FLASH_SALE_INITIAL_SECONDS/);
  assert.match(homePage, /formatFlashSaleCountdown/);
  assert.match(homePage, /flashSaleRemainingSeconds/);
  assert.match(homePage, /window\.setInterval/);
  assert.match(homePage, /window\.clearInterval/);
  assert.doesNotMatch(homePage, />\s*02:45:12\s*</);
});

test("Home Flash Sale items are synced from restaurant menu data", async () => {
  const homePage = await readFile(
    join(root, "src", "components", "home", "HomePage.tsx"),
    "utf8"
  );
  const homeData = await readFile(
    join(root, "src", "components", "home", "homeData.ts"),
    "utf8"
  );
  const restaurantData = await readFile(
    join(root, "src", "components", "restaurant", "restaurantDetailData.ts"),
    "utf8"
  );
  const restaurantDetailPage = await readFile(
    join(root, "src", "components", "restaurant", "RestaurantDetailPage.tsx"),
    "utf8"
  );

  assert.match(homeData, /@\/components\/restaurant\/restaurantDetailData/);
  assert.match(homeData, /restaurantDetails\.flatMap/);
  assert.match(homeData, /foodId/);
  assert.match(homeData, /restaurantSlug/);
  assert.match(homeData, /buildFlashSaleItems/);
  assert.match(homeData, /restaurantFlashSaleCampaigns/);
  assert.match(homeData, /getRestaurantMenuSaleForItem/);
  assert.doesNotMatch(homeData, /name:\s*"Gỏi cuốn tôm thịt"/);
  assert.match(restaurantData, /restaurantFlashSaleCampaigns/);
  assert.match(restaurantData, /com-tam-dac-biet/);
  assert.match(restaurantData, /pho-bo-dac-biet/);
  assert.match(restaurantData, /banh-mi-thit-nuong/);
  assert.match(restaurantData, /id:\s*"com-tam-dac-biet"/);
  assert.match(restaurantData, /id:\s*"pho-bo-dac-biet"/);
  assert.match(restaurantData, /id:\s*"banh-mi-thit-nuong"/);
  assert.match(homePage, /\/restaurants\/\$\{item\.restaurantSlug\}#\$\{item\.foodId\}/);
  assert.match(restaurantDetailPage, /id=\{item\.id\}/);
});

test("Home restaurant cards allow Supabase Storage images through Next Image", async () => {
  const nextConfig = await readFile(join(root, "next.config.ts"), "utf8");

  assert.match(nextConfig, /images:\s*\{/);
  assert.match(nextConfig, /remotePatterns/);
  assert.match(nextConfig, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(nextConfig, /new URL\(value\)\.hostname/);
  assert.match(nextConfig, /\/storage\/v1\/object\/public\/\*\*/);
});
