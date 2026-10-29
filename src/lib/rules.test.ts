import { describe, expect, it } from "vitest";
import { isoWeek, weekDates, ymd } from "./dates";
import { levelOf, nextRank, rankOf, resolveExercises, scoreWeek } from "./rules";
import type { Entry } from "./types";

const ex = resolveExercises([{ id: "c_rad", name: "Radfahren", cat: "cardio", custom: true }]);
let n = 0;
const e = (exId: string, day: string, amount: number): Entry => ({ id: String(n++), ex: exId, name: exId, day, amount });

describe("scoreWeek", () => {
  it("Fußball 90 min: 30 + 5 Bonus + 5 Tage-Bonus", () => {
    expect(scoreWeek([e("fussball", "2026-10-24", 90)], ex).total).toBe(40);
  });

  it("Ausdauer unter 45 min ohne Bonus, eigene Übung zählt nach Art", () => {
    expect(scoreWeek([e("c_rad", "2026-10-26", 30)], ex).total).toBe(30);
  });

  it("Wiederholungen werden pro Tag und Übung summiert, dann gedeckelt", () => {
    const s = scoreWeek([e("liegestuetz", "2026-10-26", 60), e("liegestuetz", "2026-10-26", 60)], ex);
    // 120 Wdh. / 5 = 24 → max. 20; +5 Tage-Bonus
    expect(s.total).toBe(25);
    expect([...s.per.values()]).toEqual([12, 8]);
  });

  it("Limit gilt pro Tag, nicht pro Woche", () => {
    const s = scoreWeek([e("klimmzuege", "2026-10-26", 25), e("klimmzuege", "2026-10-27", 25)], ex);
    expect(s.total).toBe(20 + 20 + 10);
  });

  it("Plank: 1 XP je 10 Sek., max. 15", () => {
    expect(scoreWeek([e("plank", "2026-10-26", 95)], ex).total).toBe(9 + 5);
    expect(scoreWeek([e("plank", "2026-10-26", 600)], ex).total).toBe(15 + 5);
  });

  it("Mobilität: 10 XP ohne Minuten-Bonus", () => {
    expect(scoreWeek([e("mobil-x", "2026-10-26", 60)], resolveExercises([{ id: "mobil-x", name: "Yoga", cat: "mobil", custom: true }])).total).toBe(15);
  });
});

describe("Rang und Level", () => {
  it("Rang-Grenzen", () => {
    expect([0, 39, 40, 70, 100, 130, 160].map(rankOf)).toEqual(["E", "E", "D", "C", "B", "A", "S"]);
    expect(nextRank(75)).toEqual({ rank: "B", missing: 25 });
    expect(nextRank(200)).toBeNull();
  });
  it("alle 250 XP ein Level", () => {
    expect([0, 249, 250, 500].map(levelOf)).toEqual([1, 1, 2, 3]);
  });
});

describe("Datum", () => {
  it("ISO-Woche", () => {
    expect(isoWeek(new Date(2026, 9, 24))).toBe("2026-W43");
    expect(isoWeek(new Date(2026, 9, 29))).toBe("2026-W44");
    expect(isoWeek(new Date(2027, 0, 1))).toBe("2026-W53");
  });
  it("Woche beginnt am Montag", () => {
    const d = weekDates(new Date(2026, 9, 25));
    expect([ymd(d[0]), ymd(d[6])]).toEqual(["2026-10-19", "2026-10-25"]);
  });
});
