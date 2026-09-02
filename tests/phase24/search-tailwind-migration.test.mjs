import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Search Filter is migrated away from global search-filter CSS", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const component = await readProjectFile(
    "src",
    "components",
    "search",
    "SearchFilterPage.tsx"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "search",
    "tailwindClasses.ts"
  );

  assert.doesNotMatch(layout, /@\/styles\/search-filter\.css/);
  assert.match(component, /from "\.\/tailwindClasses"/);
  assert.doesNotMatch(
    component,
    /className=\{?`?[^;\n]*(?:\bsearch-filter|\bsearch-result|\bsearch-heading|\bsearch-active|\bsearch-empty|\bsearch-pagination|\bis-active\b)/
  );
  assert.match(helper, /searchFilterPageClassName/);
  await assert.rejects(
    access(join(root, "src", "styles", "search-filter.css")),
    /ENOENT/
  );
});

test("Search Filter Tailwind helper keeps responsive layout and visual states", async () => {
  const helper = await readProjectFile(
    "src",
    "components",
    "search",
    "tailwindClasses.ts"
  );

  assert.match(helper, /searchFilterMainClassName/);
  assert.match(helper, /searchFilterSidebarClassName/);
  assert.match(helper, /searchFilterCardClassName/);
  assert.match(helper, /searchResultTabsClassName/);
  assert.match(helper, /searchTypeButtonClassName/);
  assert.match(helper, /searchResultsGridClassName/);
  assert.match(helper, /searchResultCardClassName/);
  assert.match(helper, /searchPaginationButtonClassName/);
  assert.match(helper, /searchResultActionClassName/);
  assert.match(helper, /max-\[900px\]:/);
  assert.match(helper, /max-\[640px\]:/);
  assert.match(helper, /data-\[active=true\]:/);
  assert.match(helper, /line-clamp-2/);
});
