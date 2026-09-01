import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const restaurantComponentFiles = [
  "RestaurantsPage.tsx",
  "RestaurantDetailPage.tsx",
  "tailwindClasses.ts",
];

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Restaurant list and detail are migrated away from global CSS files", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const contents = await Promise.all(
    restaurantComponentFiles.map((fileName) =>
      readProjectFile("src", "components", "restaurant", fileName)
    )
  );
  const joined = contents.join("\n");

  assert.doesNotMatch(
    layout,
    /@\/styles\/restaurant-(?:page|detail)\.css/
  );
  assert.doesNotMatch(
    joined,
    /className=\{?`?[^;\n]*(?:\brestaurant-|\bis-active\b)/
  );
  assert.match(joined, /tailwindClasses/);

  await assert.rejects(
    access(join(root, "src", "styles", "restaurant-page.css")),
    /ENOENT/
  );
  await assert.rejects(
    access(join(root, "src", "styles", "restaurant-detail.css")),
    /ENOENT/
  );
});

test("Restaurant Tailwind helper preserves list, detail, and modal states", async () => {
  const helper = await readProjectFile(
    "src",
    "components",
    "restaurant",
    "tailwindClasses.ts"
  );

  assert.match(helper, /restaurantListPageClassName/);
  assert.match(helper, /restaurantListGridClassName/);
  assert.match(helper, /restaurantListCategoryButtonClassName/);
  assert.match(helper, /restaurantFilterChipClassName/);
  assert.match(helper, /restaurantListBottomNavClassName/);
  assert.match(helper, /restaurantDetailPageClassName/);
  assert.match(helper, /restaurantHeroClassName/);
  assert.match(helper, /restaurantCategoryPillClassName/);
  assert.match(helper, /restaurantMenuCardClassName/);
  assert.match(helper, /restaurantCustomizationModalClassName/);
  assert.match(helper, /max-\[900px\]:grid-cols-1/);
  assert.match(helper, /max-\[640px\]:fixed/);
  assert.match(helper, /line-clamp-2/);
  assert.match(helper, /data-\[active=true\]:/);
});
