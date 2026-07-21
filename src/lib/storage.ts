import { promises as fs } from "fs";
import path from "path";
import { LibraryItem } from "./types";
import { createSeedItems } from "./seedData";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "items.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const seed = createSeedItems();
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export async function readItems(): Promise<LibraryItem[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw) as LibraryItem[];
}

export async function writeItems(items: LibraryItem[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function addItem(item: LibraryItem): Promise<LibraryItem[]> {
  const items = await readItems();
  const next = [...items, item];
  await writeItems(next);
  return next;
}
