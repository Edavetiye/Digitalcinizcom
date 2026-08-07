import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAdminEmail } from "@/lib/utils/auth";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Admin paneli: giriş + admin e-postası zorunlu.
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdminEmail(user.email)) {
      // Admin olmayan giriş yapmış kullanıcı kendi paneline yönlendirilir.
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Müşteri paneli: yalnızca giriş zorunlu.
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Giriş yapmış kullanıcı /login'e gelirse uygun panele yönlendirilir.
  if (pathname === "/login" && user) {
    const target = isAdminEmail(user.email) ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  // Middleware YALNIZCA korumalı rotalarda çalışır (/admin, /dashboard).
  // /login ve diğer public sayfalar (embed dahil) gereksiz kimlik/oturum
  // turu yapmaz -> anında açılır.
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
