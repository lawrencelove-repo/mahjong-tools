#!/usr/bin/env python3
"""
Import / normalize tileset folders as assets/style-N/.

- style-1: rename from assets/traditional (FluffyStuff + extras)
- style-2: rename from assets/custom
- style-3: samoheen/mahjong-tiles Hong Kong PNGs (public domain)
- style-4: tempai-dev tileset2 panel slices (MIT OR CC-PDDC)
- style-5: tempai-dev tileset1 panel slices (MIT OR CC-PDDC)

Re-runnable: skips rename if already done; re-downloads/re-slices into style-3..5.
"""
from __future__ import annotations

import shutil
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
FETCH = ASSETS / "_fetch"

SAMOHEEN_BASE = (
    "https://raw.githubusercontent.com/samoheen/mahjong-tiles/master/hongkong/png/"
)
TEMPAI_RASTER = (
    "https://raw.githubusercontent.com/tempai-dev/riichi-mahjong-tiles-svg/main/raster/"
)

# samoheen filename → FluffyStuff-compatible basename (shared with style-1)
SAMOHEEN_MAP = {
    "01-white-dragon.png": "Soap.png",
    "02-green-dragon.png": "Hatsu.png",
    "03-red-dragon.png": "Chun.png",
    "04-east-wind.png": "Ton.png",
    "05-south-wind.png": "Nan.png",
    "06-west-wind.png": "Shaa.png",
    "07-north-wind.png": "Pei.png",
    **{f"{7 + n:02d}-characters-{n}.png": f"Man{n}.png" for n in range(1, 10)},
    **{f"{16 + n:02d}-circles-{n}.png": f"Pin{n}.png" for n in range(1, 10)},
    **{f"{25 + n:02d}-bamboos-{n}.png": f"Sou{n}.png" for n in range(1, 10)},
    "35-spring.png": "Season1.png",
    "36-summer.png": "Season2.png",
    "37-autumn.png": "Season3.png",
    "38-winter.png": "Season4.png",
    "39-plum.png": "Flower1.png",
    "40-orchid.png": "Flower2.png",
    "41-chrysanthemum.png": "Flower3.png",
    "42-bamboo.png": "Flower4.png",
}

# tempai panel id → FluffyStuff basename
TEMPAI_NAME = {
    **{f"{n}man": f"Man{n}.png" for n in range(1, 10)},
    **{f"{n}pin": f"Pin{n}.png" for n in range(1, 10)},
    **{f"{n}sou": f"Sou{n}.png" for n in range(1, 10)},
    "ton": "Ton.png",
    "nan": "Nan.png",
    "sha": "Shaa.png",
    "pei": "Pei.png",
    "haku": "Soap.png",
    "hatsu": "Hatsu.png",
    "chun": "Chun.png",
    "back": "Back.png",
    "blank": "Blank.png",
    "aka5man": "Man5-Dora.png",
    "aka5pin": "Pin5-Dora.png",
    "aka5sou": "Sou5-Dora.png",
}

T1_COLS = [123, 499, 871, 1243, 1619, 1992, 2365, 2740, 3114]
T1_ROWS = [88, 569, 1051, 1538, 2030]
T1_W, T1_H = 358, 445
T1_LAYOUT = [
    [f"{n}man" for n in range(1, 10)],
    [f"{n}pin" for n in range(1, 10)],
    [f"{n}sou" for n in range(1, 10)],
    ["ton", "nan", "sha", "pei", "haku", "hatsu", "chun", "blank", "back"],
    ["aka5man", "aka5pin", "aka5sou", None, None, None, None, None, None],
]

T2_ORIGIN = (80, 80)
T2_CELL = (560, 752)
T2_LAYOUT = [
    [f"{n}man" for n in range(1, 10)],
    [f"{n}pin" for n in range(1, 10)],
    [f"{n}sou" for n in range(1, 10)],
    ["ton", "nan", "sha", "pei", "haku", "hatsu", "chun", "blank", "back"],
    [None, None, None, "aka5man", "aka5pin", "aka5sou", None, None, None],
]

READMES = {
    "style-1": """# style-1

Primary Riichi-style tile images used by this project.

## Sources

- Suit / wind / dragon / back tiles: [FluffyStuff/riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles) (CC0)
- Flower / season tiles: [samoheen/mahjong-tiles](https://github.com/samoheen/mahjong-tiles) Hong Kong set (public domain)
- Joker faces: generated for this project
""",
    "style-2": """# style-2

Alternate compact tile pack (project “custom” set).

Filenames use suit-letter first (`B1`–`B9`, `C1`–`C9`, `P1`–`P9`, winds `WE`/`WS`/`WW`/`WN`, dragons `DG`/`DR`/`DW`, flowers `F1`–`F4`, jokers `J1`/`J2`).

Missing tiles fall back to **style-1** at runtime.
""",
    "style-3": """# style-3

Hong Kong–style illustrations from [samoheen/mahjong-tiles](https://github.com/samoheen/mahjong-tiles) (`hongkong/png/`).

License: public domain (see upstream `LICENSE.md`).

Files were renamed to FluffyStuff-compatible basenames (`Man1.png`, `Ton.png`, …) for a shared mapping with style-1.

Missing tiles (aka dora, back, jokers, etc.) fall back to **style-1** at runtime.
""",
    "style-4": """# style-4

Sliced from **tileset2** in [tempai-dev/riichi-mahjong-tiles-svg](https://github.com/tempai-dev/riichi-mahjong-tiles-svg) (`raster/tileset2.png`).

License: MIT OR CC-PDDC (see upstream README). Upstream notes the SVGs are derivative of older raster templates; the author does not claim rights on the original rasters.

Tile faces are cropped to remove the sheet’s baked-in outline and 3D side bevel so they match other styles under the site’s CSS tile border.

Missing flowers / seasons / jokers fall back to **style-1** at runtime.
""",
    "style-5": """# style-5

Sliced from **tileset1** in [tempai-dev/riichi-mahjong-tiles-svg](https://github.com/tempai-dev/riichi-mahjong-tiles-svg) (`raster/tileset1.png`).

License: MIT OR CC-PDDC (see upstream README). Upstream notes the SVGs are derivative of older raster templates; the author does not claim rights on the original rasters.

Tile faces are cropped to remove the sheet’s baked-in outline so they match other styles under the site’s CSS tile border.

Missing flowers / seasons / jokers fall back to **style-1** at runtime.
""",
}


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        print(f"  keep {dest.name}")
        return
    print(f"  get {url}")
    urllib.request.urlretrieve(url, dest)


def write_readme(style_id: str) -> None:
    path = ASSETS / style_id / "README.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(READMES[style_id], encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}")


def rename_if_needed(old: str, new: str) -> Path:
    src = ASSETS / old
    dst = ASSETS / new
    if dst.exists():
        print(f"{new}: already present")
        return dst
    if not src.exists():
        raise SystemExit(f"Missing {src} (expected rename source for {new})")
    print(f"rename {old}/ -> {new}/")
    src.rename(dst)
    return dst


def import_samoheen(dest: Path) -> None:
    print("style-3: samoheen Hong Kong")
    dest.mkdir(parents=True, exist_ok=True)
    for src_name, out_name in SAMOHEEN_MAP.items():
        tmp = FETCH / "samoheen" / src_name
        download(SAMOHEEN_BASE + src_name, tmp)
        out = dest / out_name
        shutil.copy2(tmp, out)
    write_readme("style-3")


# Face crop inside each panel cell: strip baked outline (+ style-4 3D shadow).
# Insets clear the rounded black stroke so site CSS can own the border.
T1_FACE = (25, 25, 333, 420)  # within 358×445 cell — clears rounded outline
T2_FACE = (14, 14, 466, 658)  # within 560×752 cell (also drops right/bottom bevel)


def slice_t1(src: Path, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGBA")
    fl, ft, fr, fb = T1_FACE
    n = 0
    for r, row in enumerate(T1_LAYOUT):
        for c, tid in enumerate(row):
            if not tid:
                continue
            x, y = T1_COLS[c], T1_ROWS[r]
            cell = im.crop((x, y, x + T1_W, y + T1_H))
            cell.crop((fl, ft, fr, fb)).save(dest / TEMPAI_NAME[tid], optimize=True)
            n += 1
    print(f"  sliced {n} tiles -> {dest.name} (face {fr - fl}x{fb - ft})")


def slice_t2(src: Path, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGBA")
    ox, oy = T2_ORIGIN
    cw, ch = T2_CELL
    fl, ft, fr, fb = T2_FACE
    n = 0
    for r, row in enumerate(T2_LAYOUT):
        for c, tid in enumerate(row):
            if not tid:
                continue
            x = ox + c * cw
            y = oy + r * ch
            cell = im.crop((x, y, x + cw, y + ch))
            cell.crop((fl, ft, fr, fb)).save(dest / TEMPAI_NAME[tid], optimize=True)
            n += 1
    print(f"  sliced {n} tiles -> {dest.name} (face {fr - fl}x{fb - ft})")


def import_tempai(*, force: bool = False) -> None:
    FETCH.mkdir(parents=True, exist_ok=True)
    t1 = FETCH / "tileset1.png"
    t2 = FETCH / "tileset2.png"
    if force:
        for p in (t1, t2):
            if p.exists():
                p.unlink()
    print("download tempai rasters")
    download(TEMPAI_RASTER + "tileset1.png", t1)
    download(TEMPAI_RASTER + "tileset2.png", t2)

    print("style-4: tempai tileset2")
    slice_t2(t2, ASSETS / "style-4")
    write_readme("style-4")

    print("style-5: tempai tileset1")
    slice_t1(t1, ASSETS / "style-5")
    write_readme("style-5")


def main() -> None:
    FETCH.mkdir(parents=True, exist_ok=True)

    rename_if_needed("traditional", "style-1")
    write_readme("style-1")

    rename_if_needed("custom", "style-2")
    write_readme("style-2")

    import_samoheen(ASSETS / "style-3")
    import_tempai()

    print("done")


if __name__ == "__main__":
    main()
