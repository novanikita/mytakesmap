"use client";

import { useRef } from "react";

interface CoordPickerProps {
  x: number;
  y: number;
  onChange: (coords: { x: number; y: number }) => void;
  className?: string;
}

function clampCoord(n: number): number {
  return Math.max(-100, Math.min(100, Math.round(n)));
}

function pointToCoords(clientX: number, clientY: number, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  return {
    x: clampCoord((px - 0.5) * 200),
    y: clampCoord((0.5 - py) * 200),
  };
}

const inputClass =
  "w-full rounded border border-white/15 bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40";

export function CoordPicker({ x, y, onChange, className = "" }: CoordPickerProps) {
  const padRef = useRef<HTMLDivElement>(null);

  function place(clientX: number, clientY: number) {
    const el = padRef.current;
    if (!el) return;
    onChange(pointToCoords(clientX, clientY, el));
  }

  const left = ((x + 100) / 200) * 100;
  const top = ((-y + 100) / 200) * 100;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        ref={padRef}
        role="slider"
        aria-label="Position on Engagement and Comfort axes"
        tabIndex={0}
        onClick={(e) => place(e.clientX, e.clientY)}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          place(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          place(e.clientX, e.clientY);
        }}
        className="relative aspect-square w-full cursor-crosshair select-none overflow-hidden rounded border border-white/15 bg-black touch-none"
      >
        <div className="pointer-events-none absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-white/20" />
        <div className="pointer-events-none absolute inset-x-5 top-1/2 h-px -translate-y-1/2 bg-white/20" />

        <span className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 text-[0.6rem] tracking-wide text-white/30">
          Comfort
        </span>
        <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-wide text-white/30">
          Challenge
        </span>
        <span className="pointer-events-none absolute left-1 top-1/2 origin-center -translate-y-1/2 -rotate-90 text-[0.6rem] tracking-wide text-white/30">
          Detachment
        </span>
        <span className="pointer-events-none absolute right-1 top-1/2 origin-center -translate-y-1/2 rotate-90 text-[0.6rem] tracking-wide text-white/30">
          Engagement
        </span>

        <div
          className="pointer-events-none absolute z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_1px_rgba(255,255,255,0.4)]"
          style={{ left: `${left}%`, top: `${top}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-1.5 text-xs text-white/40">
          <span className="w-3 shrink-0">X</span>
          <input
            type="number"
            min={-100}
            max={100}
            value={x}
            onChange={(e) =>
              onChange({ x: clampCoord(Number(e.target.value) || 0), y })
            }
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-white/40">
          <span className="w-3 shrink-0">Y</span>
          <input
            type="number"
            min={-100}
            max={100}
            value={y}
            onChange={(e) =>
              onChange({ x, y: clampCoord(Number(e.target.value) || 0) })
            }
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}
