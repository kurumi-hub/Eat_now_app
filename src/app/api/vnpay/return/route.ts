import { NextRequest, NextResponse } from "next/server";

import {
  txnRefToOrderId,
  verifyVnpaySecureHash,
  vnpayConfig,
  type VnpayParams,
} from "@/lib/vnpay";

export async function GET(req: NextRequest) {
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

  if (!orderId) {
    return NextResponse.redirect(new URL("/orders?payment=invalid", req.url));
  }

  // CHỈ dùng để hiển thị UI cho user -- việc chốt trạng thái đơn hàng thật sự
  // nằm ở route IPN (server-to-server), vì user có thể đóng tab/mất mạng
  // trước khi trình duyệt kịp redirect về đây.
  if (!isValid) {
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?payment=invalid`, req.url)
    );
  }

  const status = rspCode === "00" ? "success" : "failed";
  return NextResponse.redirect(
    new URL(`/orders/${orderId}?payment=${status}`, req.url)
  );
}
