"use client";

import { useEffect, useState } from "react";
import { CoordPicker } from "@/components/CoordPicker";
import { ItemType, NewItemInput } from "@/lib/types";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: NewItemInput) => void;
  defaultType: ItemType;
}

const emptyForm: NewItemInput = {
  type: "movie",
  title: "",
  year: new Date().getFullYear(),
  director: "",
  coverUrl: "",
  description: "",
  x: 0,
  y: 0,
  watchedYear: new Date().getFullYear(),
};

const field =
  "w-full rounded border border-white/15 bg-transparent px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40";

const label = "flex flex-col gap-1 text-xs tracking-wide text-white/45";

export function AddItemModal({ open, onClose, onSubmit, defaultType }: AddItemModalProps) {
  const [form, setForm] = useState<NewItemInput>({ ...emptyForm, type: defaultType });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, type: defaultType });
      setUploadError("");
    }
  }, [open, defaultType]);

  if (!open) return null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setField("coverUrl", data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
    setForm({ ...emptyForm, type: defaultType });
    setUploadError("");
    onClose();
  }

  function setField<K extends keyof NewItemInput>(key: K, value: NewItemInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="scroll-thin flex max-h-[min(90vh,40rem)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/15 bg-zinc-950"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-base text-white">Add</h2>
          <div className="flex items-center gap-1 rounded-full border border-white/15 p-0.5">
            {(["movie", "book"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setField("type", type)}
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
            <label className={label}>
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className={field}
                placeholder="Title"
              />
            </label>

            <label className={label}>
              {form.type === "movie" ? "Director" : "Author"}
              <input
                required
                value={form.director}
                onChange={(e) => setField("director", e.target.value)}
                className={field}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className={label}>
                Release year
                <input
                  required
                  type="number"
                  value={form.year}
                  onChange={(e) => setField("year", Number(e.target.value))}
                  className={field}
                />
              </label>
              <label className={label}>
                Watched / read
                <input
                  required
                  type="number"
                  value={form.watchedYear}
                  onChange={(e) => setField("watchedYear", Number(e.target.value))}
                  className={field}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <div className="relative h-[4.5rem] w-[3.2rem] shrink-0 overflow-hidden rounded border border-white/15 bg-black">
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
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                <label className="cursor-pointer text-xs text-white/45 underline underline-offset-2 hover:text-white/70">
                  {uploading ? "Uploading…" : "Upload cover"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <input
                  value={form.coverUrl}
                  onChange={(e) => setField("coverUrl", e.target.value)}
                  placeholder="or paste URL"
                  className={field}
                />
                {uploadError && (
                  <span className="text-xs text-red-400">{uploadError}</span>
                )}
              </div>
            </div>

            <label className={label}>
              Description
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={2}
                placeholder="A short take"
                className={`${field} resize-none`}
              />
            </label>
          </div>

          <CoordPicker
            x={form.x}
            y={form.y}
            onChange={({ x, y }) => setForm((prev) => ({ ...prev, x, y }))}
            className="md:pt-0"
          />
        </div>

        <div className="flex items-center justify-end gap-5 border-t border-white/10 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-white/45 underline underline-offset-4 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="rounded-full border border-white/25 px-5 py-1.5 text-sm text-white transition hover:border-white/60 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
