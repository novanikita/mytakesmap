/** Display width for map thumbnails (≈2× retina over 2rem card). */
export const MAP_COVER_WIDTH = 64;

/** Display width for expanded card (≈2× retina over 20rem). */
export const EXPANDED_COVER_WIDTH = 384;

const MAP_ASPECT = 1.4;

export function mapCoverHeight(width = MAP_COVER_WIDTH): number {
  return Math.round(width * MAP_ASPECT);
}

/** URL for preloading / manual img src — Next.js optimized thumbnail. */
export function mapCoverSrc(url: string): string {
  if (!url) return "";
  if (url.startsWith("/_next/image")) return url;

  const params = new URLSearchParams({
    url,
    w: String(MAP_COVER_WIDTH),
    q: "52",
  });
  return `/_next/image?${params.toString()}`;
}

export function expandedCoverSizes(): string {
  return "(max-width: 768px) 15rem, 20rem";
}
