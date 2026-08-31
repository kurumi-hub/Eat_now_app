import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const authFiles = [
  "AuthLayout.tsx",
  "AuthBrandPanel.tsx",
  "LoginForm.tsx",
  "RegisterForm.tsx",
  "ForgotPasswordForm.tsx",
  "ResetPasswordForm.tsx",
  "VerifyOtpForm.tsx",
  "tailwindClasses.ts",
];

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Tailwind v4 is the styling foundation", async () => {
  const globals = await readProjectFile("src", "app", "globals.css");
  const postcss = await readProjectFile("postcss.config.mjs");
  const packageJson = await readProjectFile("package.json");

  assert.match(globals, /@import\s+"tailwindcss";/);
  assert.match(globals, /@theme\s+inline/);
  assert.match(postcss, /@tailwindcss\/postcss/);
  assert.match(packageJson, /"tailwindcss"/);
});

test("Auth flow is migrated from auth.css to Tailwind utilities", async () => {
  const layout = await readProjectFile("src", "app", "layout.tsx");
  const contents = await Promise.all(
    authFiles.map((fileName) =>
      readProjectFile("src", "components", "auth", fileName)
    )
  );
  const signupVerifyPage = await readProjectFile(
    "src",
    "app",
    "signup",
    "verify",
    "page.tsx"
  );
  const signupCheckEmailPage = await readProjectFile(
    "src",
    "app",
    "signup",
    "check-email",
    "page.tsx"
  );
  const joined = [
    ...contents,
    signupVerifyPage,
    signupCheckEmailPage,
  ].join("\n");

  assert.doesNotMatch(layout, /@\/styles\/auth\.css/);
  assert.doesNotMatch(joined, /\bauth-[a-z0-9-]+/);
  assert.match(joined, /\bgrid\b|\bflex\b/);
  assert.match(joined, /\brounded-\[/);
  assert.match(joined, /\btext-\[var\(--eatnow-primary/);

  await assert.rejects(
    access(join(root, "src", "styles", "auth.css")),
    /ENOENT/
  );
});
