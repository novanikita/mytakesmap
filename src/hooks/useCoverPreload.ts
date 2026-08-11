"use client";

import { useEffect, useState } from "react";
import { preloadCovers } from "@/lib/preloadCovers";
import { mapCoverSrc } from "@/lib/coverImages";

interface CoverPreloadState {
  ready: boolean;
  loaded: number;
  total: number;
}

export function useCoverPreload(urls: string[]): CoverPreloadState {
  const key = urls.filter(Boolean).join("\0");
  const [state, setState] = useState<CoverPreloadState>(() => ({
    ready: urls.filter(Boolean).length === 0,
    loaded: 0,
    total: urls.filter(Boolean).length,
  }));

  useEffect(() => {
    const unique = [...new Set(urls.filter(Boolean).map(mapCoverSrc))];
    if (unique.length === 0) {
      setState({ ready: true, loaded: 0, total: 0 });
      return;
    }

    let cancelled = false;
    setState({ ready: false, loaded: 0, total: unique.length });

    preloadCovers(unique, (loaded, total) => {
      if (!cancelled) {
        setState({ ready: false, loaded, total });
      }
    }).then(() => {
      if (!cancelled) {
        setState({ ready: true, loaded: unique.length, total: unique.length });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}
