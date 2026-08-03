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

export function formatDateLabel(iso: string): string {
  return parseISO(iso).toLocaleDateString(LOCALE, { weekday: "short", month: "short", day: "numeric" });
}

export function formatFullDateLabel(iso: string): string {
  return parseISO(iso).toLocaleDateString(LOCALE, { weekday: "long", month: "long", day: "numeric" });
}

/** Short tab label used by the agenda's day picker: "Ayer", "Hoy", "Mañana", or "sáb 01 ago". */
export function relativeDayLabel(iso: string): string {
  const today = todayISO();
  const diff = (parseISO(iso).getTime() - parseISO(today).getTime()) / 86_400_000;
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === 1) return "Mañana";
  return parseISO(iso)
    .toLocaleDateString(LOCALE, { weekday: "short", day: "2-digit", month: "short" })
    .replace(",", "");
}
