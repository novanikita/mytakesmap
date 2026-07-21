const LABEL =
  "axis-label pointer-events-none absolute text-[1em] tracking-wide text-white/40 transition-opacity duration-200";

const AXIS_INSET_Y = "2.75em";
const AXIS_INSET_X = "8em";

export function AxisLabels() {
  return (
    <>
      {/* Axis lines with gaps under edge labels */}
      <div
        className="pointer-events-none absolute left-1/2 w-[0.5px] -translate-x-1/2 bg-white/40"
        style={{ top: AXIS_INSET_Y, bottom: AXIS_INSET_Y }}
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
          boxShadow: "0 0 10px 1px rgba(255,255,255,0.35)",
        }}
      />
      <div
        className="axis-dot pointer-events-none absolute left-1/2 z-10 h-7 w-[2px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-150"
        style={{
          top: `clamp(${AXIS_INSET_Y}, calc(var(--py) * 100%), calc(100% - ${AXIS_INSET_Y}))`,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.25) 20%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.25) 80%, transparent 100%)",
          boxShadow: "0 0 10px 1px rgba(255,255,255,0.35)",
        }}
      />

      <span className={`${LABEL} axis-comfort left-1/2 top-2 -translate-x-1/2`}>Comfort</span>
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
