import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const accountComponentFiles = [
  "AccountHeader.tsx",
  "AccountLayout.tsx",
  "AccountSidebar.tsx",
  "ProfileEditor.tsx",
  "SecuritySettingsPanel.tsx",
  "PreferencesSettingsPanel.tsx",
  "AddressBookPanel.tsx",
  "SellerApplicationPage.tsx",
  "tailwindClasses.ts",
];

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Account surfaces are migrated away from the global account.css file", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const contents = await Promise.all(
    accountComponentFiles.map((fileName) =>
      readProjectFile("src", "components", "account", fileName)
    )
  );
  const joined = contents.join("\n");

  assert.doesNotMatch(layout, /@\/styles\/account\.css/);
  assert.doesNotMatch(joined, /className=\{?`?[^;\n]*(?:\baccount-|\bprofile-|\bsettings-|\baddress-|\bseller-)/);
  assert.match(joined, /tailwindClasses/);
  assert.match(joined, /grid-cols-\[280px_minmax\(0,1fr\)\]/);
  assert.match(joined, /data-\[selected=true\]:bg-\[#fff0eb\]/);
  assert.match(joined, /data-\[default=true\]:border-\[rgba\(15,159,98,0.32\)\]/);

  await assert.rejects(
    access(join(root, "src", "styles", "account.css")),
    /ENOENT/
  );
});

test("Account Tailwind helper preserves settings and address responsive states", async () => {
  const classes = await readProjectFile(
    "src",
    "components",
    "account",
    "tailwindClasses.ts"
  );

  assert.match(classes, /settingsSectionCardClassName/);
  assert.match(classes, /securityStrengthMeterClassName/);
  assert.match(classes, /preferencesGridClassName/);
  assert.match(classes, /addressBookLayoutClassName/);
  assert.match(classes, /sellerApplicationLayoutClassName/);
  assert.match(classes, /max-\[760px\]:grid-cols-1/);
});
