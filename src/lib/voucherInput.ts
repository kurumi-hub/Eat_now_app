import type { VoucherSaveInput } from "@/types/voucher";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type VoucherPayloadResult =
  | { error: string }
  | { payload: Record<string, string | number | boolean | null | string[]> };

export function voucherPayload(input: VoucherSaveInput, ownerMode: boolean): VoucherPayloadResult {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const start = new Date(input.startAt);
  const end = new Date(input.expiredAt);
  const targetIds = [...new Set(input.targetIds)];
  if (input.id && !UUID.test(input.id)) return { error: "Mã voucher không hợp lệ." } as const;
  if (!/^[A-Z0-9][A-Z0-9_-]{2,29}$/.test(code)) {
    return { error: "Mã voucher gồm 3–30 ký tự A-Z, 0-9, _ hoặc -." } as const;
  }
  if (name.length < 2 || name.length > 120 || input.description.trim().length > 500 || input.terms.trim().length > 1000) {
    return { error: "Tên hoặc mô tả voucher không hợp lệ." } as const;
  }
  if (!Number.isFinite(input.discountValue) || input.discountValue <= 0 ||
      (input.discountType === "percent" && input.discountValue > 100) ||
      (input.maxDiscount !== null && (!Number.isFinite(input.maxDiscount) || input.maxDiscount <= 0)) ||
      !Number.isFinite(input.minOrderValue) || input.minOrderValue < 0 ||
      (input.totalBudget !== null && (!Number.isFinite(input.totalBudget) || input.totalBudget <= 0))) {
    return { error: "Giá trị giảm, đơn tối thiểu hoặc ngân sách không hợp lệ." } as const;
  }
  if (ownerMode && input.totalBudget === null) return { error: "Voucher nhà hàng phải có tổng ngân sách." } as const;
  if (ownerMode && input.targetScope === "system") return { error: "Owner không được tạo voucher toàn hệ thống." } as const;
  if (!Number.isInteger(input.usageLimitUser) || input.usageLimitUser < 1 || input.usageLimitUser > 100 ||
      (input.usageLimitTotal !== null && (!Number.isInteger(input.usageLimitTotal) || input.usageLimitTotal < 1))) {
    return { error: "Giới hạn lượt sử dụng không hợp lệ." } as const;
  }
  if (ownerMode && input.distributionMode === "assigned") {
    return { error: "Voucher tặng riêng chỉ do nền tảng phát hành." } as const;
  }
  if (input.distributionMode !== "auto" && input.claimLimitTotal !== null &&
      (!Number.isInteger(input.claimLimitTotal) || input.claimLimitTotal < 1)) {
    return { error: "Tổng lượt nhận voucher không hợp lệ." } as const;
  }
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start >= end) {
    return { error: "Thời gian áp dụng không hợp lệ." } as const;
  }
  const requiresTargets = input.targetScope === "category" || input.targetScope === "food" ||
    (!ownerMode && input.targetScope === "restaurant");
  if (requiresTargets && (targetIds.length < 1 || targetIds.length > 100 || targetIds.some((id) => !UUID.test(id)))) {
    return { error: "Hãy chọn từ 1 đến 100 đối tượng áp dụng hợp lệ." } as const;
  }
  return {
    payload: {
      id: input.id ?? null, code, name,
      description: input.description.trim(), terms: input.terms.trim(),
      benefit_scope: input.benefitScope, target_scope: input.targetScope,
      discount_type: input.discountType, discount_value: input.discountValue,
      max_discount: input.discountType === "percent" ? input.maxDiscount : null,
      min_order_value: input.minOrderValue, usage_limit_total: input.usageLimitTotal,
      usage_limit_user: input.usageLimitUser, total_budget: input.totalBudget,
      distribution_mode: input.distributionMode,
      claim_limit_total: input.distributionMode === "auto" ? null : input.claimLimitTotal,
      start_at: start.toISOString(), expired_at: end.toISOString(),
      target_ids: requiresTargets ? targetIds : [], status: input.status,
    },
  } as const;
}
