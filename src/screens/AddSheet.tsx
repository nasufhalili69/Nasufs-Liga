import { useEffect, useState } from "react";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { Icon } from "../components/Icons";
import { DAYS, isoWeek, weekDates, ymd } from "../lib/dates";
import { addCustomExercise, addEntry, newId } from "../lib/db";
import { BUILTIN, CATS, ruleText, scoreWeek } from "../lib/rules";
import type { Category, Entry } from "../lib/types";
import type { useLiga } from "../lib/useLiga";

type Liga = ReturnType<typeof useLiga>;

/** „Training eintragen“ als Bottom-Sheet, geöffnet über den gelben Plus-Button. Trägt immer in die aktuelle Woche ein. */
export function AddSheet({ liga, today, onClose, onToast }: { liga: Liga; today: Date; onClose: () => void; onToast: (msg: string, big?: string) => void }) {
  const [selEx, setSelEx] = useState("");
  const [creating, setCreating] = useState(false);
  const [day, setDay] = useState(ymd(today));
  const [amount, setAmount] = useState("");
  const [km, setKm] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dates = weekDates(today);
  const weekKey = isoWeek(dates[0]);
  const weekEntries = liga.weeks[weekKey] ?? [];
  const ex = liga.exercises[selEx];
  const amt = parseNum(amount);
  const withKm = ex?.kind === "session" && ex.base >= 25; // Ballsport und Ausdauer

  const draft = (): Entry | null => {
    if (!ex || amt <= 0) return null;
    const e: Entry = { id: newId(), ex: ex.id, name: ex.name, day, amount: amt };
    const k = parseNum(km);
    if (withKm && k > 0) e.km = k;
    return e;
  };
  const pending = draft();
  const gain = pending ? scoreWeek([...weekEntries, pending], liga.exercises).total - scoreWeek(weekEntries, liga.exercises).total : 0;

  const submit = async () => {
    if (!pending) return;
    await addEntry(weekKey, pending);
    onToast(`${pending.name} eingetragen`, `+${gain} XP`);
    onClose();
  };

  const unitLabel = !ex ? "Menge" : ex.unit === "min" ? "Minuten" : ex.unit === "Sek." ? "Sekunden" : "Wiederholungen";
  const placeholder = !ex ? "" : ex.unit === "Wdh." ? "z. B. 20" : "z. B. 45";
  const tiles = [...BUILTIN.map((b) => ({ id: b.id, name: b.name, cat: b.cat, custom: false })), ...liga.custom];

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" aria-hidden="true" />
        <header className="sheet-head">
          <h2 id="sheet-title">Training eintragen</h2>
          <button type="button" className="round-btn" aria-label="Schließen" onClick={onClose}>
            <Icon name="close" />
          </button>
        </header>

        <div className="ex-grid" role="radiogroup" aria-label="Übung">
          {tiles.map((t) => {
            const sel = !creating && t.id === selEx;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={sel}
                className={"ex-tile" + (sel ? " sel" : "")}
                onClick={() => {
                  setCreating(false);
                  setSelEx(t.id);
                }}
              >
                <span className="ex-icon">
                  <ExerciseIcon id={t.id} cat={t.cat} />
                </span>
                <span className="ex-name">{t.name}</span>
              </button>
            );
          })}
          <button type="button" role="radio" aria-checked={creating} className={"ex-tile new" + (creating ? " sel" : "")} onClick={() => setCreating(true)}>
            <span className="ex-icon">
              <Icon name="plus" size={22} />
            </span>
            <span className="ex-name">Neue Übung</span>
          </button>
        </div>

        {creating ? (
          <NewExercise
            existing={Object.values(liga.exercises).map((e) => e.name)}
            onCancel={() => setCreating(false)}
            onCreated={(id, msg) => {
              setCreating(false);
              setSelEx(id);
              onToast(msg);
            }}
          />
        ) : (
          ex && (
            <div className="form">
              <p className="rule-line">
                <b>{ex.catName}</b> · {ruleText(ex)}
              </p>
              <div className="days" role="group" aria-label="Tag">
                {dates.map((d, i) => {
                  const k = ymd(d);
                  return (
                    <button key={k} type="button" aria-pressed={k === day} disabled={d > today && k !== ymd(today)} onClick={() => setDay(k)}>
                      <span>{DAYS[i]}</span>
                      <b className="num">{d.getDate()}</b>
                    </button>
                  );
                })}
              </div>
              <div className="fields">
                <label className="field">
                  <span>{unitLabel}</span>
                  <input type="number" inputMode="decimal" min={0} step={1} placeholder={placeholder} value={amount} onChange={(e) => setAmount(e.target.value)} />
                </label>
                {withKm && (
                  <label className="field">
                    <span>Kilometer (optional)</span>
                    <input type="number" inputMode="decimal" min={0} step={0.1} placeholder="z. B. 5" value={km} onChange={(e) => setKm(e.target.value)} />
                  </label>
                )}
              </div>
              <div className="submit-row">
                <div className={"gain" + (pending ? "" : " idle")} aria-live="polite">
                  <span className="num">+{gain}</span>
                  <small>XP</small>
                </div>
                <button type="button" className="btn-yellow" disabled={!pending} onClick={submit}>
                  Eintragen
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function NewExercise({ existing, onCancel, onCreated }: { existing: string[]; onCancel: () => void; onCreated: (id: string, msg: string) => void }) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState<Category>("spiel");
  const trimmed = name.trim();
  const dup = existing.some((n) => n.toLowerCase() === trimmed.toLowerCase());
  const rule = CATS[cat];

  const save = async () => {
    if (!trimmed || dup) return;
    const ex = await addCustomExercise(trimmed, cat);
    onCreated(ex.id, `„${ex.name}“ angelegt · ${ruleText(rule)}`);
  };

  return (
    <div className="form">
      <div className="fields">
        <label className="field">
          <span>Name</span>
          <input type="text" maxLength={40} placeholder="z. B. Radfahren" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Art</span>
          <select value={cat} onChange={(e) => setCat(e.target.value as Category)}>
            {(Object.keys(CATS) as Category[]).map((k) => (
              <option key={k} value={k}>
                {CATS[k].name} ({CATS[k].unit})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="rule-box">
        Das Spiel vergibt: <b>{ruleText(rule)}</b>
        <span>{rule.txt}</span>
        {dup && <span className="warn">Diese Übung gibt es schon.</span>}
      </div>
      <div className="btn-row">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="button" className="btn-yellow" disabled={!trimmed || dup} onClick={save}>
          Übung anlegen
        </button>
      </div>
    </div>
  );
}

/** Zahl aus Eingabe, akzeptiert auch Komma als Dezimaltrenner. */
function parseNum(s: string): number {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
