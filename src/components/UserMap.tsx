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

export function UserMap({ username, isOwner, items: initialItems }: UserMapProps) {
  const [filterType, setFilterType] = useState<ItemType>("movie");
  const [items, setItems] = useState(initialItems);
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <header className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4">
        <TypeToggle value={filterType} onChange={setFilterType} />
        {isOwner && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
          >
            + Add
          </button>
        )}
      </header>

      <MapCanvas items={items} filterType={filterType} />

      {items.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
          <p className="text-center text-white/45">
            {isOwner ? "Your map is empty. Add a movie or book." : "This map is empty."}
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
