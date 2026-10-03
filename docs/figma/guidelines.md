# RadiografIA — guidelines for Figma Make

Read this file before every prompt. It is the single source of truth. When a
prompt conflicts with this file, follow this file and say so.

## What we are building

A static web app in Spanish (Spain) that analyses a pasted text and shows
whether it *sounds like* an AI assistant, and why. It never claims
authorship. Three screens (analyser, rules catalogue, rule page) plus a
print layout. Desktop and mobile with equal weight. Language of every UI
string: **Spanish**, exactly as given in the prompts; never translate or
rephrase them.

## Hard rules (never break)

1. **No percentages of "AI", no "confidence", no traffic-light
   red/green verdict.** The result is a label plus one plain sentence
   (given verbatim in the prompts).
2. **Colour is never the only cue.** Every highlighted span has its own
   underline style and a 1–2 letter tag; every card names the category in
   words.
3. **Underlines, not background fills,** for highlighted spans. Thin
   (2–3 px), offset below the baseline, body text stays readable.
4. **Contrast:** text ≥ 4.5:1, underlines and UI parts ≥ 3:1 on their
   background. Use only the tokens below.
5. **Keyboard and focus:** everything clickable is a real button or link;
   visible focus ring (2 px, accent, 2 px offset); dialogs trap focus,
   close with Escape and return focus to the span that opened them. A
   highlighted span is a `<button>` with an accessible name («Conector
   repetido: “Además”»); the mobile sheet is a modal dialog and must not
   cover the active span.
6. **Touch targets:** buttons ≥ 44 × 44 px; inline spans are exempt.
7. **No horizontal scroll at 320 px.** Mobile is a first-class layout.
8. Do not invent features, data, charts, animations or dark mode. Build
   exactly what the prompt lists. Keep Spanish typographic quotes « » and
   accents exactly as given.

## Tokens

### Neutrals
- `bg` #FFFFFF · `ink` #1A1A1A · `ink-2` #4A4A4A · `line` #D9D9D9 ·
  `card` #F5F5F5 · `accent` #332288 (buttons: white text on accent; focus
  ring). Note: accent is the same indigo as the Estadística category;
  Estadística appears only as a thin double underline and in its card, so
  there is no clash on screen. Do not use accent for anything else.

### Eight categories (hex · underline style · tag)
- Léxico `#0072B2` · solid 2 px · L
- Discurso `#882255` · solid 3 px · D
- Sintaxis `#D55E00` · dashed 2 px · S
- Estadística `#332288` · double 1 px · E
- Puntuación y formato `#009E73` · dotted 3 px · P
- Canal (informativa) `#117733` · dotted 1 px · C
- Gramática (Español correcto) `#AA4499` · wavy 2 px · G
- Ortotipografía (Español correcto) `#CC6677` · double dashed · O
All ≥ 3.4:1 on white. The two lowest (Puntuación, Ortotipografía) are
used only as lines, never as text colour. Category names always appear as
text next to the colour.

### Type
- Body of analysed text and long paragraphs: **Literata** (serif),
  18 px / line-height 1.5, max line length 60–66 characters (`max-width:
  34em` on the text column).
- UI (labels, cards, buttons, catalogue): **Atkinson Hyperlegible Next**
  (sans), 16 px base. In this prototype the fonts may be loaded from any
  source; production will self-host them (not your concern here).
- Scale: body 18 · secondary 15 · card title 20 · screen title 28.
  The result label uses the screen title size.

### Spacing & shape
- 8 px grid. Card radius 8 px, button radius 6 px. Card background `card`
  with 1 px `line` border or no border; no drop shadows heavier than
  0 1px 2px rgba(0,0,0,.08).

## Layout rules

- **Desktop (≥ 1024 px):** two columns. Left: text column (34em). Right:
  result column ~360 px, sticky.
- **Tablet (769–1023 px):** one column with the desktop components (card
  anchored below the span, no tab bar).
- **Mobile (≤ 768 px):** one column; after analysis the result block
  comes first, then a fixed bottom tab bar «Texto · Reglas · Datos».
- **Span details:** desktop → a card anchored below the span (non-modal
  dialog, Escape closes, «Anterior / Siguiente» buttons). Mobile →
  modal bottom sheet with a labelled drag-handle button, one rule at a
  time, «Anterior / Siguiente» ≥ 44 px, close button, no need to drag.
- **Print:** numbered sections, no navigation or buttons, URLs after
  links, tags after every span, 11 pt Literata, A4 margins 20/18 mm.

## Deliverables we want from you

- Screens as previews we can «Copy as design layers». Keep layer names
  semantic (Spanish): `resultado`, `pastilla`, `tarjeta-regla`,
  `tramo`, `leyenda`, `desglose`, `hoja-inferior`, `barra-pestanas`.
- A `tokens.json` in the Design Tokens Community Group 2025.10 format
  (colour as objects with colorSpace and components; dimensions with
  value and unit) mirroring the tokens above.
- No backend, no API calls, no storage. All data is static sample data
  given in the prompts.
