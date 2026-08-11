import { NewItemInput } from "@/lib/types";

export function validateNewItem(input: Partial<NewItemInput>): string | null {
  if (input.type !== "movie" && input.type !== "book") {
    return "Type must be movie or book";
  }
  if (!input.title?.trim()) {
    return "Title is required";
  }
  if (!input.director?.trim()) {
    return input.type === "book" ? "Author is required" : "Director is required";
  }

  const year = Number(input.year);
  if (!Number.isFinite(year) || year < 1800 || year > 2100) {
    return "Release year is required";
  }

  if (!input.coverUrl?.trim()) {
    return "Cover is required";
  }

  const x = Number(input.x);
  const y = Number(input.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return "Coordinates are required";
  }
  if (x < -100 || x > 100 || y < -100 || y > 100) {
    return "Coordinates must be between −100 and 100";
  }

  if (input.watchedYear !== undefined && input.watchedYear !== null) {
    const watched = Number(input.watchedYear);
    if (!Number.isFinite(watched) || watched < 1800 || watched > 2100) {
      return "Watched / read year is invalid";
    }
  }

  return null;
}

export function normalizeNewItem(input: NewItemInput): NewItemInput {
  const year = Number(input.year);
  const watchedRaw = input.watchedYear;
  const watchedYear =
    watchedRaw === undefined || watchedRaw === null || Number.isNaN(Number(watchedRaw))
      ? year
      : Number(watchedRaw);

  return {
    type: input.type,
    title: input.title.trim(),
    year,
    director: input.director.trim(),
    coverUrl: input.coverUrl.trim(),
    description: input.description?.trim() ?? "",
    x: Math.round(Number(input.x)),
    y: Math.round(Number(input.y)),
    watchedYear,
  };
}
