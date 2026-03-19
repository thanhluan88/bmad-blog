import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  if (req.auth) return; // allow authenticated
  const path = req.nextUrl.pathname.replace(/\/$/, "") || "/";
  if (path === "/admin/login") return; // allow login page
  if (path.startsWith("/api/admin")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }
  if (path.startsWith("/admin")) {
    return Response.redirect(new URL("/admin/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
