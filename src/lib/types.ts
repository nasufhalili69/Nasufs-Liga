export type Category = "spiel" | "cardio" | "kraftOb" | "kraftUn" | "schwer" | "rumpf" | "mobil";
export type Exercise = { id: string; name: string; cat: Category; custom: boolean };
export type Entry = {
  id: string;
  ex: string;
  name: string;
  day: string; // YYYY-MM-DD
  amount: number;
  km?: number;
  note?: string;
};
export type Week = { key: string; entries: Entry[] }; // key: ISO-Woche, z. B. 2026-W43
export type Beard = "none" | "stubble" | "full";
export type Look = { skin: string; hair: string; beard: Beard };
