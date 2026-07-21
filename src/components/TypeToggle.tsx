"use client";

interface TypeToggleProps {
  value: "movie" | "book";
  onChange: (value: "movie" | "book") => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/60 p-1 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onChange("movie")}
        className={`rounded-full px-4 py-1.5 text-sm transition-all ${
          value === "movie"
            ? "bg-white text-black"
            : "text-white/60 hover:text-white"
        }`}
      >
        Movies
      </button>
      <button
        type="button"
        onClick={() => onChange("book")}
        className={`rounded-full px-4 py-1.5 text-sm transition-all ${
          value === "book"
            ? "bg-white text-black"
            : "text-white/60 hover:text-white"
        }`}
      >
        Books
      </button>
    </div>
  );
}
