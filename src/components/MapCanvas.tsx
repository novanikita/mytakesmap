"use client";

import { useEffect, useRef, useState } from "react";
import { AxisLabels } from "./AxisLabels";
import { MapItem } from "./MapItem";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { LibraryItem, ItemType } from "@/lib/types";

interface MapCanvasProps {
  items: LibraryItem[];
  filterType: ItemType;
}

export function MapCanvas({ items, filterType }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { onMouseMove, onTouchMove, onPointerLeave } = usePointerParallax(containerRef, 0.05);

  const [displayType, setDisplayType] = useState(filterType);
  const [fade, setFade] = useState(1);

  useEffect(() => {
    if (filterType === displayType) return;
    setFade(0);
    const timer = setTimeout(() => {
      setDisplayType(filterType);
      requestAnimationFrame(() => setFade(1));
    }, 180);
    return () => clearTimeout(timer);
  }, [filterType, displayType]);

  function updateAxisPointer(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    el.style.setProperty("--px", String(x));
    el.style.setProperty("--py", String(y));
    el.dataset.pointer = "1";
    el.dataset.quad = `${y < 0.5 ? "n" : "s"}${x < 0.5 ? "w" : "e"}`;
  }

  function clearAxisPointer() {
    const el = containerRef.current;
    if (el) {
      el.style.setProperty("--px", "0.5");
      el.style.setProperty("--py", "0.5");
      el.dataset.pointer = "0";
      delete el.dataset.quad;
    }
    onPointerLeave();
  }

  const visible = items
    .filter((item) => item.type === displayType)
    .sort((a, b) => a.watchedYear - b.watchedYear);

  return (
    <div
      ref={containerRef}
      className="axis-map relative h-full w-full touch-none"
      style={{ "--mx": 0, "--my": 0, "--px": 0.5, "--py": 0.5 } as React.CSSProperties}
      data-pointer="0"
      onMouseMove={(e) => {
        onMouseMove(e);
        updateAxisPointer(e.clientX, e.clientY);
      }}
      onTouchMove={(e) => {
        onTouchMove(e);
        if (e.touches.length === 1) {
          updateAxisPointer(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onMouseLeave={clearAxisPointer}
      onTouchEnd={clearAxisPointer}
    >
      <AxisLabels />
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-in-out"
        style={{ opacity: fade }}
      >
        {visible.map((item) => (
          <MapItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
