"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2, Check, Clock, X } from "lucide-react";
import type { EventItem } from "@/lib/types";
import {
  todayISO,
  addDaysISO,
  getWeekDays,
  weekdayShort,
  dayNumber,
  formatHeaderDate,
  formatTime12h,
} from "@/lib/date";

export default function AgendaPage() {
  const today = todayISO();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [selected, setSelected] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
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
    if (!title.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date: selected, time: time || null, notes }),
      });
      setTitle("");
      setTime("");
      setNotes("");
      setShowForm(false);
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

  const weekDays = useMemo(() => getWeekDays(selected), [selected]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const ev of events ?? []) {
      if (!map.has(ev.date)) map.set(ev.date, []);
      map.get(ev.date)!.push(ev);
    }
    return map;
  }, [events]);

  const dayEvents = useMemo(() => {
    const list = eventsByDate.get(selected) ?? [];
    return [...list].sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));
  }, [eventsByDate, selected]);

  const { dayMonth, year } = formatHeaderDate(selected);

  return (
    <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-ink">
          {dayMonth} de <span className="text-accent">{year}</span>
        </h1>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setSelected((d) => addDaysISO(d, -7))}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-card transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelected((d) => addDaysISO(d, 7))}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-card transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7">
        {weekDays.map((d) => {
          const isSelected = d === selected;
          const isToday = d === today;
          const dayList = eventsByDate.get(d) ?? [];
          return (
            <button key={d} onClick={() => setSelected(d)} className="flex flex-col items-center gap-1.5 py-1">
              <span className="text-[11px] uppercase text-muted font-medium">{weekdayShort(d)}</span>
              <span
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                  isSelected
                    ? "bg-gradient-to-br from-accent to-violet-500 text-white shadow-[0_2px_10px_rgba(61,111,224,0.35)]"
                    : isToday
                      ? "text-accent"
                      : "text-ink"
                }`}
              >
                {dayNumber(d)}
              </span>
              <div className="flex gap-0.5 h-1.5">
                {dayList.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    className={`h-1.5 w-1.5 rounded-full ${ev.done ? "bg-emerald-500" : "bg-violet-400"}`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <section className="flex-1">
        {events === null && <p className="text-sm text-muted">Cargando…</p>}
        {events && dayEvents.length === 0 && (
          <div className="card-base p-6 text-center">
            <p className="text-sm text-muted">Nada agendado este día.</p>
          </div>
        )}
        <div className="flex flex-col">
          {dayEvents.map((ev, idx) => {
            const isLast = idx === dayEvents.length - 1;
            return (
              <div key={ev.id} className="flex gap-3">
                <div className="w-12 shrink-0 text-right text-xs text-muted pt-2 num">
                  {ev.time ? formatTime12h(ev.time) : ""}
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center ${
                      ev.done ? "bg-emerald-500" : "bg-gradient-to-br from-accent to-violet-500"
                    }`}
                  >
                    {ev.done ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <Clock className="h-4 w-4 text-white" />
                    )}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className="flex-1 pb-6 pt-1.5 min-w-0">
                  <p className={`font-semibold text-ink ${ev.done ? "line-through text-muted" : ""}`}>
                    {ev.title}
                  </p>
                  {ev.notes && <p className="text-sm text-muted mt-0.5">{ev.notes}</p>}
                </div>
                <div className="flex flex-col items-center gap-2 pt-1.5">
                  <button
                    onClick={() => toggleDone(ev)}
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                      ev.done ? "bg-emerald-500 border-emerald-500" : "border-accent/50"
                    }`}
                  >
                    {ev.done && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <button onClick={() => remove(ev)} className="text-muted hover:text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 16, height: 0 }}
            transition={{ duration: 0.22 }}
            onSubmit={addEvent}
            className="card-base p-4 flex flex-col gap-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Nuevo evento</p>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del evento"
              className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-28 bg-bg border border-border rounded-xl px-2 py-2 text-sm text-ink focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas (opcional)"
                className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={adding || !title.trim()}
              className="bg-gradient-to-r from-accent to-violet-500 text-bg font-semibold text-sm rounded-xl py-2 flex items-center justify-center gap-1 disabled:opacity-40 shadow-[0_2px_10px_rgba(61,111,224,0.3)]"
            >
              <Plus className="h-4 w-4" /> Agregar
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowForm((v) => !v)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-gradient-to-br from-accent to-violet-500 shadow-lg shadow-black/20 flex items-center justify-center text-white z-20"
      >
        <motion.span
          animate={{ rotate: showForm ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus className="h-6 w-6" />
        </motion.span>
      </motion.button>
    </main>
  );
}
