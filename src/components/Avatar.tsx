import { FORMS, stageOf } from "../lib/rules";
import type { Look } from "../lib/types";

/*
 * Charakter im Holzschnitt-Stil (Ukiyo-e): dicke Tusche-Konturen, Papiergrund,
 * Wirbelwolken, Namensschild mit Rang und roter Stempel. Eigenes Design,
 * aus SVG-Formen gezeichnet. Schultern, Arme und Muskel-Linien wachsen mit dem Level.
 */

const INK = "#2a1c12";
const PAPER = "#ecdcb8";
const PAPER_EDGE = "#d6bf91";
const CLOTH_LIGHT = "#efe6d3";
const RED = "#b3261e";
const OCHRE = "#c99a3a";
const AURA = [null, null, "#4f9a94", "#d9822b", "#b8322a", "#d4a72c"];
const TOP = ["#a3aaa6", "#3f5277", "#33405e"];
const OBI = ["#7d6a4f", RED, RED, OCHRE, OCHRE, OCHRE];
const CX = 120;

/** Wirbelwolke: drei ineinander laufende Halbkreise. */
function Swirl({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const d = `M${x - r} ${y} A${r} ${r} 0 1 1 ${x + r} ${y} A${r * 0.7} ${r * 0.7} 0 1 1 ${x - r * 0.4} ${y} A${r * 0.4} ${r * 0.4} 0 1 1 ${x + r * 0.4} ${y}`;
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.08} fill={fill} />
      <path d={d} fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

/** Wolkenband aus Bögen, z. B. am Boden. */
function CloudBand({ x, y, w, bump, fill }: { x: number; y: number; w: number; bump: number; fill: string }) {
  const n = Math.max(1, Math.round(w / (bump * 2)));
  const step = w / n;
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` a${step / 2} ${bump} 0 0 1 ${step} 0`;
  d += ` L${x + w} ${y + bump} L${x} ${y + bump} Z`;
  return <path d={d} fill={fill} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />;
}

/** `bust`: nur Kopf und Schultern ohne Hintergrund, für Porträt-Kacheln. */
export function Avatar({ level, look, bust = false }: { level: number; look: Look; bust?: boolean }) {
  const L = Math.min(level, 20);
  const s = stageOf(level);
  const form = FORMS[s];
  const cx = CX;
  const ws = 34 + L * 1.2; // Schulterbreite wächst mit jedem Level
  const ww = 26;
  const t = 10 + L * 0.5; // Armdicke
  const { skin, hair } = look;
  const aura = AURA[s];
  const cloud = aura ?? "#d99a85";
  const top = TOP[Math.min(s, 2)];
  const bareArms = s >= 2;
  const bareChest = s >= 3;
  const pants = s === 0 ? "#6f7a83" : "#2b3247";
  const coat = s >= 4 ? "#2a1a1a" : "#1f2433";
  const eye = s >= 4 ? aura! : INK;
  const torso = `M${cx - ws} 102 Q${cx - ws - 3} 145 ${cx - ww} 190 L${cx + ww} 190 Q${cx + ws + 3} 145 ${cx + ws} 102 Q${cx} 90 ${cx - ws} 102Z`;
  const muscleLines = Math.min(3, Math.floor(L / 4));

  return (
    <svg
      viewBox={bust ? "40 0 160 160" : "0 0 240 300"}
      xmlns="http://www.w3.org/2000/svg"
      role={bust ? undefined : "img"}
      aria-hidden={bust || undefined}
      aria-label={bust ? undefined : `Charakter ${form.name}, Level ${level}`}
      strokeLinejoin="round"
    >
      {!bust && (
        <>
          <rect width="240" height="300" fill={PAPER} />
          <g opacity={0.55}>
            <Swirl x={196} y={46} r={20} fill={cloud} />
            <Swirl x={222} y={92} r={12} fill={cloud} />
            <Swirl x={58} y={196} r={15} fill={cloud} />
            <Swirl x={206} y={214} r={17} fill={cloud} />
          </g>
          <rect x="3" y="3" width="234" height="294" fill="none" stroke={PAPER_EDGE} strokeWidth={6} />
          {/* Namensschild mit Rang und Stempel */}
          <rect x="12" y="12" width="28" height="78" fill="#6e5a8a" stroke={OCHRE} strokeWidth={2.5} />
          <rect x="15" y="15" width="22" height="72" fill="none" stroke={INK} strokeWidth={0.8} />
          {[...form.kanji].map((k, i) => (
            <text key={i} x="26" y={42 + i * 30} textAnchor="middle" fontSize="20" fontFamily="'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif" fontWeight="700" fill="#f3e7c9">
              {k}
            </text>
          ))}
          <rect x="15" y="98" width="22" height="22" rx="3" fill={RED} />
          <text x="26" y="114" textAnchor="middle" fontSize="14" fontFamily="'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif" fontWeight="700" fill="#f6e9d4">
            力
          </text>
          <text x="26" y="134" textAnchor="middle" fontSize="9" fontFamily="serif" fill={INK} opacity={0.75}>
            Lv {level}
          </text>
        </>
      )}

      {aura && (
        <g className="aura">
          <path
            d="M120 18 C140 40 176 50 182 92 C188 130 170 150 188 190 C204 226 186 260 196 290 L44 290 C54 260 36 226 52 190 C70 150 52 130 58 92 C64 50 100 40 120 18Z"
            fill={aura}
            opacity={0.22}
            stroke={aura}
            strokeWidth={2}
          />
          <path d="M120 40 C134 58 160 66 164 100 C168 134 156 156 168 196 L72 196 C84 156 72 134 76 100 C80 66 106 58 120 40Z" fill={aura} opacity={0.18} />
        </g>
      )}

      {/* Mantel (Hokage) hinter dem Körper */}
      {s >= 5 && (
        <>
          <path d={`M${cx - ws + 2} 98 L${cx + ws - 2} 98 Q${cx + ws + 30} 180 ${cx + ws + 44} 266 L${cx - ws - 44} 266 Q${cx - ws - 30} 180 ${cx - ws + 2} 98 Z`} fill="#7a1f1f" stroke={INK} strokeWidth={2.2} />
          {[-1, 1].map((k) => (
            <Swirl key={k} x={cx + k * (ws + 28)} y={248} r={9} fill={CLOTH_LIGHT} />
          ))}
        </>
      )}

      {/* Hakama */}
      <path d={`M${cx - 28} 184 L${cx + 28} 184 L${cx + 36} 276 L${cx + 4} 276 L${cx} 214 L${cx - 4} 276 L${cx - 36} 276 Z`} fill={pants} stroke={INK} strokeWidth={2.2} />
      <path d={`M${cx - 15} 192 L${cx - 21} 270 M${cx + 15} 192 L${cx + 21} 270`} stroke={INK} strokeWidth={1.2} opacity={0.6} />
      <ellipse cx={cx - 20} cy={281} rx={15} ry={6} fill={CLOTH_LIGHT} stroke={INK} strokeWidth={2} />
      <ellipse cx={cx + 20} cy={281} rx={15} ry={6} fill={CLOTH_LIGHT} stroke={INK} strokeWidth={2} />

      {/* Oberkörper */}
      <path d={torso} fill={bareChest ? skin : top} stroke={INK} strokeWidth={2.4} />
      {!bareChest && (
        <>
          {/* Kreuzkragen bzw. tiefer V-Ausschnitt */}
          <path d={`M${cx - 16} 97 L${cx} ${s === 2 ? 142 : 128} L${cx + 16} 97Z`} fill={skin} />
          <path d={`M${cx - 16} 97 L${cx + 4} ${s === 2 ? 150 : 136} M${cx + 16} 97 L${cx} ${s === 2 ? 142 : 128}`} fill="none" stroke={CLOTH_LIGHT} strokeWidth={4} />
          <path d={`M${cx - 18} 96 L${cx + 4} ${s === 2 ? 152 : 138} M${cx + 18} 96 L${cx - 1} ${s === 2 ? 144 : 130}`} fill="none" stroke={INK} strokeWidth={1.6} />
          {s === 2 && <path d={`M${cx - 10} 118 Q${cx - 4} 124 ${cx} 120 Q${cx + 4} 124 ${cx + 8} 118`} fill="none" stroke={INK} strokeWidth={1.2} />}
          {/* Stoff-Falten */}
          <path d={`M${cx - ws + 10} 120 Q${cx - ws + 14} 150 ${cx - 18} 172 M${cx + ws - 10} 120 Q${cx + ws - 14} 150 ${cx + 18} 172`} fill="none" stroke={INK} strokeWidth={1.1} opacity={0.5} />
        </>
      )}
      {bareChest && (
        <g fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round">
          <path d={`M${cx - ws + 10} 126 Q${cx - 14} 140 ${cx - 2} 128 M${cx + ws - 10} 126 Q${cx + 14} 140 ${cx + 2} 128`} />
          <path d={`M${cx} 130 L${cx} 176`} opacity={0.7} />
          {[146, 159, 171].map((y) => (
            <path key={y} d={`M${cx - 13} ${y} Q${cx - 7} ${y + 3} ${cx - 2} ${y} M${cx + 2} ${y} Q${cx + 7} ${y + 3} ${cx + 13} ${y}`} />
          ))}
          <path d={`M${cx - ws + 4} 110 Q${cx - ws + 14} 104 ${cx - 20} 108 M${cx + ws - 4} 110 Q${cx + ws - 14} 104 ${cx + 20} 108`} opacity={0.6} />
        </g>
      )}

      {/* Obi */}
      <rect x={cx - ww - 1} y={176} width={2 * ww + 2} height={12} fill={OBI[s]} stroke={INK} strokeWidth={2} />
      <path d={`M${cx + 6} 182 l10 14 l6 -2 l-8 -12 Z`} fill={OBI[s]} stroke={INK} strokeWidth={1.6} />

      {/* Offener Mantel ab Jōnin */}
      {s >= 3 && (
        <>
          <path d={`M${cx - ws - 3} 99 L${cx - 17} 95 L${cx - ww + 1} 192 L${cx - ww - 4} 240 L${cx - ws - 16} 240 Z`} fill={coat} stroke={INK} strokeWidth={2.2} />
          <path d={`M${cx + ws + 3} 99 L${cx + 17} 95 L${cx + ww - 1} 192 L${cx + ww + 4} 240 L${cx + ws + 16} 240 Z`} fill={coat} stroke={INK} strokeWidth={2.2} />
          <path d={`M${cx - 17} 95 L${cx - ww + 1} 192 L${cx - ww - 4} 240 M${cx + 17} 95 L${cx + ww - 1} 192 L${cx + ww + 4} 240`} fill="none" stroke={OCHRE} strokeWidth={3} />
          <path d={`M${cx - ws - 16} 240 L${cx - ww - 4} 240 M${cx + ws + 16} 240 L${cx + ww + 4} 240`} stroke={OCHRE} strokeWidth={3.5} />
        </>
      )}
      {/* Schulterschutz ab ANBU */}
      {s >= 4 && <path d={`M${cx - ws - 8} 112 Q${cx - ws - 6} 92 ${cx - ws + 14} 94 L${cx - ws + 10} 116 Z`} fill="#5a6470" stroke={INK} strokeWidth={2} />}

      {/* Arme */}
      {[-1, 1].map((d) => {
        const sx = cx + d * (ws - 5);
        const ex = cx + d * (ws + 8);
        const hx = cx + d * (ws + 5);
        const arm = `${sx},108 ${ex},150 ${hx},186`;
        return (
          <g key={d}>
            <polyline points={arm} fill="none" stroke={INK} strokeWidth={t + 4.4} strokeLinecap="round" />
            <polyline points={arm} fill="none" stroke={skin} strokeWidth={t} strokeLinecap="round" />
            {!bareArms && (
              <>
                <line x1={sx} y1={106} x2={cx + d * (ws + 4)} y2={132} stroke={INK} strokeWidth={t + 12} strokeLinecap="round" />
                <line x1={sx} y1={106} x2={cx + d * (ws + 4)} y2={132} stroke={top} strokeWidth={t + 8} strokeLinecap="round" />
              </>
            )}
            {bareArms &&
              Array.from({ length: Math.max(1, muscleLines) }, (_, i) => (
                <path
                  key={i}
                  d={`M${sx + d * (1 + i * 2)} ${114 + i * 6} Q${ex + d * (-1 - i)} ${126 + i * 4} ${ex - d * (1 + i)} ${144}`}
                  fill="none"
                  stroke={INK}
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  opacity={0.65}
                />
              ))}
            {L >= 8 && <path d={`M${ex} 154 Q${hx + d * 3} 166 ${hx} 178`} fill="none" stroke={INK} strokeWidth={1.1} opacity={0.55} />}
            {s >= 4 && <path d={`M${ex - d * 4} 158 L${hx - d * 3} 166 M${ex - d * 1} 164 L${hx} 172`} stroke={RED} strokeWidth={2.4} strokeLinecap="round" />}
            {s >= 1 && <rect x={hx - t / 2 - 1.5} y={172} width={t + 3} height={8} fill={CLOTH_LIGHT} stroke={INK} strokeWidth={1.4} />}
            <circle cx={hx} cy={190} r={t * 0.56} fill={skin} stroke={INK} strokeWidth={1.8} />
          </g>
        );
      })}

      {/* Kopf */}
      {s >= 3 && <path d={`M${cx + 16} 38 Q${cx + 52} 30 ${cx + 60} 66 Q${cx + 42} 54 ${cx + 22} 52 Z`} fill={hair} stroke={INK} strokeWidth={1.8} />}
      <rect x={cx - 9 - L * 0.2} y={76} width={18 + L * 0.4} height={26} fill={skin} stroke={INK} strokeWidth={2} />
      <circle cx={cx - 26} cy={60} r={5} fill={skin} stroke={INK} strokeWidth={1.8} />
      <circle cx={cx + 26} cy={60} r={5} fill={skin} stroke={INK} strokeWidth={1.8} />
      <path d={`M${cx - 26} 56 Q${cx - 27} 84 ${cx} 86 Q${cx + 27} 84 ${cx + 26} 56 Q${cx + 26} 31 ${cx} 31 Q${cx - 26} 31 ${cx - 26} 56Z`} fill={skin} stroke={INK} strokeWidth={2.2} />
      {look.beard !== "none" && (
        <path
          d={`M${cx - 24} 62 Q${cx - 22} 88 ${cx} 88 Q${cx + 22} 88 ${cx + 24} 62 Q${cx + 15} 77 ${cx} 76 Q${cx - 15} 77 ${cx - 24} 62Z`}
          fill={hair}
          opacity={look.beard === "full" ? 0.92 : 0.35}
          stroke={look.beard === "full" ? INK : "none"}
          strokeWidth={1.4}
        />
      )}
      <path d={`M${cx - 28} 60 Q${cx - 30} 24 ${cx} 25 Q${cx + 30} 24 ${cx + 28} 60 Q${cx + 22} 40 ${cx} 42 Q${cx - 22} 40 ${cx - 28} 60Z`} fill={hair} stroke={INK} strokeWidth={2} />
      <path d={`M${cx - 18} 32 Q${cx - 22} 42 ${cx - 24} 52 M${cx - 6} 28 Q${cx - 10} 36 ${cx - 12} 42 M${cx + 8} 28 Q${cx + 12} 36 ${cx + 14} 42 M${cx + 19} 33 Q${cx + 22} 42 ${cx + 24} 52`} fill="none" stroke="#ffffff" strokeOpacity={0.22} strokeWidth={1.2} />
      {s >= 4 && (
        <path d={`M${cx - 24} 40 L${cx - 32} 18 L${cx - 13} 30 L${cx - 9} 8 L${cx + 2} 28 L${cx + 13} 6 L${cx + 15} 30 L${cx + 32} 16 L${cx + 24} 40Z`} fill={hair} stroke={INK} strokeWidth={2} />
      )}

      {/* Stirnband mit eigener Lotus-Platte */}
      {s >= 1 && (
        <>
          <path d={`M${cx + 26} 47 Q${cx + 44} 50 ${cx + 52} 64 Q${cx + 40} 58 ${cx + 26} 53 Z M${cx + 26} 49 Q${cx + 46} 44 ${cx + 58} 50 Q${cx + 44} 52 ${cx + 26} 53 Z`} fill={CLOTH_LIGHT} stroke={INK} strokeWidth={1.4} />
          <rect x={cx - 28} y={43} width={56} height={10} fill={CLOTH_LIGHT} stroke={INK} strokeWidth={1.8} />
          <rect x={cx - 12} y={41} width={24} height={14} rx={2} fill="#c8ccd2" stroke={INK} strokeWidth={1.8} />
          <path d={`M${cx} 44 Q${cx - 3} 48 ${cx} 52 Q${cx + 3} 48 ${cx} 44 Z M${cx - 2} 52 Q${cx - 8} 49 ${cx - 7} 46 Q${cx - 3} 48 ${cx - 2} 52 Z M${cx + 2} 52 Q${cx + 8} 49 ${cx + 7} 46 Q${cx + 3} 48 ${cx + 2} 52 Z`} fill="none" stroke={INK} strokeWidth={0.9} />
        </>
      )}

      {/* Gesicht */}
      <path d={`M${cx - 16} ${s >= 2 ? 55 : 56} L${cx - 4} ${s >= 2 ? 58 : 57} M${cx + 4} ${s >= 2 ? 58 : 57} L${cx + 16} ${s >= 2 ? 55 : 56}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${cx - 14} 62 Q${cx - 9} 58 ${cx - 4} 62 Q${cx - 9} 64 ${cx - 14} 62Z M${cx + 4} 62 Q${cx + 9} 58 ${cx + 14} 62 Q${cx + 9} 64 ${cx + 4} 62Z`} fill={CLOTH_LIGHT} stroke={INK} strokeWidth={1.3} />
      <circle cx={cx - 9} cy={61.6} r={1.9} fill={eye} />
      <circle cx={cx + 9} cy={61.6} r={1.9} fill={eye} />
      <path d={`M${cx} 63 L${cx - 2.5} 70 L${cx + 1.5} 71`} fill="none" stroke={INK} strokeWidth={1.3} strokeLinecap="round" />
      <path d={`M${cx - 6} 76 Q${cx} ${s >= 3 ? 75 : 78} ${cx + 6} 76`} stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />

      {!bust && (
        <g opacity={0.95}>
          <CloudBand x={8} y={276} w={84} bump={8} fill={PAPER_EDGE} />
          <CloudBand x={150} y={272} w={82} bump={9} fill={PAPER_EDGE} />
        </g>
      )}
    </svg>
  );
}
