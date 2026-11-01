# Realistische Charakter-Bilder

Die App zeigt pro Rang ein Bild aus `public/characters/`. Fehlt ein Bild, springt die gezeichnete SVG-Figur ein.

| Rang | ab Level | Dateiname |
|---|---|---|
| Akademie | 1 | `akademie.webp` |
| Genin | 3 | `genin.webp` |
| Chūnin | 6 | `chunin.webp` |
| Jōnin | 10 | `jonin.webp` |
| ANBU | 15 | `anbu.webp` |
| Hokage | 20 | `hokage.webp` |

## Format

- Hochformat **4:5**, ideal **1200 × 1500 px**
- Ganze Figur von Kopf bis Fuß, mittig, der Kopf im oberen Drittel (die App schneidet für die kleinen Porträts oben mittig aus)
- Am besten bei allen sechs Bildern derselbe Hintergrund und dieselbe Kamera, damit der Aufstieg wie eine Serie wirkt
- PNG oder JPG geht auch: einfach im Chat schicken, die Umwandlung in WebP und das Einbauen übernimmt Claude

## Gleiche Person in allen Bildern

Damit es jedes Mal dieselbe Person ist:

- **Eigenes Foto als Referenz** (am realistischsten): Midjourney „Omni Reference“ / `--cref`, Leonardo „Character Reference“, ChatGPT/DALL·E oder Gemini mit hochgeladenem Foto und dem Satz „use the person in the photo as the character“
- Sonst: denselben Basis-Prompt und, wo möglich, denselben Seed für alle sechs Bilder verwenden

Hinweis: Hautton, Haarfarbe und Bart aus „Aussehen“ wirken nur auf die gezeichnete Figur. Bei Bildern legt der Prompt das Aussehen fest.

## Basis-Prompt (immer voranstellen)

Englisch funktioniert in den meisten Generatoren am besten.

```
Hyperrealistic full-body portrait of the same man, 32 years old, Central European,
short dark hair, short stubble beard, brown eyes, standing confidently and facing
the viewer, centered, full body visible from head to feet, head in the upper third.
Cinematic lighting, dark smoky background with faint Japanese ink-wash clouds,
photorealistic skin texture and fabric detail, shot on 85mm lens, shallow depth of
field, 4:5 aspect ratio, ultra detailed.
Original costume design. No anime characters, no logos, no village symbols,
no masks or outfits from existing series, no text.
```

## Zusatz je Rang

**1 · Akademie (`akademie.webp`)**
```
Slim, untrained build. Simple light grey cotton kimono top with cross collar,
grey hakama trousers, plain brown cloth belt, white tabi socks and sandals.
Neutral soft lighting, humble beginner look.
```

**2 · Genin (`genin.webp`)**
```
Lean, slightly athletic build. Indigo kimono top, dark hakama, red obi belt,
white cloth wraps on the forearms, cloth headband with a small engraved metal
plate showing a lotus flower. Determined expression.
```

**3 · Chūnin (`chunin.webp`)**
```
Athletic, clearly defined arms and shoulders. Sleeveless dark indigo top with a
deep V neckline, dark hakama, red obi belt, forearm wraps, lotus headband.
Subtle teal glowing mist around the body, teal rim light.
```

**4 · Jōnin (`jonin.webp`)**
```
Muscular V-shaped torso with visible abs, broad shoulders. Open long dark coat
with ochre gold trim over a bare chest, ochre belt, dark hakama, forearm wraps,
lotus headband, hair tied back. Warm orange glowing mist, orange rim light.
```

**5 · ANBU (`anbu.webp`)**
```
Very muscular, powerful heavyweight build. Open dark crimson-black coat with gold
trim, bare chest with defined abs, steel shoulder guard on one shoulder, red
painted stripe markings on the forearms, wild spiky hair, eyes faintly glowing red,
lotus headband. Intense red glowing mist, dramatic red rim light.
```

**6 · Hokage (`hokage.webp`)**
```
Peak physique, calm and commanding presence. Long deep red flowing cloak with
white cloud embroidery at the hem, over the open dark coat with gold trim,
steel shoulder guard, lotus headband, wild hair. Golden glowing aura and light
particles, golden rim light, majestic atmosphere.
```

## Einbauen

Bilder als `public/characters/<dateiname>.webp` ablegen oder im Chat schicken. Die App erkennt sie automatisch, auch offline, weil der Service Worker sie mitspeichert.
