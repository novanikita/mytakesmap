import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MAX_COVER_WIDTH = 480;
const AVIF_QUALITY = 45;

/** Resize and compress to AVIF for faster delivery. */
async function toCoverAvif(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({ width: MAX_COVER_WIDTH, withoutEnlargement: true })
    .avif({ quality: AVIF_QUALITY, effort: 4 })
    .toBuffer();
}

async function storeAvif(avif: Buffer, userId: string): Promise<string> {
  const pathname = `covers/${userId}/${Date.now()}.avif`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, avif, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: "image/avif",
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return blob.url;
  }

  const safeName = `${userId}-${Date.now()}.avif`;
  const dir = path.join(process.cwd(), "public", "covers");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, safeName), avif);
  return `/covers/${safeName}`;
}

/** Store cover in Vercel Blob when configured; otherwise local public/covers (dev). */
export async function saveCover(file: File, userId: string): Promise<string> {
  const raw = Buffer.from(await file.arrayBuffer());
  const avif = await toCoverAvif(raw);
  return storeAvif(avif, userId);
}

/** Download a remote image and store as optimized AVIF cover. */
export async function saveCoverFromUrl(url: string, userId: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "MyTakesMap/1.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) {
    throw new Error(`Cover download failed (${res.status})`);
  }
  const raw = Buffer.from(await res.arrayBuffer());
  if (raw.byteLength > 8 * 1024 * 1024) {
    throw new Error("Cover too large");
  }
  const avif = await toCoverAvif(raw);
  return storeAvif(avif, userId);
}
