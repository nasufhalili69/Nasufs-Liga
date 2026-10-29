# Nasufs Wochen-Liga

Trainings-App als Spiel (PWA). Spielregeln und Charakter: siehe `CLAUDE.md`, Referenz-Prototyp: `wochen-liga-prototyp.html`.

```bash
npm install
npm run dev      # Entwicklung
npm test         # Spielregel-Tests
npm run build    # Produktions-Build nach dist/ (inkl. Service Worker + Manifest)
npm run preview  # Build lokal ansehen
```

Daten liegen lokal am Gerät in IndexedDB (Dexie). XP werden immer aus den Einträgen berechnet.

**Stand Phase 1:** Startseite (Anzeigetafel, Charakter) und Training eintragen. Offen: Diese Woche, Wirkung der Woche, Spielregeln-Tabellen.
