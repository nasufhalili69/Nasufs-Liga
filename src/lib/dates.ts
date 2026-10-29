export const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const pad = (n: number) => String(n).padStart(2, "0");

export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Lokales Datum aus YYYY-MM-DD (mittags, damit Sommerzeit nichts verschiebt). */
export const parseDay = (s: string) => new Date(s + "T12:00:00");

export function mondayOf(d: Date): Date {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

/** ISO-Woche, z. B. "2026-W43". */
export function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const w = Math.ceil(((t.getTime() - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${pad(w)}`;
}

/** Die 7 Tage (Mo–So) der Woche, `offset` Wochen vom heutigen Datum entfernt. */
export function weekDates(today: Date, offset = 0): Date[] {
  const m = mondayOf(today);
  m.setDate(m.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(m);
    d.setDate(m.getDate() + i);
    return d;
  });
}

export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;

export const fmtShort = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.`;
