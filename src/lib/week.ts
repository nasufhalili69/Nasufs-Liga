import { fmtShort, isoWeek, weekDates } from "./dates";
import type { Entry } from "./types";

/** Die gerade angezeigte Woche (über die Wochen-Pfeile im Kopf gewählt). */
export type WeekView = { offset: number; key: string; dates: Date[]; range: string; entries: Entry[] };

export function weekView(today: Date, offset: number, weeks: Record<string, Entry[]>): WeekView {
  const dates = weekDates(today, offset);
  const key = isoWeek(dates[0]);
  const range = `${fmtShort(dates[0])} – ${fmtShort(dates[6])}${dates[6].getFullYear()}`;
  return { offset, key, dates, range, entries: weeks[key] ?? [] };
}
