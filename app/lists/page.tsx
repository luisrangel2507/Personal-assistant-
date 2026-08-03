"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import type { ListSummary } from "@/lib/types";
import { LIST_ICONS } from "@/lib/types";
import ListIconGlyph, { IconChip, getIconStyle } from "@/components/ListIcon";

export default function ListsPage() {
  const [lists, setLists] = useState<ListSummary[] | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string>("list");
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/lists");
    setLists(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function createList(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });
      setName("");
      setIcon("list");
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function removeList(id: number) {
    setLists((prev) => prev?.filter((l) => l.id !== id) ?? prev);
    await fetch(`/api/lists/${id}`, { method: "DELETE" });
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <header>
        <p className="label-caps">Listas</p>
        <h1 className="text-2xl font-semibold text-ink">Compras, viajes y más</h1>
      </header>

      <form onSubmit={createList} className="card-base p-4 flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la lista (ej. Despensa, Viaje a Cancún)"
          className="bg-bg border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {LIST_ICONS.map((i) => {
            const style = getIconStyle(i);
            const isSelected = icon === i;
            return (
              <button
                type="button"
                key={i}
                onClick={() => setIcon(i)}
                className={`h-9 w-9 rounded-md flex items-center justify-center border transition ${
                  isSelected ? `${style.ring} ${style.bg} ${style.text}` : "border-border text-muted hover:text-ink"
                }`}
              >
                <ListIconGlyph icon={i} className="h-4 w-4" />
              </button>
            );
          })}
        </div>
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="bg-accent text-bg font-semibold text-sm rounded-md py-2 flex items-center justify-center gap-1 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Crear lista
        </button>
      </form>

      <section className="flex flex-col gap-2">
        {lists === null && <p className="text-sm text-muted">Cargando…</p>}
        {lists?.length === 0 && <p className="text-sm text-muted">Aún no tienes listas — crea una arriba.</p>}
        {lists?.map((list) => {
          const style = getIconStyle(list.icon);
          return (
            <div key={list.id} className="card-base p-3 flex items-center gap-3">
              <Link href={`/lists/${list.id}`} className="flex-1 flex items-center gap-3 min-w-0">
                <IconChip icon={list.icon} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{list.name}</p>
                  <span className={`text-xs w-fit rounded-full px-2 py-0.5 inline-block mt-0.5 ${style.bg} ${style.text}`}>
                    {list.itemCount - list.checkedCount} de {list.itemCount} pendientes
                  </span>
                </div>
              </Link>
              <button onClick={() => removeList(list.id)} className="text-muted hover:text-danger shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </section>
    </main>
  );
}
