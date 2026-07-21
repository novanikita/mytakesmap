import { NextResponse } from "next/server";
import { addItem, readItems } from "@/lib/storage";
import { verifyAdmin, unauthorized } from "@/lib/adminServer";
import { LibraryItem, NewItemInput } from "@/lib/types";
import { randomColor } from "@/lib/coordinates";

export async function GET() {
  const items = await readItems();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorized();

  const input = (await request.json()) as NewItemInput;

  if (!input.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const item: LibraryItem = {
    ...input,
    id: `${input.type}-${Date.now()}`,
    color: input.coverUrl ? undefined : randomColor(),
  };

  const items = await addItem(item);
  return NextResponse.json(items);
}
