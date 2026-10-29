import { stageOf } from "../lib/rules";
import type { Look } from "../lib/types";

/*
 * Platzhalter-Grafik aus SVG-Formen (wie im Prototyp). Wird später durch
 * eigene, gezeichnete Illustrationen pro Form ersetzt.
 */

const AURA = [null, null, "#2bb5c9", "#ff7a1a", "#ff3d2e", "#f5c542"];
const CX = 120;

/** `bust`: nur Kopf und Schultern, für die Porträt-Kacheln der Formen-Auswahl. */
export function Avatar({ level, look, bust = false }: { level: number; look: Look; bust?: boolean }) {
  const L = Math.min(level, 20);
  const s = stageOf(level);
  const cx = CX;
  const ws = 34 + L * 1.2; // Schulterbreite wächst mit jedem Level
  const ww = 26;
  const t = 10 + L * 0.5; // Armdicke
  const { skin, hair } = look;
  const acc = s >= 3 ? "#d9480f" : "#2f6db5";
  const aura = AURA[s];
  const pants = s >= 2 ? "#1f2a36" : "#3a4654";
  const top = ["#8a96a3", "#2f6db5", "#22304a"][s];
  const torso = `M${cx - ws} 102 Q${cx - ws - 3} 145 ${cx - ww} 190 L${cx + ww} 190 Q${cx + ws + 3} 145 ${cx + ws} 102 Q${cx} 90 ${cx - ws} 102Z`;
  const shade = "rgba(60,30,10,.28)";
  const coat = "#141a22";
  const eye = s >= 4 ? aura! : "#1a1a1a";

  return (
    <svg
      viewBox={bust ? "40 0 160 160" : "0 0 240 300"}
      xmlns="http://www.w3.org/2000/svg"
      role={bust ? undefined : "img"}
      aria-hidden={bust || undefined}
      aria-label={bust ? undefined : `Charakter Level ${level}`}
    >
      {aura && (
        <g className="aura">
          <path d="M120 4 C152 40 204 62 198 140 C194 200 216 232 192 296 L48 296 C24 232 46 200 42 140 C36 62 88 40 120 4Z" fill={aura} opacity={0.1 + 0.05 * s} />
          <path d="M120 30 C140 62 180 82 176 146 C174 200 190 236 172 296 L68 296 C50 236 66 200 64 146 C60 82 100 62 120 30Z" fill={aura} opacity={0.08 + 0.05 * s} />
        </g>
      )}
      {s >= 5 && (
        <>
          <path d={`M${cx - ws + 8} 100 L${cx + ws - 8} 100 L${cx + ws + 24} 288 L${cx - ws - 24} 288 Z`} fill="#6e1b1b" />
          <path d={`M${cx - ws - 24} 288 L${cx + ws + 24} 288`} stroke={AURA[5]!} strokeWidth={4} />
        </>
      )}

      <rect x={cx - 27} y={184} width={25} height={96} rx={8} fill={pants} />
      <rect x={cx + 2} y={184} width={25} height={96} rx={8} fill={pants} />
      <ellipse cx={cx - 15} cy={282} rx={15} ry={6} fill="#151515" />
      <ellipse cx={cx + 15} cy={282} rx={15} ry={6} fill="#151515" />

      <path d={torso} fill={s <= 2 ? top : skin} />
      {s === 2 && (
        <>
          <path d={`M${cx - 15} 97 L${cx} 136 L${cx + 15} 97Z`} fill={skin} />
          <path d={`M${cx - 15} 97 L${cx} 136 L${cx + 15} 97`} fill="none" stroke="#111a28" strokeWidth={3} />
        </>
      )}
      {s >= 3 && (
        <g stroke={shade} strokeWidth={2} fill="none">
          <path d={`M${cx - ws + 10} 128 Q${cx - 12} 138 ${cx} 128 Q${cx + 12} 138 ${cx + ws - 10} 128`} />
          <path d={`M${cx} 130 L${cx} 182`} />
          {[146, 160, 173].map((y) => (
            <path key={y} d={`M${cx - 13} ${y} L${cx - 3} ${y + 1} M${cx + 3} ${y + 1} L${cx + 13} ${y}`} />
          ))}
        </g>
      )}
      {s >= 2 && <rect x={cx - ww - 1} y={178} width={2 * ww + 2} height={10} rx={2} fill={s >= 3 ? acc : "#111"} />}
      {s >= 3 && (
        <>
          <path d={`M${cx - ws - 3} 99 L${cx - 17} 95 L${cx - ww + 1} 192 L${cx - ww - 4} 238 L${cx - ws - 15} 238 Z`} fill={coat} />
          <path d={`M${cx + ws + 3} 99 L${cx + 17} 95 L${cx + ww - 1} 192 L${cx + ww + 4} 238 L${cx + ws + 15} 238 Z`} fill={coat} />
          <path d={`M${cx - 17} 95 L${cx - ww + 1} 192 L${cx - ww - 4} 238 M${cx + 17} 95 L${cx + ww - 1} 192 L${cx + ww + 4} 238`} fill="none" stroke={acc} strokeWidth={3} />
          <path d={`M${cx - ws - 15} 238 L${cx - ww - 4} 238 M${cx + ws + 15} 238 L${cx + ww + 4} 238`} stroke={acc} strokeWidth={4} />
        </>
      )}

      {[-1, 1].map((d) => {
        const sx = cx + d * (ws - 5);
        const ex = cx + d * (ws + 8);
        const hx = cx + d * (ws + 5);
        return (
          <g key={d}>
            <polyline points={`${sx},108 ${ex},150 ${hx},186`} fill="none" stroke={skin} strokeWidth={t} strokeLinecap="round" strokeLinejoin="round" />
            {s <= 1 && <line x1={sx} y1={106} x2={cx + d * (ws + 3)} y2={128} stroke={top} strokeWidth={t + 4} strokeLinecap="round" />}
            {s >= 4 && <path d={`M${ex - d * 3} 158 L${hx - d * 2} 170 M${ex} 162 L${hx + d} 176`} stroke={aura!} strokeWidth={2} strokeLinecap="round" />}
            {s >= 1 && <rect x={hx - t / 2 - 1} y={172} width={t + 2} height={7} rx={2} fill={acc} />}
            <circle cx={hx} cy={190} r={t * 0.55} fill={skin} />
          </g>
        );
      })}

      <rect x={cx - 9 - L * 0.2} y={76} width={18 + L * 0.4} height={26} rx={4} fill={skin} />
      <circle cx={cx - 26} cy={60} r={5} fill={skin} />
      <circle cx={cx + 26} cy={60} r={5} fill={skin} />
      <circle cx={cx} cy={58} r={26} fill={skin} />
      {look.beard !== "none" && (
        <path
          d={`M${cx - 24} 62 Q${cx - 22} 88 ${cx} 88 Q${cx + 22} 88 ${cx + 24} 62 Q${cx + 15} 77 ${cx} 76 Q${cx - 15} 77 ${cx - 24} 62Z`}
          fill={hair}
          opacity={look.beard === "full" ? 0.92 : 0.35}
        />
      )}
      <path d={`M${cx - 27} 60 Q${cx - 29} 26 ${cx} 27 Q${cx + 29} 26 ${cx + 27} 60 Q${cx + 21} 41 ${cx} 43 Q${cx - 21} 41 ${cx - 27} 60Z`} fill={hair} />
      {s >= 4 && (
        <path d={`M${cx - 24} 40 L${cx - 30} 20 L${cx - 12} 32 L${cx - 8} 12 L${cx + 2} 30 L${cx + 12} 10 L${cx + 14} 32 L${cx + 30} 18 L${cx + 24} 40Z`} fill={hair} />
      )}
      {s >= 1 && (
        <>
          <rect x={cx - 27} y={43} width={54} height={8} rx={2} fill={acc} />
          <path d={`M${cx + 25} 47 L${cx + 40} 56 L${cx + 36} 60 Z M${cx + 25} 47 L${cx + 44} 48 L${cx + 42} 53Z`} fill={acc} />
        </>
      )}
      <path
        d={`M${cx - 15} 54 L${cx - 4} ${s >= 2 ? 56 : 55} M${cx + 4} ${s >= 2 ? 56 : 55} L${cx + 15} 54`}
        stroke={hair}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <ellipse cx={cx - 9} cy={61} rx={2.6} ry={3.2} fill={eye} />
      <ellipse cx={cx + 9} cy={61} rx={2.6} ry={3.2} fill={eye} />
      <path d={`M${cx - 6} 73 Q${cx} ${s >= 3 ? 74 : 76} ${cx + 6} 73`} stroke="#5a3a2a" strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
  );
}
