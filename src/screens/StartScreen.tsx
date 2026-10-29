import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { DAYS, fmtShort, isoWeek, weekDates, ymd } from "../lib/dates";
import { HAIRS, saveLook, SKINS } from "../lib/db";
import { FORMS, nextRank, rankOf, scoreWeek, stageOf, WEEK_GOAL, XP_PER_LEVEL } from "../lib/rules";
import type { Beard, Look } from "../lib/types";
import type { useLiga } from "../lib/useLiga";

type Liga = ReturnType<typeof useLiga>;

export function StartScreen({ liga, today }: { liga: Liga; today: Date }) {
  return (
    <>
      <Scoreboard liga={liga} today={today} />
      <CharacterCard liga={liga} />
    </>
  );
}

function Scoreboard({ liga, today }: { liga: Liga; today: Date }) {
  const [offset, setOffset] = useState(0);
  const dates = weekDates(today, offset);
  const key = isoWeek(dates[0]);
  const entries = liga.weeks[key] ?? [];
  const score = scoreWeek(entries, liga.exercises);
  const active = new Set(entries.map((e) => e.day));
  const next = nextRank(score.total);
  const xpInLevel = liga.totalXp % XP_PER_LEVEL;

  return (
    <section className="board" aria-label="Wochenstand">
      <div className="weeknav">
        <button type="button" aria-label="Vorige Woche" onClick={() => setOffset(offset - 1)}>
          ‹
        </button>
        <div className="weektitle">
          <span className="eyebrow">
            KW {key.slice(-2)}
            {offset === 0 ? " · diese Woche" : offset === -1 ? " · letzte Woche" : ""}
          </span>
          <b>
            {fmtShort(dates[0])} – {fmtShort(dates[6])}
            {dates[6].getFullYear()}
          </b>
        </div>
        <button type="button" aria-label="Nächste Woche" disabled={offset >= 0} onClick={() => setOffset(offset + 1)}>
          ›
        </button>
      </div>

      <div className="score">
        <div className="big num">
          {score.total}
          <small> / {WEEK_GOAL} XP</small>
        </div>
        <div className="rank">
          <span className="eyebrow">Wochen-Rang</span>
          <b>Rang {rankOf(score.total)}</b>
        </div>
      </div>
      <div className="bar" aria-hidden="true">
        <i style={{ width: `${Math.min(100, (score.total / WEEK_GOAL) * 100)}%` }} />
      </div>
      {offset === 0 && next && (
        <div className="hint num">
          Noch <b>{next.missing} XP</b> bis Rang {next.rank}
        </div>
      )}

      <div className="days">
        {dates.map((d, i) => (
          <div key={i} className={"day" + (active.has(ymd(d)) ? " on" : "") + (ymd(d) === ymd(today) ? " today" : "")}>
            {DAYS[i]}
          </div>
        ))}
      </div>

      <div className="player">
        <span className="num">
          Level {liga.level} · {FORMS[stageOf(liga.level)].name}
        </span>
        <div className="bar" role="progressbar" aria-label="Level-Fortschritt" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={xpInLevel}>
          <i style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} />
        </div>
        <span className="num">{liga.totalXp} XP</span>
      </div>
    </section>
  );
}

function CharacterCard({ liga }: { liga: Liga }) {
  const [preview, setPreview] = useState<number | null>(null);
  const { level, totalXp, look } = liga;
  const shown = preview ?? level;
  const isPreview = preview !== null && preview !== level;
  const form = FORMS[stageOf(shown)];
  const nextForm = FORMS.find((f) => f.lv > level);

  const pick = (lv: number) => setPreview(lv === level ? null : lv);
  const updateLook = (patch: Partial<Look>) => void saveLook({ ...look, ...patch });

  return (
    <section className="card" aria-label="Dein Charakter">
      <div className="hero">
        <div className="avatar">
          <Avatar level={shown} look={look} />
          {isPreview && <span className="badge">Vorschau</span>}
        </div>
        <div className="heroinfo">
          <span className="eyebrow">Dein Charakter</span>
          <div className="title">{form.name}</div>
          <div className="sub">
            {form.de} · Level {shown}
            {isPreview && ` (du bist Level ${level})`}
          </div>
          <div className="next">
            {nextForm ? (
              <>
                Nächste Form: <b>{nextForm.name}</b> ab Level {nextForm.lv}, noch{" "}
                <b className="num">{(nextForm.lv - 1) * XP_PER_LEVEL - totalXp}</b> XP
              </>
            ) : (
              "Höchste Form erreicht."
            )}
          </div>
        </div>
      </div>

      <div className="slider">
        <label htmlFor="lvlPreview">
          <span>Zukunft ansehen</span>
          <span className="num">Level {shown}</span>
        </label>
        <input id="lvlPreview" type="range" min={1} max={20} step={1} value={Math.min(shown, 20)} onChange={(e) => pick(+e.target.value)} />
      </div>
      <div className="forms">
        {FORMS.map((f) => (
          <button key={f.lv} type="button" className={level >= f.lv ? "reached" : ""} onClick={() => pick(f.lv)}>
            {f.name} · {f.lv}
          </button>
        ))}
      </div>

      <details className="look">
        <summary>Aussehen anpassen</summary>
        <div className="lookrow">
          Hautton
          <div className="swatches">
            {SKINS.map((c) => (
              <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Hautton ${c}`} aria-pressed={look.skin === c} onClick={() => updateLook({ skin: c })} />
            ))}
          </div>
        </div>
        <div className="lookrow">
          Haarfarbe
          <div className="swatches">
            {HAIRS.map((c) => (
              <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Haarfarbe ${c}`} aria-pressed={look.hair === c} onClick={() => updateLook({ hair: c })} />
            ))}
          </div>
        </div>
        <div className="lookrow">
          <label htmlFor="beardSel">Bart</label>
          <br />
          <select id="beardSel" className="looksel" value={look.beard} onChange={(e) => updateLook({ beard: e.target.value as Beard })}>
            <option value="none">Kein Bart</option>
            <option value="stubble">Dreitagebart</option>
            <option value="full">Vollbart</option>
          </select>
        </div>
      </details>
    </section>
  );
}
