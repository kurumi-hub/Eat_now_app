import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Customer header location opens a backend address picker", async () => {
  const header = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );

  assert.match(header, /listAddressesAction/);
  assert.match(header, /setDefaultAddressAction/);
  assert.match(header, /locationMenuAnchor/);
  assert.match(header, /deliveryAddresses/);
  assert.match(header, /isLoadingDeliveryAddresses/);
  assert.match(header, /pendingAddressId/);
  assert.match(header, /handleLocationMenuOpen/);
  assert.match(header, /await listAddressesAction\(\)/);
  assert.doesNotMatch(
    header,
    /Chọn vị trí giao hàng sẽ được hoàn thiện sau/
  );
});

test("Choosing a location sets the backend default address and refreshes UI", async () => {
  const header = await readProjectFile(
    "src",
    "components",
    "home",
    "CustomerHeader.tsx"
  );

  assert.match(header, /handleSelectDeliveryAddress/);
  assert.match(header, /setDefaultAddressAction\(address\.id\)/);
  assert.match(header, /router\.refresh\(\)/);
  assert.match(header, /setActiveDeliveryLocationLabel/);
  assert.match(header, /getAddressLocationLabel\(address/);
  assert.match(header, /locationMenuClassName/);
  assert.match(header, /locationOptionClassName\(address\.isDefault\)/);
  assert.match(header, /getAddressLineLabel\(address\)/);
  assert.match(header, /href="\/account\/addresses"/);
});

test("Default address action surfaces backend errors and refreshes location consumers", async () => {
  const actions = await readProjectFile(
    "src",
    "app",
    "account",
    "addresses",
    "actions.ts"
  );

  assert.match(actions, /function revalidateAddressDependentPaths/);
  assert.match(actions, /revalidatePath\("\/"\)/);
  assert.match(actions, /revalidatePath\("\/search"\)/);
  assert.match(actions, /revalidatePath\("\/checkout"\)/);
  assert.match(actions, /throw new Error\("Không thể đặt địa chỉ mặc định\."/);
});

test("Tailwind helper includes polished address picker states", async () => {
  const classes = await readProjectFile(
    "src",
    "components",
    "home",
    "tailwindClasses.ts"
  );

  assert.match(classes, /locationMenuClassName/);
  assert.match(classes, /locationMenuHeaderClassName/);
  assert.match(classes, /locationOptionClassName/);
  assert.match(classes, /data-\[active=true\]:border-\[#ffb49c\]/);
  assert.match(classes, /locationManageClassName/);
  assert.match(classes, /locationMenuStateClassName/);
});
