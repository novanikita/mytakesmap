import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LibraryItem, NewItemInput } from "@/lib/types";
import { normalizeNewItem, validateNewItem } from "@/lib/itemValidation";
import { normalizeUsername } from "@/lib/validation";

function toLibraryItem(item: {
  id: string;
  type: string;
  title: string;
  year: number;
  director: string;
  coverUrl: string;
  description: string;
  x: number;
  y: number;
  watchedYear: number;
  color: string | null;
}): LibraryItem {
  return {
    id: item.id,
    type: item.type as LibraryItem["type"],
    title: item.title,
    year: item.year,
    director: item.director,
    coverUrl: item.coverUrl,
    description: item.description,
    x: item.x,
    y: item.y,
    watchedYear: item.watchedYear,
    color: item.color ?? undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usernameRaw = searchParams.get("username");
  if (!usernameRaw) {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  const username = normalizeUsername(usernameRaw);
  const user = await prisma.user.findUnique({
    where: { username },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user.items.map(toLibraryItem));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json()) as NewItemInput;
  const error = validateNewItem(input);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const data = normalizeNewItem(input);

  await prisma.item.create({
    data: {
      userId: session.user.id,
      type: data.type,
      title: data.title,
      year: data.year,
      director: data.director,
      coverUrl: data.coverUrl,
      description: data.description,
      x: data.x,
      y: data.y,
      watchedYear: data.watchedYear,
      color: null,
    },
  });

  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(items.map(toLibraryItem));
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const existing = await prisma.item.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await prisma.item.delete({ where: { id } });

  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(items.map(toLibraryItem));
}
