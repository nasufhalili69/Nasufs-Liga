import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LigaDB } from "./db";

describe("LigaDB", () => {
  it("übernimmt beim ersten Start das Fußball-Training aus KW 43", async () => {
    const db = new LigaDB("test-seed");
    const w = await db.weeks.get("2026-W43");
    expect(w?.entries).toHaveLength(1);
    expect(w?.entries[0]).toMatchObject({ ex: "fussball", day: "2026-10-24", amount: 90, km: 8 });
    db.close();
  });
});
