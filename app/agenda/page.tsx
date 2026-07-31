"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { todayISO, formatDateLabel } from "@/lib/date";

export default function AgendaPage() {
  const today = todayISO();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    const res = await fetch("/api/events");
    setEvents(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setAdding(true);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, time: time || null, notes }),
      });
      setTitle("");
      setTime("");
      setNotes("");
      await load();
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

  async function remove(ev: EventItem) {
    setEvents((prev) => prev?.filter((e) => e.id !== ev.id) ?? prev);
    await fetch(`/api/events/${ev.id}`, { method: "DELETE" });
  }

  const grouped = useMemo(() => {
    if (!events) return [];
    const map = new Map<string, EventItem[]>();
    for (const ev of events) {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events]);

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <header>
        <p className="label-caps">Agenda</p>
        <h1 className="text-2xl font-semibold text-ink">All events</h1>
      </header>

      <form onSubmit={addEvent} className="card-base p-4 flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="bg-bg border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-28 bg-bg border border-border rounded-md px-2 py-2 text-sm text-ink focus:outline-none focus:border-accent"
          />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="bg-bg border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent resize-none"
        />
        <button
          type="submit"
          disabled={adding || !title.trim()}
          className="bg-accent text-bg font-semibold text-sm rounded-md py-2 flex items-center justify-center gap-1 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add event
        </button>
      </form>

      <section className="flex flex-col gap-4">
        {events === null && <p className="text-sm text-muted">Loading…</p>}
        {events?.length === 0 && <p className="text-sm text-muted">No events yet.</p>}
        {grouped.map(([groupDate, groupEvents]) => (
          <div key={groupDate} className="flex flex-col gap-2">
            <p className="label-caps">
              {groupDate === today ? "Today" : formatDateLabel(groupDate)}
            </p>
            <div className="card-base divide-y divide-border">
              {groupEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={ev.done}
                    onChange={() => toggleDone(ev)}
                    className="h-4 w-4 accent-accent"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${ev.done ? "line-through text-muted" : "text-ink"}`}>
                      {ev.title}
                    </p>
                    {ev.notes && <p className="text-xs text-muted truncate">{ev.notes}</p>}
                  </div>
                  {ev.time && <span className="text-xs text-muted num">{ev.time}</span>}
                  <button onClick={() => remove(ev)} className="text-muted hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
