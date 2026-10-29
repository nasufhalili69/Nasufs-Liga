import { useState } from "react";
import { DAYS, isoWeek, weekDates, ymd } from "../lib/dates";
import { addCustomExercise, addEntry, newId } from "../lib/db";
import { BUILTIN, CATS, ruleText, scoreWeek } from "../lib/rules";
import type { Category, Entry } from "../lib/types";
import type { useLiga } from "../lib/useLiga";

type Liga = ReturnType<typeof useLiga>;

const NEW = "__new";

export function TrainScreen({ liga, today, onToast }: { liga: Liga; today: Date; onToast: (msg: string) => void }) {
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
    onToast(`${pending.name} eingetragen · +${gain} XP`);
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

  return (
    <section className="card" aria-label="Training eintragen">
      <h2>Training eintragen</h2>
      <div className="field full">
        <label htmlFor="exSelect">Übung</label>
        <select id="exSelect" value={creating ? NEW : selEx} onChange={(e) => onSelect(e.target.value)}>
          <option value="">Übung wählen …</option>
          <optgroup label="Standard">
            {BUILTIN.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </optgroup>
          {liga.custom.length > 0 && (
            <optgroup label="Eigene Übungen">
              {liga.custom.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          )}
          <option value={NEW}>+ Neue Übung hinzufügen …</option>
        </select>
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
        <>
          <div className="daypick" role="group" aria-label="Tag">
            {dates.map((d, i) => {
              const k = ymd(d);
              return (
                <button key={k} type="button" aria-pressed={k === day} disabled={d > today && k !== ymd(today)} onClick={() => setDay(k)}>
                  {DAYS[i]}
                  <br />
                  <span className="num daynum">{d.getDate()}.</span>
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
          <div className="addrow">
            <div className="preview" aria-live="polite">
              {!ex ? (
                "Wähl eine Übung"
              ) : pending ? (
                <>
                  bringt <b className="num">+{gain}</b> XP
                </>
              ) : (
                <span className="small">{ruleText(ex)}</span>
              )}
            </div>
            <button type="button" className="primary" disabled={!pending} onClick={submit}>
              Eintragen
            </button>
          </div>
        </>
      )}
    </section>
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
    <div className="newex">
      <h3>Neue Übung anlegen</h3>
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
    </div>
  );
}

/** Zahl aus Eingabe, akzeptiert auch Komma als Dezimaltrenner. */
function parseNum(s: string): number {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
