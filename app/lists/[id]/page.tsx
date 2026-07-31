"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import type { ListItem } from "@/lib/types";
import ListIconGlyph from "@/components/ListIcon";

export default function ListDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listId = params.id;

  const [list, setList] = useState<{ id: number; name: string; icon: string } | null>(null);
  const [items, setItems] = useState<ListItem[] | null>(null);
  const [text, setText] = useState("");
  const [quantity, setQuantity] = useState("");
  const [adding, setAdding] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function load() {
    const [listRes, itemsRes] = await Promise.all([
      fetch(`/api/lists/${listId}`),
      fetch(`/api/lists/${listId}/items`),
    ]);
    if (!listRes.ok) {
      setNotFound(true);
      return;
    }
    setList(await listRes.json());
    setItems(await itemsRes.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setAdding(true);
    try {
      await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, quantity: quantity || null }),
      });
      setText("");
      setQuantity("");
      await load();
    } finally {
      setAdding(false);
    }
  }

  async function toggleChecked(item: ListItem) {
    setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)) ?? prev);
    await fetch(`/api/lists/${listId}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    });
  }

  async function removeItem(item: ListItem) {
    setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? prev);
    await fetch(`/api/lists/${listId}/items/${item.id}`, { method: "DELETE" });
  }

  async function clearChecked() {
    setItems((prev) => prev?.filter((i) => !i.checked) ?? prev);
    await fetch(`/api/lists/${listId}/items`, { method: "DELETE" });
  }

  async function deleteList() {
    await fetch(`/api/lists/${listId}`, { method: "DELETE" });
    router.push("/lists");
  }

  if (notFound) {
    return (
      <main className="max-w-lg mx-auto px-4 py-6">
        <p className="text-sm text-muted">List not found.</p>
        <Link href="/lists" className="text-accent text-sm">
          ← Back to lists
        </Link>
      </main>
    );
  }

  const hasChecked = items?.some((i) => i.checked);

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link href="/lists" className="text-muted hover:text-ink">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {list && <ListIconGlyph icon={list.icon} className="h-5 w-5 text-accent" />}
        <h1 className="text-xl font-semibold text-ink flex-1 truncate">{list?.name ?? "…"}</h1>
        <button onClick={deleteList} className="text-muted hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <form onSubmit={addItem} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an item…"
          className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          className="w-16 bg-bg border border-border rounded-md px-2 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={adding || !text.trim()}
          className="bg-accent text-bg rounded-md px-3 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <section className="card-base divide-y divide-border">
        {items === null && <p className="p-4 text-sm text-muted">Loading…</p>}
        {items?.length === 0 && <p className="p-4 text-sm text-muted">No items yet.</p>}
        {items?.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleChecked(item)}
              className="h-4 w-4 accent-accent"
            />
            <p className={`flex-1 text-sm ${item.checked ? "line-through text-muted" : "text-ink"}`}>
              {item.text}
            </p>
            {item.quantity && <span className="text-xs text-muted">{item.quantity}</span>}
            <button onClick={() => removeItem(item)} className="text-muted hover:text-danger">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      {hasChecked && (
        <button onClick={clearChecked} className="text-sm text-muted hover:text-danger self-start">
          Clear checked items
        </button>
      )}
    </main>
  );
}
