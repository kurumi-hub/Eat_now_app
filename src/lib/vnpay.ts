import crypto from "crypto";
import qs from "qs";

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
 * Dựng chuỗi ký theo đúng mẫu Node.js chính thức của VNPay 2.1.0:
 * sortObject -> encodeURIComponent (space thành "+") -> qs.stringify.
 * Không dùng URLSearchParams vì tập ký tự percent-encode của WHATWG có thể
 * khác encodeURIComponent ở một số giá trị callback.
 */
export function buildVnpayQuery(params: VnpayParams): string {
  const encoded: Record<string, string> = {};
  const keys = Object.keys(params)
    .map((key) => encodeURIComponent(key))
    .sort();

  for (const encodedKey of keys) {
    const rawKey = decodeURIComponent(encodedKey);
    encoded[encodedKey] = encodeURIComponent(String(params[rawKey]))
      .replace(/%20/g, "+");
  }

  return qs.stringify(encoded, { encode: false });
}

export function createVnpaySecureHash(
  params: VnpayParams,
  hashSecret: string
): string {
  return createVnpaySecureHashFromQuery(buildVnpayQuery(params), hashSecret);
}

function createVnpaySecureHashFromQuery(
  query: string,
  hashSecret: string
): string {
  return crypto
    .createHmac("sha512", hashSecret)
    .update(query, "utf8")
    .digest("hex");
}

function hashesMatch(receivedHash: string | undefined, expectedHash: string) {
  if (!receivedHash || !/^[0-9a-f]{128}$/i.test(receivedHash)) return false;
  return crypto.timingSafeEqual(
    Buffer.from(receivedHash.toLowerCase(), "hex"),
    Buffer.from(expectedHash, "hex")
  );
}

export function verifyVnpaySecureHash(
  params: VnpayParams,
  receivedHash: string | undefined,
  hashSecret: string
): boolean {
  const expected = createVnpaySecureHash(params, hashSecret);
  return hashesMatch(receivedHash, expected);
}

/**
 * Kiểm tra thêm trên raw query để không làm mất biểu diễn byte mà VNPay đã ký
 * (ví dụ "+" so với "%20", hoặc tập ký tự được percent-encode). Chỉ các
 * tham số vnp_* được dùng và callback có key trùng lặp bị từ chối.
 */
export function verifyVnpaySecureHashFromRawUrl(
  rawUrl: string,
  receivedHash: string | undefined,
  hashSecret: string
): boolean {
  const queryStart = rawUrl.indexOf("?");
  if (queryStart < 0) return false;

  const seenKeys = new Set<string>();
  const signedPairs: Array<{ key: string; pair: string }> = [];

  try {
    for (const part of rawUrl.slice(queryStart + 1).split("&")) {
      if (!part) continue;
      const separator = part.indexOf("=");
      const rawKey = separator < 0 ? part : part.slice(0, separator);
      const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
      if (!key.startsWith("vnp_") || key === "vnp_SecureHash" || key === "vnp_SecureHashType") {
        continue;
      }
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      signedPairs.push({ key, pair: part });
    }
  } catch {
    return false;
  }

  signedPairs.sort((left, right) => left.key.localeCompare(right.key, "en"));
  const signData = signedPairs.map(({ pair }) => pair).join("&");
  return hashesMatch(
    receivedHash,
    createVnpaySecureHashFromQuery(signData, hashSecret)
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
