import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PRIVATE_ROUTE_PREFIXES = [
  "/account",
  "/owner",
  "/admin",
  "/moderator",
  "/checkout",
  "/orders",
];

function isPrivateRoute(pathname: string) {
  return PRIVATE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims xác minh JWT bằng JWKS đã cache (cục bộ với signing key bất đối
  // xứng) và vẫn cho Supabase SSR refresh cookie khi cần. getUser luôn tạo
  // thêm một round-trip tới Auth server cho mọi lần điều hướng.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const hasAuthenticatedUser =
    !claimsError && typeof claimsData?.claims?.sub === "string";

  if (!hasAuthenticatedUser && isPrivateRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", nextPath);

    return NextResponse.redirect(url);
  }

  // Proxy chỉ xác thực phiên. Phân quyền route được thực hiện trong server
  // guard bằng session-context RPC; dữ liệu đặc quyền tiếp tục do RLS/RPC bảo vệ.

  return supabaseResponse;
}
