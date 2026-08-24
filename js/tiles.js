/**
 * Tile notation: 6B, 1P, RD, EW, 5Pr, 123P → tile IDs → DOM
 *
 * Image styles live under assets/style-N/ (ids style-1 …). Dropdown labels
 * are independent of folder ids — edit TILESETS[].label (or add style-6+).
 * Special kind "text" is NMJL digit/letter rendering (no image folder).
 */

const SUIT_LETTER = { B: "bam", C: "crak", P: "dot" };
const SUIT_COLOR = { bam: "green", crak: "red", dot: "black", honor: "blue", other: "blue" };

/** Shared FluffyStuff-compatible basenames (style-1, style-3+, tempai slices). */
const STYLE1_FILES = {
  "1B": "Sou1", "2B": "Sou2", "3B": "Sou3", "4B": "Sou4", "5B": "Sou5",
  "6B": "Sou6", "7B": "Sou7", "8B": "Sou8", "9B": "Sou9", "5Br": "Sou5-Dora",
  "1C": "Man1", "2C": "Man2", "3C": "Man3", "4C": "Man4", "5C": "Man5",
  "6C": "Man6", "7C": "Man7", "8C": "Man8", "9C": "Man9", "5Cr": "Man5-Dora",
  "1P": "Pin1", "2P": "Pin2", "3P": "Pin3", "4P": "Pin4", "5P": "Pin5",
  "6P": "Pin6", "7P": "Pin7", "8P": "Pin8", "9P": "Pin9", "5Pr": "Pin5-Dora",
  EW: "Ton", SW: "Nan", WW: "Shaa", NW: "Pei",
  WD: "Soap", GD: "Hatsu", RD: "Chun",
  F: "Flower1", F1: "Flower1", F2: "Flower2", F3: "Flower3", F4: "Flower4",
  F5: "Season1", F6: "Season2", F7: "Season3", F8: "Season4",
  J: "Joker", J1: "Joker", J2: "Joker2", X: "Back",
};

/**
 * style-2 pack: suit letter first.
 * Bam B1–B9, Crak C1–C9, Dot P1–P9,
 * Winds WE/WS/WW/WN, Dragons DG/DR/DW,
 * Flowers F1–F4, Jokers J1/J2.
 */
const STYLE2_FILES = {
  "1B": "B1", "2B": "B2", "3B": "B3", "4B": "B4", "5B": "B5",
  "6B": "B6", "7B": "B7", "8B": "B8", "9B": "B9",
  "1C": "C1", "2C": "C2", "3C": "C3", "4C": "C4", "5C": "C5",
  "6C": "C6", "7C": "C7", "8C": "C8", "9C": "C9",
  "1P": "P1", "2P": "P2", "3P": "P3", "4P": "P4", "5P": "P5",
  "6P": "P6", "7P": "P7", "8P": "P8", "9P": "P9",
  "5Br": "B5r", "5Cr": "C5r", "5Pr": "P5r",
  EW: "WE", SW: "WS", WW: "WW", NW: "WN",
  GD: "DG", RD: "DR", WD: "DW",
  F: "F1", F1: "F1", F2: "F2", F3: "F3", F4: "F4",
  F5: "F1", F6: "F2", F7: "F3", F8: "F4",
  J: "J1", J1: "J1", J2: "J2",
  X: "J1",
};

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   kind: "image" | "text",
 *   dir?: string,
 *   files?: Record<string, string>,
 *   fallback?: string | null,
 *   rankSide?: "left" | "right",
 *   akaPlain?: Record<string, string>,
 * }} TilesetDef
 */

/** Registry: add style-6+ here; folders live at assets/{id}/. */
const TILESETS = /** @type {TilesetDef[]} */ ([
  {
    id: "style-1",
    label: "Traditional",
    kind: "image",
    dir: "style-1",
    files: STYLE1_FILES,
    fallback: null,
    rankSide: "right",
  },
  {
    id: "style-2",
    label: "Lemons",
    kind: "image",
    dir: "style-2",
    files: STYLE2_FILES,
    fallback: "style-1",
    rankSide: "left",
    akaPlain: { "5Br": "B5", "5Cr": "C5", "5Pr": "P5" },
  },
  {
    id: "style-3",
    label: "Hong Kong",
    kind: "image",
    dir: "style-3",
    files: STYLE1_FILES,
    fallback: "style-1",
    rankSide: "right",
  },
  {
    id: "style-5",
    label: "Tempai Set 1",
    kind: "image",
    dir: "style-5",
    files: STYLE1_FILES,
    fallback: "style-1",
    rankSide: "right",
  },
  {
    id: "style-4",
    label: "Tempai Set 2",
    kind: "image",
    dir: "style-4",
    files: STYLE1_FILES,
    fallback: "style-1",
    rankSide: "right",
  },
  { id: "text", label: "Text (NMJL)", kind: "text" },
]);

const TILESET_BY_ID = Object.fromEntries(TILESETS.map((t) => [t.id, t]));
const DEFAULT_TILE_STYLE = "style-1";

/** Old cookie / settings values → style-N */
const TILE_STYLE_ALIASES = {
  traditional: "style-1",
  custom: "style-2",
};

function listTilesets() {
  return TILESETS.slice();
}

function getTileset(id) {
  const normalized = normalizeStyleId(id);
  return TILESET_BY_ID[normalized] || TILESET_BY_ID[DEFAULT_TILE_STYLE];
}

function normalizeStyleId(value) {
  if (!value) return DEFAULT_TILE_STYLE;
  const aliased = TILE_STYLE_ALIASES[value] || value;
  return TILESET_BY_ID[aliased] ? aliased : DEFAULT_TILE_STYLE;
}

function labelForStyle(id) {
  return getTileset(id).label;
}

const TEXT_GLYPH = {
  EW: "E", SW: "S", WW: "W", NW: "N",
  WD: "Wh", GD: "G", RD: "R",
  F: "F", J: "J", X: "—",
};

function expandToken(raw) {
  const t = raw.trim();
  if (!t || t === "|") return [{ type: "break" }];

  // Run sugar: 123P / 4567B / 19C
  const run = t.match(/^([1-9]+)([BCP])(r)?$/i);
  if (run && run[1].length > 1) {
    const suit = run[2].toUpperCase();
    const red = run[3] ? "r" : "";
    return [...run[1]].map((d) => ({ type: "tile", id: `${d}${suit}${red}` }));
  }

  // Repeat: 1P*3
  const rep = t.match(/^(.+)\*(\d+)$/);
  if (rep) {
    const inner = expandToken(rep[1]).filter((x) => x.type === "tile");
    const out = [];
    const n = parseInt(rep[2], 10);
    for (let i = 0; i < n; i++) out.push(...inner.map((x) => ({ ...x })));
    return out;
  }

  const id = normalizeId(t);
  if (!id) return [{ type: "unknown", raw: t }];
  return [{ type: "tile", id }];
}

function normalizeId(t) {
  const u = t.trim();
  const m = u.match(/^([1-9])([BCP])(r)?$/i);
  if (m) return `${m[1]}${m[2].toUpperCase()}${m[3] ? "r" : ""}`;
  // NMJL soap (white dragon as 0), optionally suit-tinted for card color: 0 / 0P / 0B / 0C
  if (/^0[BCP]?$/i.test(u)) {
    const suit = u.length > 1 ? u[1].toUpperCase() : "";
    return suit ? `0${suit}` : "0";
  }
  const honors = ["EW", "SW", "WW", "NW", "WD", "GD", "RD", "BD", "PD", "F", "J", "X", "J1", "J2"];
  const up = u.toUpperCase();
  if (honors.includes(up)) return up;
  if (/^F[1-8]$/i.test(u)) return u.toUpperCase();
  return null;
}

function parseHand(notation) {
  if (!notation || !notation.trim()) return [];
  const parts = notation.trim().split(/\s+/);
  const tokens = [];
  for (const p of parts) {
    if (p === "|") {
      tokens.push({ type: "break" });
      continue;
    }
    tokens.push(...expandToken(p));
  }
  return tokens;
}

function tileMeta(id) {
  // Soap: white dragon shown as 0; optional suit letter tints NMJL text color
  if (/^0[BCP]?$/.test(id)) {
    const suitLetter = id[1];
    const suit = suitLetter ? SUIT_LETTER[suitLetter] : "honor";
    const color = suitLetter ? SUIT_COLOR[suit] : "blue";
    return {
      id,
      suit,
      rank: "0",
      aka: false,
      color,
      text: "0",
      label: suitLetter
        ? `Soap (0) · ${{ bam: "Bam", crak: "Crak", dot: "Dot" }[suit]} tint`
        : "Soap (White Dragon as 0)",
      category: "honor",
      soap: true,
      imageId: "WD",
    };
  }
  if (/^[1-9][BCP]r?$/.test(id)) {
    const suit = SUIT_LETTER[id[1]];
    const rank = id[0];
    const aka = id.endsWith("r");
    const suitName = { bam: "Bam", crak: "Crak", dot: "Dot" }[suit];
    return {
      id,
      suit,
      rank,
      aka,
      color: aka ? "red" : SUIT_COLOR[suit],
      text: rank,
      label: aka ? `Red ${rank} ${suitName}` : `${rank} ${suitName}`,
      category: "suited",
    };
  }
  const honorNames = {
    EW: "East",
    SW: "South",
    WW: "West",
    NW: "North",
    WD: "White Dragon",
    GD: "Green Dragon",
    RD: "Red Dragon",
    BD: "Green Dragon (bam D)",
    PD: "White Dragon (dot D)",
    F: "Flower",
    F1: "Flower 1",
    F2: "Flower 2",
    F3: "Flower 3",
    F4: "Flower 4",
    J: "Joker",
    J1: "Joker 1",
    J2: "Joker 2",
    X: "Blank",
  };
  if (["EW", "SW", "WW", "NW", "WD", "GD", "RD", "BD", "PD"].includes(id)) {
    const imageId = id === "BD" ? "GD" : id === "PD" ? "WD" : id;
    return {
      id,
      suit: "honor",
      color: "blue",
      text: TEXT_GLYPH[imageId] || TEXT_GLYPH[id] || id,
      label: honorNames[id],
      category: "honor",
      imageId,
    };
  }
  if (/^F[1-8]?$/.test(id) || id === "J" || id === "J1" || id === "J2" || id === "X") {
    return {
      id,
      suit: "other",
      color: "blue",
      text: id.startsWith("F") ? "F" : id.startsWith("J") ? "J" : TEXT_GLYPH[id] || id,
      label: honorNames[id] || id,
      category: "other",
    };
  }
  return {
    id,
    suit: "other",
    color: "blue",
    text: TEXT_GLYPH[id] || id,
    label: honorNames[id] || id,
    category: "other",
  };
}

function resolveImageId(id) {
  if (/^0[BCP]?$/.test(id)) return "WD";
  if (id === "BD") return "GD";
  if (id === "PD") return "WD";
  return id;
}

function assetSrc(dir, basename) {
  return `assets/${dir}/${basename}.png`;
}

/**
 * Candidate image URLs for a tile in a given image tileset, then fallbacks.
 * @param {string} id
 * @param {string} styleId
 * @returns {string[]}
 */
function imageCandidates(id, styleId) {
  const urls = [];
  const seen = new Set();
  const push = (dir, base) => {
    if (!dir || !base) return;
    const url = assetSrc(dir, base);
    if (seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  let cur = getTileset(styleId);
  const visited = new Set();
  while (cur && cur.kind === "image" && !visited.has(cur.id)) {
    visited.add(cur.id);
    const imageId = resolveImageId(id);
    const primary = cur.files?.[imageId];
    if (primary) push(cur.dir, primary);
    const plain = cur.akaPlain?.[id];
    if (plain) push(cur.dir, plain);
    // Aka without a dedicated red file → plain suit 5 in FluffyStuff packs
    if (!cur.akaPlain && (id === "5Br" || id === "5Cr" || id === "5Pr")) {
      const plainKey = id.slice(0, 2);
      const plainBase = cur.files?.[plainKey];
      if (plainBase) push(cur.dir, plainBase);
    }
    if (!cur.fallback) break;
    cur = getTileset(cur.fallback);
  }

  if (!urls.length) {
    push("style-1", STYLE1_FILES[resolveImageId(id)] || "Back");
  }
  return urls;
}

/**
 * NMJL letter-style text: dragons as colored D, winds/flowers black.
 * Riichi text mode is unchanged unless opts.nmjlText is set.
 */
function nmjlTextPresentation(id, meta) {
  if (id === "RD") return { text: "D", color: "red" };
  if (id === "BD" || id === "GD") return { text: "D", color: "green" };
  if (id === "PD" || id === "WD") return { text: "D", color: "black" };
  if (id === "F" || /^F[1-8]$/.test(id)) return { text: "F", color: "black" };
  if (id === "EW") return { text: "E", color: "black" };
  if (id === "SW") return { text: "S", color: "black" };
  if (id === "WW") return { text: "W", color: "black" };
  if (id === "NW") return { text: "N", color: "black" };
  return { text: meta.text, color: meta.color };
}

/**
 * @param {string} notation
 * @param {string} [style]
 * @param {{ rankLabels?: "off"|"hover"|"always", nmjlText?: boolean }} [opts]
 * @returns {HTMLElement}
 */
function renderHand(notation, style = DEFAULT_TILE_STYLE, opts = {}) {
  const styleId = normalizeStyleId(style);
  const rankLabels = opts.rankLabels || "hover";
  const wrap = document.createElement("div");
  wrap.className = "hand";
  wrap.dataset.style = styleId;

  let group = document.createElement("span");
  group.className = "meld";

  const flush = () => {
    if (group.childNodes.length) wrap.appendChild(group);
    group = document.createElement("span");
    group.className = "meld";
  };

  for (const tok of parseHand(notation)) {
    if (tok.type === "break") {
      flush();
      continue;
    }
    if (tok.type === "unknown") {
      const span = document.createElement("span");
      span.className = "tile tile-unknown";
      span.textContent = tok.raw;
      group.appendChild(span);
      continue;
    }
    group.appendChild(renderTile(tok.id, styleId, rankLabels, opts));
  }
  flush();
  return wrap;
}

function renderTile(id, style, rankLabels = "hover", opts = {}) {
  const styleId = normalizeStyleId(style);
  const meta = tileMeta(id);
  const tileset = getTileset(styleId);

  if (tileset.kind === "text") {
    const present = opts.nmjlText ? nmjlTextPresentation(id, meta) : { text: meta.text, color: meta.color };
    const span = document.createElement("span");
    span.className = `tile tile-text suit-${present.color}`;
    span.dataset.id = id;
    span.textContent = present.text;
    span.title = `${meta.label} (${id})`;
    return span;
  }

  const wrap = document.createElement("span");
  wrap.className = `tile-wrap rank-${rankLabels}`;
  wrap.dataset.id = id;
  wrap.title = `${meta.label} (${id})`;

  const img = document.createElement("img");
  img.className = "tile tile-img";
  img.alt = meta.label;
  img.loading = "lazy";

  const candidates = imageCandidates(id, styleId);
  let i = 0;
  img.src = candidates[0];
  if (candidates.length > 1) {
    img.onerror = () => {
      i += 1;
      if (i < candidates.length) {
        img.src = candidates[i];
        return;
      }
      img.onerror = null;
    };
  }
  wrap.appendChild(img);

  if (rankLabels !== "off") {
    const badge = document.createElement("span");
    badge.className = `tile-rank suit-${meta.color}`;
    badge.textContent = meta.text;
    badge.setAttribute("aria-hidden", "true");
    wrap.appendChild(badge);
  }

  return wrap;
}

window.Tiles = {
  parseHand,
  renderHand,
  renderTile,
  tileMeta,
  expandToken,
  listTilesets,
  getTileset,
  normalizeStyleId,
  labelForStyle,
  imageCandidates,
  TILESETS,
  STYLE1_FILES,
  STYLE2_FILES,
  DEFAULT_TILE_STYLE,
  // Back-compat aliases
  TRADITIONAL_FILES: STYLE1_FILES,
  CUSTOM_FILES: STYLE2_FILES,
};
