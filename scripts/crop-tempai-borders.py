#!/usr/bin/env python3
"""
Re-slice Tempai tiles (style-4 / style-5) with baked-in borders cropped out.

Prefer: python scripts/import-tilesets.py  (face crop is applied at slice time)

This helper only re-runs the Tempai import with forced re-download.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "import_tilesets", ROOT / "scripts" / "import-tilesets.py"
)
mod = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(mod)
mod.import_tempai(force=True)
print("done")
