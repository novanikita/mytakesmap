const MIN_YEAR = 2000;
const MAX_YEAR = 2026;

/** Преобразует координату -100…100 в проценты 0…100 (с clamp) */
export function coordToPercent(value: number): number {
  const clamped = Math.max(-100, Math.min(100, value));
  return ((clamped + 100) / 200) * 100;
}

function rootRemVariable(name: string, fallback: number): number {
  const styles = getComputedStyle(document.documentElement);
  const value = parseFloat(styles.getPropertyValue(name));
  const rootFontSize = parseFloat(styles.fontSize);
  return (Number.isFinite(value) ? value : fallback) * rootFontSize;
}

function mapInsetsPx(axis: "x" | "y"): { start: number; end: number } {
  const styles = getComputedStyle(document.documentElement);
  const rootFontSize = parseFloat(styles.fontSize);
  const size = parseFloat(styles.getPropertyValue(axis === "x" ? "--card-w" : "--card-h"));
  const halfCard = ((Number.isFinite(size) ? size : axis === "x" ? 2 : 2.8) * rootFontSize) / 2;
  const parallax = rootRemVariable("--parallax-range", 0.65);

  if (axis === "x") {
    const padding = rootRemVariable("--map-pad-x", 1.25);
    return { start: padding + halfCard + parallax, end: padding + halfCard + parallax };
  }

  return {
    start: rootRemVariable("--map-pad-top", 4) + halfCard + parallax,
    end: rootRemVariable("--map-pad-bottom", 2) + halfCard + parallax,
  };
}

/** Координата -100…100 → % внутри безопасной области карты */
export function coordToMapPercent(value: number, axis: "x" | "y"): number {
  const t = coordToPercent(value);
  if (typeof window === "undefined") {
    const start = axis === "x" ? 4 : 12;
    const end = axis === "x" ? 4 : 7;
    return start + (t / 100) * (100 - start - end);
  }

  const span = axis === "x" ? window.innerWidth : window.innerHeight;
  const insets = mapInsetsPx(axis);
  const start = (insets.start / span) * 100;
  const end = (insets.end / span) * 100;

  return start + (t / 100) * (100 - start - end);
}

/** Ограничивает top%, чтобы карточка и параллакс оставались внутри карты */
export function clampMapTopPercent(topPercent: number): number {
  if (typeof window === "undefined") return topPercent;
  const insets = mapInsetsPx("y");
  const start = (insets.start / window.innerHeight) * 100;
  const end = (insets.end / window.innerHeight) * 100;
  return Math.max(start, Math.min(100 - end, topPercent));
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
