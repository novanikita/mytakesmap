import { writeFileSync, mkdirSync } from "fs";
import { createSeedItems } from "../src/lib/seedData";

mkdirSync("data", { recursive: true });
const items = createSeedItems();
writeFileSync("data/items.json", JSON.stringify(items));
const movies = items.filter((i) => i.type === "movie").length;
const books = items.filter((i) => i.type === "book").length;
console.log(`Generated ${items.length} items (${movies} movies, ${books} books)`);
