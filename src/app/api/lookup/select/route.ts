import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveCoverFromUrl } from "@/lib/covers";
import { lookupMovieDirector } from "@/lib/mediaLookup";
import { ItemType } from "@/lib/types";

interface SelectBody {
  type?: ItemType;
  title?: string;
  year?: number | null;
  credit?: string;
  coverUrl?: string;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SelectBody;
  const type = body.type === "book" ? "book" : "movie";
  const title = body.title?.trim() ?? "";
  const year =
    typeof body.year === "number" && Number.isFinite(body.year) ? body.year : null;
  let credit = body.credit?.trim() ?? "";
  const remoteCover = body.coverUrl?.trim() ?? "";

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }
  if (!remoteCover) {
    return NextResponse.json({ error: "Cover required" }, { status: 400 });
  }

  try {
    if (type === "movie" && !credit) {
      credit = await lookupMovieDirector(title, year);
    }

    const coverUrl = await saveCoverFromUrl(remoteCover, session.user.id);

    return NextResponse.json({
      title,
      year,
      credit,
      coverUrl,
    });
  } catch (err) {
    console.error("Lookup select failed:", err);
    return NextResponse.json({ error: "Could not import title" }, { status: 502 });
  }
}
