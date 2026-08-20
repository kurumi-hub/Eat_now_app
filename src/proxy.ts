import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Chỉ chạy middleware (và gọi Supabase getUser() qua network) trên các route
  // thực sự cần xác thực. Trước đây matcher chặn gần như mọi request (kể cả
  // trang chủ, danh mục, nhà hàng...), khiến mỗi lần click Link đều phải chờ
  // round-trip tới Supabase Auth trước khi Next.js bắt đầu render trang.
  matcher: [
    "/account/:path*",
    "/owner/:path*",
    "/admin/:path*",
    "/moderator/:path*",
  ],
};
