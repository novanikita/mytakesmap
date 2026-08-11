const LABEL =
  "axis-label pointer-events-none absolute text-[1em] tracking-wide text-white/40 transition-opacity duration-200";

/** Axis ends align with poster hover bounds (map pads). */
const AXIS_INSET_TOP = "var(--map-pad-top)";
const AXIS_INSET_BOTTOM = "var(--map-pad-bottom)";
const AXIS_INSET_X = "var(--map-pad-x)";

export function AxisLabels() {
  return (
    <>
      {/* Axis lines stop at the poster hover zone */}
      <div
        className="pointer-events-none absolute left-1/2 w-[0.5px] -translate-x-1/2 bg-white/40"
        style={{ top: AXIS_INSET_TOP, bottom: AXIS_INSET_BOTTOM }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-[0.5px] -translate-y-1/2 bg-white/40"
        style={{ left: AXIS_INSET_X, right: AXIS_INSET_X }}
      />

      {/* Soft glow along the axis segments (not a floating blob) */}
      <div
        className="axis-dot pointer-events-none absolute top-1/2 z-10 h-[2px] w-7 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150"
        style={{
          left: `clamp(${AXIS_INSET_X}, calc(var(--px) * 100%), calc(100% - ${AXIS_INSET_X}))`,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 20%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.25) 80%, transparent 100%)",
        }}
      />
      <div
        className="axis-dot pointer-events-none absolute left-1/2 z-10 h-7 w-[2px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150"
        style={{
          top: `clamp(${AXIS_INSET_TOP}, calc(var(--py) * 100%), calc(100% - ${AXIS_INSET_BOTTOM}))`,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.25) 20%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.25) 80%, transparent 100%)",
        }}
      />

      <span className={`${LABEL} axis-challenge bottom-2 left-1/2 -translate-x-1/2`}>
        Challenge
      </span>
      <span className={`${LABEL} axis-detachment left-2 top-1/2 -translate-y-1/2`}>
        Detachment
      </span>
      <span className={`${LABEL} axis-engagement right-2 top-1/2 -translate-y-1/2`}>
        Engagement
      </span>
    </>
  );
}
