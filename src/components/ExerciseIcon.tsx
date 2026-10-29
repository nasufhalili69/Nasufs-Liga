import type { ReactNode } from "react";
import type { Category } from "../lib/types";

/* Einfache Piktogramme für die Auswahl-Kacheln, nach Übung oder sonst nach Art. */

const BY_ID: Record<string, string> = {
  fussball: "ball",
  laufen: "run",
  schwimmen: "swim",
};

const BY_CAT: Record<Category, string> = {
  spiel: "ball",
  cardio: "pulse",
  kraftOb: "dumbbell",
  kraftUn: "kettlebell",
  schwer: "pullup",
  rumpf: "timer",
  mobil: "stretch",
};

const PATHS: Record<string, ReactNode> = {
  ball: (
    <>
      <circle cx="24" cy="24" r="17" />
      <path d="M24 15 L32 21 L29 31 L19 31 L16 21 Z" />
      <path d="M24 15 V7 M32 21 L40 18 M29 31 L34 38 M19 31 L14 38 M16 21 L8 18" />
    </>
  ),
  run: (
    <>
      <circle cx="29" cy="9" r="4" />
      <path d="M14 21 L22 15 L30 18 L34 26 L40 27" />
      <path d="M26 17 L22 29 L30 34 L28 43 M22 29 L14 36 L8 35" />
    </>
  ),
  swim: (
    <>
      <circle cx="33" cy="15" r="4" />
      <path d="M10 24 L22 18 L30 24" />
      <path d="M4 32 Q10 28 16 32 T28 32 T40 32 T46 32 M4 40 Q10 36 16 40 T28 40 T40 40 T46 40" />
    </>
  ),
  pulse: (
    <>
      <path d="M24 40 C10 30 5 22 8 15 C11 8 20 8 24 15 C28 8 37 8 40 15 C43 22 38 30 24 40 Z" />
      <path d="M8 24 H17 L20 18 L25 30 L28 24 H40" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M14 24 H34" />
      <rect x="7" y="15" width="7" height="18" rx="2" />
      <rect x="34" y="15" width="7" height="18" rx="2" />
      <path d="M4 20 V28 M44 20 V28" />
    </>
  ),
  kettlebell: (
    <>
      <path d="M17 17 C17 8 31 8 31 17" />
      <path d="M13 22 C10 34 16 41 24 41 C32 41 38 34 35 22 C33 17 15 17 13 22 Z" />
    </>
  ),
  pullup: (
    <>
      <path d="M4 7 H44" />
      <path d="M16 7 L20 18 M32 7 L28 18" />
      <circle cx="24" cy="20" r="4" />
      <path d="M20 26 H28 L27 36 L29 44 M21 36 L19 44 M21 36 L20 26" />
    </>
  ),
  timer: (
    <>
      <circle cx="24" cy="27" r="15" />
      <path d="M20 6 H28 M24 6 V12 M24 27 L31 20 M37 13 L40 10" />
    </>
  ),
  stretch: (
    <>
      <circle cx="24" cy="8" r="4" />
      <path d="M24 13 V28 M24 17 L10 10 M24 17 L38 10 M24 28 L13 42 M24 28 L35 42" />
    </>
  ),
  plus: <path d="M24 10 V38 M10 24 H38" />,
};

export function ExerciseIcon({ id, cat }: { id: string; cat?: Category }) {
  const key = BY_ID[id] ?? (cat ? BY_CAT[cat] : "plus");
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[key]}
    </svg>
  );
}
