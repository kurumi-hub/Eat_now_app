import assert from "node:assert/strict";
import test from "node:test";

const validation = await import("../../src/utils/validation.ts");
const roles = await import("../../src/utils/roles.ts");
const publicUser = await import("../../src/utils/auth/publicUser.ts");

test("normalizes Vietnamese mobile phone numbers", () => {
  assert.equal(validation.normalizeVietnamesePhone("+84 912 345 678"), "0912345678");
  assert.equal(validation.normalizeVietnamesePhone("091-234-5678"), "0912345678");
});

test("validates registration values with normalized fields", () => {
  const result = validation.validateRegisterValues({
    fullName: "  Nguyen Thanh Long  ",
    email: " ThanhLong123@Gmail.COM ",
    phone: "+84 912 345 678",
    password: "EatNow123",
    confirmPassword: "EatNow123",
    termsAccepted: true,
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalized.fullName, "Nguyen Thanh Long");
  assert.equal(result.normalized.email, "thanhlong123@gmail.com");
  assert.equal(result.normalized.phone, "0912345678");
});

test("returns field errors for invalid account form values", () => {
  const result = validation.validateRegisterValues({
    fullName: "   ",
    email: "not-an-email",
    phone: "123",
    password: "short",
    confirmPassword: "different",
    termsAccepted: false,
  });

  assert.equal(result.isValid, false);
  assert.match(result.errors.fullName, /họ và tên/i);
  assert.match(result.errors.email, /email/i);
  assert.match(result.errors.phone, /điện thoại/i);
  assert.match(result.errors.password, /8 ký tự/i);
  assert.match(result.errors.confirmPassword, /chưa khớp/i);
  assert.match(result.errors.termsAccepted, /điều khoản/i);
});

test("filters unsupported roles and formats role labels", () => {
  assert.deepEqual(roles.normalizeRoles(["CUSTOMER", "BAD_ROLE", "ADMIN"]), [
    "CUSTOMER",
    "ADMIN",
  ]);
  assert.equal(roles.formatRole("RESTAURANT_OWNER"), "Chủ quán");
});

test("maps Supabase users to safe public users", () => {
  const mappedUser = publicUser.toPublicUser({
    id: "supabase-user-001",
    email: "customer@eatnow.vn",
    phone: "",
    created_at: "2026-07-31T08:00:00.000Z",
    user_metadata: {
      full_name: "Khách hàng EatNow",
      phone: "+84 912 345 678",
      roles: ["CUSTOMER", "BAD_ROLE"],
      status: "ACTIVE",
      seller_status: "NOT_APPLIED",
      avatar_url: "https://example.com/avatar.png",
    },
  });

  assert.deepEqual(mappedUser, {
    id: "supabase-user-001",
    fullName: "Khách hàng EatNow",
    email: "customer@eatnow.vn",
    phone: "0912345678",
    roles: ["CUSTOMER"],
    status: "ACTIVE",
    createdAt: "2026-07-31T08:00:00.000Z",
    avatarUrl: "https://example.com/avatar.png",
    sellerStatus: "NOT_APPLIED",
  });
});
