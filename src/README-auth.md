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

## Cấu trúc chính

```txt
src/app/auth/actions.ts             # Server Actions Supabase
src/app/login/page.tsx              # Login route
src/app/register/page.tsx           # Register route
src/app/signup/page.tsx             # Legacy alias
src/app/signup/verify/page.tsx      # OTP route
src/components/auth/AuthLayout.tsx
src/components/auth/AuthBrandPanel.tsx
src/components/auth/LoginForm.tsx
src/components/auth/RegisterForm.tsx
src/components/auth/PasswordField.tsx
src/components/auth/OAuthButtons.tsx
src/components/auth/VerifyOtpForm.tsx
src/styles/auth.css
```

## Lưu ý với Bao

- Cần xác nhận role cuối cùng nằm ở Supabase metadata, custom claims hay bảng
  `profiles`.
- Phase 5 tạm ghi `roles: ["CUSTOMER"]` vào metadata khi public signup.
- OAuth buttons hiện là placeholder, chưa gọi provider thật.
- Password reset chưa triển khai vì chưa có contract.
