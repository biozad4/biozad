import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// هنا يتم تفعيل إعدادات الـ Edge المتوافقة والآمنة
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isPosRoute = nextUrl.pathname.startsWith("/pos");
  const isAccountRoute = nextUrl.pathname.startsWith("/account");

  if (isApiRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (userRole === "admin" || userRole === "manager") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      if (userRole === "cashier") {
        return NextResponse.redirect(new URL("/pos", nextUrl));
      }
      return NextResponse.redirect(new URL("/account", nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "admin" && userRole !== "manager") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isPosRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "admin" && userRole !== "manager" && userRole !== "cashier") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isAccountRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};