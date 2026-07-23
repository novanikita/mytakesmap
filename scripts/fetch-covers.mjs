/**
 * Fetch posters for movies without coverUrl via IMDb suggestions,
 * convert to AVIF, upload to Vercel Blob, update DB.
 *
 * Usage: node scripts/fetch-covers.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import sharp from "sharp";

const USER_ID = "cmrwk8i9g0000kw04favqeqn8";
const UA = "MyTakesMapCoverBot/1.0 (cover import)";

const TITLE_ALIASES = {
  "War of the Arts": "The Art of War documentary",
  "Diving into the Darknet": "Dark Net",
  "Hands Off My Cats": "Cats documentary",
  "100 Years of Design": "Abstract: The Art of Design",
  "The City Through a Cat's Eyes": "Kedi",
  "Lil Peep: Everything for Everybody": "Everybody's Everything",
  "Why We Are Creative": "Why Are We Creative",
  "Keith Haring: Street Art Wunderkind": "Keith Haring Street Art Boy",
  "The Courier": "The Courier 2019",
  "Love": "Love Gaspar Noe",
  "The Experiment": "Das Experiment",
  "Michael": "Michael Markus Schleinzer",
  "Cube": "Cube 1997",
  "Dirt": "Filth",
  "Retreat": "The Retreat",
  "Capital in the Twenty-First Century": "Capital in the Twenty-First Century",
  "Marina Abramovic: The Artist Is Present": "Marina Abramovic The Artist Is Present",
  "Exit Through the Gift Shop": "Exit Through the Gift Shop",
  "Banksy Does New York": "Banksy Does New York",
  "Woodstock": "Woodstock Three Days That Defined a Generation",
  "Studio 54": "Studio 54 documentary",
  "Houdini": "Houdini miniseries",
};

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[:\-–—']/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleScore(query, candidate) {
  const q = normalize(query);
  const c = normalize(candidate);
  if (q === c) return 100;
  if (c.startsWith(q) || q.startsWith(c)) return 80;
  if (c.includes(q) || q.includes(c)) return 60;
  const qw = new Set(q.split(" "));
  const cw = new Set(c.split(" "));
  let inter = 0;
  for (const w of qw) if (cw.has(w)) inter++;
  return (inter / Math.max(qw.size, 1)) * 50;
}

async function withRetry(fn, attempts = 6) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw last;
}

async function searchImdb(title) {
  const q = TITLE_ALIASES[title] || title;
  const first = encodeURIComponent(q.trim()[0].toLowerCase() || "a");
  const enc = encodeURIComponent(q.trim());
  const url = `https://v3.sg.media-imdb.com/suggestion/${first}/${enc}.json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`imdb ${res.status}`);
  const data = await res.json();
  return (data.d || []).filter(
    (x) =>
      x.i?.imageUrl &&
      (x.qid === "movie" || x.qid === "tvMovie" || x.qid === "tvMiniSeries" || !x.qid)
  );
}

function pickMatch(item, results) {
  if (!results.length) return null;
  const scored = results.map((r) => {
    let score = titleScore(item.title, r.l || "");
    if (r.y === item.year) score += 40;
    else if (typeof r.y === "number" && Math.abs(r.y - item.year) <= 1) score += 25;
    else if (typeof r.y === "number" && Math.abs(r.y - item.year) <= 3) score += 10;
    if (r.qid === "movie") score += 5;
    return { r, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (best.score < 40) return null;
  return best.r;
}

function posterUrl(imageUrl) {
  // Prefer a mid-size still for faster download
  return imageUrl.replace(/\._V1_.*$/, "._V1_SX600.jpg");
}

async function downloadAvif(imageUrl) {
  const res = await fetch(posterUrl(imageUrl), {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`img ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return sharp(buf)
    .resize({ width: 480, withoutEnlargement: true })
    .avif({ quality: 50 })
    .toBuffer();
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing");
  }
  const prisma = new PrismaClient();
  const items = await withRetry(() =>
    prisma.item.findMany({
      where: { userId: USER_ID, type: "movie", coverUrl: "" },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, year: true },
    })
  );

  console.log(`missing covers: ${items.length}`);
  let ok = 0;
  let fail = 0;
  const failed = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const results = await searchImdb(item.title);
      const match = pickMatch(item, results);
      if (!match) {
        fail++;
        failed.push({ title: item.title, year: item.year, reason: "no match" });
        console.log(`[${i + 1}/${items.length}] FAIL ${item.title} — no match`);
        continue;
      }
      const avif = await downloadAvif(match.i.imageUrl);
      const pathname = `covers/${USER_ID}/${slugify(item.title)}-${item.year}.avif`;
      const blob = await put(pathname, avif, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: "image/avif",
        allowOverwrite: true,
      });
      await withRetry(() =>
        prisma.item.update({
          where: { id: item.id },
          data: { coverUrl: blob.url, color: null },
        })
      );
      ok++;
      console.log(
        `[${i + 1}/${items.length}] OK ${item.title} ← ${match.l} (${match.y}) ${avif.length}b`
      );
      await new Promise((r) => setTimeout(r, 120));
    } catch (e) {
      fail++;
      failed.push({ title: item.title, year: item.year, reason: e.message });
      console.log(`[${i + 1}/${items.length}] ERR ${item.title} — ${e.message}`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`done ok=${ok} fail=${fail}`);
  if (failed.length) {
    console.log("failed:");
    for (const f of failed) console.log(`  - ${f.title} (${f.year}): ${f.reason}`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
