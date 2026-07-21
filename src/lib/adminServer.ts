import { NextResponse } from "next/server";

export function verifyAdmin(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("x-admin-secret") === secret;
}

export function unauthorized() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
