import Dexie, { type EntityTable } from "dexie";
import type { Entry, Exercise, Look, Week } from "./types";

type Setting = { key: "look"; value: Look };

export const SKINS = ["#f1c9a5", "#d9a77f", "#b98257", "#8a5a3b"];
export const HAIRS = ["#1c1a19", "#3b2a20", "#6b4a2e", "#c9a35b"];
export const DEFAULT_LOOK: Look = { skin: SKINS[1], hair: HAIRS[0], beard: "stubble" };

export class LigaDB extends Dexie {
  weeks!: EntityTable<Week, "key">;
  exercises!: EntityTable<Exercise, "id">;
  settings!: EntityTable<Setting, "key">;

  constructor(name = "wochen-liga") {
    super(name);
    this.version(1).stores({
      weeks: "key",
      exercises: "id",
      settings: "key",
    });
    // Bestehende Daten beim ersten Start übernehmen.
    this.on("populate", (tx) => {
      tx.table("weeks").add({
        key: "2026-W43",
        entries: [{ id: "seed-w43-fussball", ex: "fussball", name: "Fußball", day: "2026-10-24", amount: 90, km: 8, note: "Halle · 5 Tore" }],
      } satisfies Week);
    });
  }
}

export const db = new LigaDB();

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export async function addEntry(weekKey: string, entry: Entry) {
  await db.transaction("rw", db.weeks, async () => {
    const w = await db.weeks.get(weekKey);
    await db.weeks.put({ key: weekKey, entries: [...(w?.entries ?? []), entry] });
  });
}

export async function addCustomExercise(name: string, cat: Exercise["cat"]): Promise<Exercise> {
  const ex: Exercise = { id: "c_" + newId(), name, cat, custom: true };
  await db.exercises.add(ex);
  return ex;
}

export async function saveLook(look: Look) {
  await db.settings.put({ key: "look", value: look });
}
