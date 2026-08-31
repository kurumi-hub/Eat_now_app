import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const authComponentNames = [
  "AuthLayout.tsx",
  "AuthBrandPanel.tsx",
  "LoginForm.tsx",
  "RegisterForm.tsx",
  "PasswordField.tsx",
  "OAuthButtons.tsx",
];

async function readProjectFile(...segments) {
  return await readFile(join(root, ...segments), "utf8");
}

test("Auth pages use migrated EatNow auth components", async () => {
  const loginPage = await readProjectFile("src", "app", "login", "page.tsx");
  const registerPage = await readProjectFile(
    "src",
    "app",
    "register",
    "page.tsx"
  );
  const signupPage = await readProjectFile("src", "app", "signup", "page.tsx");
  const layout = await readProjectFile("src", "app", "layout.tsx");

  assert.match(loginPage, /@\/components\/auth\/AuthLayout/);
  assert.match(loginPage, /@\/components\/auth\/LoginForm/);
  assert.match(registerPage, /@\/components\/auth\/AuthLayout/);
  assert.match(registerPage, /@\/components\/auth\/RegisterForm/);
  assert.match(signupPage, /@\/app\/register\/page/);
  assert.doesNotMatch(layout, /@\/styles\/auth\.css/);
});

test("Auth component files use MUI, Next navigation, and Tailwind helpers", async () => {
  const contents = await Promise.all(
    authComponentNames.map((componentName) =>
      readProjectFile("src", "components", "auth", componentName)
    )
  );
  const joined = contents.join("\n");
  const tailwindClasses = await readProjectFile(
    "src",
    "components",
    "auth",
    "tailwindClasses.ts"
  );

  assert.match(joined, /@mui\/material/);
  assert.match(joined, /from "next\/link"/);
  assert.match(joined, /from "next\/image"/);
  assert.match(joined, /tailwindClasses/);
  assert.match(tailwindClasses, /rounded-\[/);
  assert.match(tailwindClasses, /text-\[var\(--eatnow-primary/);
  assert.doesNotMatch(joined, /react-router-dom|RouterLink|useNavigate/);
});

test("Auth UI includes required validation and placeholder states", async () => {
  const loginForm = await readProjectFile(
    "src",
    "components",
    "auth",
    "LoginForm.tsx"
  );
  const registerForm = await readProjectFile(
    "src",
    "components",
    "auth",
    "RegisterForm.tsx"
  );
  const passwordField = await readProjectFile(
    "src",
    "components",
    "auth",
    "PasswordField.tsx"
  );

  assert.match(loginForm, /validateLoginValues/);
  assert.match(loginForm, /href="\/forgot-password"/);
  assert.doesNotMatch(loginForm, /Tính năng quên mật khẩu đang được hoàn thiện/);
  assert.match(loginForm, /Đăng nhập mạng xã hội đang được hoàn thiện/);
  assert.match(registerForm, /validateRegisterValues/);
  assert.match(registerForm, /Đăng ký mạng xã hội đang được hoàn thiện/);
  assert.match(registerForm, /termsAccepted/);
  assert.match(passwordField, /aria-label=\{isVisible \? "Ẩn mật khẩu" : "Hiện mật khẩu"\}/);
});

test("Supabase auth actions preserve safe login, customer signup, and OTP flow", async () => {
  const actions = await readProjectFile("src", "app", "auth", "actions.ts");

  assert.match(actions, /signInWithPassword/);
  assert.match(actions, /Email hoặc mật khẩu không chính xác\./);
  assert.match(actions, /name:\s*validation\.normalized\.fullName/);
  assert.match(actions, /phone_number:\s*validation\.normalized\.phone/);
  assert.doesNotMatch(actions, /roles:\s*\["CUSTOMER"\]/);
  assert.doesNotMatch(actions, /status:\s*"PENDING_VERIFICATION"/);
  assert.doesNotMatch(actions, /seller_status:\s*"NOT_APPLIED"/);
  assert.match(actions, /verifyOtp/);
  assert.match(actions, /redirect\(`\/signup\/verify\?email=/);
  assert.match(actions, /logSupabaseAuthError\("signup", error\)/);
  assert.match(actions, /mapSignupAuthError\(error\)/);
  assert.doesNotMatch(actions, /localStorage|sessionStorage|VITE_USE_MOCK_AUTH/);
});

test("Signup confirmation emails use the app auth callback URL", async () => {
  const actions = await readProjectFile("src", "app", "auth", "actions.ts");

  assert.match(actions, /async function getAuthConfirmCallbackUrl/);
  assert.match(actions, /new URL\("\/auth\/confirm", origin\)/);
  assert.match(actions, /emailRedirectTo:\s*signupCallbackUrl/);
  assert.match(
    actions,
    /resend\(\{\s*type:\s*"signup",\s*email:[\s\S]*options:\s*\{\s*emailRedirectTo:\s*signupCallbackUrl/s
  );
});

test("Password recovery pages use Supabase reset password actions", async () => {
  const forgotPage = await readProjectFile(
    "src",
    "app",
    "forgot-password",
    "page.tsx"
  );
  const resetPage = await readProjectFile(
    "src",
    "app",
    "reset-password",
    "page.tsx"
  );
  const forgotForm = await readProjectFile(
    "src",
    "components",
    "auth",
    "ForgotPasswordForm.tsx"
  );
  const resetForm = await readProjectFile(
    "src",
    "components",
    "auth",
    "ResetPasswordForm.tsx"
  );
  const actions = await readProjectFile("src", "app", "auth", "actions.ts");

  assert.match(forgotPage, /@\/components\/auth\/ForgotPasswordForm/);
  assert.match(resetPage, /@\/components\/auth\/ResetPasswordForm/);
  assert.match(forgotForm, /requestPasswordReset/);
  assert.match(forgotForm, /\/reset-password/);
  assert.match(resetForm, /resetPassword/);
  assert.match(resetForm, /confirmPassword/);
  assert.match(actions, /export async function requestPasswordReset/);
  assert.match(actions, /resetPasswordForEmail/);
  assert.match(actions, /export async function resetPassword/);
  assert.match(actions, /updateUser\(\{\s*password:/s);
});

test("Signup OTP verification accepts the current 8 digit email code format", async () => {
  const verifyForm = await readProjectFile(
    "src",
    "components",
    "auth",
    "VerifyOtpForm.tsx"
  );
  const verifyPage = await readProjectFile(
    "src",
    "app",
    "signup",
    "verify",
    "page.tsx"
  );
  const actions = await readProjectFile("src", "app", "auth", "actions.ts");

  assert.match(verifyForm, /OTP_REGEX\s*=\s*\/\^\\d\{8\}\$\/;/);
  assert.match(verifyForm, /maxLength:\s*8/);
  assert.match(verifyForm, /placeholder="00000000"/);
  assert.doesNotMatch(verifyForm, /\\d\{6\}|maxLength:\s*6|placeholder="000000"/);
  assert.match(verifyPage, /mã 8 số|mÃ£ 8 sá»‘/);
  assert.match(actions, /SIGNUP_OTP_REGEX\s*=\s*\/\^\\d\{8\}\$\/;/);
  assert.match(actions, /SIGNUP_OTP_REGEX\.test\(token\)/);
});

test("Signup Supabase errors are mapped to clearer safe messages", async () => {
  const errorMessages = await import("../../src/utils/auth/errorMessages.ts");

  assert.equal(
    errorMessages.mapSignupAuthError({
      code: "user_already_exists",
      message: "User already registered",
    }),
    "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác."
  );
  assert.equal(
    errorMessages.mapSignupAuthError({
      message: "Database error saving new user",
    }),
    "Không thể tạo hồ sơ người dùng trong database. Vui lòng báo Bảo kiểm tra trigger/profile ở Supabase."
  );
  assert.equal(
    errorMessages.mapSignupAuthError({
      message: "captcha verification failed",
    }),
    "Supabase đang yêu cầu CAPTCHA. Frontend cần cấu hình CAPTCHA trước khi đăng ký."
  );
  assert.equal(
    errorMessages.mapSignupAuthError({
      status: 429,
      message: "over_email_send_rate_limit",
    }),
    "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."
  );
  assert.equal(
    errorMessages.mapSignupAuthError({
      status: 500,
      name: "AuthRetryableFetchError",
      message: "{}",
    }),
    "Supabase Auth đang trả lỗi 500. Vui lòng báo Bảo kiểm tra Auth logs, database trigger/profile hoặc email provider."
  );
  assert.equal(
    errorMessages.mapSignupAuthError({
      status: 500,
      message: "Error sending confirmation email",
    }),
    "Không thể gửi email xác nhận. Vui lòng dùng email thật hoặc báo Bảo kiểm tra SMTP/Auth email trong Supabase."
  );
});

test("Auth validation messages are stored as readable Vietnamese text", async () => {
  const validation = await import("../../src/utils/validation.ts");

  const loginResult = validation.validateLoginValues({
    email: "not-an-email",
    password: "",
  });
  const registerResult = validation.validateRegisterValues({
    fullName: "   ",
    email: "bad-email",
    phone: "123",
    password: "short",
    confirmPassword: "different",
    termsAccepted: false,
  });

  assert.equal(loginResult.errors.email, "Email không đúng định dạng.");
  assert.equal(loginResult.errors.password, "Vui lòng nhập mật khẩu.");
  assert.equal(registerResult.errors.fullName, "Vui lòng nhập họ và tên.");
  assert.match(registerResult.errors.phone, /Số điện thoại Việt Nam/);
  assert.match(registerResult.errors.termsAccepted, /điều khoản/);
});

test("Auth redirect helpers avoid open redirects and honor role landing pages", async () => {
  const redirects = await import("../../src/utils/auth/redirects.ts");

  assert.equal(redirects.getSafeRedirectPath("/account/profile"), "/account/profile");
  assert.equal(redirects.getSafeRedirectPath("https://evil.test"), "/");
  assert.equal(redirects.getSafeRedirectPath("//evil.test/path"), "/");
  assert.equal(redirects.getDefaultPostLoginPath(["ADMIN"]), "/admin");
  assert.equal(
    redirects.getDefaultPostLoginPath(["RESTAURANT_OWNER"]),
    "/owner"
  );
  assert.equal(redirects.getDefaultPostLoginPath(["CUSTOMER"]), "/");
});

test("Auth image assets are available from public/images/auth", async () => {
  await Promise.all(
    ["login-food.png", "register-food.png"].map((assetName) =>
      access(join(root, "public", "images", "auth", assetName))
    )
  );
});
