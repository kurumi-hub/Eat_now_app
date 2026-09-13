import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/utils/supabase/admin";
import {
  txnRefToOrderId,
  validateVnpayConfig,
  verifyVnpaySecureHash,
  verifyVnpaySecureHashFromRawUrl,
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
  ) || verifyVnpaySecureHashFromRawUrl(
    req.url,
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

  const paymentSuccessful = rspCode === "00" && transactionStatus === "00";
  if (!paymentSuccessful) {
    // Không chốt thất bại từ Return: IPN/job hết hạn là nguồn xử lý chính,
    // tránh hủy nhầm nếu callback success đến chậm hơn redirect trình duyệt.
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?payment=failed`, req.url)
    );
  }

  const rawAmount = params.vnp_Amount;
  const transactionId = params.vnp_TransactionNo?.trim();
  if (!rawAmount || !/^\d+$/.test(rawAmount) || !transactionId) {
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?payment=invalid`, req.url)
    );
  }

  const amountInSmallestUnit = Number(rawAmount);
  const gatewayAmount = amountInSmallestUnit / 100;
  if (!Number.isSafeInteger(amountInSmallestUnit) || !Number.isFinite(gatewayAmount)) {
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?payment=invalid`, req.url)
    );
  }

  // Fallback cho trường hợp sandbox không gửi IPN hoặc IPN đến chậm. RPC vẫn
  // khóa bản ghi, đối chiếu amount/method/transaction và xử lý callback lặp.
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("confirm_payment_v2", {
    p_order_id: orderId,
    p_transaction_id: transactionId,
    p_success: true,
    p_gateway_amount: gatewayAmount,
    p_raw: vnpParams,
  });

  if (error) {
    console.error("VNPay Return fallback confirm_payment error:", error.message);
  }

  // Trang chi tiết luôn đọc trạng thái thật từ DB; không tuyên bố success dựa
  // riêng vào query string của trình duyệt.
  return NextResponse.redirect(
    new URL(`/orders/${orderId}?payment=checking`, req.url)
  );
}
