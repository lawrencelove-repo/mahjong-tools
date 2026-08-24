# Mahjong Cheatsheets

Presentation-oriented HTML guides for several mahjong rulesets, with shared tile styles and landscape Letter PDF export.

## Open locally

Open `index.html` for the landing page, then pick a ruleset — or open any sheet directly:

| Page | Ruleset |
| --- | --- |
| `riichi.html` | Japanese Riichi yaku |
| `nmjl.html` | American NMJL-style card |
| `hk.html` | Hong Kong / Cantonese faan |
| `filipino.html` | Filipino (17-tile) scoring |

**Print / Save PDF** uses the browser print dialog (Save as PDF).

## Tile styles

Tilesets are registered in `js/tiles.js` (`TILESETS`). Folder ids are `style-1`, `style-2`, …; **dropdown labels** are separate (`label` on each entry). Prefer changing labels there rather than renaming folders.

| Id | Default label | Assets |
| --- | --- | --- |
| `style-1` | Traditional | `assets/style-1/` — FluffyStuff suits/honors (CC0) + samoheen flowers/seasons; project jokers. See that folder’s `README.md`. |
| `style-2` | Custom | `assets/style-2/` — compact pack (falls back to style-1). |
| `style-3` | Hong Kong | `assets/style-3/` — [samoheen/mahjong-tiles](https://github.com/samoheen/mahjong-tiles) (public domain). |
| `style-4` | Tempai Set 2 | `assets/style-4/` — sliced from [tempai-dev/riichi-mahjong-tiles-svg](https://github.com/tempai-dev/riichi-mahjong-tiles-svg) tileset2 (MIT OR CC-PDDC). |
| `style-5` | Tempai Set 1 | `assets/style-5/` — same repo, tileset1. |
| `text` | Text (NMJL) | Colored digits/letters (no image folder). |

Legacy cookie values `traditional` / `custom` migrate to `style-1` / `style-2`.

To add another set: create `assets/style-6/`, drop PNGs (FluffyStuff basenames or map in `files`), add a `README.md` with the source, and append an entry to `TILESETS`. Re-run `python scripts/import-tilesets.py` only if you need to re-fetch the bundled open-source packs.

## style-2 filenames

Drop PNGs into `assets/style-2/` using:

| Tiles | Filenames |
| --- | --- |
| Bam | `B1.png` … `B9.png` |
| Crak | `C1.png` … `C9.png` |
| Dot | `P1.png` … `P9.png` |
| Winds | `WE.png` (East), `WS.png` (South), `WW.png` (West), `WN.png` (North) |
| Dragons | `DG.png` (green), `DR.png` (red), `DW.png` (white) |
| Flowers | `F1.png` … `F4.png` |
| Jokers | `J1.png`, `J2.png` |
| Aka (optional) | `B5r.png`, `C5r.png`, `P5r.png` — else falls back to `B5` / `C5` / `P5` |

Internal hand notation is unchanged (`6B`, `EW`, `RD`, …). Missing style-2 files fall back to style-1.

## Notation

```
6B   1P   9C     suited tiles (bam / pin / crak)
EW SW WW NW      winds
WD GD RD         white / green / red dragons
5Pr 5Br 5Cr      red fives (aka)
F J X            flower / joker / blank
F1–F4 / F5–F8    flowers / seasons (HK & Filipino)
|                meld separator
123P             sugar for 1P 2P 3P
1P*3             sugar for 1P 1P 1P
```

Text mode shows **digits only** for suited tiles (color = suit).

## American Mahjong (NMJL)

Open `nmjl.html` for an unofficial NMJL-style card cheatsheet (2026 default, 2025 available).

- Same tile styles and Print / Save PDF as the Riichi sheet
- Switch years in the toolbar; add future cards in `js/nmjl-data.js` (`NMJL_REGISTRY`)
- Hands are **placeholders** (copyright) — correct against your licensed card; lines marked **verify** are intentionally off
- **Hand builder** (wrench icon): pick 14 tiles and copy a paste-ready object for `js/nmjl-data.js`

## Hong Kong

Open `hk.html`. Group by faan or type. Settings → **Seasons / flowers**: include, exclude (default), or render seasons as blanks.

## Filipino

Open `filipino.html`. Group by points or type. Same seasons/flowers setting as Hong Kong. Examples use 17-tile (five meld + pair) hands.

## Hand evaluation

Use the **Hand Evaluation** toolbar button on the Riichi sheet to open a non-modal popup window.
Build a closed 14-tile hand, set win conditions, and evaluate.

Uses [`riichi-score`](https://www.npmjs.com/package/riichi-score) (CDN ESM) for yaku, fu, dora/ura/aka, and payments. Open melds are not in v1 yet.

## Test application

Use this link to test: https://lawrencelove-repo.github.io/mahjong-tools/
