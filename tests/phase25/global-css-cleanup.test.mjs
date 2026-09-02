import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Global CSS files are limited to Tailwind entry and foundational tokens", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const globals = await readProjectFile("src", "app", "globals.css");
  const variables = await readProjectFile("src", "styles", "variables.css");
  const globalStyles = await readProjectFile("src", "styles", "global.css");
  const styleFiles = (await readdir(join(root, "src", "styles"))).sort();

  assert.deepEqual(styleFiles, ["global.css", "variables.css"]);
  assert.doesNotMatch(layout, /@\/styles\/routes\.css/);
  assert.match(layout, /@\/styles\/variables\.css/);
  assert.match(layout, /@\/styles\/global\.css/);

  assert.match(globals, /@import\s+"tailwindcss";/);
  assert.match(globals, /@theme\s+inline/);
  assert.match(globals, /@keyframes ownerLiveGlow/);
  assert.match(globals, /@keyframes orderSubmissionProgress/);
  assert.doesNotMatch(
    globals,
    /ticket-edge|animate-steam|animate-bob|animate-marquee|--pink-|--mango|--mint|--ink|--background|--foreground/
  );

  assert.match(globalStyles, /\.eatnow-body/);
  assert.doesNotMatch(globalStyles, /\.eatnow-page|\.eatnow-container/);
  assert.doesNotMatch(variables, /--background|--foreground/);

  await assert.rejects(
    access(join(root, "src", "styles", "routes.css")),
    /ENOENT/
  );
});

test("RouteNotice is migrated away from global route CSS selectors", async () => {
  const component = await readProjectFile(
    "src",
    "components",
    "common",
    "RouteNotice.tsx"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "common",
    "tailwindClasses.ts"
  );

  assert.match(component, /from "\.\/tailwindClasses"/);
  assert.doesNotMatch(
    component,
    /className=\{?`?[^;\n]*(?:\broute-state|\broute-button)/
  );
  assert.match(helper, /routeNoticePageClassName/);
  assert.match(helper, /routeNoticeCardClassName/);
  assert.match(helper, /routeNoticeButtonClassName/);
  assert.match(helper, /data-\[variant=primary\]:/);
  assert.match(helper, /max-\[600px\]:/);
});
