import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Checkout and order result surfaces use the Order Tailwind helper", async () => {
  const files = await Promise.all(
    [
      "CheckoutPage.tsx",
      "OrderSuccessPage.tsx",
      "OrderCreationErrorPage.tsx",
      "VoucherPickerModal.tsx",
    ].map((fileName) =>
      readProjectFile("src", "components", "order", fileName)
    )
  );
  const joined = files.join("\n");
  const helper = await readProjectFile(
    "src",
    "components",
    "order",
    "tailwindClasses.ts"
  );

  assert.match(joined, /from "\.\/tailwindClasses"/);
  assert.doesNotMatch(
    joined,
    /className=\{?`?[^;\n]*(?:\border-checkout|\border-result|\border-success|\border-error|\border-receipt|\border-summary|\border-payment|\border-form|\border-voucher|\border-submit|\border-information|\border-submission|\bis-selected\b|\bis-invalid\b)/
  );
  assert.match(helper, /orderPageClassName/);
});

test("Order Tailwind helper preserves checkout, result, modal, and loading states", async () => {
  const helper = await readProjectFile(
    "src",
    "components",
    "order",
    "tailwindClasses.ts"
  );
  const globals = await readProjectFile("src", "app", "globals.css");

  assert.match(helper, /orderCheckoutLayoutClassName/);
  assert.match(helper, /orderCheckoutPanelClassName/);
  assert.match(helper, /orderFormInputClassName/);
  assert.match(helper, /orderPaymentOptionClassName/);
  assert.match(helper, /orderSummaryCardClassName/);
  assert.match(helper, /orderVoucherAppliedClassName/);
  assert.match(helper, /orderInformationModalClassName/);
  assert.match(helper, /orderSubmissionOverlayClassName/);
  assert.match(helper, /orderSubmissionProgressBarClassName/);
  assert.match(helper, /orderResultCardClassName/);
  assert.match(helper, /orderVoucherPickerOverlayClassName/);
  assert.match(helper, /max-\[900px\]:/);
  assert.match(helper, /max-\[640px\]:/);
  assert.match(helper, /data-\[selected=true\]:/);
  assert.match(helper, /data-\[invalid=true\]:/);
  assert.match(globals, /@keyframes orderSubmissionProgress/);
});
