import { ItemType } from "@/lib/types";

export interface LookupResult {
  id: string;
  title: string;
  year: number | null;
  /** Director for movies, author for books */
  credit: string;
  coverUrl: string;
  source: "imdb" | "openlibrary";
}

const UA = "MyTakesMap/1.0 (lookup)";

function posterUrl(imageUrl: string): string {
  return imageUrl.replace(/\._V1_.*$/, "._V1_SX600.jpg");
}

function parseDirectorFromDescription(description?: string): string {
  if (!description) return "";
  const match = description.match(/directed by\s+([^.(]+)/i);
  return match?.[1]?.trim() ?? "";
}

export async function lookupMovieDirector(
  title: string,
  year: number | null,
): Promise<string> {
  const query = year ? `${title} ${year}` : title;
  try {
    const url = new URL("https://www.wikidata.org/w/api.php");
    url.searchParams.set("action", "wbsearchentities");
    url.searchParams.set("search", query);
    url.searchParams.set("language", "en");
    url.searchParams.set("type", "item");
    url.searchParams.set("limit", "8");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as {
      search?: Array<{ label?: string; description?: string }>;
    };

    const needle = title.toLowerCase();
    const hit =
      data.search?.find((item) => {
        const label = (item.label || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        return (
          label === needle &&
          (desc.includes("film") || desc.includes("movie")) &&
          desc.includes("directed by")
        );
      }) ||
      data.search?.find((item) => {
        const desc = (item.description || "").toLowerCase();
        return (
          (desc.includes("film") || desc.includes("movie")) &&
          desc.includes("directed by")
        );
      });

    return parseDirectorFromDescription(hit?.description);
  } catch {
    return "";
  }
}

async function searchMovies(query: string): Promise<LookupResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const first = encodeURIComponent(q[0].toLowerCase());
  const enc = encodeURIComponent(q);
  const res = await fetch(`https://v3.sg.media-imdb.com/suggestion/${first}/${enc}.json`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Movie search failed");

  const data = (await res.json()) as {
    d?: Array<{
      id?: string;
      l?: string;
      y?: number;
      qid?: string;
      i?: { imageUrl?: string };
    }>;
  };

  return (data.d || [])
    .filter(
      (item) =>
        item.l &&
        item.i?.imageUrl &&
        (item.qid === "movie" || item.qid === "tvMovie" || !item.qid),
    )
    .slice(0, 8)
    .map((item) => ({
      id: item.id || `${item.l}-${item.y ?? "x"}`,
      title: item.l!,
      year: typeof item.y === "number" ? item.y : null,
      credit: "",
      coverUrl: posterUrl(item.i!.imageUrl!),
      source: "imdb" as const,
    }));
}

async function searchBooks(query: string): Promise<LookupResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "8");
  url.searchParams.set("fields", "key,title,author_name,first_publish_year,cover_i");

  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Book search failed");

  const data = (await res.json()) as {
    docs?: Array<{
      key?: string;
      title?: string;
      author_name?: string[];
      first_publish_year?: number;
      cover_i?: number;
    }>;
  };

  return (data.docs || [])
    .filter((doc) => doc.title && doc.cover_i)
    .slice(0, 8)
    .map((doc) => ({
      id: doc.key || `${doc.title}-${doc.first_publish_year ?? "x"}`,
      title: doc.title!,
      year: typeof doc.first_publish_year === "number" ? doc.first_publish_year : null,
      credit: doc.author_name?.[0] || "",
      coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`,
      source: "openlibrary" as const,
    }));
}

export async function searchMedia(
  type: ItemType,
  query: string,
): Promise<LookupResult[]> {
  if (type === "book") return searchBooks(query);
  return searchMovies(query);
}
