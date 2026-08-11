import {
  clampMapTopPercent,
  coordToMapPercent,
  depthZIndex,
  yearOffsetPercent,
} from "@/lib/coordinates";
import { LibraryItem } from "@/lib/types";

export interface MapItemLayout {
  left: number;
  top: number;
  zIndex: number;
}

export function layoutMapItem(item: LibraryItem): MapItemLayout {
  return {
    left: coordToMapPercent(item.x, "x"),
    top: clampMapTopPercent(
      coordToMapPercent(-item.y, "y") + yearOffsetPercent(item.watchedYear),
    ),
    zIndex: depthZIndex(item.watchedYear),
  };
}
