import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { DAYS, fmtShort, isoWeek, weekDates, ymd } from "../lib/dates";
import { HAIRS, saveLook, SKINS } from "../lib/db";
import { FORMS, nextRank, rankOf, scoreWeek, stageOf, WEEK_GOAL, XP_PER_LEVEL } from "../lib/rules";
import type { Beard, Look } from "../lib/types";
import type { useLiga } from "../lib/useLiga";

type Liga = ReturnType<typeof useLiga>;

/* Rang-Schwellen als Marken auf dem Wochenbalken (Skala 0–160 XP = Rang S). */
const BAR_MAX = 160;
const RANK_MARKS = [
  { xp: 40, r: "D" },
  { xp: 70, r: "C" },
  { xp: 100, r: "B" },
  { xp: 130, r: "A" },
];

export function StartScreen({ liga, today }: { liga: Liga; today: Date }) {
  const [preview, setPreview] = useState<number | null>(null);
  return (
    <>
      <Hud liga={liga} today={today} />
      <Stage liga={liga} preview={preview} />
      <Roster liga={liga} preview={preview} onPick={(lv) => setPreview(lv === liga.level ? null : lv)} />
      <Costume look={liga.look} />
    </>
  );
}

function Hud({ liga, today }: { liga: Liga; today: Date }) {
  const [offset, setOffset] = useState(0);
  const dates = weekDates(today, offset);
  const key = isoWeek(dates[0]);
  const entries = liga.weeks[key] ?? [];
  const score = scoreWeek(entries, liga.exercises);
  const active = new Set(entries.map((e) => e.day));
  const next = nextRank(score.total);
  const rank = rankOf(score.total);

  return (
    <section className="hud" aria-label="Wochenstand">
      <div className="hud-top">
        <div className="plate">
          <span className="p1">P1</span>
          <span className="plate-name">Nasuf</span>
        </div>
        <div className={`emblem rank-${rank}`} aria-label={`Wochen-Rang ${rank}`}>
          <span>{rank}</span>
        </div>
      </div>

      <div className="weeknav">
        <button type="button" aria-label="Vorige Woche" onClick={() => setOffset(offset - 1)}>
          ◀
        </button>
        <div className="weektitle">
          <b>
            KW {key.slice(-2)}
            {offset === 0 ? " · diese Woche" : offset === -1 ? " · letzte Woche" : ""}
          </b>
          <span>
            {fmtShort(dates[0])} – {fmtShort(dates[6])}
            {dates[6].getFullYear()}
          </span>
        </div>
        <button type="button" aria-label="Nächste Woche" disabled={offset >= 0} onClick={() => setOffset(offset + 1)}>
          ▶
        </button>
      </div>

      <div className="xpline">
        <span className="xpnum num">
          {score.total}
          <small> / {WEEK_GOAL} XP</small>
        </span>
        {offset === 0 && next && (
          <span className="hint num">
            noch <b>{next.missing}</b> bis Rang {next.rank}
          </span>
        )}
      </div>
      <div className="lifebar" role="progressbar" aria-label="Wochen-XP" aria-valuemin={0} aria-valuemax={WEEK_GOAL} aria-valuenow={score.total}>
        <i style={{ width: `${Math.min(100, (score.total / BAR_MAX) * 100)}%` }} />
        {RANK_MARKS.map((m) => (
          <span key={m.r} className={"mark" + (score.total >= m.xp ? " hit" : "")} style={{ left: `${(m.xp / BAR_MAX) * 100}%` }}>
            {m.r}
          </span>
        ))}
      </div>

      <div className="rounds" aria-label="Trainingstage">
        {dates.map((d, i) => (
          <div key={i} className={"round" + (active.has(ymd(d)) ? " won" : "") + (ymd(d) === ymd(today) ? " today" : "")}>
            <i aria-hidden="true" />
            <span>{DAYS[i]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stage({ liga, preview }: { liga: Liga; preview: number | null }) {
  const { level, totalXp, look } = liga;
  const shown = preview ?? level;
  const isPreview = preview !== null && preview !== level;
  const form = FORMS[stageOf(shown)];
  const nextForm = FORMS.find((f) => f.lv > level);
  const xpInLevel = totalXp % XP_PER_LEVEL;

  return (
    <section className="stage" aria-label="Dein Charakter">
      <div className="stage-bg" aria-hidden="true">
        {form.name}
      </div>
      <div className="spot" aria-hidden="true" />
      <div className="fighter" key={stageOf(shown)}>
        <Avatar level={shown} look={look} />
      </div>
      {isPreview && <div className="preview-tag">Vorschau · du bist Level {level}</div>}

      <div className="stage-info">
        <div className="fname">{form.name}</div>
        <div className="ftitle">
          {form.de} <span className="lv">Lv {shown}</span>
        </div>
      </div>

      <div className="levelbox">
        <div className="levelrow num">
          <span className="lvbig">Lv {level}</span>
          <div className="lvbar" role="progressbar" aria-label="Level-Fortschritt" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={xpInLevel}>
            <i style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} />
          </div>
          <span className="lvxp">
            {xpInLevel}/{XP_PER_LEVEL}
          </span>
        </div>
        <div className="nextform">
          <span>
            {nextForm ? (
              <>
                Nächste Form <b>{nextForm.name}</b> ab Lv {nextForm.lv} · noch{" "}
                <b className="num">{(nextForm.lv - 1) * XP_PER_LEVEL - totalXp} XP</b>
              </>
            ) : (
              "Höchste Form erreicht."
            )}
          </span>
          <span className="total num">Gesamt {totalXp} XP</span>
        </div>
      </div>
    </section>
  );
}

function Roster({ liga, preview, onPick }: { liga: Liga; preview: number | null; onPick: (lv: number) => void }) {
  const shownStage = stageOf(preview ?? liga.level);
  return (
    <section className="roster" aria-label="Formen">
      <h2 className="section-title">
        Formen <small>Zukunft ansehen</small>
      </h2>
      <div className="roster-grid" role="radiogroup" aria-label="Form ansehen">
        {FORMS.map((f, i) => {
          const locked = liga.level < f.lv;
          const sel = i === shownStage;
          return (
            <button
              key={f.lv}
              type="button"
              role="radio"
              aria-checked={sel}
              className={"tile" + (locked ? " locked" : "") + (sel ? " sel" : "")}
              onClick={() => onPick(previewLevel(i, liga.level))}
            >
              <span className="tile-art">
                <Avatar level={f.lv} look={liga.look} bust />
              </span>
              <span className="tile-name">{f.name}</span>
              <span className="tile-lv">{locked ? `🔒 Lv ${f.lv}` : `Lv ${f.lv}`}</span>
              {sel && <span className="cursor">P1</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Level, mit dem eine Form angezeigt wird: die eigene Form im aktuellen Level, sonst ihr höchstes (erreicht) bzw. erstes (gesperrt) Level. */
function previewLevel(formIndex: number, level: number): number {
  const from = FORMS[formIndex].lv;
  const to = (FORMS[formIndex + 1]?.lv ?? Infinity) - 1;
  if (level < from) return from;
  return Math.min(level, to);
}

function Costume({ look }: { look: Look }) {
  const update = (patch: Partial<Look>) => void saveLook({ ...look, ...patch });
  return (
    <details className="panel costume">
      <summary>
        <span className="section-title">Kostüm anpassen</span>
      </summary>
      <div className="lookrow">
        <span className="label">Hautton</span>
        <div className="swatches">
          {SKINS.map((c) => (
            <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Hautton ${c}`} aria-pressed={look.skin === c} onClick={() => update({ skin: c })} />
          ))}
        </div>
      </div>
      <div className="lookrow">
        <span className="label">Haarfarbe</span>
        <div className="swatches">
          {HAIRS.map((c) => (
            <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Haarfarbe ${c}`} aria-pressed={look.hair === c} onClick={() => update({ hair: c })} />
          ))}
        </div>
      </div>
      <div className="lookrow">
        <span className="label">Bart</span>
        <div className="seg" role="radiogroup" aria-label="Bart">
          {(
            [
              ["none", "Kein Bart"],
              ["stubble", "Dreitage"],
              ["full", "Vollbart"],
            ] as [Beard, string][]
          ).map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={look.beard === v} onClick={() => update({ beard: v })}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
