const BATCH_TIMEOUT_MS = 25000;
const IMAGE_TIMEOUT_MS = 10000;
const CONCURRENCY = 8;

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = window.setTimeout(() => resolve(), IMAGE_TIMEOUT_MS);

    img.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve();
    };
    img.src = url;
  });
}

async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  if (items.length === 0) return;

  let index = 0;
  async function next(): Promise<void> {
    while (index < items.length) {
      const current = index;
      index += 1;
      await worker(items[current]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => next()),
  );
}

/** Preload optimized cover URLs with bounded concurrency. */
export async function preloadCovers(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void,
): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return;

  let loaded = 0;
  const bump = () => {
    loaded += 1;
    onProgress?.(loaded, unique.length);
  };

  await Promise.race([
    runPool(unique, CONCURRENCY, (url) => preloadImage(url).then(bump)),
    new Promise<void>((resolve) => window.setTimeout(resolve, BATCH_TIMEOUT_MS)),
  ]);
}
