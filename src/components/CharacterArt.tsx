import { useState } from "react";
import { FORMS, stageOf } from "../lib/rules";
import type { Look } from "../lib/types";
import { Avatar } from "./Avatar";

/* Dateinamen der Illustrationen in public/characters/, eine pro Rang. */
export const CHARACTER_FILES = ["akademie", "genin", "chunin", "jonin", "anbu", "hokage"];

/**
 * Zeigt die Illustration des Rangs (public/characters/<rang>.webp). Fehlt sie,
 * springt die gezeichnete SVG-Figur ein. `bust`: Ausschnitt Kopf und Schultern.
 */
export function CharacterArt({ level, look, bust = false }: { level: number; look: Look; bust?: boolean }) {
  const s = stageOf(level);
  return <Art key={s} stage={s} level={level} look={look} bust={bust} />;
}

function Art({ stage, level, look, bust }: { stage: number; level: number; look: Look; bust: boolean }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <Avatar level={level} look={look} bust={bust} />;
  return (
    <img
      className={"char-img" + (bust ? " bust" : "")}
      src={`/characters/${CHARACTER_FILES[stage]}.webp`}
      alt={bust ? "" : `Charakter ${FORMS[stage].name}, Level ${level}`}
      onError={() => setMissing(true)}
      draggable={false}
    />
  );
}
