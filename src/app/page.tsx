"use client";

import { useEffect, useState } from "react";
import { MapCanvas } from "@/components/MapCanvas";
import { TypeToggle } from "@/components/TypeToggle";
import { AddItemModal } from "@/components/AddItemModal";
import { isAdminClient, getAdminHeaders } from "@/lib/admin";
import { ItemType, LibraryItem, NewItemInput } from "@/lib/types";

export default function Home() {
  const [filterType, setFilterType] = useState<ItemType>("movie");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const isAdmin = isAdminClient();

  useEffect(() => {
    fetch("/api/items")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: LibraryItem[]) => setItems(data))
      .catch((err) => console.error("Failed to load items:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(input: NewItemInput) {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminHeaders(),
      },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const data = (await res.json()) as LibraryItem[];
      setItems(data);
    }
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <header className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4">
        <TypeToggle value={filterType} onChange={setFilterType} />
        {isAdmin && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
          >
            + Add
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex h-full items-center justify-center text-white/40">
          Loading…
        </div>
      ) : (
        <MapCanvas items={items} filterType={filterType} />
      )}

      {isAdmin && (
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
