const EDGE_MARGIN_EM = 1;

function fontSizePx(): number {
  if (typeof window === "undefined") return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function edgeMarginPx(): number {
  return EDGE_MARGIN_EM * fontSizePx();
}

export interface ExpandedPlacement {
  left: number;
  top: number;
  originX: number;
  originY: number;
}

/** Позиция expanded-карточки: top-left + origin для зума из точки наведения */
export function placeExpandedCard(
  centerX: number,
  centerY: number,
  widthPx: number,
  heightPx: number,
): ExpandedPlacement {
  if (typeof window === "undefined") {
    return { left: centerX, top: centerY, originX: widthPx / 2, originY: heightPx / 2 };
  }

  const pad = edgeMarginPx();
  const maxLeft = window.innerWidth - pad - widthPx;
  const maxTop = window.innerHeight - pad - heightPx;

  let left = centerX - widthPx / 2;
  let top = centerY - heightPx / 2;

  left = Math.max(pad, Math.min(maxLeft, left));
  top = Math.max(pad, Math.min(maxTop, top));

  return {
    left,
    top,
    originX: centerX - left,
    originY: centerY - top,
  };
}

/** Fallback-размер expanded-карточки до первого измерения в DOM */
export function measureExpandedSize(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 320, height: 520 };
  }
  const styles = getComputedStyle(document.documentElement);
  const fs = fontSizePx();
  const wEm = parseFloat(styles.getPropertyValue("--card-expanded-w")) || 20;
  const coverEm = parseFloat(styles.getPropertyValue("--card-expanded-h")) || 28;
  const metaEm = 5;
  return {
    width: wEm * fs,
    height: (coverEm + metaEm) * fs,
  };
}
