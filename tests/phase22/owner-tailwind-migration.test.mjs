import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

const ownerComponentFiles = [
  "OwnerShell.tsx",
  "OwnerStoreStatusControl.tsx",
  "OwnerDashboardPage.tsx",
  "OwnerOrdersPage.tsx",
  "OwnerMenuPage.tsx",
  "OwnerAddDishPage.tsx",
  "OwnerRevenuePage.tsx",
  "OwnerReviewsPage.tsx",
  "OwnerSettingsPage.tsx",
];

test("Owner flow is migrated away from the global owner.css file", async () => {
  const rootLayout = await readProjectFile("src", "app", "layout.tsx");

  assert.doesNotMatch(rootLayout, /@\/styles\/owner\.css/);
  await assert.rejects(
    access(join(root, "src", "styles", "owner.css")),
    /ENOENT/
  );
});

test("Owner components use Tailwind helpers instead of owner CSS selectors", async () => {
  for (const fileName of ownerComponentFiles) {
    const component = await readProjectFile("src", "components", "owner", fileName);
    const classNameFragments = [
      ...component.matchAll(/className=(?:"[^"]*"|\{[^}\n]*\})/g),
    ].map((match) => match[0]);

    assert.match(component, /tailwindClasses/);
    assert.equal(
      classNameFragments.some((fragment) => /\bowner-|\bis-active\b/.test(fragment)),
      false,
      `${fileName} should not use owner CSS selectors in className`
    );
  }
});

test("Owner Tailwind helper preserves shell, live status, and responsive layout states", async () => {
  const helper = await readProjectFile("src", "components", "owner", "tailwindClasses.ts");

  assert.match(helper, /shellClassName/);
  assert.match(helper, /sidebarClassName/);
  assert.match(helper, /data-\[menu-open=true\]:translate-x-0/);
  assert.match(helper, /lg:ml-\[240px\]/);
  assert.match(helper, /mobileBarClassName/);
  assert.match(helper, /bottomNavClassName/);
  assert.match(helper, /grid-cols-\[280px_minmax\(0,1fr\)\]/);
  assert.match(helper, /grid-cols-\[minmax\(0,1fr\)_374px\]/);
  assert.match(helper, /max-\[640px\]:grid-cols-1/);
  assert.match(helper, /animate-\[ownerLiveGlow_1\.6s_ease-in-out_infinite\]/);
  assert.match(helper, /peer-checked:after:translate-x-\[18px\]/);
});
