"use client";

import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  EXPANDED_COVER_WIDTH,
  mapCoverHeight,
  MAP_COVER_WIDTH,
  mapCoverSrc,
  expandedCoverSizes,
} from "@/lib/coverImages";
import {
  ExpandedPlacement,
  measureExpandedSize,
  placeExpandedCard,
} from "@/lib/portalPosition";
import { truncateWords } from "@/lib/text";
import { LibraryItem } from "@/lib/types";

interface MapItemProps {
  item: LibraryItem;
  left: number;
  top: number;
  zIndex: number;
  deleteMode?: boolean;
  onDelete?: (id: string) => void;
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

export const MapItem = memo(function MapItem({
  item,
  left,
  top,
  zIndex,
  deleteMode = false,
  onDelete,
}: MapItemProps) {
  const hitRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const anchorCenterRef = useRef<{ x: number; y: number } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandedRef2 = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [placement, setPlacement] = useState<ExpandedPlacement | null>(null);

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
        setExpanded(false);
        setClosing(false);
        setPlacement(null);
        anchorCenterRef.current = null;
      }, ZOOM_OUT_MS);
    }, CLOSE_DELAY_MS);
  }

  function handlePointerEnter() {
    if (deleteMode || isTouchDevice()) return;
    handleOpen();
  }

  function handlePointerLeave() {
    if (deleteMode || isTouchDevice()) return;
    handleClose();
  }

  function handleDelete() {
    onDelete?.(item.id);
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (deleteMode) {
      e.stopPropagation();
      handleDelete();
      return;
    }
    if (!isTouchDevice()) return;
    e.stopPropagation();
    if (expandedRef2.current) handleClose();
    else handleOpen();
  }

  useEffect(() => {
    if (!deleteMode) return;
    clearCloseTimer();
    clearZoomOutTimer();
    if (!expandedRef2.current) return;
    expandedRef2.current = false;
    setExpanded(false);
    setClosing(false);
    setPlacement(null);
    anchorCenterRef.current = null;
  }, [deleteMode]);

  useEffect(
    () => () => {
      clearCloseTimer();
      clearZoomOutTimer();
    },
    [],
  );

  useEffect(() => {
    if (!expanded || !isTouchDevice() || deleteMode) return;
    const onTapOutside = (e: PointerEvent) => {
      if (!hitRef.current?.contains(e.target as Node)) handleClose();
    };
    document.addEventListener("pointerdown", onTapOutside);
    return () => document.removeEventListener("pointerdown", onTapOutside);
  }, [expanded, deleteMode]);

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

  const thumbSrc = item.coverUrl ? mapCoverSrc(item.coverUrl) : "";

  const expandedCover = item.coverUrl ? (
    <Image
      src={item.coverUrl}
      alt={item.title}
      width={EXPANDED_COVER_WIDTH}
      height={Math.round(EXPANDED_COVER_WIDTH * 1.4)}
      sizes={expandedCoverSizes()}
      quality={58}
      className="block w-full object-cover"
      style={{ height: "var(--card-expanded-h)", maxWidth: "none" }}
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
          className="card-zoom-anim"
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
        </div>
      </div>,
      getPortalRoot(),
    );

  return (
    <>
      <div
        ref={hitRef}
        className={`map-item-hit absolute touch-none ${deleteMode ? "cursor-pointer" : ""}`}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: "var(--card-w)",
          height: "var(--card-h)",
          zIndex: expanded ? 9999 : zIndex,
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ visibility: expanded ? "hidden" : "visible" }}
        >
          {thumbSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbSrc}
              alt=""
              width={MAP_COVER_WIDTH}
              height={mapCoverHeight()}
              className="map-item-thumb block"
              style={{
                width: "var(--card-w)",
                height: "var(--card-h)",
                maxWidth: "none",
                objectFit: "cover",
              }}
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
          )}
          {deleteMode ? (
            <span
              aria-hidden
              className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[0.65rem] leading-none text-black shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
            >
              −
            </span>
          ) : null}
        </div>
      </div>
      {portal}
    </>
  );
});
