# Riichi Mahjong Yaku Cheat Sheet — Punch List

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` needs decision

---

## Goal

Build a **presentation-worthy, HTML-first** guide of every playable Riichi Mahjong **yaku**, grouped like common cheatsheets (1-han, 2-han, 3-han, 6-han, yakuman, etc.). Support **three tile render styles** (traditional images, custom images, AMJL/NMJL-style colored text) and **export a single-page 8.5×11 landscape PDF** that matches the on-screen style.

Reference cheatsheets reviewed:

- [Mahjong Master yaku cheat sheet](https://www.mahjongmaster.co/resources/yaku-cheat-sheet/) (scannable table + printable PDF)
- [EMA / Mahjongbond scoresheet-style yaku lists](https://mahjongbond.org/wp-content/uploads/2026/06/Riichi-scoresheet-2025-EN.pdf) (grouped by han)
- [Tsumoron all-yaku-by-han](https://tsumoron.com/en/articles/rules/all-yaku-list/)
- [riichi.wiki Yaku](https://riichi.wiki/Yaku)

Traditional tile art candidate (CC0 / public domain):

- [FluffyStuff/riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles) (SVG + PNG, Regular & Black)

---

## 1. Content & rules scope

- [x] **Core catalog** = common tournament Riichi yaku (always shown)
- [ ] Tag each entry with `tags`: `core` | `optional` | `local` | `scoring-note` so Settings can filter
- [ ] Exhaustive **yaku catalog** with Japanese + English names (display via Settings)
- [ ] Group / sort modes (user preference — see Settings):
  - [ ] By han: 1-han · 2-han · 3-han · 6-han · yakuman
  - [ ] By category: sequence · triplet · flush · terminals/honors · lucky/timing · yakuman (common secondary grouping)
- [ ] Per-yaku fields:
  - [ ] Name (EN + JP)
  - [ ] Han value (closed / open if different)
  - [ ] Closed-only flag
  - [ ] Short condition text (compiled from common online sources — not reinvented)
  - [ ] Example hands: **one if unambiguous**; **multiple when ambiguity or common sheets show variants**
  - [ ] Optional notes (kuikae, wait restrictions, etc.)
- [ ] Optional content (Settings toggles — see § Decisions / Settings):
  - [ ] Optional/local yaku (Nagashi Mangan, Renhou, etc.)
  - [ ] Double-yakuman callouts
  - [ ] Dora / aka-dora / ura-dora notes
  - [ ] Mini scoring / fu / limits sidebar (esp. useful on page 2)

---

## 2. Tile notation (authoring format)

Design a compact shorthand so each example hand is data, not hard-coded HTML.

### Proposed token grammar

| Token | Meaning | Example |
| --- | --- | --- |
| `nB` | Bamboo / sozu (bam) | `6B` = 6 bam |
| `nC` | Characters / manzu (crak) | `1C` = 1 crak |
| `nP` | Circles / pinzu (dot) | `1P` = 1 dot |
| `nD` | Dot alias (optional synonym of `P`) | `1D` |
| `EW` `SW` `WW` `NW` | Winds (East/South/West/North) | `EW` |
| `WD` `GD` `RD` | Dragons (White/Green/Red) | `RD` |
| `F` / `F1`…`F8` | Flowers (if shown) | `F1` |
| `J` | Joker | `J` |
| `X` / `_` | Blank / back / placeholder | `X` |
| `5Br` `5Cr` `5Pr` | Red fives (aka-dora), if needed | `5Pr` |

**Suits letters (preferred):** `B` bam, `C` crak, `P` pin/dot.  
**Honors:** two-letter codes so they never collide with suit digits.

### Hand / meld separators

| Syntax | Meaning |
| --- | --- |
| Space-separated tokens | Ordered tile list |
| `\|` | Visual group break (meld / pair boundary) |
| `*` or `×N` | Repeat last tile N times (optional sugar) e.g. `1P*3` → `1P 1P 1P` |
| `…` or `?` | “Any matching / flexible” slot for pattern yaku (e.g. Chinitsu remainder) |
| `(open)` / `(closed)` | Annotation on a meld (for display, not a tile) |

**Example — Ittsu (pinzu):**

```text
1P 2P 3P | 4P 5P 6P | 7P 8P 9P | 2P 2P | 5B 5B 5B
```

**Example — Daisangen:**

```text
WD WD WD | GD GD GD | RD RD RD | 1P 1P | 3C 4C 5C
```

**Example — Tanyao (simples only):**

```text
2B 3B 4B | 5P 6P 7P | 3C 3C 3C | 8B 8B | 2P 2P 2P
```

### Rendering mapping (same token → three styles)

| Style | `6B` | `RD` | `EW` |
| --- | --- | --- | --- |
| Traditional | PNG/SVG from traditional set | red dragon image | East wind image |
| Custom | PNG from `assets/custom/` | custom red dragon | custom East |
| Text (AMJL-like) | green `6` | blue/red `R` (or `中`) | blue `E` |

**NMJL-style text colors (locked):**

- Bam → **green**
- Crak → **red**
- Dot → **black**
- Honors / flowers / jokers / blanks → **blue**
- Optional aka: red fives stay red with `r` marker

> On real NMJL cards, colors mean suit-*relationships*. Here we use **fixed suit→color** so Riichi examples stay unambiguous.

### Punch list — notation

- [ ] Lock final token table (aliases: `S`/`Z` for sozu? `M`/`W` for manzu?)
- [ ] Implement parser: string → tile ID list
- [ ] Implement renderer switch: traditional | custom | text
- [ ] File naming convention for images, e.g. `6B.png`, `RD.png`, `EW.png`
- [ ] Fallback when a custom image is missing (show traditional, or text, or placeholder)
- [ ] Optional compact “run” sugar: `123P` → `1P 2P 3P` (nice for authoring; confirm)

---

## 3. UI / presentation (web)

- [ ] Single HTML page (or small static site: `index.html` + `css` + `js` + `data`)
- [ ] **Tile style selector** (dropdown): Traditional · Custom · Text (NMJL)
- [ ] **Settings panel** (see § Decisions) — radios / checkboxes; persist in `localStorage`
- [ ] **Group/sort control** (radio): By han · By category (user preference)
- [ ] Live re-render when style or settings change
- [ ] Sectioned layout driven by active group mode
- [ ] Each yaku row/card: name, han, closed/open, blurb, tile example(s)
- [ ] Print-friendly / presentation CSS (density via Settings)
- [ ] Responsive: usable on desktop; print is landscape letter
- [ ] Hide chrome (selectors, settings, export) from print/PDF via `@media print`
- [ ] Accessibility: alt text / aria labels for tile images; text mode remains readable

---

## 4. Assets

### Traditional

- [ ] Vendor or submodule [FluffyStuff](https://github.com/FluffyStuff/riichi-mahjong-tiles) (CC0)
- [ ] Map our notation IDs → upstream filenames (`Pin6.png`, `Sou6.png`, `Man6.png`, `Chun.png`, etc.)
- [ ] Prefer SVG if crisp at print size; PNG fallback OK
- [ ] Decide Regular vs Black tile backs/faces

### Custom

- [ ] Folder `assets/custom/` — **PNG**, filenames match notation (`6B.png`, `RD.png`, …)
- [ ] Image pixel size TBD during layout pass (screen + print)
- [ ] Document required filenames for user-supplied tiles
- [ ] Support partial sets (missing → fallback)
- [ ] Flowers / jokers / blanks / aka only required if those Settings are on and examples use them

### Text style (NMJL-inspired)

- [ ] CSS for suit colors + monospace / tabular figures
- [ ] Optional small “legend” on page and PDF

---

## 5. Data model

Prefer editable data over hardcoding yaku in markup.

- [ ] `yaku.json` (or YAML / JS module) listing all hands
- [ ] Schema sketch:

```json
{
  "id": "ittsu",
  "nameEn": "Pure Straight",
  "nameJp": "一気通貫",
  "hanClosed": 2,
  "hanOpen": 1,
  "closedOnly": false,
  "section": "2-han",
  "description": "123, 456, and 789 sequences in one suit.",
  "examples": [
    { "label": "Pinzu", "tiles": "1P 2P 3P | 4P 5P 6P | 7P 8P 9P | EW EW | 5B 6B 7B" }
  ]
}
```

- [ ] Validate all tile tokens against known IDs at build/load time
- [ ] Keep content easy for you to tweak without touching renderer code

---

## 6. PDF export (8.5×11 landscape)

- [ ] **Both** export paths:
  - [ ] Print / Save as PDF (`@page` letter landscape + `window.print()`)
  - [ ] One-click Download PDF (client library)
- [ ] Page size: **US Letter landscape** (11 × 8.5 in)
- [ ] Content reflects **current** tile style + Settings (group mode, optional yaku, language, etc.)
- [ ] Prefer **one page**; allow **page 2** when Settings / content density require it
- [ ] Dense, cheatsheet-like layout (multi-column); no browser chrome
- [ ] Test print density with both image and text modes
- [ ] Embed or ensure tile images resolve offline for print

---

## 7. Tech stack (proposed)

- [ ] Static: **HTML + CSS + vanilla JS** (easy appearance tweaking, no build step required)
- [ ] Optional later: tiny build step only if we want SVG sprite packing
- [ ] No server required; open `index.html` locally or host statically

---

## 8. Polish / extras (nice-to-have)

- [ ] Closed/open badge icons
- [ ] Frequency / difficulty hint (common · rare) like Mahjong Master
- [ ] Search / filter yaku on screen
- [ ] Dark/light theme (screen only; PDF stays print-white)
- [ ] Second page optional “scoring quick ref” if one page is too cramped
- [ ] Keyboard shortcut to cycle tile styles
- [ ] License / attribution footer for FluffyStuff tiles

---

## 9. Delivery milestones

1. [x] Lock notation + scope answers (this doc)
2. [x] Scaffold HTML/CSS/JS + Settings shell + traditional (FluffyStuff) assets
3. [x] Tile renderer: traditional · custom · NMJL text
4. [x] Populate full yaku data + examples (compile from common sources)
5. [x] Group/sort modes + optional-content filters
6. [x] Print + one-click PDF (1 page preferred; page 2 via Settings)
7. [ ] Visual pass for presentation density
8. [ ] You drop in custom PNGs; we verify mapping + size

---

## Proposed file layout

```text
riichi-yaku-cheatsheet/
├── PUNCHLIST.md
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── tiles.js          # notation parse + render
│   ├── settings.js       # defaults + localStorage
│   ├── app.js            # UI, group/sort, export
│   └── yaku-data.js      # or yaku.json
├── assets/
│   ├── traditional/      # FluffyStuff (CC0)
│   └── custom/           # your PNGs (6B.png, RD.png, …)
└── README.md             # notation legend + how to add custom tiles
```

---

## 10. Hand evaluation

- [x] Toolbar button opens non-modal popup (`hand-evaluation.html`)
- [x] Renamed to **Hand Evaluation**
- [x] 14-tile picker UI (palette + rack, win tile, dora/ura indicators)
- [x] Full score via `riichi-score` (yaku, fu, dora, payments) — **closed hands v1**
- [ ] Open melds (chi/pon/kan) in evaluator
- [ ] Tenhou / Chiihou flags in UI
- [ ] Deeper result formatting / link matched yaku to cheatsheet entries

---

## Decisions (locked 2026-08-21)

| # | Topic | Decision |
| --- | --- | --- |
| 1 | Optional / local yaku | **Settings toggles** — core always on; optional packs off by default (see differences below) |
| 2 | Grouping | **User preference** — radio/Settings: by han **or** by category |
| 3 | Example hands | **One if clear; multiple if ambiguous**; follow common online presentation styles |
| 4 | NMJL text colors | Bam=green, Crak=red, Dot=black, honors=blue |
| 5 | Aka / flowers / jokers / blanks | **Optional via Settings** (tile set + legend); not required in core Riichi examples |
| 6 | Language | **Optional via Settings** (EN / EN+JP / JP) |
| 7 | PDF | **Both** Print-to-PDF and one-click download |
| 8 | Page count | Prefer 1 page; **allow page 2 via Settings** when needed |
| 9 | Custom tiles | **PNG**; pixel size TBD during layout; IDs like `6B.png` |
| 10 | Traditional tiles | **FluffyStuff** (CC0), credit in footer |
| 11 | Project path | `C:\Users\kimbe\Projects\riichi-yaku-cheatsheet` |
| 12 | Text style name | **NMJL**-inspired (not AMJL) |

### Q1 detail — what Settings change (vs hard-coding one ruleset)

Yes: treat “completeness” as **filters over one tagged dataset**, not separate apps.

| Setting (proposed) | Default | What changes when enabled |
| --- | --- | --- |
| **Core yaku** | On (always) | Common ~40 yaku + standard yakuman used on most cheatsheets |
| **Optional / local yaku** | Off | Adds hands not universal: e.g. **Nagashi Mangan**, **Renhou**, rare house hands. Sheet grows; some clubs won’t recognize them |
| **Double yakuman notes** | Off | Annotates variants scored as *double* under some rules (Kokushi 13-wait, Suuankou tanki, Daisuushii). Same patterns, different **point ceiling** |
| **Kazoe yakuman note** | Off | Explains 13+ han → yakuman vs capped sanbaiman — scoring footnote, not a new hand pattern |
| **Dora / aka / ura panel** | Off | Scoring modifiers (not yaku). Aka also needs `5Br/5Cr/5Pr` in the tile set when examples mention red fives |
| **Extra tile types** (flowers, jokers, blanks) | Off | Shows them in legend / custom mapping; Riichi examples usually won’t use jokers/flowers |
| **Names: EN / EN+JP / JP** | EN | Label language only; examples unchanged |
| **Group by: Han / Category** | Han | Section order/headers only; same entries |
| **Allow page 2** | Off or auto | Print CSS: force denser 1-page vs overflow to page 2 (e.g. scoring ref + optional yaku) |
| **Tile style** | Traditional | Traditional images · Custom PNGs · NMJL colored text |

**Net effect:** one HTML guide; Settings only show/hide tagged rows, rename labels, re-bucket sections, and change tile chrome. PDF/export uses the **currently active** Settings snapshot.

---

## Remaining open items (small)

- [x] Text mode glyph: **digit only** (`6`), suit implied by color
- [x] Run sugar `123P` (= `1P 2P 3P`): **supported in parser** for authoring convenience; examples may use either form
- [x] Page 2: **off until overflow** (auto when content/settings need it)
- [x] Page-2 **scoring quick ref**: **yes**, via Settings toggle

---

## Notation quick reference (locked base)

```text
Suits:   1–9 + B | C | P     →  1B…9B, 1C…9C, 1P…9P
Aka:     5Br 5Cr 5Pr         →  red fives (Settings)
Winds:   EW SW WW NW
Dragons: WD GD RD            →  white / green / red
Other:   F F1–F8 | J | X     →  Settings / legend
Groups:  | between melds
Repeat:  1P*3   or   123P    →  optional sugar TBD
```

Next: scaffold the app (Settings shell + FluffyStuff tiles + a few sample yaku proving all three render modes and both export paths).
