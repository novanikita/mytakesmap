export type ItemType = "movie" | "book";

export interface LibraryItem {
  id: string;
  type: ItemType;
  title: string;
  year: number;
  director: string;
  coverUrl: string;
  description: string;
  /** X: Engagement (+100) ↔ Detachment (−100) */
  x: number;
  /** Y: Comfort (+100) ↔ Challenge (−100) */
  y: number;
  /** Год просмотра / прочтения — влияет на глубину и положение */
  watchedYear: number;
  /** Цвет-заглушка, если нет обложки */
  color?: string;
  /** Пресет размера карточки */
  size?: "sm" | "md" | "lg";
}

export interface NewItemInput {
  type: ItemType;
  title: string;
  year: number;
  director: string;
  coverUrl: string;
  description: string;
  x: number;
  y: number;
  watchedYear: number;
}
