import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db, DEFAULT_LOOK } from "./db";
import { levelOf, resolveExercises, scoreWeek } from "./rules";
import type { Exercise, Week } from "./types";

const NO_WEEKS: Week[] = [];
const NO_EXERCISES: Exercise[] = [];

/** Alle gespeicherten Daten plus daraus berechnete XP und Level. */
export function useLiga() {
  const weeksList = useLiveQuery(() => db.weeks.toArray(), []);
  const custom = useLiveQuery(() => db.exercises.toArray(), []) ?? NO_EXERCISES;
  const lookSetting = useLiveQuery(() => db.settings.get("look"), []);

  const exercises = useMemo(() => resolveExercises(custom), [custom]);
  const weeks = useMemo(() => {
    const out: Record<string, Week["entries"]> = {};
    for (const w of weeksList ?? NO_WEEKS) out[w.key] = w.entries;
    return out;
  }, [weeksList]);
  const totalXp = useMemo(
    () => Object.values(weeks).reduce((sum, entries) => sum + scoreWeek(entries, exercises).total, 0),
    [weeks, exercises],
  );

  return {
    loaded: weeksList !== undefined,
    weeks,
    custom,
    exercises,
    look: lookSetting?.value ?? DEFAULT_LOOK,
    totalXp,
    level: levelOf(totalXp),
  };
}
