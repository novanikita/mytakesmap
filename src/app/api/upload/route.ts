import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveCover } from "@/lib/covers";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File not found" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Images only" }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 4 MB" }, { status: 400 });
  }

  try {
    const url = await saveCover(file, session.user.id);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Cover upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
