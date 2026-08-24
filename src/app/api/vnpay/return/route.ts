import { NextRequest, NextResponse } from "next/server";

import {
  txnRefToOrderId,
  validateVnpayConfig,
  verifyVnpaySecureHash,
  vnpayConfig,
  type VnpayParams,
} from "@/lib/vnpay";

export async function GET(req: NextRequest) {
  if (validateVnpayConfig()) {
    return NextResponse.redirect(new URL("/orders?payment=invalid", req.url));
  }
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const secureHash = params.vnp_SecureHash;

  const vnpParams: VnpayParams = { ...params };
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  const isValid = verifyVnpaySecureHash(
    vnpParams,
    secureHash,
    vnpayConfig.vnp_HashSecret
  );
  const orderId = txnRefToOrderId(params.vnp_TxnRef);
  const rspCode = params.vnp_ResponseCode;
  const transactionStatus = params.vnp_TransactionStatus;
  const isExpectedMerchant = params.vnp_TmnCode === vnpayConfig.vnp_TmnCode;
  const isExpectedCurrency = params.vnp_CurrCode === "VND";

  if (!orderId) {
    return NextResponse.redirect(new URL("/orders?payment=invalid", req.url));
  }

  // CHỈ dùng để hiển thị UI cho user -- việc chốt trạng thái đơn hàng thật sự
  // nằm ở route IPN (server-to-server), vì user có thể đóng tab/mất mạng
  // trước khi trình duyệt kịp redirect về đây.
  if (!isValid || !isExpectedMerchant || !isExpectedCurrency) {
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?payment=invalid`, req.url)
    );
  }

  if (rspCode === "00" && transactionStatus === "00") {
    return NextResponse.redirect(
      new URL(`/orders/success?orderId=${orderId}&payment=success`, req.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/orders/${orderId}?payment=failed`, req.url)
  );
}
