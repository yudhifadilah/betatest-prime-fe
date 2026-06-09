import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/store-closed")
  ) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(`${API_URL}/api/store/status`, {
      cache: "no-store",
    });

    const data = await res.json();
    const isStoreOpen = data?.data?.isStoreOpen ?? true;

    if (!isStoreOpen) {
      return NextResponse.redirect(new URL("/store-closed", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware store status error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
};