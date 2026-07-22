import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/validation";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; username?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw = body.email ?? "";
  const password = body.password ?? "";
  const usernameRaw = body.username ?? "";

  const emailError = validateEmail(emailRaw);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }
  const usernameError = validateUsername(usernameRaw);
  if (usernameError) {
    return NextResponse.json({ error: usernameError }, { status: 400 });
  }

  const email = emailRaw.trim().toLowerCase();
  const username = normalizeUsername(usernameRaw);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing?.email === email) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  if (existing?.username === username) {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
