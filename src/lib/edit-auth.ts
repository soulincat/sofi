import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sofi_edit_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getSecret(): string {
  return process.env.EDIT_SESSION_SECRET?.trim() || "";
}

export function getEditPassword(): string {
  return process.env.EDIT_PASSWORD?.trim() || "";
}

export function getEditCookieName(): string {
  return COOKIE_NAME;
}

function sign(payload: string): string {
  const secret = getSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createEditToken(nowMs = Date.now()): string {
  const payload = String(nowMs);
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyEditToken(token: string, nowMs = Date.now()): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const ts = Number.parseInt(payload, 10);
  if (!Number.isFinite(ts)) return false;
  const ageMs = nowMs - ts;
  if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) return false;

  const expected = sign(payload);
  if (!expected) return false;
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function hasEditSession(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value || "";
  return verifyEditToken(token);
}

export function editSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
