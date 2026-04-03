import { NextResponse } from "next/server";

import {
  createEditToken,
  editSessionCookieOptions,
  getEditCookieName,
  getEditPassword,
} from "@/lib/edit-auth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  const expected = getEditPassword();
  if (!process.env.EDIT_SESSION_SECRET?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Server misconfigured: set EDIT_SESSION_SECRET in environment" },
      { status: 503 },
    );
  }
  if (!expected || !password || password !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getEditCookieName(), createEditToken(), editSessionCookieOptions());
  return res;
}
