import { useEffect, useState } from "react";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { Icon } from "../components/Icons";
import { DAYS, parseDay, weekdayIndex } from "../lib/dates";
import { deleteEntry } from "../lib/db";
import { scoreWeek } from "../lib/rules";
import type { useLiga } from "../lib/useLiga";
import type { WeekView } from "../lib/week";

type Liga = ReturnType<typeof useLiga>;

export function EntriesScreen({ liga, week, onAdd, onToast }: { liga: Liga; week: WeekView; onAdd: () => void; onToast: (msg: string) => void }) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const entries = [...week.entries].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  const score = scoreWeek(entries, liga.exercises);

  // Löschen braucht ein zweites Antippen innerhalb von 3 Sekunden.
  useEffect(() => {
    if (!confirm) return;
    const t = window.setTimeout(() => setConfirm(null), 3000);
    return () => window.clearTimeout(t);
  }, [confirm]);

  const onDelete = async (id: string) => {
    if (confirm !== id) {
      setConfirm(id);
      return;
    }
    setConfirm(null);
    await deleteEntry(week.key, id);
    onToast("Eintrag gelöscht");
  };

  return (
    <section className="card light" aria-label="Einträge der Woche">
      <header className="card-head">
        <div>
          <h2>Einträge</h2>
          <span className="card-sub">{week.range}</span>
        </div>
        <span className="pill dark num">{score.total} XP</span>
      </header>

      {entries.length === 0 ? (
        <div className="empty">
          <p>In dieser Woche ist noch nichts eingetragen.</p>
          {week.offset === 0 && (
            <button type="button" className="btn-yellow" onClick={onAdd}>
              <Icon name="plus" /> Training eintragen
            </button>
          )}
        </div>
      ) : (
        <ul className="entries">
          {entries.map((e) => {
            const ex = liga.exercises[e.ex];
            const unit = ex ? (ex.kind === "session" ? "min" : ex.unit) : "";
            const detail = [`${e.amount} ${unit}`.trim(), e.km ? `${String(e.km).replace(".", ",")} km` : "", e.note ?? ""].filter(Boolean).join(" · ");
            const asking = confirm === e.id;
            return (
              <li key={e.id}>
                <span className="entry-icon">
                  <ExerciseIcon id={e.ex} cat={ex?.cat} />
                </span>
                <span className="entry-what">
                  <b>{ex?.name ?? e.name}</b>
                  <span>
                    {DAYS[weekdayIndex(parseDay(e.day))]} · {detail}
                  </span>
                </span>
                <span className="entry-xp num">+{score.per.get(e.id) ?? 0}</span>
                <button type="button" className={"round-btn small" + (asking ? " danger" : "")} aria-label={asking ? "Wirklich löschen?" : "Eintrag löschen"} onClick={() => onDelete(e.id)}>
                  {asking ? "?" : <Icon name="trash" size={16} />}
                </button>
              </li>
            );
          })}
          <li className="bonus-row">
            <span>Tage-Bonus · {score.activeDays} Tage</span>
            <b className="num">+{score.bonus}</b>
          </li>
        </ul>
      )}
    </section>
  );
}
