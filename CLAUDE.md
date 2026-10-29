# Wochen-Liga – Trainings-App als Spiel

Persönliche Fitness-App für Nasuf (32, Laxenburg). Trainings eintragen, XP sammeln, Level aufsteigen, eigener Charakter wird mit jedem Level stärker. Sprache der App: Deutsch (österreichisch, locker).

Ein funktionierender Prototyp liegt als `wochen-liga-prototyp.html` bei. Spielregeln, Formen und Wirkungswerte dort sind die Referenz.

## Ziel

Eine installierbare Web-App (PWA) fürs Handy, später optional native (Expo/React Native).

## Tech-Vorschlag

- Vite + React + TypeScript
- PWA (manifest, Service Worker, offline nutzbar, App-Icon am Homescreen)
- Speicher Phase 1: IndexedDB (z. B. via Dexie) lokal am Gerät
- Speicher Phase 2: Sync zwischen Handy und PC (z. B. Supabase mit Login)
- Push-Erinnerungen in Phase 2 (z. B. „Noch 25 XP bis Rang B diese Woche“)

## Spielregeln (vom Programm festgelegt, nicht vom Nutzer)

Jede Übung gehört zu einer **Art**. Die Art bestimmt die XP.

| Art | Einheit | XP-Regel | Wirkung (Ausdauer, Muskel, Aussehen, Gesundheit; 0–3) |
|---|---|---|---|
| Ballsport / Spiel | min | 30 XP pro Einheit, +5 ab 45 min | 3, 1, 2, 3 |
| Ausdauer | min | 25 XP pro Einheit, +5 ab 45 min | 3, 1, 2, 3 |
| Kraft Oberkörper | Wdh. | 1 XP je 5 Wdh., max. 20 XP/Tag | 1, 3, 3, 2 |
| Kraft Beine | Wdh. | 1 XP je 5 Wdh., max. 20 XP/Tag | 1, 3, 2, 2 |
| Kraft schwer | Wdh. | 1 XP je Wdh., max. 20 XP/Tag | 1, 3, 3, 2 |
| Rumpf / Halten | Sek. | 1 XP je 10 Sek., max. 15 XP/Tag | 0, 1, 2, 2 |
| Mobilität / Dehnen | min | 10 XP pro Einheit | 0, 0, 1, 3 |

Wiederholungs-Übungen werden pro Tag und Übung zusammengezählt, dann gilt das Tageslimit.

**Standard-Übungen:** Fußball (Spiel), Laufen (Ausdauer), Schwimmen (Ausdauer, Wirkung 3,2,2,3), Liegestütz (Kraft Oberkörper), Kniebeugen (Kraft Beine), Klimmzüge (Kraft schwer), Plank (Rumpf).

**Eigene Übungen:** Nutzer gibt Name + Art ein, die App vergibt die XP automatisch. Eigene Übungen ohne Einträge sind löschbar.

**Tage-Bonus:** +5 XP je Tag mit mindestens einem Training.

**Wochenziel:** 100 XP.

**Wochen-Rang:** E (<40) · D (40) · C (70) · B (100) · A (130) · S (160).

**Level:** Alle XP aller Wochen zählen zusammen, alle 250 XP ein Level.

## Charakter

Der Charakter ist der Nutzer selbst. Anpassbar: Hautton, Haarfarbe, Bart (keiner, Dreitage, Vollbart).

| Form | ab Level | Bedeutung | Look |
|---|---|---|---|
| Minarai | 1 | Lehrling | schmal, graues T-Shirt |
| Senshi | 3 | Krieger | etwas breiter, Stirnband, Armbänder |
| Bushi | 6 | Kämpfer | athletisch, ärmelloser Gi, Gürtel, leichte türkise Aura |
| Shihan | 10 | Meister | V-Form, sichtbare Bauchmuskeln, offener Mantel, orange Aura |
| Kensei | 15 | Schwertheiliger | sehr breit, leuchtende Augen, Markierungen an den Armen, rote Aura |
| Haō | 20 | Oberherr | Umhang, goldene Aura |

Schulterbreite und Armdicke wachsen zusätzlich mit jedem Level stufenlos.

- „Zukunft ansehen“: Regler, um jede Form vorab anzusehen.
- **Grafik:** Im Prototyp aus SVG-Formen gezeichnet. Für die App eigene, gezeichnete Illustrationen pro Form verwenden (Illustrator oder Bildgenerator). Wichtig: Der Charakter muss eigenständig sein. Keine Figuren, Namen, Ränge oder Designs aus Naruto, Bleach, Jujutsu Kaisen oder anderen Serien übernehmen.

## Screens

1. **Start:** Anzeigetafel der Woche (XP / 100, Rang, Tage-Leiste Mo–So, Level-Fortschritt) und Charakter mit Form, Level und XP bis zur nächsten Form.
2. **Training eintragen:** Dropdown (Standard + eigene + „Neue Übung hinzufügen“), Tag-Auswahl der aktuellen Woche, Menge, bei Ausdauer optional km, Live-Vorschau „bringt +X XP“.
3. **Diese Woche:** Liste der Einträge mit XP, Löschen mit Bestätigung, Tage-Bonus, Blättern zwischen Wochen.
4. **Wirkung der Woche:** 4 Balken (Ausdauer & Herz, Muskelmasse, Aussehen, Gesundheit).
5. **Spielregeln** (eingeklappt) und **Was jede Übung bringt** (Tabelle).

## Datenmodell

```ts
type Category = "spiel" | "cardio" | "kraftOb" | "kraftUn" | "schwer" | "rumpf" | "mobil";
type Exercise = { id: string; name: string; cat: Category; custom: boolean };
type Entry = { id: string; ex: string; name: string; day: string /* YYYY-MM-DD */; amount: number; km?: number; note?: string };
type Week = { key: string /* ISO-Woche, z. B. 2026-W43 */; entries: Entry[] };
type Look = { skin: string; hair: string; beard: "none" | "stubble" | "full" };
```

XP werden immer aus den Einträgen berechnet, nie gespeichert. So können Regeln später angepasst werden.

## Bestehende Daten (übernehmen)

- KW 43, Samstag 24.10.2026: Fußball (Halle), 90 min, 8 km, 5 Tore

## Ideen für später

- Erfolge/Abzeichen (z. B. erste 100-Liegestütz-Woche, 4 Wochen in Folge Rang B)
- Wochen-Streak
- Animation beim Level-Aufstieg und bei neuer Form
- Wochenrückblick am Sonntag
