"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Check } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { todayISO, addDaysISO, formatDateLabel, relativeDayLabel } from "@/lib/date";

const DAY_TABS = ["all", -1, 0, 1, 2, 3] as const;

export default function AgendaPage() {
  const today = todayISO();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [selected, setSelected] = useState<string | "all">(today);
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
    const filtered = selected === "all" ? events : events.filter((e) => e.date === selected);
    const map = new Map<string, EventItem[]>();
    for (const ev of filtered) {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events, selected]);

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      <header>
        <p className="label-caps">Agenda</p>
        <h1 className="text-2xl font-semibold text-ink">Todos los eventos</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
        {DAY_TABS.map((offset) => {
          const value = offset === "all" ? "all" : addDaysISO(today, offset);
          const label = offset === "all" ? "Todos" : relativeDayLabel(value);
          const isActive = selected === value;
          return (
            <button
              key={offset}
              onClick={() => setSelected(value)}
              className="relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium"
            >
              {isActive && (
                <motion.span
                  layoutId="day-tab-pill"
                  className="absolute inset-0 rounded-full bg-violet-500/10 border border-violet-500/30 shadow-[0_1px_8px_rgba(139,92,246,0.25)]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative ${isActive ? "text-violet-600" : "text-muted hover:text-ink"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={addEvent} className="card-base p-4 flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del evento"
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
          placeholder="Notas (opcional)"
          rows={2}
          className="bg-bg border border-border rounded-md px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent resize-none"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={adding || !title.trim()}
          className="bg-gradient-to-r from-accent to-violet-500 text-bg font-semibold text-sm rounded-md py-2 flex items-center justify-center gap-1 disabled:opacity-40 shadow-[0_2px_10px_rgba(61,111,224,0.3)]"
        >
          <Plus className="h-4 w-4" /> Agregar evento
        </motion.button>
      </form>

      <section className="flex flex-col gap-4">
        {events === null && <p className="text-sm text-muted">Cargando…</p>}
        {events?.length === 0 && <p className="text-sm text-muted">Aún no hay eventos.</p>}
        {grouped.length === 0 && events && events.length > 0 && (
          <p className="text-sm text-muted">Nada para este día.</p>
        )}
        {grouped.map(([groupDate, groupEvents]) => (
          <div key={groupDate} className="flex flex-col gap-2">
            <p className="label-caps">
              {groupDate === today ? "Hoy" : formatDateLabel(groupDate)}
            </p>
            <div className="card-base divide-y divide-border">
              <AnimatePresence initial={false}>
                {groupEvents.map((ev) => (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 p-3 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleDone(ev)}
                      className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition ${
                        ev.done ? "bg-emerald-500 border-emerald-500" : "border-border"
                      }`}
                    >
                      <AnimatePresence>
                        {ev.done && (
                          <motion.span
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <Check className="h-3 w-3 text-bg" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${ev.done ? "line-through text-muted" : "text-ink"}`}>
                        {ev.title}
                      </p>
                      {ev.notes && <p className="text-xs text-muted truncate">{ev.notes}</p>}
                    </div>
                    {ev.time && (
                      <span className="text-xs num rounded-full px-2 py-0.5 bg-sky-500/10 text-sky-600">
                        {ev.time}
                      </span>
                    )}
                    <button onClick={() => remove(ev)} className="text-muted hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
