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
- `/signup/verify?email=...`: nhập mã OTP 8 số sau khi đăng ký.
- `/signup/check-email`: fallback hướng dẫn kiểm tra email.
- `/forgot-password`: yêu cầu email đặt lại mật khẩu.
- `/reset-password`: đặt mật khẩu mới sau khi xác nhận liên kết recovery.

## Cấu trúc chính

```txt
src/app/auth/actions.ts             # Server Actions Supabase
src/app/login/page.tsx              # Login route
src/app/register/page.tsx           # Register route
src/app/signup/page.tsx             # Legacy alias
src/app/signup/verify/page.tsx      # OTP route
src/app/forgot-password/page.tsx    # Request password reset
src/app/reset-password/page.tsx     # Set a new password
src/components/auth/AuthLayout.tsx
src/components/auth/AuthBrandPanel.tsx
src/components/auth/LoginForm.tsx
src/components/auth/RegisterForm.tsx
src/components/auth/PasswordField.tsx
src/components/auth/OAuthButtons.tsx
src/components/auth/VerifyOtpForm.tsx
src/utils/auth/access.ts             # Đọc quyền từ RPC SQL 13
src/styles/auth.css
```

## Nguồn role và phân quyền

- Nguồn role duy nhất của frontend là RPC `api_get_my_access` trong SQL 13.
- RPC đọc `public.user_roles`; frontend không dùng `user_metadata` để cấp quyền.
- Frontend hỗ trợ nhiều role và chuẩn hóa đủ `SUPER_ADMIN`, `ADMIN`,
  `MODERATOR`, `RESTAURANT_OWNER`, `RESTAURANT_STAFF`, `SHIPPER`, `CUSTOMER`.
- `proxy` refresh session và chặn người chưa đăng nhập. Quyền route được kiểm tra
  bằng server guard; dữ liệu và thao tác đặc quyền vẫn phải được bảo vệ bằng RLS
  hoặc RPC.
- Thứ tự ưu tiên điều hướng là Super Admin, Admin, Moderator, người bán rồi
  Customer.

## Lưu ý khác

- OAuth buttons hiện là placeholder, chưa gọi provider thật.
- Nên cấu hình `NEXT_PUBLIC_SITE_URL` bằng origin production để liên kết đặt
  lại mật khẩu luôn quay về đúng domain. Khi biến này chưa có, server action
  dùng host của request hiện tại.
