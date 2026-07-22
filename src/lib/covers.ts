import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

function extensionFor(file: File): string {
  return (
    EXT[file.type] ||
    file.name.split(".").pop()?.toLowerCase() ||
    "jpg"
  );
}

/** Store cover in Vercel Blob when configured; otherwise local public/covers (dev). */
export async function saveCover(file: File, userId: string): Promise<string> {
  const ext = extensionFor(file);
  const pathname = `covers/${userId}/${Date.now()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type || "image/jpeg",
    });
    return blob.url;
  }

  const safeName = `${userId}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "covers");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safeName), buffer);
  return `/covers/${safeName}`;
}
