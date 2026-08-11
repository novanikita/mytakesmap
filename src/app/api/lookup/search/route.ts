import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchMedia } from "@/lib/mediaLookup";
import { ItemType } from "@/lib/types";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const type = (searchParams.get("type") ?? "movie") as ItemType;

  if (type !== "movie" && type !== "book") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchMedia(type, q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Lookup search failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
