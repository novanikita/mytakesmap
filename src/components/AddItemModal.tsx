"use client";

import { useEffect, useRef, useState } from "react";
import { CoordPicker } from "@/components/CoordPicker";
import type { LookupResult } from "@/lib/mediaLookup";
import { ItemType, NewItemInput } from "@/lib/types";
import { normalizeNewItem, validateNewItem } from "@/lib/itemValidation";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: NewItemInput) => void;
  defaultType: ItemType;
}

interface FormState {
  type: ItemType;
  title: string;
  year: string;
  director: string;
  coverUrl: string;
  description: string;
  x: number;
  y: number;
  placed: boolean;
  watchedYear: string;
  selected: boolean;
}

function emptyForm(type: ItemType): FormState {
  return {
    type,
    title: "",
    year: "",
    director: "",
    coverUrl: "",
    description: "",
    x: 0,
    y: 0,
    placed: false,
    watchedYear: "",
    selected: false,
  };
}

const field =
  "w-full rounded border border-white/15 bg-transparent px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40";

const label = "flex flex-col gap-1 text-xs tracking-wide text-white/45";

export function AddItemModal({ open, onClose, onSubmit, defaultType }: AddItemModalProps) {
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultType));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LookupResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const searchSeq = useRef(0);

  useEffect(() => {
    if (open) {
      setForm(emptyForm(defaultType));
      setQuery("");
      setResults([]);
      setSearching(false);
      setImporting(false);
      setShowDetails(false);
      setUploading(false);
      setFormError("");
    }
  }, [open, defaultType]);

  useEffect(() => {
    if (!open || form.selected) return;

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const seq = ++searchSeq.current;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/lookup/search?type=${form.type}&q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        if (seq !== searchSeq.current) return;
        if (!res.ok) throw new Error(data.error || "Search failed");
        setResults((data.results as LookupResult[]) ?? []);
      } catch {
        if (seq !== searchSeq.current) return;
        setResults([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [query, form.type, form.selected, open]);

  if (!open) return null;

  async function handleSelect(result: LookupResult) {
    setImporting(true);
    setFormError("");
    setResults([]);
    setQuery(result.title);

    try {
      const res = await fetch("/api/lookup/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          title: result.title,
          year: result.year,
          credit: result.credit,
          coverUrl: result.coverUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setForm((prev) => ({
        ...prev,
        title: data.title || result.title,
        year: data.year ? String(data.year) : result.year ? String(result.year) : "",
        director: data.credit || result.credit || "",
        coverUrl: data.coverUrl || "",
        selected: true,
      }));
      setShowDetails(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function clearSelection() {
    setForm((prev) => ({
      ...emptyForm(prev.type),
      type: prev.type,
    }));
    setQuery("");
    setResults([]);
    setShowDetails(false);
    setFormError("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError("");

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((prev) => ({ ...prev, coverUrl: data.url, selected: true }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.placed) {
      setFormError("Place the item on the map");
      return;
    }

    const draft: NewItemInput = {
      type: form.type,
      title: form.title,
      year: Number(form.year),
      director: form.director,
      coverUrl: form.coverUrl,
      description: form.description,
      x: form.x,
      y: form.y,
      watchedYear:
        form.watchedYear === ""
          ? Number(form.year) || new Date().getFullYear()
          : Number(form.watchedYear),
    };

    const error = validateNewItem(draft);
    if (error) {
      setFormError(error);
      setShowDetails(true);
      return;
    }

    onSubmit(normalizeNewItem(draft));
    onClose();
  }

  const creditLabel = form.type === "movie" ? "Director" : "Author";
  const canSubmit =
    !importing &&
    !uploading &&
    form.title.trim() !== "" &&
    form.director.trim() !== "" &&
    form.year.trim() !== "" &&
    form.coverUrl.trim() !== "" &&
    form.placed;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="scroll-thin flex max-h-[min(90vh,40rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/15 bg-zinc-950"
        noValidate
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-base text-white">Add</h2>
          <div className="flex items-center gap-1 rounded-full border border-white/15 p-0.5">
            {(["movie", "book"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setForm(emptyForm(type));
                  setQuery("");
                  setResults([]);
                  setShowDetails(false);
                  setFormError("");
                }}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  form.type === type
                    ? "bg-white text-black"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {type === "movie" ? "Movie" : "Book"}
              </button>
            ))}
          </div>
        </div>

        <div className="scroll-thin grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-[1fr_13rem]">
          <div className="flex flex-col gap-3">
            {!form.selected ? (
              <div className="relative">
                <label className={label}>
                  Title <span className="text-white/25">(required)</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={field}
                    placeholder={
                      form.type === "movie" ? "Search a movie…" : "Search a book…"
                    }
                    autoFocus
                  />
                </label>

                {(searching || results.length > 0 || query.trim().length >= 2) && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-64 overflow-y-auto rounded border border-white/15 bg-zinc-950 shadow-xl">
                    {searching ? (
                      <p className="px-3 py-2 text-xs text-white/40">Searching…</p>
                    ) : results.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-white/40">No matches</p>
                    ) : (
                      results.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelect(result)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/5"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={result.coverUrl}
                            alt=""
                            className="h-12 w-8 shrink-0 object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-white">
                              {result.title}
                            </span>
                            <span className="block text-xs text-white/40">
                              {[result.year, result.credit].filter(Boolean).join(" · ") ||
                                "Select to autofill"}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      title: query.trim(),
                      selected: true,
                    }));
                    setShowDetails(true);
                    setResults([]);
                  }}
                  className="mt-2 text-xs text-white/40 underline underline-offset-2 hover:text-white/70"
                >
                  Enter manually
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-3 rounded border border-white/15 p-3">
                  <div className="relative h-[5.5rem] w-[4rem] shrink-0 overflow-hidden rounded bg-black">
                    {form.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.coverUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[0.6rem] text-white/25">
                        cover
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{form.title || "Untitled"}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {[form.year, form.director].filter(Boolean).join(" · ") ||
                        "Details missing"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs">
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-white/45 underline underline-offset-2 hover:text-white/70"
                      >
                        Change title
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDetails((v) => !v)}
                        className="text-white/45 underline underline-offset-2 hover:text-white/70"
                      >
                        {showDetails ? "Hide details" : "Edit details"}
                      </button>
                    </div>
                  </div>
                </div>

                <label className={label}>
                  Watched / read <span className="text-white/25">(optional)</span>
                  <input
                    type="number"
                    value={form.watchedYear}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, watchedYear: e.target.value }))
                    }
                    placeholder={form.year || "Current year"}
                    className={field}
                  />
                </label>

                {showDetails ? (
                  <div className="flex flex-col gap-3 border-t border-white/10 pt-3">
                    <label className={label}>
                      Title
                      <input
                        value={form.title}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className={field}
                      />
                    </label>
                    <label className={label}>
                      {creditLabel}
                      <input
                        value={form.director}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, director: e.target.value }))
                        }
                        className={field}
                        placeholder={
                          form.type === "movie" ? "Director" : "Author"
                        }
                      />
                    </label>
                    <label className={label}>
                      Release year
                      <input
                        type="number"
                        value={form.year}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, year: e.target.value }))
                        }
                        className={field}
                      />
                    </label>
                    <div className="flex gap-3">
                      <label className="cursor-pointer text-xs text-white/45 underline underline-offset-2 hover:text-white/70">
                        {uploading ? "Uploading…" : "Replace cover"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <label className={label}>
                      Description <span className="text-white/25">(optional)</span>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        rows={2}
                        placeholder="A short take"
                        className={`${field} resize-none`}
                      />
                    </label>
                  </div>
                ) : null}
              </>
            )}

            {importing ? (
              <p className="text-xs text-white/40">Importing cover and details…</p>
            ) : null}
          </div>

          <CoordPicker
            x={form.x}
            y={form.y}
            placed={form.placed}
            onChange={({ x, y }) =>
              setForm((prev) => ({ ...prev, x, y, placed: true }))
            }
            error={
              formError.toLowerCase().includes("place") ||
              formError.toLowerCase().includes("coord")
                ? formError
                : undefined
            }
            className="md:pt-0"
          />
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-white/10 px-5 py-3">
          <div className="min-h-[1rem] text-xs text-red-400">{formError}</div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-white/45 underline underline-offset-4 transition hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-full border border-white/25 px-5 py-1.5 text-sm text-white transition hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
