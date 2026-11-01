import { XpRing } from "../components/XpRing";
import { DAYS, ymd } from "../lib/dates";
import { FORMS, FX_NAMES, nextRank, rankOf, scoreWeek, stageOf, WEEK_GOAL, weekEffect, XP_GROUPS, XP_PER_LEVEL, xpByGroup, type XpGroup } from "../lib/rules";
import type { useLiga } from "../lib/useLiga";
import type { WeekView } from "../lib/week";

type Liga = ReturnType<typeof useLiga>;

/* Kategoriale Reihenfolge, gegen die Mint-Karte geprüft (dataviz-Validator). */
const GROUP_COLORS: Record<XpGroup, string> = {
  ausdauer: "#2a78d6",
  kraft: "#eb6834",
  rumpf: "#6250d6",
  bonus: "#eda100",
};

export function OverviewScreen({ liga, week, today }: { liga: Liga; week: WeekView; today: Date }) {
  const score = scoreWeek(week.entries, liga.exercises);
  const groups = xpByGroup(week.entries, liga.exercises);
  const next = nextRank(score.total);
  const effect = weekEffect(week.entries, liga.exercises);
  const active = new Set(week.entries.map((e) => e.day));
  const xpInLevel = liga.totalXp % XP_PER_LEVEL;

  return (
    <>
      <section className="card mint" aria-label="Wochen-XP">
        <header className="card-head">
          <div>
            <h2>Wochen-XP</h2>
            <span className="card-sub">{week.range}</span>
          </div>
        </header>
        <XpRing segments={XP_GROUPS.map((g) => ({ key: g.key, name: g.name, value: groups[g.key], color: GROUP_COLORS[g.key] }))} max={WEEK_GOAL}>
          <span className="ring-label">von {WEEK_GOAL} XP</span>
          <span className="ring-num num">{score.total}</span>
          <span className="pill dark">Rang {rankOf(score.total)}</span>
        </XpRing>
        <ul className="legend">
          {XP_GROUPS.map((g) => (
            <li key={g.key} className={groups[g.key] ? "" : "zero"}>
              <i style={{ background: GROUP_COLORS[g.key] }} aria-hidden="true" />
              <span>{g.name}</span>
              <b className="num">{groups[g.key]}</b>
            </li>
          ))}
        </ul>
        {week.offset === 0 && next && (
          <p className="card-foot">
            Noch <b className="num">{next.missing} XP</b> bis Rang {next.rank}
          </p>
        )}
      </section>

      <div className="duo">
        <section className="card dark small" aria-label="Level-Fortschritt">
          <h3>Level</h3>
          <span className="card-sub">{FORMS[stageOf(liga.level)].name}</span>
          <span className="big num">{liga.level}</span>
          <div className="minibar" role="progressbar" aria-label="Fortschritt zum nächsten Level" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={xpInLevel}>
            <i style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} />
          </div>
          <span className="pill green num">noch {XP_PER_LEVEL - xpInLevel} XP</span>
        </section>
        <section className="card dark small" aria-label="Tage-Bonus">
          <h3>Tage-Bonus</h3>
          <span className="card-sub">+5 XP je Trainingstag</span>
          <span className="big num accent">+{score.bonus}</span>
          <div className="daydots" aria-label={`${score.activeDays} von 7 Tagen trainiert`}>
            {week.dates.map((d, i) => (
              <span key={i} className={(active.has(ymd(d)) ? "on" : "") + (ymd(d) === ymd(today) ? " today" : "")}>
                {DAYS[i][0]}
              </span>
            ))}
          </div>
          <span className="pill num">{score.activeDays} / 7 Tage</span>
        </section>
      </div>

      <section className="card sand" aria-label="Wirkung der Woche">
        <header className="card-head">
          <div>
            <h2>Wirkung der Woche</h2>
            <span className="card-sub">{week.range}</span>
          </div>
        </header>
        <div className="effect" role="list">
          <div className="effect-grid" aria-hidden="true">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          {effect.map((v, i) => (
            <div key={i} className="effect-col" role="listitem" aria-label={`${FX_NAMES[i]} ${v} Prozent`}>
              <span className="effect-val num">{v}%</span>
              <div className="effect-track">
                <i style={{ height: `${v}%` }} />
              </div>
              <span className="effect-name">{FX_NAMES[i]}</span>
            </div>
          ))}
        </div>
        <p className="card-foot muted">Voll heißt: dieser Bereich wurde diese Woche gut abgedeckt.</p>
      </section>
    </>
  );
}
