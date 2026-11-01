import { useState } from "react";
import { CharacterArt } from "../components/CharacterArt";
import { HAIRS, saveLook, SKINS } from "../lib/db";
import { FORMS, stageOf, XP_PER_LEVEL } from "../lib/rules";
import type { Beard, Look } from "../lib/types";
import type { useLiga } from "../lib/useLiga";

type Liga = ReturnType<typeof useLiga>;

const BEARDS: [Beard, string][] = [
  ["none", "Kein Bart"],
  ["stubble", "Dreitage"],
  ["full", "Vollbart"],
];

export function CharacterScreen({ liga }: { liga: Liga }) {
  const [preview, setPreview] = useState<number | null>(null);
  const { level, totalXp, look } = liga;
  const shown = preview ?? level;
  const isPreview = preview !== null && preview !== level;
  const form = FORMS[stageOf(shown)];
  const nextForm = FORMS.find((f) => f.lv > level);
  const update = (patch: Partial<Look>) => void saveLook({ ...look, ...patch });

  return (
    <>
      <section className="card peach hero" aria-label="Dein Charakter">
        <header className="card-head">
          <div>
            <h2>{form.name}</h2>
            <span className="card-sub">
              {form.de} · Level {shown}
            </span>
          </div>
          {isPreview && (
            <button type="button" className="pill dark" onClick={() => setPreview(null)}>
              Vorschau · zurück zu Lv {level}
            </button>
          )}
        </header>
        <div className="hero-art">
          <CharacterArt level={shown} look={look} />
        </div>
        <p className="pill light-pill">
          {nextForm ? (
            <>
              Nächste Form <b>{nextForm.name}</b> ab Lv {nextForm.lv} · noch <b className="num">{(nextForm.lv - 1) * XP_PER_LEVEL - totalXp} XP</b>
            </>
          ) : (
            "Höchste Form erreicht"
          )}
        </p>
      </section>

      <section aria-label="Formen">
        <h2 className="row-title">
          Zukunft ansehen <span>{FORMS.length} Formen</span>
        </h2>
        <div className="forms" role="radiogroup" aria-label="Form ansehen">
          {FORMS.map((f, i) => {
            const locked = level < f.lv;
            const sel = i === stageOf(shown);
            return (
              <button key={f.lv} type="button" role="radio" aria-checked={sel} className={"form-card" + (locked ? " locked" : "") + (sel ? " sel" : "")} onClick={() => setPreview(previewLevel(i, level))}>
                <span className="form-art">
                  <CharacterArt level={f.lv} look={look} bust />
                </span>
                <span className="form-num num">{String(i + 1).padStart(2, "0")}</span>
                <b>{f.name}</b>
                <span>{locked ? `ab Lv ${f.lv}` : "erreicht"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card lavender" aria-label="Aussehen">
        <header className="card-head">
          <h2>Aussehen</h2>
        </header>
        <div className="look-row">
          <span className="look-label">Hautton</span>
          <div className="swatches">
            {SKINS.map((c) => (
              <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Hautton ${c}`} aria-pressed={look.skin === c} onClick={() => update({ skin: c })} />
            ))}
          </div>
        </div>
        <div className="look-row">
          <span className="look-label">Haarfarbe</span>
          <div className="swatches">
            {HAIRS.map((c) => (
              <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Haarfarbe ${c}`} aria-pressed={look.hair === c} onClick={() => update({ hair: c })} />
            ))}
          </div>
        </div>
        <div className="look-row">
          <span className="look-label">Bart</span>
          <div className="seg" role="radiogroup" aria-label="Bart">
            {BEARDS.map(([v, label]) => (
              <button key={v} type="button" role="radio" aria-checked={look.beard === v} onClick={() => update({ beard: v })}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** Level, mit dem eine Form angezeigt wird: die eigene Form im aktuellen Level, sonst ihr höchstes (erreicht) bzw. erstes (gesperrt) Level. */
function previewLevel(formIndex: number, level: number): number {
  const from = FORMS[formIndex].lv;
  const to = (FORMS[formIndex + 1]?.lv ?? Infinity) - 1;
  if (level < from) return from;
  return Math.min(level, to);
}
