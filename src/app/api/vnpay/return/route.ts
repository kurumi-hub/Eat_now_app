import crypto from "crypto";
import qs from "qs";
import { NextRequest, NextResponse } from "next/server";

import { sortObject, vnpayConfig } from "@/lib/vnpay";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const secureHash = params.vnp_SecureHash;

  const vnp_Params: Record<string, string> = { ...params };
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const sorted = sortObject(vnp_Params);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  const checkHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const isValid = secureHash === checkHash;
  const orderId = params.vnp_TxnRef;
  const rspCode = params.vnp_ResponseCode;

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
