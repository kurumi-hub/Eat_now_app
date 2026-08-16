import crypto from "crypto";
import qs from "qs";
import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/utils/supabase/admin";
import { sortObject, vnpayConfig } from "@/lib/vnpay";

// VNPay yêu cầu response đúng format { RspCode, Message } -- KHÔNG được
// redirect hay trả về HTML ở endpoint này.
function ipnResponse(rspCode: string, message: string) {
  return NextResponse.json({ RspCode: rspCode, Message: message });
}

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

  if (secureHash !== checkHash) {
    return ipnResponse("97", "Invalid signature");
  }

  const orderId = params.vnp_TxnRef;
  const rspCode = params.vnp_ResponseCode;
  const transactionId = params.vnp_TransactionNo || params.vnp_TxnRef;
  const success = rspCode === "00";

  if (!orderId) {
    return ipnResponse("01", "Missing order id");
  }

  const supabase = createAdminClient();
  const vnpAmount = Number(params.vnp_Amount) / 100;
  if (!Number.isFinite(vnpAmount)) {
    return ipnResponse("04", "Invalid amount");
  }

  // RPC tự khóa đơn, đối chiếu số tiền và xác nhận payment trong một transaction.
  const { error } = await supabase.rpc("confirm_payment_v2", {
    p_order_id: orderId,
    p_transaction_id: transactionId,
    p_success: success,
    p_gateway_amount: vnpAmount,
    p_raw: params,
  });

  if (error) {
    if (error.message?.includes("không khớp")) {
      return ipnResponse("04", "Invalid amount");
    }
    if (error.message?.includes("Không tìm thấy đơn hàng")) {
      return ipnResponse("01", "Order not found");
    }
    // "Không tìm thấy giao dịch đang chờ" nghĩa là IPN đã được xử lý trước đó
    // (VNPay có thể gọi lại IPN nhiều lần) -- báo thành công để VNPay ngừng retry.
    if (error.message?.includes("Không tìm thấy giao dịch")) {
      return ipnResponse("02", "Order already confirmed");
    }
    console.error("VNPay IPN confirm_payment error:", error.message);
    return ipnResponse("99", "Unknown error");
  }

  return ipnResponse("00", "Confirm Success");
}
