const LOCALE = "es-ES";

export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso: string, days: number): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatFullDateLabel(iso: string): string {
  return parseISO(iso).toLocaleDateString(LOCALE, { weekday: "long", month: "long", day: "numeric" });
}

/** "3 de agosto" / "2026", split so the year can be styled separately. */
export function formatHeaderDate(iso: string): { dayMonth: string; year: string } {
  const date = parseISO(iso);
  return {
    dayMonth: date.toLocaleDateString(LOCALE, { day: "numeric", month: "long" }),
    year: String(date.getFullYear()),
  };
}

/** The 7 ISO dates (Sunday-Saturday) of the week containing `iso`. */
export function getWeekDays(iso: string): string[] {
  const date = parseISO(iso);
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, "0");
    const d = String(day.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
}

export function weekdayShort(iso: string): string {
  return parseISO(iso).toLocaleDateString(LOCALE, { weekday: "short" });
}

export function dayNumber(iso: string): number {
  return parseISO(iso).getDate();
}

/** "6:30 a.m." from a 24h "HH:MM" string. */
export function formatTime12h(time: string): string {
  const [hStr, m] = time.split(":");
  let h = parseInt(hStr, 10);
  const period = h < 12 ? "a.m." : "p.m.";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}
