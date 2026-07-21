"use client";

import { useCallback, useEffect, useRef } from "react";

function pointerToNormalized(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width - 0.5) * 2,
    y: ((clientY - rect.top) / rect.height - 0.5) * 2,
  };
}

export function usePointerParallax(
  containerRef: React.RefObject<HTMLElement | null>,
  smoothing = 0.05,
) {
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  const updateTarget = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    target.current = pointerToNormalized(clientX, clientY, rect);
  }, [containerRef]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      updateTarget(e.clientX, e.clientY);
    },
    [updateTarget],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length !== 1) return;
      e.preventDefault();
      updateTarget(e.touches[0].clientX, e.touches[0].clientY);
    },
    [updateTarget],
  );

  const onPointerLeave = useCallback(() => {
    target.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      const el = containerRef.current;
      if (el) {
        current.current = {
          x: current.current.x + (target.current.x - current.current.x) * smoothing,
          y: current.current.y + (target.current.y - current.current.y) * smoothing,
        };
        el.style.setProperty("--mx", String(current.current.x));
        el.style.setProperty("--my", String(current.current.y));
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [containerRef, smoothing]);

  return { onMouseMove, onTouchMove, onPointerLeave };
}
