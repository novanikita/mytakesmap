"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AxisLabels } from "./AxisLabels";
import { MapItem } from "./MapItem";
import { MapLoadingOverlay } from "./MapLoadingOverlay";
import { useCoverPreload } from "@/hooks/useCoverPreload";
import { layoutMapItem } from "@/lib/mapLayout";
import { LibraryItem, ItemType } from "@/lib/types";

interface MapCanvasProps {
  items: LibraryItem[];
  filterType: ItemType;
  deleteMode?: boolean;
  onDelete?: (id: string) => void;
}

export function MapCanvas({
  items,
  filterType,
  deleteMode = false,
  onDelete,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerRafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);

  const [displayType, setDisplayType] = useState(filterType);
  const [revealed, setRevealed] = useState(false);
  const [layoutEpoch, setLayoutEpoch] = useState(0);

  const pendingItems = items.filter((item) => item.type === filterType);
  const coverUrls = pendingItems.map((item) => item.coverUrl);
  const { ready, loaded, total } = useCoverPreload(coverUrls);

  useEffect(() => {
    setRevealed(false);
  }, [filterType]);

  useEffect(() => {
    if (!ready) return;
    setDisplayType(filterType);
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, [ready, filterType]);

  useEffect(() => {
    const onResize = () => setLayoutEpoch((value) => value + 1);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(
    () => () => {
      if (pointerRafRef.current) cancelAnimationFrame(pointerRafRef.current);
    },
    [],
  );

  const visible = useMemo(
    () =>
      items
        .filter((item) => item.type === displayType)
        .sort((a, b) => a.watchedYear - b.watchedYear),
    [items, displayType],
  );

  const positionedItems = useMemo(
    () =>
      visible.map((item) => ({
        item,
        layout: layoutMapItem(item),
      })),
    [visible, layoutEpoch],
  );

  const flushAxisPointer = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    el.style.setProperty("--px", String(x));
    el.style.setProperty("--py", String(y));
    el.dataset.pointer = "1";
    el.dataset.quad = `${y < 0.5 ? "n" : "s"}${x < 0.5 ? "w" : "e"}`;
  }, []);

  const scheduleAxisPointer = useCallback(
    (clientX: number, clientY: number) => {
      pendingPointerRef.current = { x: clientX, y: clientY };
      if (pointerRafRef.current !== null) return;

      pointerRafRef.current = requestAnimationFrame(() => {
        pointerRafRef.current = null;
        const pending = pendingPointerRef.current;
        if (!pending) return;
        flushAxisPointer(pending.x, pending.y);
      });
    },
    [flushAxisPointer],
  );

  const clearAxisPointer = useCallback(() => {
    pendingPointerRef.current = null;
    if (pointerRafRef.current !== null) {
      cancelAnimationFrame(pointerRafRef.current);
      pointerRafRef.current = null;
    }

    const el = containerRef.current;
    if (el) {
      el.style.setProperty("--px", "0.5");
      el.style.setProperty("--py", "0.5");
      el.dataset.pointer = "0";
      delete el.dataset.quad;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="axis-map relative h-full w-full touch-none"
      style={{ "--px": 0.5, "--py": 0.5 } as React.CSSProperties}
      data-pointer="0"
      onMouseMove={(e) => {
        scheduleAxisPointer(e.clientX, e.clientY);
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 1) {
          scheduleAxisPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onMouseLeave={clearAxisPointer}
      onTouchEnd={clearAxisPointer}
    >
      <AxisLabels />

      {!ready && <MapLoadingOverlay loaded={loaded} total={total} />}

      <div
        className="map-layer absolute inset-0"
        style={{ opacity: revealed ? 1 : 0 }}
      >
        {positionedItems.map(({ item, layout }) => (
          <MapItem
            key={item.id}
            item={item}
            left={layout.left}
            top={layout.top}
            zIndex={layout.zIndex}
            deleteMode={deleteMode}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
