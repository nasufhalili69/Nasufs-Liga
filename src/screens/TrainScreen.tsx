import { useState } from "react";
import { ExerciseIcon } from "../components/ExerciseIcon";
import { DAYS, isoWeek, weekDates, ymd } from "../lib/dates";
import { addCustomExercise, addEntry, newId } from "../lib/db";
import { BUILTIN, CATS, ruleText, scoreWeek } from "../lib/rules";
import type { Category, Entry } from "../lib/types";
import type { useLiga } from "../lib/useLiga";

type Liga = ReturnType<typeof useLiga>;

const NEW = "__new";

export function TrainScreen({ liga, today, onToast }: { liga: Liga; today: Date; onToast: (msg: string, big?: string) => void }) {
  const [selEx, setSelEx] = useState("");
  const [creating, setCreating] = useState(false);
  const [day, setDay] = useState(ymd(today));
  const [amount, setAmount] = useState("");
  const [km, setKm] = useState("");

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
  const gainOf = (e: Entry) => scoreWeek([...weekEntries, e], liga.exercises).total - scoreWeek(weekEntries, liga.exercises).total;

  const pending = draft();
  const gain = pending ? gainOf(pending) : 0;

  const submit = async () => {
    if (!pending) return;
    await addEntry(weekKey, pending);
    setAmount("");
    setKm("");
    onToast(`${pending.name} eingetragen`, `+${gain} XP`);
  };

  const onSelect = (v: string) => {
    if (v === NEW) {
      setCreating(true);
      return;
    }
    setCreating(false);
    setSelEx(v);
  };

  const unitLabel = !ex ? "Menge" : ex.unit === "min" ? "Minuten" : ex.unit === "Sek." ? "Sekunden" : "Wiederholungen";
  const placeholder = !ex ? "" : ex.unit === "Wdh." ? "z. B. 20" : "z. B. 45";

  const tiles = [...BUILTIN.map((b) => ({ id: b.id, name: b.name, cat: b.cat, custom: false })), ...liga.custom];

  return (
    <>
      <section className="select" aria-label="Training wählen">
        <h2 className="section-title">
          Training wählen <small>{ex ? ex.catName : "Übung antippen"}</small>
        </h2>
        <div className="ex-grid" role="radiogroup" aria-label="Übung">
          {tiles.map((t) => {
            const sel = !creating && t.id === selEx;
            return (
              <button key={t.id} type="button" role="radio" aria-checked={sel} className={"extile cat-" + t.cat + (sel ? " sel" : "")} onClick={() => onSelect(t.id)}>
                <span className="ex-icon">
                  <ExerciseIcon id={t.id} cat={t.cat} />
                </span>
                <span className="ex-name">{t.name}</span>
                {t.custom && <span className="ex-tag">eigene</span>}
                {sel && <span className="cursor">P1</span>}
              </button>
            );
          })}
          <button type="button" role="radio" aria-checked={creating} className={"extile new" + (creating ? " sel" : "")} onClick={() => onSelect(NEW)}>
            <span className="ex-icon">
              <ExerciseIcon id={NEW} />
            </span>
            <span className="ex-name">Neue Übung</span>
          </button>
        </div>
      </section>

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
      ) : !ex ? (
        <section className="panel empty-panel">Wähl oben dein Training, dann Tag und Menge.</section>
      ) : (
        <section className="panel loadout" aria-label="Training eintragen">
          <div className="loadout-head">
            <span className="ex-icon big">
              <ExerciseIcon id={ex.id} cat={ex.cat} />
            </span>
            <div>
              <div className="lname">{ex.name}</div>
              <div className="lrule">{ruleText(ex)}</div>
            </div>
          </div>

          <div className="daypick" role="group" aria-label="Tag">
            {dates.map((d, i) => {
              const k = ymd(d);
              return (
                <button key={k} type="button" aria-pressed={k === day} disabled={d > today && k !== ymd(today)} onClick={() => setDay(k)}>
                  <b>{DAYS[i]}</b>
                  <span className="num">{d.getDate()}.</span>
                </button>
              );
            })}
          </div>
          <div className="fields">
            <div className="field">
              <label htmlFor="amount">{unitLabel}</label>
              <input id="amount" type="number" inputMode="decimal" min={0} step={1} placeholder={placeholder} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            {withKm && (
              <div className="field">
                <label htmlFor="km">Kilometer (optional)</label>
                <input id="km" type="number" inputMode="decimal" min={0} step={0.1} placeholder="z. B. 5" value={km} onChange={(e) => setKm(e.target.value)} />
              </div>
            )}
          </div>
          <div className="confirm">
            <div className={"gain" + (pending ? "" : " idle")} aria-live="polite">
              <span className="num">+{gain}</span> XP
            </div>
            <button type="button" className="go" disabled={!pending} onClick={submit}>
              <span>Eintragen</span>
            </button>
          </div>
        </section>
      )}
    </>
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
    <section className="panel newex">
      <h2 className="section-title">Neue Übung anlegen</h2>
      <div className="fields">
        <div className="field">
          <label htmlFor="newName">Name</label>
          <input id="newName" type="text" maxLength={40} placeholder="z. B. Radfahren" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="newCat">Art</label>
          <select id="newCat" value={cat} onChange={(e) => setCat(e.target.value as Category)}>
            {(Object.keys(CATS) as Category[]).map((k) => (
              <option key={k} value={k}>
                {CATS[k].name} ({CATS[k].unit})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="rulebox">
        Das Spiel vergibt: <b>{ruleText(rule)}</b>
        <br />
        <span className="note">{rule.txt}</span>
        {dup && (
          <>
            <br />
            <span className="note">Diese Übung gibt es schon.</span>
          </>
        )}
      </div>
      <div className="btnrow">
        <button type="button" className="ghost" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="button" className="primary" disabled={!trimmed || dup} onClick={save}>
          Übung anlegen
        </button>
      </div>
    </section>
  );
}

/** Zahl aus Eingabe, akzeptiert auch Komma als Dezimaltrenner. */
function parseNum(s: string): number {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
