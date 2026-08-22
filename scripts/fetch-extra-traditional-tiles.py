"""Fetch CC0 flower/season tiles and generate joker faces for traditional set."""

from __future__ import annotations

import math
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
TMP = ROOT / "assets" / "_tmp-tiles"
DEST = ROOT / "assets" / "traditional"
BASE = "https://raw.githubusercontent.com/samoheen/mahjong-tiles/master/hongkong/png"
TARGET = (600, 800)

MAPPING = {
    "39-plum.png": "Flower1.png",
    "40-orchid.png": "Flower2.png",
    "41-chrysanthemum.png": "Flower3.png",
    "42-bamboo.png": "Flower4.png",
    "35-spring.png": "Season1.png",
    "36-summer.png": "Season2.png",
    "37-autumn.png": "Season3.png",
    "38-winter.png": "Season4.png",
}


def download() -> None:
    TMP.mkdir(parents=True, exist_ok=True)
    for src in MAPPING:
        out = TMP / src
        if out.exists():
            continue
        url = f"{BASE}/{src}"
        print("download", url)
        urllib.request.urlretrieve(url, out)


def resize_flowers() -> None:
    for src, name in MAPPING.items():
        im = Image.open(TMP / src).convert("RGBA")
        im = im.resize(TARGET, Image.Resampling.LANCZOS)
        im.save(DEST / name, optimize=True)
        print("saved", name, im.size)


def make_joker(path: Path, accent=(0x2E, 0xC4, 0xB6), label="JOKER") -> None:
    """Original black-face joker art sized like FluffyStuff tiles."""
    w, h = TARGET
    im = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)

    margin = 28
    d.rounded_rectangle(
        [margin, margin, w - margin, h - margin],
        radius=36,
        outline=(40, 40, 40, 255),
        width=4,
    )

    cx, cy = w // 2, int(h * 0.52)
    r = 118
    for i in range(16):
        ang = i * math.pi / 8
        x1 = cx + int(math.cos(ang) * (r + 18))
        y1 = cy + int(math.sin(ang) * (r + 18))
        x2 = cx + int(math.cos(ang) * (r + 78))
        y2 = cy + int(math.sin(ang) * (r + 78))
        d.line([(x1, y1), (x2, y2)], fill=(255, 200, 40, 255), width=14)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 210, 50, 255))

    eye_y = cy - 20
    d.ellipse([cx - 48, eye_y - 14, cx - 18, eye_y + 16], fill=accent)
    d.ellipse([cx + 18, eye_y - 14, cx + 48, eye_y + 16], fill=accent)
    d.arc([cx - 55, cy - 10, cx + 55, cy + 70], 20, 160, fill=accent, width=10)
    d.ellipse([cx - 62, cy + 18, cx - 38, cy + 42], fill=accent)
    d.ellipse([cx + 38, cy + 18, cx + 62, cy + 42], fill=accent)

    try:
        font = ImageFont.truetype("arialbd.ttf", 72)
        small = ImageFont.truetype("arialbd.ttf", 36)
    except OSError:
        font = ImageFont.load_default()
        small = font

    tw = d.textlength(label, font=font)
    d.text(((w - tw) / 2, 70), label, fill=accent, font=font)
    d.text((48, 48), "J", fill=accent, font=small)

    im.save(path, optimize=True)
    print("saved", path.name, im.size)


def main() -> None:
    download()
    resize_flowers()
    make_joker(DEST / "Joker.png")
    make_joker(DEST / "Joker2.png", accent=(0x4F, 0xC3, 0xF7), label="JOKER")


if __name__ == "__main__":
    main()
