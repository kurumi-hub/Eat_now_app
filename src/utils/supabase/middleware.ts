import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PRIVATE_ROUTE_PREFIXES = ["/account", "/owner", "/admin"];

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

  // Bắt buộc phải gọi getUser() ở đây để Supabase tự refresh token nếu cần.
  // Không được bỏ qua bước này hoặc chèn logic giữa createServerClient và getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isPrivateRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", nextPath);

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
