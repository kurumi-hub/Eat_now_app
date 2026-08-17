import crypto from "crypto";

export const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE?.trim() ?? "",
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET?.trim() ?? "",
  vnp_Url:
    process.env.VNPAY_URL?.trim() ??
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL?.trim() ?? "",
};

export type VnpayParams = Record<string, string | number>;

/**
 * VNPay ký đúng chuỗi query đã URL-encode, với tên tham số tăng dần.
 * URLSearchParams dùng application/x-www-form-urlencoded (space thành "+"),
 * khớp với urlencode trong tài liệu tích hợp chính thức của VNPay.
 */
export function buildVnpayQuery(params: VnpayParams): string {
  const query = new URLSearchParams();
  const entries = Object.entries(params).sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0
  );

  for (const [key, value] of entries) {
    query.append(key, String(value));
  }

  return query.toString();
}

export function createVnpaySecureHash(
  params: VnpayParams,
  hashSecret: string
): string {
  return crypto
    .createHmac("sha512", hashSecret)
    .update(buildVnpayQuery(params), "utf8")
    .digest("hex");
}

export function verifyVnpaySecureHash(
  params: VnpayParams,
  receivedHash: string | undefined,
  hashSecret: string
): boolean {
  if (!receivedHash || !/^[0-9a-f]{128}$/i.test(receivedHash)) return false;

  const expected = createVnpaySecureHash(params, hashSecret);
  return crypto.timingSafeEqual(
    Buffer.from(receivedHash.toLowerCase(), "hex"),
    Buffer.from(expected, "hex")
  );
}

// vnp_TxnRef chỉ cho phép ký tự chữ/số, nên bỏ dấu gạch ngang của UUID.
export function orderIdToTxnRef(orderId: string): string {
  return orderId.replace(/-/g, "");
}

// Chấp nhận cả UUID cũ có dấu gạch ngang để tương thích giao dịch đã tạo.
export function txnRefToOrderId(txnRef: string | undefined): string | null {
  if (!txnRef) return null;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      txnRef
    )
  ) {
    return txnRef;
  }
  if (!/^[0-9a-f]{32}$/i.test(txnRef)) return null;

  return [
    txnRef.slice(0, 8),
    txnRef.slice(8, 12),
    txnRef.slice(12, 16),
    txnRef.slice(16, 20),
    txnRef.slice(20),
  ].join("-");
}

export function validateVnpayConfig(): string | null {
  if (!vnpayConfig.vnp_TmnCode) return "Thiếu VNPAY_TMN_CODE.";
  if (!vnpayConfig.vnp_HashSecret) return "Thiếu VNPAY_HASH_SECRET.";
  if (!vnpayConfig.vnp_ReturnUrl) return "Thiếu VNPAY_RETURN_URL.";
  return null;
}
