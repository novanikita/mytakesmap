import { LibraryItem } from "./types";
import { randomColor } from "./coordinates";

export const SEED_COUNT_PER_TYPE = 200;

const MOVIE_TITLES = [
  "Parasite", "Dune", "Fight Club", "Inception", "Whiplash",
  "Birdman", "La La Land", "Joker", "1917", "Green Book",
  "Interstellar", "Titanic", "The Matrix", "Gladiator", "Amélie",
  "Oldboy", "Drive", "The Heirs", "Forrest Gump", "The Shining",
];

const BOOK_TITLES = [
  "1984", "The Master and Margarita", "Crime and Punishment", "Fahrenheit 451",
  "The Old Man and the Sea", "The Great Gatsby", "Anna Karenina", "To Kill a Mockingbird",
  "The Little Prince", "Three Comrades",
  "Dune", "Solaris", "Atlas Shrugged", "Ulysses", "Lolita",
  "The Catcher in the Rye", "Harry Potter", "War and Peace", "The Idiot", "White Nights",
];

const DIRECTORS = [
  "Nolan", "Anderson", "Tarantino", "Kubrick", "Scorsese",
  "Villeneuve", "Bong", "Chazelle", "Phillips", "Farrelly",
  "Spielberg", "Fincher", "Sorrentino", "PTA", "Greenaway",
  "Miyazaki", "Kurosawa", "Wenders", "Lynch", "Arriaga",
];

function coordForIndex(index: number, axis: "x" | "y"): number {
  const a = axis === "x" ? 48271 : 97331;
  const b = axis === "x" ? 11939 : 55127;
  const raw = ((index * a + index * index * b) % 20100) / 100 - 100.5;
  return Math.round(Math.max(-95, Math.min(95, raw)));
}

function watchedYearForIndex(index: number, count: number): number {
  const min = 2000;
  const max = 2026;
  const t = index / (count - 1);
  return min + Math.round(t * (max - min));
}

function titleForIndex(titles: string[], index: number): string {
  return titles[index % titles.length];
}

function createSeedItemsOfType(type: "movie" | "book", count: number): LibraryItem[] {
  const titles = type === "movie" ? MOVIE_TITLES : BOOK_TITLES;
  const offset = type === "book" ? 1000 : 0;

  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    type,
    title: titleForIndex(titles, i),
    year: 1970 + ((i * 7) % 50),
    director: DIRECTORS[i % DIRECTORS.length],
    coverUrl: "",
    description: "French special forces help civilians leave Kabul",
    x: coordForIndex(i + offset, "x"),
    y: coordForIndex(i + offset, "y"),
    watchedYear: watchedYearForIndex(i, count),
    color: randomColor(),
  }));
}

export function createSeedItems(
  countPerType = SEED_COUNT_PER_TYPE,
): LibraryItem[] {
  return [
    ...createSeedItemsOfType("movie", countPerType),
    ...createSeedItemsOfType("book", countPerType),
  ];
}
