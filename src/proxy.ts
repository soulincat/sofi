import { NextResponse, type NextRequest } from "next/server";

const EDIT_COOKIE_NAME = "sofi_edit_session";

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/edit/")) {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname === "/api/edit/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(EDIT_COOKIE_NAME)?.value || "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/edit/:path*"],
};
