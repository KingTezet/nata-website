import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "nata_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function password(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length >= 8 ? p : null;
}

/** Admin aktif hanya jika ADMIN_PASSWORD (min. 8 karakter) diisi. */
export function adminEnabled(): boolean {
  return password() !== null;
}

function key(): string {
  return process.env.ADMIN_SESSION_SECRET || createHash("sha256").update(`nata-admin:${password() ?? ""}`).digest("hex");
}

function sign(payload: string): string {
  return createHmac("sha256", key()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyPassword(input: string): boolean {
  const p = password();
  return p !== null && safeEqual(input, p);
}

export async function createSession(): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const token = `${exp}.${sign(String(exp))}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, sign(exp));
}
