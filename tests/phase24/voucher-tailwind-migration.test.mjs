import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Voucher page is migrated away from global voucher CSS", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const component = await readProjectFile(
    "src",
    "components",
    "voucher",
    "VoucherPage.tsx"
  );
  const data = await readProjectFile(
    "src",
    "components",
    "voucher",
    "voucherData.ts"
  );
  const helper = await readProjectFile(
    "src",
    "components",
    "voucher",
    "tailwindClasses.ts"
  );

  assert.doesNotMatch(layout, /@\/styles\/voucher\.css/);
  assert.match(component, /from "\.\/tailwindClasses"/);
  assert.doesNotMatch(
    component,
    /className=\{?`?[^;\n]*(?:\bvoucher-|\bis-active\b|\bis-inactive\b|\bis-used\b|\bis-expired\b|\bis-urgent\b|\bis-strikethrough\b|\bis-disabled\b)/
  );
  assert.doesNotMatch(
    data,
    /voucher-(?:icon|promo)-(?:-|header|icon)/
  );
  assert.match(helper, /voucherPageClassName/);
  await assert.rejects(
    access(join(root, "src", "styles", "voucher.css")),
    /ENOENT/
  );
});

test("Voucher Tailwind helper preserves cards, filters, promos, and states", async () => {
  const helper = await readProjectFile(
    "src",
    "components",
    "voucher",
    "tailwindClasses.ts"
  );

  assert.match(helper, /voucherMainClassName/);
  assert.match(helper, /voucherHeroClassName/);
  assert.match(helper, /voucherToolbarClassName/);
  assert.match(helper, /voucherSearchBarClassName/);
  assert.match(helper, /voucherFilterChipClassName/);
  assert.match(helper, /voucherGridClassName/);
  assert.match(helper, /voucherCardClassName/);
  assert.match(helper, /voucherCardLeftClassName/);
  assert.match(helper, /voucherBadgeClassName/);
  assert.match(helper, /voucherCardTitleClassName/);
  assert.match(helper, /voucherPromoGridClassName/);
  assert.match(helper, /voucherPromoCardClassName/);
  assert.match(helper, /voucherPromoCtaClassName/);
  assert.match(helper, /voucherIconToneClassName/);
  assert.match(helper, /voucherIconBackgroundClassName/);
  assert.match(helper, /voucherPromoHeaderClassName/);
  assert.match(helper, /max-\[1024px\]:/);
  assert.match(helper, /max-\[640px\]:/);
  assert.match(helper, /data-\[active=true\]:/);
  assert.match(helper, /data-\[status=expired\]:/);
  assert.match(helper, /data-\[urgent=true\]:/);
  assert.match(helper, /data-\[available=false\]:/);
});
