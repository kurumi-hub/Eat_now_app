import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Account route layout delegates to migrated account components", async () => {
  const rootLayout = await readProjectFile("src", "app", "layout.tsx");
  const accountRouteLayout = await readProjectFile(
    "src",
    "app",
    "account",
    "layout.tsx"
  );

  assert.match(rootLayout, /@\/styles\/account\.css/);
  assert.match(accountRouteLayout, /@\/components\/account\/AccountLayout/);
  assert.match(accountRouteLayout, /requireCurrentUser/);
  assert.doesNotMatch(accountRouteLayout, /react-router-dom/);
});

test("Account navigation components are migrated to Next.js TSX", async () => {
  await Promise.all(
    [
      "AccountLayout.tsx",
      "AccountSidebar.tsx",
      "AccountHeader.tsx",
      "accountNavItems.ts",
    ].map((fileName) =>
      access(join(root, "src", "components", "account", fileName))
    )
  );

  const sidebar = await readProjectFile(
    "src",
    "components",
    "account",
    "AccountSidebar.tsx"
  );
  const navItems = await readProjectFile(
    "src",
    "components",
    "account",
    "accountNavItems.ts"
  );

  assert.match(sidebar, /"use client"/);
  assert.match(sidebar, /from "next\/link"/);
  assert.match(sidebar, /usePathname/);
  assert.match(sidebar, /@mui\/icons-material/);
  assert.match(navItems, /allowedRoles/);
  assert.doesNotMatch(`${sidebar}\n${navItems}`, /react-router-dom/);
});

test("Profile route renders the migrated ProfileEditor client component", async () => {
  const profilePage = await readProjectFile(
    "src",
    "app",
    "account",
    "profile",
    "page.tsx"
  );
  const profileEditor = await readProjectFile(
    "src",
    "components",
    "account",
    "ProfileEditor.tsx"
  );

  assert.match(profilePage, /@\/components\/account\/ProfileEditor/);
  assert.match(profilePage, /requireCurrentUser/);
  assert.doesNotMatch(profilePage, /account-placeholder-note/);
  assert.match(profileEditor, /"use client"/);
  assert.match(profileEditor, /Avatar/);
  assert.match(profileEditor, /TextField/);
  assert.match(profileEditor, /Dialog/);
  assert.match(profileEditor, /validateProfileValues/);
  assert.match(profileEditor, /updateProfileAction/);
});

test("Profile server action updates only editable profile metadata", async () => {
  const profileActions = await readProjectFile(
    "src",
    "app",
    "account",
    "profile",
    "actions.ts"
  );

  assert.match(profileActions, /"use server"/);
  assert.match(profileActions, /validateProfileValues/);
  assert.match(profileActions, /supabase\.auth\.updateUser/);
  assert.match(profileActions, /revalidatePath\("\/account\/profile"\)/);
  assert.doesNotMatch(profileActions, /password|roles:\s*|seller_status/);
});

test("Profile editor protects avatar preview and form validation behavior", async () => {
  const profileEditor = await readProjectFile(
    "src",
    "components",
    "account",
    "ProfileEditor.tsx"
  );

  assert.match(profileEditor, /MAX_AVATAR_SIZE_BYTES/);
  assert.match(profileEditor, /image\/png/);
  assert.match(profileEditor, /image\/jpeg/);
  assert.match(profileEditor, /image\/webp/);
  assert.match(profileEditor, /FileReader/);
  assert.match(profileEditor, /aria-label="Xóa ảnh đại diện"/);
  assert.doesNotMatch(profileEditor, /console\.log\((?:.*password|.*token)/);
});
