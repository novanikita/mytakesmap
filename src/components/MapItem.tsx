"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  coordToMapPercent,
  coordToPercent,
  clampMapTopPercent,
  depthParallaxSpeed,
  depthZIndex,
  yearOffsetPercent,
  yearToDepth,
} from "@/lib/coordinates";
import {
  ExpandedPlacement,
  measureExpandedSize,
  placeExpandedCard,
} from "@/lib/portalPosition";
import { truncateWords } from "@/lib/text";
import { LibraryItem } from "@/lib/types";

interface MapItemProps {
  item: LibraryItem;
}

const ZOOM_IN_MS = 70;
const ZOOM_OUT_MS = 420;
const CLOSE_DELAY_MS = 200;
const PORTAL_ROOT_ID = "expanded-card-root";

function isTouchDevice() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}

function getPortalRoot(): HTMLElement {
  return document.getElementById(PORTAL_ROOT_ID) ?? document.body;
}

function readParallaxVars(el: HTMLElement): { mx: number; my: number } {
  const node = el.closest("[style]") ?? el.parentElement;
  const styles = node ? getComputedStyle(node) : getComputedStyle(document.documentElement);
  return {
    mx: parseFloat(styles.getPropertyValue("--mx")) || 0,
    my: parseFloat(styles.getPropertyValue("--my")) || 0,
  };
}

export function MapItem({ item }: MapItemProps) {
  const hitRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const anchorCenterRef = useRef<{ x: number; y: number } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandedRef2 = useRef(false);
  const frozenParallaxRef = useRef<{ mx: number; my: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [placement, setPlacement] = useState<ExpandedPlacement | null>(null);

  const baseTop = coordToPercent(-item.y) + yearOffsetPercent(item.watchedYear);
  const [pos, setPos] = useState({
    left: coordToPercent(item.x),
    top: baseTop,
  });

  const depth = yearToDepth(item.watchedYear);
  const left = pos.left;
  const top = pos.top;
  const speed = depthParallaxSpeed(depth);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function clearZoomOutTimer() {
    if (zoomOutTimerRef.current) {
      clearTimeout(zoomOutTimerRef.current);
      zoomOutTimerRef.current = null;
    }
  }

  function recalcPlacement() {
    const center = anchorCenterRef.current;
    if (!center) return;

    const el = expandedRef.current;
    const fallback = measureExpandedSize();
    const width = el?.offsetWidth || fallback.width;
    const height = el?.offsetHeight || fallback.height;

    const next = placeExpandedCard(center.x, center.y, width, height);
    setPlacement((prev) => {
      if (
        prev &&
        Math.abs(prev.left - next.left) < 0.5 &&
        Math.abs(prev.top - next.top) < 0.5 &&
        Math.abs(prev.originX - next.originX) < 0.5 &&
        Math.abs(prev.originY - next.originY) < 0.5
      ) {
        return prev;
      }
      return next;
    });
  }

  function snapshotAnchor() {
    const hitRect = hitRef.current?.getBoundingClientRect();
    if (!hitRect) return;
    anchorCenterRef.current = {
      x: hitRect.left + hitRect.width / 2,
      y: hitRect.top + hitRect.height / 2,
    };
  }

  function handleOpen() {
    clearCloseTimer();
    clearZoomOutTimer();
    if (expandedRef2.current) {
      setClosing(false);
      return;
    }
    if (hitRef.current) {
      frozenParallaxRef.current = readParallaxVars(hitRef.current);
    }
    snapshotAnchor();
    setClosing(false);
    expandedRef2.current = true;
    setExpanded(true);
  }

  function handleClose() {
    if (!expandedRef2.current) return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setClosing(true);
      zoomOutTimerRef.current = setTimeout(() => {
        expandedRef2.current = false;
        frozenParallaxRef.current = null;
        setExpanded(false);
        setClosing(false);
        setPlacement(null);
        anchorCenterRef.current = null;
      }, ZOOM_OUT_MS);
    }, CLOSE_DELAY_MS);
  }

  function handlePointerEnter() {
    if (isTouchDevice()) return;
    handleOpen();
  }

  function handlePointerLeave() {
    if (isTouchDevice()) return;
    handleClose();
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!isTouchDevice()) return;
    e.stopPropagation();
    if (expandedRef2.current) handleClose();
    else handleOpen();
  }

  useEffect(
    () => () => {
      clearCloseTimer();
      clearZoomOutTimer();
    },
    [],
  );

  useEffect(() => {
    if (!expanded || !isTouchDevice()) return;
    const onTapOutside = (e: PointerEvent) => {
      if (!hitRef.current?.contains(e.target as Node)) handleClose();
    };
    document.addEventListener("pointerdown", onTapOutside);
    return () => document.removeEventListener("pointerdown", onTapOutside);
  }, [expanded]);

  useLayoutEffect(() => {
    setPos({
      left: coordToMapPercent(item.x, "x"),
      // +Y = Comfort (top), -Y = Challenge (bottom) — invert for CSS top%
      top: clampMapTopPercent(coordToMapPercent(-item.y, "y") + yearOffsetPercent(item.watchedYear)),
    });
  }, [item.x, item.y, item.watchedYear]);

  useLayoutEffect(() => {
    if (!expanded) return;

    recalcPlacement();
    requestAnimationFrame(recalcPlacement);

    const el = expandedRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => recalcPlacement());
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onResize = () => recalcPlacement();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [expanded]);

  const mxExpr = frozenParallaxRef.current
    ? String(frozenParallaxRef.current.mx)
    : "var(--mx)";
  const myExpr = frozenParallaxRef.current
    ? String(frozenParallaxRef.current.my)
    : "var(--my)";

  const expandedCover = item.coverUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.coverUrl}
      alt={item.title}
      className="block w-full object-cover"
      style={{ height: "var(--card-expanded-h)", maxWidth: "none" }}
      decoding="async"
      draggable={false}
    />
  ) : (
    <div
      className="w-full"
      style={{
        height: "var(--card-expanded-h)",
        backgroundColor: item.color ?? "#666",
      }}
    />
  );

  const defaultCover = item.coverUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.coverUrl}
      alt=""
      className="pointer-events-none block"
      style={{
        width: "var(--card-w)",
        height: "var(--card-h)",
        maxWidth: "none",
        objectFit: "cover",
      }}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  ) : (
    <div
      className="pointer-events-none"
      style={{
        width: "var(--card-w)",
        height: "var(--card-h)",
        backgroundColor: item.color ?? "#666",
      }}
    />
  );

  const expandedCard = (
    <div
      ref={expandedRef}
      className="text-white"
      style={{ width: "var(--card-expanded-w)", fontSize: "1rem" }}
    >
      {expandedCover}
      <div className="mt-[0.5em] px-[0.25em] text-center">
        <p className="text-[1.5em] leading-tight">{item.title}</p>
        <p className="mt-[0.35em] text-[1em] leading-snug text-white/60">
          {item.year} · {item.director}
        </p>
        <p className="mt-[0.25em] text-[1em] leading-snug text-white/60">
          {truncateWords(item.description, 10)}
        </p>
      </div>
    </div>
  );

  const portal =
    expanded &&
    createPortal(
      <div
        className="pointer-events-none absolute"
        style={{
          left: placement?.left ?? -10000,
          top: placement?.top ?? 0,
          opacity: placement ? 1 : 0,
        }}
      >
        <div
          style={{
            transformOrigin: placement
              ? `${placement.originX}px ${placement.originY}px`
              : "center center",
            animation: closing
              ? `cardZoomOut ${ZOOM_OUT_MS}ms ease-in forwards`
              : placement
                ? `cardZoomIn ${ZOOM_IN_MS}ms ease-out forwards`
                : "none",
          }}
        >
          {expandedCard}
        </div>
      </div>,
      getPortalRoot(),
    );

  return (
    <>
      <div
        ref={hitRef}
        className="absolute touch-none"
        style={
          {
            left: `${left}%`,
            top: `${top}%`,
            width: "var(--card-w)",
            height: "var(--card-h)",
            boxSizing: "content-box",
            padding: "0.75rem",
            margin: "-0.75rem",
            zIndex: expanded ? 9999 : depthZIndex(item.watchedYear),
            transform: `translate(calc(-50% + calc(${mxExpr} * ${speed} * calc(-1 * var(--parallax-range)))), calc(-50% + calc(${myExpr} * ${speed} * calc(-1 * var(--parallax-range)))))`,
          } as React.CSSProperties
        }
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ visibility: expanded ? "hidden" : "visible" }}
        >
          {defaultCover}
        </div>
      </div>
      {portal}
    </>
  );
}
