# Đăng ký / Đăng nhập với Supabase

EatNow dùng Supabase Auth trong Next.js App Router. UI auth đã được migrate sang
Material UI + CSS thuần trong Phase 5.

## Biến môi trường

Tạo `eatnow-backend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Sau khi tạo hoặc sửa `.env.local`, tắt và chạy lại `npm run dev`.

## Flow hiện tại

- `/login`: đăng nhập email + mật khẩu.
- `/register`: route sản phẩm để đăng ký tài khoản khách hàng.
- `/signup`: alias tạm thời của `/register`.
- `/signup/verify?email=...`: nhập mã OTP 6 số sau khi đăng ký.
- `/signup/check-email`: fallback hướng dẫn kiểm tra email.
- `/forgot-password`: gửi email đặt lại mật khẩu qua Supabase.
- `/reset-password`: tạo mật khẩu mới sau khi recovery link được xác nhận qua `/auth/confirm`.

## Cấu trúc chính

```txt
src/app/auth/actions.ts             # Server Actions Supabase
src/app/login/page.tsx              # Login route
src/app/register/page.tsx           # Register route
src/app/forgot-password/page.tsx    # Forgot password route
src/app/reset-password/page.tsx     # Reset password route
src/app/signup/page.tsx             # Legacy alias
src/app/signup/verify/page.tsx      # OTP route
src/components/auth/AuthLayout.tsx
src/components/auth/AuthBrandPanel.tsx
src/components/auth/ForgotPasswordForm.tsx
src/components/auth/LoginForm.tsx
src/components/auth/RegisterForm.tsx
src/components/auth/ResetPasswordForm.tsx
src/components/auth/PasswordField.tsx
src/components/auth/OAuthButtons.tsx
src/components/auth/VerifyOtpForm.tsx
src/styles/auth.css
```

## Lưu ý với Bao

- Cần xác nhận role cuối cùng nằm ở Supabase metadata, custom claims hay bảng
  `profiles`.
- Public signup không tự ghi role/account status; backend sở hữu các field này.
- OAuth buttons hiện là placeholder, chưa gọi provider thật.
- Password reset đang dùng Supabase `resetPasswordForEmail` và `updateUser`.
