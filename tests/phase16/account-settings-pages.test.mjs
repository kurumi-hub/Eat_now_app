import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Account settings routes render migrated setting panels", async () => {
  await Promise.all(
    [
      "SecuritySettingsPanel.tsx",
      "PreferencesSettingsPanel.tsx",
      "AddressBookPanel.tsx",
    ].map((fileName) =>
      access(join(root, "src", "components", "account", fileName))
    )
  );

  const securityPage = await readProjectFile(
    "src",
    "app",
    "account",
    "security",
    "page.tsx"
  );
  const preferencesPage = await readProjectFile(
    "src",
    "app",
    "account",
    "preferences",
    "page.tsx"
  );
  const addressesPage = await readProjectFile(
    "src",
    "app",
    "account",
    "addresses",
    "page.tsx"
  );

  assert.match(securityPage, /@\/components\/account\/AccountHeader/);
  assert.match(securityPage, /SecuritySettingsPanel/);
  assert.match(preferencesPage, /@\/components\/account\/AccountHeader/);
  assert.match(preferencesPage, /PreferencesSettingsPanel/);
  assert.match(addressesPage, /@\/components\/account\/AccountHeader/);
  assert.match(addressesPage, /AddressBookPanel/);
  assert.match(addressesPage, /getCurrentUserAddresses/);
  assert.doesNotMatch(
    `${securityPage}\n${preferencesPage}\n${addressesPage}`,
    /account-placeholder-note|Phase 6/
  );
});

test("Security settings panel includes password and session UI", async () => {
  const securityPanel = await readProjectFile(
    "src",
    "components",
    "account",
    "SecuritySettingsPanel.tsx"
  );

  assert.match(securityPanel, /"use client"/);
  assert.match(securityPanel, /PasswordField/);
  assert.match(securityPanel, /validateSecurityPasswordValues/);
  assert.match(securityPanel, /currentPassword/);
  assert.match(securityPanel, /newPassword/);
  assert.match(securityPanel, /confirmNewPassword/);
  assert.match(securityPanel, /securityStrengthMeterClassName/);
  assert.match(securityPanel, /Phiên đăng nhập hiện tại/);
  assert.match(securityPanel, /Cập nhật mật khẩu/);
  assert.doesNotMatch(securityPanel, /console\.log\((?:.*password|.*token)/);
});

test("Preferences settings panel includes notifications appearance and language controls", async () => {
  const preferencesPanel = await readProjectFile(
    "src",
    "components",
    "account",
    "PreferencesSettingsPanel.tsx"
  );

  assert.match(preferencesPanel, /"use client"/);
  assert.match(preferencesPanel, /Switch/);
  assert.match(preferencesPanel, /ToggleButtonGroup/);
  assert.match(preferencesPanel, /orderStatusNotifications/);
  assert.match(preferencesPanel, /promotionalNotifications/);
  assert.match(preferencesPanel, /ownerNotifications/);
  assert.match(preferencesPanel, /appearance/);
  assert.match(preferencesPanel, /Tiếng Việt/);
  assert.match(preferencesPanel, /Lưu cài đặt/);
});

test("Address book panel manages delivery addresses without technical location fields", async () => {
  const addressPanel = await readProjectFile(
    "src",
    "components",
    "account",
    "AddressBookPanel.tsx"
  );

  assert.match(addressPanel, /"use client"/);
  assert.match(addressPanel, /validateAddressValues/);
  assert.match(addressPanel, /recipientName/);
  assert.match(addressPanel, /line1/);
  assert.match(addressPanel, /ward/);
  assert.match(addressPanel, /district/);
  assert.match(addressPanel, /city/);
  assert.match(addressPanel, /Đặt làm mặc định/);
  assert.match(addressPanel, /Xóa địa chỉ/);
  assert.match(addressPanel, /Lưu địa chỉ/);
  assert.doesNotMatch(
    addressPanel,
    /\b(?:googlePlaceId|formattedAddress|lat|lon|timezone)\b/i
  );
});

test("Account address location is synced from the backend default address", async () => {
  const accountLayout = await readProjectFile(
    "src",
    "app",
    "account",
    "layout.tsx"
  );
  const customerHeader = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );
  const deliveryLocation = await readProjectFile(
    "src",
    "lib",
    "data",
    "deliveryLocation.ts"
  );
  const addressPanel = await readProjectFile(
    "src",
    "components",
    "account",
    "AddressBookPanel.tsx"
  );

  assert.match(accountLayout, /getCurrentDeliveryLocationLabel/);
  assert.match(deliveryLocation, /getCurrentUserAddresses/);
  assert.match(deliveryLocation, /getDeliveryLocationLabel/);
  assert.match(accountLayout, /deliveryLocationLabel=\{deliveryLocationLabel\}/);
  assert.match(customerHeader, /deliveryLocationLabel\?: string/);
  assert.match(customerHeader, /DEFAULT_DELIVERY_LOCATION_LABEL/);
  assert.match(customerHeader, /displayedDeliveryLocationLabel/);
  assert.match(customerHeader, /<span>\{displayedDeliveryLocationLabel\}<\/span>/);
  assert.doesNotMatch(customerHeader, /<span>Ninh Kiều, Cần Thơ<\/span>/);
  assert.doesNotMatch(addressPanel, /city: "Cần Thơ"/);
  assert.match(addressPanel, /getDefaultAddress\(initialAddresses\)/);
});

test("Saved address cards use a compact non-duplicated layout", async () => {
  const addressPanel = await readProjectFile(
    "src",
    "components",
    "account",
    "AddressBookPanel.tsx"
  );
  const tailwindClasses = await readProjectFile(
    "src",
    "components",
    "account",
    "tailwindClasses.ts"
  );

  assert.match(addressPanel, /addressBodyClassName/);
  assert.match(addressPanel, /addressTextClassName/);
  assert.match(addressPanel, /addressPhoneClassName/);
  assert.doesNotMatch(addressPanel, /address-default-summary/);
  assert.match(tailwindClasses, /addressBodyClassName/);
  assert.match(tailwindClasses, /addressTextClassName/);
  assert.match(tailwindClasses, /\[overflow-wrap:anywhere\]/);
  assert.match(tailwindClasses, /addressActionsClassName/);
});

test("Account Tailwind helper covers settings panels responsively", async () => {
  const tailwindClasses = await readProjectFile(
    "src",
    "components",
    "account",
    "tailwindClasses.ts"
  );

  assert.match(tailwindClasses, /settingsStackClassName/);
  assert.match(tailwindClasses, /settingsSectionCardClassName/);
  assert.match(tailwindClasses, /securityStrengthMeterClassName/);
  assert.match(tailwindClasses, /preferencesGridClassName/);
  assert.match(tailwindClasses, /addressBookLayoutClassName/);
  assert.match(tailwindClasses, /max-\[760px\]:grid-cols-1/);
});
