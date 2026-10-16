import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const name = "zvl_visitor";
function secret() {
  const value = process.env.VIDEO_HANDLE_SECRET;
  if (!value || value.length < 32) throw new Error("VIDEO_HANDLE_SECRET must contain at least 32 characters.");
  return value;
}
function digest(value: string) { return createHmac("sha256", secret()).update(value).digest("hex"); }
export function visitorFrom(request: Request): string | null {
  const cookie = request.headers.get("cookie")?.match(/(?:^|;\s*)zvl_visitor=([^;]+)/)?.[1];
  if (!cookie) return null;
  const match = /^([0-9a-f]{64})\.([0-9a-f]{64})$/.exec(cookie);
  if (!match || !timingSafeEqual(Buffer.from(digest(match[1]), "hex"), Buffer.from(match[2], "hex"))) return null;
  return digest(`visitor:${match[1]}`);
}
export function newVisitor(response: NextResponse): string {
  const id = randomBytes(32).toString("hex");
  response.cookies.set(name, `${id}.${digest(id)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 90 });
  return digest(`visitor:${id}`);
}
