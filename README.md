# Riichi Mahjong Yaku Cheatsheet

Presentation-oriented HTML guide of Riichi yaku with three tile styles and landscape Letter PDF export.

## Open locally

Open `index.html` in a browser (or serve the folder statically).  
**Download PDF** needs network once for the CDN copies of html2canvas / jsPDF. **Print / Save PDF** works fully offline after tiles are loaded.

## Tile styles

| Style | Behavior |
| --- | --- |
| Traditional | PNGs from `assets/traditional/` (FluffyStuff, CC0) |
| Custom | PNGs from `assets/custom/{id}.png` (falls back to traditional) |
| Text (NMJL) | Colored digits/letters: bam green, crak red, dot black, honors blue |

## Notation

```
6B   1P   9C     suited tiles (bam / pin / crak)
EW SW WW NW      winds
WD GD RD         white / green / red dragons
5Pr 5Br 5Cr      red fives (aka)
F J X            flower / joker / blank
|                meld separator
123P             sugar for 1P 2P 3P
1P*3             sugar for 1P 1P 1P
```

Text mode shows **digits only** for suited tiles (color = suit).

## Custom tiles

Drop PNGs into `assets/custom/` using these filenames:

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

Internal hand notation is unchanged (`6B`, `EW`, `RD`, …). Missing custom files fall back to traditional.

## Hand verification

Enable **Settings → Hand verification (scorer)**. Build a closed 14-tile hand, set win conditions, and evaluate.

Uses [`riichi-score`](https://www.npmjs.com/package/riichi-score) (CDN ESM) for yaku, fu, dora/ura/aka, and payments. Open melds are not in v1 yet.
