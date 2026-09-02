import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Order history, detail, tracking, and reorder surfaces no longer use global order CSS", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const files = await Promise.all(
    [
      "OrderHistoryPage.tsx",
      "OrderDetailPage.tsx",
      "OrderTrackingPage.tsx",
      "ReorderModal.tsx",
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

  assert.doesNotMatch(layout, /@\/styles\/order-process\.css/);
  assert.match(joined, /from "\.\/tailwindClasses"/);
  assert.doesNotMatch(
    joined,
    /className=\{?`?[^;\n]*(?:\border-history|\border-detail|\border-tracking|\border-reorder|\border-status|\border-cancel|\bis-active\b|\bactive\b|\bis-complete\b|\bis-current\b|\bis-unavailable\b|\bis-available\b|\bis-soldout\b|\bis-strikethrough\b)/
  );
  assert.match(helper, /orderHistoryPageClassName/);
  assert.match(helper, /orderDetailPageClassName/);
  assert.match(helper, /orderTrackingPageClassName/);
  assert.match(helper, /orderReorderModalClassName/);

  await assert.rejects(
    access(join(root, "src", "styles", "order-process.css")),
    /ENOENT/
  );
});

test("Order Tailwind helper preserves history, detail, tracking, and reorder responsive states", async () => {
  const helper = await readProjectFile(
    "src",
    "components",
    "order",
    "tailwindClasses.ts"
  );
  const globals = await readProjectFile("src", "app", "globals.css");

  assert.match(helper, /orderHistoryToolbarClassName/);
  assert.match(helper, /orderHistoryFilterPanelClassName/);
  assert.match(helper, /orderHistoryChipClassName/);
  assert.match(helper, /orderHistoryBentoGridClassName/);
  assert.match(helper, /orderHistoryLargeCardClassName/);
  assert.match(helper, /orderHistorySmallCardClassName/);
  assert.match(helper, /orderStatusChipClassName/);
  assert.match(helper, /orderDetailLayoutClassName/);
  assert.match(helper, /orderDetailStatusCardClassName/);
  assert.match(helper, /orderDetailTimelineStepClassName/);
  assert.match(helper, /orderDetailCancelModalClassName/);
  assert.match(helper, /orderTrackingLayoutClassName/);
  assert.match(helper, /orderTrackingMapClassName/);
  assert.match(helper, /orderTrackingTimelineStepClassName/);
  assert.match(helper, /orderTrackingSummaryCardClassName/);
  assert.match(helper, /orderReorderItemClassName/);
  assert.match(helper, /orderReorderBadgeClassName/);
  assert.match(helper, /max-\[900px\]:/);
  assert.match(helper, /max-\[640px\]:/);
  assert.match(helper, /data-\[active=true\]:/);
  assert.match(helper, /data-\[state=complete\]:/);
  assert.match(helper, /data-\[availability=unavailable\]:/);
  assert.match(globals, /@keyframes orderModalFadeIn/);
  assert.match(globals, /@keyframes orderModalSlideUp/);
});
