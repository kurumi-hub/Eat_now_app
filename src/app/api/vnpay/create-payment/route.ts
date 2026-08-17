import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import {
  buildVnpayQuery,
  createVnpaySecureHash,
  orderIdToTxnRef,
  validateVnpayConfig,
  vnpayConfig,
  type VnpayParams,
} from "@/lib/vnpay";

export async function POST(req: NextRequest) {
  await requireCurrentUser();

  const configError = validateVnpayConfig();
  if (configError) {
    console.error(`VNPay configuration error: ${configError}`);
    return NextResponse.json(
      { error: "Cấu hình VNPay trên máy chủ chưa đầy đủ." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;

  if (!orderId) {
    return NextResponse.json({ error: "Thiếu orderId." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("api_get_vnpay_checkout", {
    p_order_id: orderId,
  });

  if (error || !data) {
    return NextResponse.json(
      { error: "Không tìm thấy đơn hàng." },
      { status: 404 }
    );
  }

  const order = data as unknown as {
    id: string;
    code: string;
    total_price: number;
    status: string;
    payment: { id: string; status: string; method: string };
  };

  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Đơn hàng không ở trạng thái chờ thanh toán." },
      { status: 400 }
    );
  }

  if (!order.payment || order.payment.method !== "vnpay") {
    return NextResponse.json(
      { error: "Đơn hàng này không dùng phương thức VNPay." },
      { status: 400 }
    );
  }

  if (order.payment.status !== "pending") {
    return NextResponse.json(
      { error: "Giao dịch đã được xử lý trước đó." },
      { status: 400 }
    );
  }

  const now = moment().utcOffset(7 * 60);
  const createDate = now.format("YYYYMMDDHHmmss");
  const expireDate = now.clone().add(15, "minutes").format("YYYYMMDDHHmmss");
  const ipAddr =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1";

  const vnpParams: VnpayParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    // Dùng order.id làm mã tham chiếu để đối chiếu 1-1 khi IPN gọi về.
    vnp_TxnRef: orderIdToTxnRef(order.id),
    vnp_OrderInfo: `Thanh toan don hang ${order.code}`,
    vnp_OrderType: "other",
    vnp_Amount: Math.round(order.total_price) * 100,
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const signData = buildVnpayQuery(vnpParams);
  const secureHash = createVnpaySecureHash(
    vnpParams,
    vnpayConfig.vnp_HashSecret
  );
  const paymentUrl = `${vnpayConfig.vnp_Url}?${signData}&vnp_SecureHash=${secureHash}`;

  return NextResponse.json({ paymentUrl });
}
