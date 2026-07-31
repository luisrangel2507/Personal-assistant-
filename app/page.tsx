"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CalendarDays, ChevronRight } from "lucide-react";
import type { EventItem, ListSummary } from "@/lib/types";
import { todayISO } from "@/lib/date";
import ListIconGlyph from "@/components/ListIcon";

export default function HomePage() {
  const today = todayISO();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [lists, setLists] = useState<ListSummary[] | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [adding, setAdding] = useState(false);

  async function loadEvents() {
    const res = await fetch(`/api/events?from=${today}&to=${today}`);
    setEvents(await res.json());
  }

  async function loadLists() {
    const res = await fetch("/api/lists");
    setLists(await res.json());
  }

  useEffect(() => {
    loadEvents();
    loadLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date: today, time: time || null }),
      });
      setTitle("");
      setTime("");
      await loadEvents();
    } finally {
      setAdding(false);
    }
  }

  async function toggleDone(ev: EventItem) {
    setEvents((prev) => prev?.map((e) => (e.id === ev.id ? { ...e, done: !e.done } : e)) ?? prev);
    await fetch(`/api/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !ev.done }),
    });
  }

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <header>
        <p className="label-caps">Today</p>
        <h1 className="text-2xl font-semibold text-ink">{todayLabel}</h1>
      </header>

      <section className="card-base p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CalendarDays className="h-4 w-4 text-accent" /> Today's agenda
          </h2>
          <Link href="/agenda" className="text-xs text-muted hover:text-accent flex items-center gap-0.5">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {events === null && <p className="text-sm text-muted">Loading…</p>}
        {events?.length === 0 && (
          <p className="text-sm text-muted">Nothing scheduled today. Add something below.</p>
        )}
        <ul className="flex flex-col gap-2">
          {events?.map((ev) => (
            <li key={ev.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={ev.done}
                onChange={() => toggleDone(ev)}
                className="h-4 w-4 accent-accent"
              />
              <div className="flex-1">
                <p className={`text-sm ${ev.done ? "line-through text-muted" : "text-ink"}`}>{ev.title}</p>
              </div>
              {ev.time && <span className="text-xs text-muted num">{ev.time}</span>}
            </li>
          ))}
        </ul>

        <form onSubmit={addEvent} className="flex gap-2 pt-2 border-t border-border">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-bg border border-border rounded-md px-2 py-2 text-sm text-ink w-28 focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add an event…"
            className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={adding || !title.trim()}
            className="bg-accent text-bg rounded-md px-3 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Your lists</h2>
          <Link href="/lists" className="text-xs text-muted hover:text-accent flex items-center gap-0.5">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {lists?.length === 0 && (
          <Link href="/lists" className="card-base p-4 text-sm text-muted hover:text-accent transition">
            Create your first list (shopping, trip packing, …) →
          </Link>
        )}
        <div className="grid grid-cols-2 gap-3">
          {lists?.slice(0, 4).map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="card-base p-3 flex flex-col gap-2 hover:border-accent transition"
            >
              <ListIconGlyph icon={list.icon} className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-ink truncate">{list.name}</span>
              <span className="text-xs text-muted">
                {list.itemCount - list.checkedCount} left of {list.itemCount}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
