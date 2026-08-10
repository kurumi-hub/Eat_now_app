import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const appRoot = join(process.cwd(), "src", "app");

const requiredRouteFiles = [
  "page.tsx",
  "register/page.tsx",
  "unauthorized/page.tsx",
  "not-found.tsx",
  "account/layout.tsx",
  "account/page.tsx",
  "account/profile/page.tsx",
  "account/security/page.tsx",
  "account/preferences/page.tsx",
  "account/addresses/page.tsx",
  "account/seller/page.tsx",
  "owner/page.tsx",
  "admin/page.tsx",
];

test("Next.js App Router contains the Phase 3 route skeleton", async () => {
  await Promise.all(
    requiredRouteFiles.map(async (routeFile) => {
      const content = await readFile(join(appRoot, routeFile), "utf8");
      assert.ok(content.trim().length > 0, `${routeFile} should not be empty`);
    })
  );
});

test("Owner and Admin routes remain lightweight placeholders", async () => {
  const expected = "Trang này sẽ được triển khai ở Sprint tiếp theo.";
  const ownerPage = await readFile(join(appRoot, "owner", "page.tsx"), "utf8");
  const adminPage = await readFile(join(appRoot, "admin", "page.tsx"), "utf8");

  assert.match(ownerPage, new RegExp(expected));
  assert.match(adminPage, new RegExp(expected));
});

test("proxy protects private route groups and preserves intended destination", async () => {
  const middleware = await readFile(
    join(process.cwd(), "src", "utils", "supabase", "middleware.ts"),
    "utf8"
  );

  assert.match(middleware, /"\/account"/);
  assert.match(middleware, /"\/owner"/);
  assert.match(middleware, /"\/admin"/);
  assert.match(middleware, /searchParams\.set\("next"/);
});
