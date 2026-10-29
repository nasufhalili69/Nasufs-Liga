import type { Category, Entry, Exercise } from "./types";

/* Spielregeln: das Programm legt fest, wie viel XP es gibt. XP werden immer aus den Einträgen berechnet. */

type Fx = [number, number, number, number]; // Ausdauer, Muskel, Aussehen, Gesundheit (0–3)

type CatBase = { name: string; fx: Fx; txt: string };
export type SessionCat = CatBase & { kind: "session"; unit: "min"; base: number; bonusMin: number; bonus: number };
export type RepsCat = CatBase & { kind: "reps"; unit: "Wdh." | "Sek."; div: number; cap: number };
export type CatRule = SessionCat | RepsCat;

export const CATS: Record<Category, CatRule> = {
  spiel: { name: "Ballsport / Spiel", unit: "min", kind: "session", base: 30, bonusMin: 45, bonus: 5, fx: [3, 1, 2, 3], txt: "Intervalle und Sprints: stark für Herz, Ausdauer und Fettverbrennung." },
  cardio: { name: "Ausdauer", unit: "min", kind: "session", base: 25, bonusMin: 45, bonus: 5, fx: [3, 1, 2, 3], txt: "Baut Grundausdauer auf, senkt Ruhepuls und Blutdruck." },
  kraftOb: { name: "Kraft Oberkörper", unit: "Wdh.", kind: "reps", div: 5, cap: 20, fx: [1, 3, 3, 2], txt: "Brust, Schultern, Arme: Oberkörper wird kräftiger und definierter." },
  kraftUn: { name: "Kraft Beine", unit: "Wdh.", kind: "reps", div: 5, cap: 20, fx: [1, 3, 2, 2], txt: "Größte Muskeln des Körpers, kurbelt den Stoffwechsel an." },
  schwer: { name: "Kraft schwer (z. B. Klimmzug)", unit: "Wdh.", kind: "reps", div: 1, cap: 20, fx: [1, 3, 3, 2], txt: "Schwere Übungen mit wenigen Wiederholungen, viel Muskelreiz." },
  rumpf: { name: "Rumpf / Halten", unit: "Sek.", kind: "reps", div: 10, cap: 15, fx: [0, 1, 2, 2], txt: "Stabiler Rumpf, entlastet den Rücken, bessere Haltung." },
  mobil: { name: "Mobilität / Dehnen", unit: "min", kind: "session", base: 10, bonusMin: 0, bonus: 0, fx: [0, 0, 1, 3], txt: "Beweglichkeit und Regeneration, beugt Verletzungen vor." },
};

type Builtin = Omit<Exercise, "custom"> & { fx?: Fx; txt: string };

export const BUILTIN: Builtin[] = [
  { id: "fussball", name: "Fußball", cat: "spiel", txt: "Intervalle, Sprints, Richtungswechsel: stark für Herz und Ausdauer, verbrennt viel Energie." },
  { id: "laufen", name: "Laufen", cat: "cardio", txt: "Ruhig in Zone 2 baut Grundausdauer auf, senkt Ruhepuls und Blutdruck." },
  { id: "schwimmen", name: "Schwimmen", cat: "cardio", fx: [3, 2, 2, 3], txt: "Ganzkörper und gelenkschonend, kräftigt Rücken und Schultern." },
  { id: "liegestuetz", name: "Liegestütz", cat: "kraftOb", txt: "Brust, Schultern, Trizeps und Rumpf: Oberkörper wird breiter und definierter." },
  { id: "kniebeugen", name: "Kniebeugen", cat: "kraftUn", txt: "Trainiert die größten Muskeln (Beine, Po) und kurbelt den Stoffwechsel an." },
  { id: "klimmzuege", name: "Klimmzüge", cat: "schwer", txt: "Rücken und Bizeps, sorgt für die V-Form und hilft gegen runde Schultern." },
  { id: "plank", name: "Plank", cat: "rumpf", txt: "Stabiler Rumpf, entlastet den Rücken und verbessert die Haltung." },
];

/** Übung mit aufgelöster Regel ihrer Art. */
export type ResolvedExercise = CatRule & { id: string; name: string; cat: Category; catName: string; custom: boolean };

export function resolveExercises(custom: Exercise[]): Record<string, ResolvedExercise> {
  const out: Record<string, ResolvedExercise> = {};
  for (const e of BUILTIN) {
    const c = CATS[e.cat];
    out[e.id] = { ...c, id: e.id, name: e.name, cat: e.cat, catName: c.name, fx: e.fx ?? c.fx, txt: e.txt, custom: false };
  }
  for (const e of custom) {
    const c = CATS[e.cat];
    if (!c) continue;
    out[e.id] = { ...c, id: e.id, name: e.name, cat: e.cat, catName: c.name, custom: true };
  }
  return out;
}

export function ruleText(c: CatRule): string {
  if (c.kind === "session") return `${c.base} XP pro Einheit` + (c.bonus ? ` · +${c.bonus} ab ${c.bonusMin} min` : "");
  const per = c.div === 1 ? `1 XP je ${c.unit === "Sek." ? "Sekunde" : "Wiederholung"}` : `1 XP je ${c.div} ${c.unit}`;
  return `${per} · max. ${c.cap} XP pro Tag (= ${c.cap * c.div} ${c.unit})`;
}

export const DAY_BONUS = 5;
export const WEEK_GOAL = 100;
export const XP_PER_LEVEL = 250;

export type WeekScore = { total: number; bonus: number; activeDays: number; per: Map<string, number> };

/**
 * Wochen-XP aus den Einträgen. Wiederholungs-Übungen werden pro Tag und Übung
 * zusammengezählt, dann gilt das Tageslimit. +5 XP je Tag mit Training.
 */
export function scoreWeek(entries: Entry[], ex: Record<string, ResolvedExercise>): WeekScore {
  let pts = 0;
  const per = new Map<string, number>();
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const r = ex[e.ex];
    if (!r) {
      per.set(e.id, 0);
      continue;
    }
    if (r.kind === "session") {
      const p = r.base + (r.bonus && (e.amount || 0) >= r.bonusMin ? r.bonus : 0);
      per.set(e.id, p);
      pts += p;
    } else {
      const k = e.day + "|" + e.ex;
      groups.set(k, [...(groups.get(k) ?? []), e]);
    }
  }
  for (const list of groups.values()) {
    const r = ex[list[0].ex] as RepsCat;
    let run = 0;
    let before = 0;
    for (const e of list) {
      run += e.amount || 0;
      const upto = Math.min(r.cap, Math.floor(run / r.div));
      per.set(e.id, upto - before);
      before = upto;
    }
    pts += before;
  }
  const activeDays = new Set(entries.map((e) => e.day)).size;
  return { total: pts + activeDays * DAY_BONUS, bonus: activeDays * DAY_BONUS, activeDays, per };
}

const RANKS: [number, string][] = [
  [160, "S"],
  [130, "A"],
  [100, "B"],
  [70, "C"],
  [40, "D"],
  [0, "E"],
];

export const rankOf = (xp: number) => RANKS.find(([min]) => xp >= min)![1];

/** Nächster Rang und wie viel XP noch fehlen, oder null bei Rang S. */
export function nextRank(xp: number): { rank: string; missing: number } | null {
  const next = [...RANKS].reverse().find(([min]) => min > xp);
  return next ? { rank: next[1], missing: next[0] - xp } : null;
}

export const levelOf = (totalXp: number) => Math.floor(totalXp / XP_PER_LEVEL) + 1;

/* Charakter-Formen */
export const FORMS = [
  { lv: 1, name: "Minarai", de: "Lehrling" },
  { lv: 3, name: "Senshi", de: "Krieger" },
  { lv: 6, name: "Bushi", de: "Kämpfer" },
  { lv: 10, name: "Shihan", de: "Meister" },
  { lv: 15, name: "Kensei", de: "Schwertheiliger" },
  { lv: 20, name: "Haō", de: "Oberherr" },
];

export const stageOf = (level: number) => FORMS.reduce((s, f, i) => (level >= f.lv ? i : s), 0);
