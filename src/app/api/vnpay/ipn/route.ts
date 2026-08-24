import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/utils/supabase/admin";
import {
  txnRefToOrderId,
  validateVnpayConfig,
  verifyVnpaySecureHash,
  vnpayConfig,
  type VnpayParams,
} from "@/lib/vnpay";

// VNPay yêu cầu response đúng format { RspCode, Message } -- KHÔNG được
// redirect hay trả về HTML ở endpoint này.
function ipnResponse(rspCode: string, message: string) {
  return NextResponse.json({ RspCode: rspCode, Message: message });
}

function gatewayEventKey(params: Record<string, string>) {
  return [
    "ipn",
    params.vnp_TransactionNo || "unknown",
    params.vnp_TxnRef || "unknown",
    params.vnp_ResponseCode || "unknown",
    params.vnp_TransactionStatus || "unknown",
    params.vnp_Amount || "unknown",
  ].join(":");
}

async function recordGatewayEvent(
  supabase: ReturnType<typeof createAdminClient>,
  params: Record<string, string>,
  payload: VnpayParams,
  orderId: string | null,
  verified: boolean
) {
  try {
    const { error } = await supabase.rpc("record_payment_gateway_event", {
      p_provider: "vnpay",
      p_event_key: gatewayEventKey(params),
      p_event_type: "ipn_received",
      p_order_id: orderId,
      p_verified: verified,
      p_payload: payload,
    });
    // SQL 26 có thể chưa được chạy ở một môi trường vừa deploy code.
    if (error) console.warn("VNPay gateway event audit failed:", error.message);
  } catch (error) {
    // Audit không được làm hỏng callback thanh toán hoặc kích hoạt retry vô hạn.
    console.warn("VNPay gateway event audit failed:", error);
  }
}

export async function GET(req: NextRequest) {
  if (validateVnpayConfig()) {
    return ipnResponse("99", "Payment configuration error");
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const secureHash = params.vnp_SecureHash;

  const vnpParams: VnpayParams = { ...params };
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;

  const signatureValid = verifyVnpaySecureHash(
    vnpParams,
    secureHash,
    vnpayConfig.vnp_HashSecret
  );
  const orderId = txnRefToOrderId(params.vnp_TxnRef);
  const expectedMerchant = params.vnp_TmnCode === vnpayConfig.vnp_TmnCode;
  const expectedCurrency = params.vnp_CurrCode === "VND";
  const supabase = createAdminClient();

  await recordGatewayEvent(
    supabase,
    params,
    vnpParams,
    orderId,
    signatureValid && expectedMerchant && expectedCurrency
  );

  if (!signatureValid) {
    return ipnResponse("97", "Invalid signature");
  }

  if (!expectedMerchant || !expectedCurrency) {
    return ipnResponse("03", "Invalid merchant or currency");
  }

  const rspCode = params.vnp_ResponseCode;
  const transactionStatus = params.vnp_TransactionStatus;
  const transactionId = params.vnp_TransactionNo || params.vnp_TxnRef;
  const success = rspCode === "00" && transactionStatus === "00";

  if (!orderId) {
    return ipnResponse("01", "Missing order id");
  }

  if (!/^\d+$/.test(params.vnp_Amount || "")) {
    return ipnResponse("04", "Invalid amount");
  }
  const vnpAmount = Number(params.vnp_Amount) / 100;
  if (!Number.isSafeInteger(Number(params.vnp_Amount)) || !Number.isFinite(vnpAmount)) {
    return ipnResponse("04", "Invalid amount");
  }

  // RPC tự khóa đơn, đối chiếu số tiền và xác nhận payment trong một transaction.
  const { error } = await supabase.rpc("confirm_payment_v2", {
    p_order_id: orderId,
    p_transaction_id: transactionId,
    p_success: success,
    p_gateway_amount: vnpAmount,
    p_raw: vnpParams,
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
