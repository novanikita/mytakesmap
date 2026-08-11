interface MapLoadingOverlayProps {
  loaded: number;
  total: number;
}

export function MapLoadingOverlay({ loaded, total }: MapLoadingOverlayProps) {
  const progress = total > 0 ? Math.round((loaded / total) * 100) : 100;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/90">
      <div className="flex flex-col items-center gap-7 px-6">
        <div className="flex items-end justify-center gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="map-load-poster"
              style={{ animationDelay: `${index * 140}ms` }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/45">
            Loading map
          </p>
          {total > 0 ? (
            <p className="mt-2 text-xs tabular-nums text-white/30">
              {loaded} / {total} · {progress}%
            </p>
          ) : null}
        </div>

        <div className="h-px w-44 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/55 transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
