import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const homeComponentFiles = [
  "HomePage.tsx",
  "CustomerHeader.tsx",
  "CustomerFooter.tsx",
  "BeforeLoginHomePage.tsx",
  "tailwindClasses.ts",
];

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Home surfaces are migrated away from the global home.css file", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const contents = await Promise.all(
    homeComponentFiles.map((fileName) =>
      readProjectFile("src", "components", "home", fileName)
    )
  );
  const joined = contents.join("\n");

  assert.doesNotMatch(layout, /@\/styles\/home\.css/);
  assert.doesNotMatch(joined, /className=\{?`?[^;\n]*\bhome-/);
  assert.match(joined, /tailwindClasses/);
  assert.match(joined, /grid-cols-\[auto_minmax\(230px,1fr\)_auto_auto\]/);
  assert.match(joined, /max-\[760px\]:fixed/);
  assert.match(joined, /group-hover:/);

  await assert.rejects(
    access(join(root, "src", "styles", "home.css")),
    /ENOENT/
  );
});

test("Customer header keeps backend location picker behavior while using Tailwind", async () => {
  const header = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );
  const classes = await readProjectFile(
    "src",
    "components",
    "home",
    "tailwindClasses.ts"
  );

  assert.match(header, /listAddressesAction/);
  assert.match(header, /setDefaultAddressAction/);
  assert.match(header, /getAddressLocationLabel/);
  assert.match(header, /locationOptionClassName\(address\.isDefault\)/);
  assert.match(classes, /data-\[active=true\]:border-\[#ffb49c\]/);
  assert.match(classes, /line-clamp-2/);
});
