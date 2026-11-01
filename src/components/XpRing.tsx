import type { ReactNode } from "react";

export type RingSegment = { key: string; name: string; value: number; color: string };

const R = 80;
const STROKE = 26;
const C = 2 * Math.PI * R;
const GAP = 3; // Abstand zwischen Segmenten in Kartenfarbe

/**
 * Ring-Diagramm: Segmente anteilig zu `max` (z. B. Wochenziel). Liegt die Summe
 * darüber, füllen die Segmente den ganzen Ring.
 */
export function XpRing({ segments, max, children }: { segments: RingSegment[]; max: number; children: ReactNode }) {
  const visible = segments.filter((s) => s.value > 0);
  const scale = Math.max(max, visible.reduce((a, s) => a + s.value, 0));
  let offset = 0;

  return (
    <div className="ring">
      <svg viewBox="0 0 200 200" role="img" aria-label={visible.map((s) => `${s.name} ${s.value} XP`).join(", ") || "Noch keine XP"}>
        <circle cx="100" cy="100" r={R} fill="none" className="ring-track" strokeWidth={STROKE} />
        <g transform="rotate(-90 100 100)">
          {visible.map((s) => {
            const len = (s.value / scale) * C;
            const dash = Math.max(0, len - (visible.length > 1 || len < C ? GAP : 0));
            const el = (
              <circle
                key={s.key}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
              >
                <title>{`${s.name}: ${s.value} XP`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}
