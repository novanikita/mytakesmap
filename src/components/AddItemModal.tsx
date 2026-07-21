"use client";

import { useState } from "react";
import { getAdminHeaders } from "@/lib/admin";
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

export function AddItemModal({ open, onClose, onSubmit, defaultType }: AddItemModalProps) {
  const [form, setForm] = useState<NewItemInput>({ ...emptyForm, type: defaultType });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
        headers: getAdminHeaders(),
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
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-lg border border-white/20 bg-zinc-900 p-6"
      >
        <h2 className="text-lg">Add item</h2>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Type
          <select
            value={form.type}
            onChange={(e) => setField("type", e.target.value as ItemType)}
            className="rounded border border-white/20 bg-black px-3 py-2 text-white"
          >
            <option value="movie">Movie</option>
            <option value="book">Book</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            className="rounded border border-white/20 bg-black px-3 py-2 text-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Release year
          <input
            required
            type="number"
            value={form.year}
            onChange={(e) => setField("year", Number(e.target.value))}
            className="rounded border border-white/20 bg-black px-3 py-2 text-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          {form.type === "movie" ? "Director" : "Author"}
          <input
            required
            value={form.director}
            onChange={(e) => setField("director", e.target.value)}
            className="rounded border border-white/20 bg-black px-3 py-2 text-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Year watched / read
          <input
            required
            type="number"
            value={form.watchedYear}
            onChange={(e) => setField("watchedYear", Number(e.target.value))}
            className="rounded border border-white/20 bg-black px-3 py-2 text-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm text-white/70">
            X (engagement)
            <input
              type="number"
              min={-100}
              max={100}
              value={form.x}
              onChange={(e) => setField("x", Number(e.target.value))}
              className="rounded border border-white/20 bg-black px-3 py-2 text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-white/70">
            Y (comfort)
            <input
              type="number"
              min={-100}
              max={100}
              value={form.y}
              onChange={(e) => setField("y", Number(e.target.value))}
              className="rounded border border-white/20 bg-black px-3 py-2 text-white"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 text-sm text-white/70">
          <span>Cover</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="rounded border border-white/20 bg-black px-3 py-2 text-white file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-white"
          />
          {uploading && <span className="text-xs text-white/40">Uploading…</span>}
          {uploadError && <span className="text-xs text-red-400">{uploadError}</span>}
          {form.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.coverUrl}
              alt="Preview"
              className="mt-1 h-24 w-auto rounded object-cover"
            />
          )}
          <input
            value={form.coverUrl}
            onChange={(e) => setField("coverUrl", e.target.value)}
            placeholder="or paste URL: https://..."
            className="rounded border border-white/20 bg-black px-3 py-2 text-white"
          />
        </div>

        <label className="flex flex-col gap-1 text-sm text-white/70">
          Short description
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className="resize-none rounded border border-white/20 bg-black px-3 py-2 text-white"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="flex-1 rounded bg-white px-4 py-2 text-sm text-black hover:bg-white/90 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
