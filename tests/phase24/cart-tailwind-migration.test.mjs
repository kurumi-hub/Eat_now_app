import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Cart page is migrated away from global cart CSS", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const component = await readProjectFile(
    "src",
    "components",
    "cart",
    "CartPage.tsx"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "cart",
    "tailwindClasses.ts"
  );

  assert.doesNotMatch(layout, /@\/styles\/cart\.css/);
  assert.match(component, /from "\.\/tailwindClasses"/);
  assert.doesNotMatch(
    component,
    /className=\{?`?[^;\n]*(?:\bcart-|\bhome-cart-link\b|\bis-active\b)/
  );
  assert.match(helper, /cartPageClassName/);
  await assert.rejects(
    access(join(root, "src", "styles", "cart.css")),
    /ENOENT/
  );
});

test("Cart Tailwind helper preserves responsive cart layout and controls", async () => {
  const helper = await readProjectFile(
    "src",
    "components",
    "cart",
    "tailwindClasses.ts"
  );

  assert.match(helper, /cartMainClassName/);
  assert.match(helper, /cartLayoutClassName/);
  assert.match(helper, /cartItemsCardClassName/);
  assert.match(helper, /cartSummaryCardClassName/);
  assert.match(helper, /cartItemRowClassName/);
  assert.match(helper, /cartRemoveItemButtonClassName/);
  assert.match(helper, /cartQuantityControlClassName/);
  assert.match(helper, /cartNoteTextareaClassName/);
  assert.match(helper, /cartCheckoutButtonClassName/);
  assert.match(helper, /cartEmptyStateClassName/);
  assert.match(helper, /max-\[900px\]:/);
  assert.match(helper, /max-\[640px\]:/);
  assert.match(helper, /group-hover\/item:opacity-100/);
});
