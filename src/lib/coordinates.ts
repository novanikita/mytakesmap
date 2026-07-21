const MIN_YEAR = 2000;
const MAX_YEAR = 2026;

/** Преобразует координату -100…100 в проценты 0…100 (с clamp) */
export function coordToPercent(value: number): number {
  const clamped = Math.max(-100, Math.min(100, value));
  return ((clamped + 100) / 200) * 100;
}

/** Координата -100…100 → % с отступом под половину карточки */
export function coordToMapPercent(value: number, axis: "x" | "y"): number {
  const t = coordToPercent(value);
  if (typeof window === "undefined") {
    const inset = axis === "x" ? 2 : 3;
    return inset + (t / 100) * (100 - 2 * inset);
  }

  const fs = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const styles = getComputedStyle(document.documentElement);
  const sizeEm = parseFloat(styles.getPropertyValue(axis === "x" ? "--card-w" : "--card-h")) || (axis === "x" ? 3 : 4.2);
  const halfPx = (sizeEm * fs) / 2;
  const span = axis === "x" ? window.innerWidth : window.innerHeight;
  const inset = (halfPx / span) * 100;

  return inset + (t / 100) * (100 - 2 * inset);
}

/** Ограничивает top%, чтобы карточка не выходила за край по вертикали */
export function clampMapTopPercent(topPercent: number): number {
  if (typeof window === "undefined") return topPercent;
  const fs = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const hEm =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--card-h")) || 4.2;
  const inset = ((hEm * fs) / 2 / window.innerHeight) * 100;
  return Math.max(inset, Math.min(100 - inset, topPercent));
}

/** 0 — далеко (старый просмотр), 1 — близко (новый) */
export function yearToDepth(watchedYear: number): number {
  const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, watchedYear));
  return (clamped - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
}

/** Смещение по вертикали за счёт давности просмотра */
export function yearOffsetPercent(watchedYear: number): number {
  const depth = yearToDepth(watchedYear);
  return (1 - depth) * 6;
}

/** Множитель скорости параллакса: дальние — медленнее */
export function depthParallaxSpeed(depth: number): number {
  return 0.08 + depth * 0.92;
}

/** z-index по глубине */
export function depthZIndex(watchedYear: number): number {
  return Math.round(yearToDepth(watchedYear) * 1000);
}

export function randomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 65%, 55%)`;
}

export const yearToDepthFactor = yearToDepth;
