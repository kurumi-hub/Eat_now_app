import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Owner flow routes render through a shared guarded layout", async () => {
  const layout = await readProjectFile("src", "app", "owner", "layout.tsx");
  const rootPage = await readProjectFile("src", "app", "owner", "page.tsx");
  const routeFiles = [
    ["orders", "page.tsx"],
    ["menu", "page.tsx"],
    ["menu", "new", "page.tsx"],
    ["revenue", "page.tsx"],
    ["reviews", "page.tsx"],
    ["settings", "page.tsx"],
  ];

  await Promise.all(
    routeFiles.map((segments) => access(join(root, "src", "app", "owner", ...segments)))
  );

  assert.match(layout, /requireAnyRole\(\["RESTAURANT_OWNER"\]\)/);
  assert.doesNotMatch(layout, /requireCurrentUser/);
  assert.doesNotMatch(layout, /isOwnerUiPreviewEnabled/);
  assert.doesNotMatch(layout, /process\.env\.NODE_ENV !== "production"/);
  assert.match(layout, /OwnerShell/);
  assert.match(rootPage, /OwnerDashboardPage/);
  assert.doesNotMatch(rootPage, /RouteNotice|Sprint tiếp theo/);
});

test("Owner sidebar follows the Restaurants Owner design and is reused by every page", async () => {
  const shell = await readProjectFile("src", "components", "owner", "OwnerShell.tsx");
  const styles = await readProjectFile("src", "components", "owner", "tailwindClasses.ts");
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const data = await readProjectFile("src", "components", "owner", "ownerFlowData.ts");

  assert.match(shell, /"use client"/);
  assert.match(shell, /tailwindClasses/);
  assert.doesNotMatch(shell, /isPreviewMode/);
  assert.doesNotMatch(shell, /basePath/);
  assert.doesNotMatch(shell, /resolveOwnerHref/);
  assert.doesNotMatch(shell, /owner-preview-banner/);
  assert.doesNotMatch(styles, /owner-preview-banner/);
  assert.match(shell, /EatNow/);
  assert.doesNotMatch(shell, /Admin Portal/);
  assert.match(shell, /Restaurant Owner/);
  assert.match(data, /ownerProfileName:\s*"Owner Profile"/);
  assert.match(data, /ownerProfileId:\s*"9482"/);
  assert.match(shell, /Add New Dish/);
  assert.match(data, /ordersBadge\s*=\s*3/);
  assert.match(data, /ownerNavItems/);
  assert.match(data, /href:\s*"\/owner\/orders"/);
  assert.match(data, /label:\s*"Đơn hàng"/);
  assert.match(styles, /sidebarClassName/);
  assert.match(styles, /sidebarLinkClassName/);
  assert.match(styles, /data-\[menu-open=true\]:translate-x-0/);
  assert.match(styles, /#ffd3c6/);
  assert.match(styles, /#7a3000/);
  assert.match(styles, /max-lg/);
  assert.doesNotMatch(layout, /@\/styles\/owner\.css/);
});

test("Owner dashboard exposes an animated open status control with a temporary close option", async () => {
  const dashboard = await readProjectFile("src", "components", "owner", "OwnerDashboardPage.tsx");
  const statusControl = await readProjectFile(
    "src",
    "components",
    "owner",
    "OwnerStoreStatusControl.tsx"
  );
  const styles = await readProjectFile("src", "components", "owner", "tailwindClasses.ts");

  assert.match(dashboard, /OwnerStoreStatusControl/);
  assert.match(dashboard, /initialStatus=\{ownerRestaurant\.status\}/);
  assert.match(statusControl, /"use client"/);
  assert.match(statusControl, /useState/);
  assert.match(statusControl, /Đang mở cửa/);
  assert.match(statusControl, /Tạm đóng cửa/);
  assert.match(statusControl, /aria-expanded/);
  assert.match(statusControl, /liveMenuClassName/);
  assert.match(statusControl, /liveLightClassName/);
  assert.match(styles, /ownerLiveGlow/);
  assert.match(styles, /livePillBaseClassName/);
  assert.match(styles, /liveMenuClassName/);
});

test("Owner preview routes are not shipped with the branch", async () => {
  await assert.rejects(
    access(join(root, "src", "app", "owner-preview", "layout.tsx")),
    /ENOENT/
  );
});

test("Owner pages contain the designed flow screens", async () => {
  const dashboard = await readProjectFile("src", "components", "owner", "OwnerDashboardPage.tsx");
  const orders = await readProjectFile("src", "components", "owner", "OwnerOrdersPage.tsx");
  const menu = await readProjectFile("src", "components", "owner", "OwnerMenuPage.tsx");
  const addDish = await readProjectFile("src", "components", "owner", "OwnerAddDishPage.tsx");
  const revenue = await readProjectFile("src", "components", "owner", "OwnerRevenuePage.tsx");
  const reviews = await readProjectFile("src", "components", "owner", "OwnerReviewsPage.tsx");
  const settings = await readProjectFile("src", "components", "owner", "OwnerSettingsPage.tsx");
  const data = await readProjectFile("src", "components", "owner", "ownerFlowData.ts");

  assert.match(data, /name:\s*"Bếp Việt Premium"/);
  assert.match(dashboard, /Xin chào, \{ownerRestaurant\.name\}/);
  assert.match(dashboard, /Đơn hàng đang xử lý/);
  assert.match(orders, /Quản lý đơn hàng/);
  assert.match(data, /id:\s*"#EN-9840"/);
  assert.match(orders, /Chấp nhận đơn/);
  assert.match(menu, /Quản lý Thực đơn/);
  assert.match(data, /name:\s*"Cơm Tấm Sườn Bì Chả"/);
  assert.match(addDish, /Thêm món mới/);
  assert.match(addDish, /Kéo thả hoặc nhấp để tải ảnh lên/);
  assert.match(revenue, /Doanh thu &amp; Phân tích/);
  assert.match(revenue, /Xu hướng doanh thu/);
  assert.match(reviews, /Đánh giá từ khách hàng/);
  assert.match(reviews, /Phản hồi từ nhà hàng/);
  assert.match(settings, /Cài đặt nhà hàng/);
  assert.match(settings, /Thông tin nhà hàng/);
});
