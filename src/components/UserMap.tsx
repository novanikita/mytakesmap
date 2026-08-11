"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { MapCanvas } from "@/components/MapCanvas";
import { TypeToggle } from "@/components/TypeToggle";
import { AddItemModal } from "@/components/AddItemModal";
import { ItemType, LibraryItem, NewItemInput } from "@/lib/types";

interface UserMapProps {
  username: string;
  isOwner: boolean;
  items: LibraryItem[];
}

const headerBtn =
  "rounded-full border px-4 py-1.5 text-sm transition border-white/20 text-white/80 hover:border-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

export function UserMap({ username, isOwner, items: initialItems }: UserMapProps) {
  const [filterType, setFilterType] = useState<ItemType>("movie");
  const [items, setItems] = useState(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [baselineItems, setBaselineItems] = useState<LibraryItem[] | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleAdd(input: NewItemInput) {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = (await res.json()) as LibraryItem[];
      setItems(data);
    }
  }

  function enterDeleteMode() {
    setBaselineItems(items);
    setPendingDeleteIds([]);
    setDeleteMode(true);
  }

  function handleStageDelete(id: string) {
    setPendingDeleteIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function handleBack() {
    if (baselineItems) setItems(baselineItems);
    setBaselineItems(null);
    setPendingDeleteIds([]);
    setDeleteMode(false);
  }

  async function handleSaveDeletes() {
    if (saving) return;

    if (pendingDeleteIds.length === 0) {
      setBaselineItems(null);
      setDeleteMode(false);
      return;
    }

    setSaving(true);
    const snapshot = baselineItems ?? items;

    try {
      const results = await Promise.all(
        pendingDeleteIds.map((id) =>
          fetch(`/api/items?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
        ),
      );

      if (results.some((res) => !res.ok)) {
        setItems(snapshot);
        setPendingDeleteIds([]);
        setBaselineItems(null);
        setDeleteMode(false);
        return;
      }

      const last = results[results.length - 1];
      const data = (await last.json()) as LibraryItem[];
      setItems(data);
      setPendingDeleteIds([]);
      setBaselineItems(null);
      setDeleteMode(false);
    } catch {
      setItems(snapshot);
      setPendingDeleteIds([]);
      setBaselineItems(null);
      setDeleteMode(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <header className="absolute left-0 right-0 top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <div className="justify-self-start">
          <TypeToggle value={filterType} onChange={setFilterType} />
        </div>
        <span className="axis-label axis-comfort pointer-events-none select-none text-[1em] tracking-wide text-white/40 transition-opacity duration-200">
          Comfort
        </span>
        <div className="justify-self-end flex items-center gap-2">
          {isOwner ? (
            deleteMode ? (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={saving}
                  className={headerBtn}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSaveDeletes}
                  disabled={saving}
                  className="rounded-full border border-white bg-white px-4 py-1.5 text-sm text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className={headerBtn}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={enterDeleteMode}
                  className={headerBtn}
                >
                  Delete
                </button>
              </>
            )
          ) : null}
        </div>
      </header>

      <MapCanvas
        items={items}
        filterType={filterType}
        deleteMode={isOwner && deleteMode}
        onDelete={handleStageDelete}
      />

      {items.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <p className="text-center text-white/45">
            {isOwner
              ? deleteMode
                ? "Nothing left to delete. Save or go Back."
                : "Your map is empty. Add a movie or book."
              : "This map is empty."}
          </p>
        </div>
      )}

      <div className="absolute bottom-3 right-4 z-50 flex items-center gap-3 text-sm text-white/70">
        <span className="text-white/40">{username}</span>
        {isOwner ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-white/55 underline underline-offset-4 transition hover:text-white"
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/login"
            className="text-white/55 underline underline-offset-4 transition hover:text-white"
          >
            Sign in
          </Link>
        )}
      </div>

      {isOwner && (
        <AddItemModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleAdd}
          defaultType={filterType}
        />
      )}
    </main>
  );
}
