import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Seller account page loads seller context and delegates to the application UI", async () => {
  const page = await readProjectFile("src", "app", "account", "seller", "page.tsx");

  assert.match(page, /requireAnyRole\(\["CUSTOMER", "RESTAURANT_OWNER"\]\)/);
  assert.match(page, /createClient/);
  assert.match(page, /api_get_seller_context/);
  assert.match(page, /parseSellerContext/);
  assert.match(page, /SellerApplicationPage/);
  assert.doesNotMatch(page, /Frontend kh.ng t. c.p quy.n RESTAURANT_OWNER/u);
});

test("Seller application UI lets customers apply and approved owners enter the portal", async () => {
  await access(join(root, "src", "components", "account", "SellerApplicationPage.tsx"));

  const component = await readProjectFile(
    "src",
    "components",
    "account",
    "SellerApplicationPage.tsx"
  );
  const tailwindClasses = await readProjectFile(
    "src",
    "components",
    "account",
    "tailwindClasses.ts"
  );

  assert.match(component, /"use client"/);
  assert.match(component, /saveSellerApplicationAction/);
  assert.match(component, /submitSellerApplicationAction/);
  assert.match(component, /withdrawSellerApplicationAction/);
  assert.match(component, /Mở quán trên EatNow/);
  assert.match(component, /Thông tin nhà hàng/);
  assert.match(component, /Thông tin pháp lý/);
  assert.match(component, /Lưu hồ sơ/);
  assert.match(component, /Nộp hồ sơ xét duyệt/);
  assert.match(component, /href="\/owner"/);
  assert.match(component, /Vào Owner Portal/);
  assert.match(component, /sellerContext\.restaurants/);
  assert.match(component, /sellerContext\.timeline/);
  assert.doesNotMatch(component, /user_metadata|app_metadata/);

  assert.match(component, /sellerPageClassName/);
  assert.match(component, /sellerApplicationFormClassName/);
  assert.match(component, /sellerStatusCardClassName/);
  assert.match(component, /sellerPortalCardClassName/);
  assert.match(tailwindClasses, /sellerApplicationLayoutClassName/);
  assert.match(tailwindClasses, /max-\[760px\]:grid-cols-1/);
});

test("Seller application form hides technical location fields from customers", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "account",
    "SellerApplicationPage.tsx"
  );
  const actions = await readProjectFile("src", "app", "account", "seller", "actions.ts");

  assert.doesNotMatch(component, /Mã Google Place|Múi giờ|Vĩ độ|Kinh độ/);
  assert.doesNotMatch(component, /name="googlePlaceId"|name="timezone"|name="lat"|name="lon"/);
  assert.match(actions, /googlePlaceId\?: string/);
  assert.match(actions, /lat\?: number/);
  assert.match(actions, /lon\?: number/);
  assert.match(actions, /p_lat: verifiedAddress\.lat/);
  assert.match(actions, /p_lon: verifiedAddress\.lon/);
  assert.match(actions, /p_timezone: input\.timezone \|\| "Asia\/Ho_Chi_Minh"/);
});
