import crypto from "crypto";
import moment from "moment";
import qs from "qs";
import { NextRequest, NextResponse } from "next/server";

import { requireCurrentUser } from "@/utils/auth/guards";
import { createClient } from "@/utils/supabase/server";
import { sortObject, vnpayConfig } from "@/lib/vnpay";

export async function POST(req: NextRequest) {
  await requireCurrentUser();

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

  const date = new Date();
  const createDate = moment(date).format("YYYYMMDDHHmmss");
  const ipAddr = req.headers.get("x-forwarded-for") || "127.0.0.1";

  let vnp_Params: Record<string, string | number> = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    // Dùng order.id làm mã tham chiếu để đối chiếu 1-1 khi IPN gọi về.
    vnp_TxnRef: order.id,
    vnp_OrderInfo: `Thanh toan don hang ${order.code}`,
    vnp_OrderType: "other",
    vnp_Amount: Math.round(order.total_price) * 100,
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_BankCode: "VNPAYQR",
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params.vnp_SecureHash = signed;

  const paymentUrl =
    vnpayConfig.vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });

  return NextResponse.json({ paymentUrl });
}
