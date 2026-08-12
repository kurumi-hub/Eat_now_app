export const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET!,
  vnp_Url:
    process.env.VNPAY_URL ??
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL!,
};

export function sortObject<T extends Record<string, unknown>>(obj: T): T {
  const sorted: Record<string, unknown> = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted as T;
}
