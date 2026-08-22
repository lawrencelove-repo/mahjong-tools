/**
 * App settings — persisted in a cookie (with localStorage migration).
 */

const SETTINGS_KEY = "riichi-cheatsheet-settings";
const SETTINGS_COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~13 months

const DEFAULT_SETTINGS = {
  tileStyle: "traditional", // traditional | custom | text
  groupBy: "han", // han | category
  language: "en", // en | en-jp | jp
  showOptional: false,
  showDoubleYakumanNotes: false,
  showDoraPanel: false,
  showExtraTiles: false, // flowers / jokers / blanks in legend
  showScoringRef: false, // page-2 style scoring quick ref
  allowPage2: false, // when false, denser 1-page print; overflow still may spill if content huge — print CSS prefers 1 page unless this or scoring ref is on
  rankLabels: "hover", // off | hover | always — Arabic/honor glyphs on image tiles
  showTileKey: false, // full tileset key / legend section
  nmjlYear: 2026, // American Mahjong card year (nmjl.html)
  hkGroupBy: "faan", // faan | category — Hong Kong page
  hkSeasons: "exclude", // include | exclude | blanks — flowers/seasons display
  hkLanguage: "en-zh", // en | zh | en-zh — English and/or Chinese (Cantonese names)
  filipinoGroupBy: "points", // points | category — Filipino page
};

function readCookie(name) {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length < 2) return null;
  return decodeURIComponent(parts.pop().split(";").shift() || "");
}

function writeCookie(name, value, maxAge = SETTINGS_COOKIE_MAX_AGE) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
}

function parseSettingsJson(raw) {
  if (!raw) return null;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function loadSettings() {
  const fromCookie = parseSettingsJson(readCookie(SETTINGS_KEY));
  if (fromCookie) return fromCookie;

  try {
    const fromStorage = parseSettingsJson(localStorage.getItem(SETTINGS_KEY));
    if (fromStorage) {
      saveSettings(fromStorage);
      return fromStorage;
    }
  } catch {
    /* ignore */
  }

  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  const payload = JSON.stringify(settings);
  writeCookie(SETTINGS_KEY, payload);
  try {
    localStorage.setItem(SETTINGS_KEY, payload);
  } catch {
    /* ignore quota / private mode */
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function quickStartDl(rows) {
  return `<dl class="quick-start-dl">${rows
    .map(
      ([dt, dd]) =>
        `<div class="quick-start-row"><dt>${escapeHtml(dt)}</dt><dd>${dd}</dd></div>`
    )
    .join("")}</dl>`;
}

function hkSeasonRows(mode) {
  if (mode === "include") {
    return [
      ["Wall", "144 tiles — 136 suited/honors + 8 flowers &amp; seasons."],
      [
        "Remove",
        "Nothing from a standard Chinese set. Leave out jokers and blanks if your set has them.",
      ],
      [
        "Keep",
        "All 4 flowers and 4 seasons (bonus tiles). Suited tiles and honors stay in.",
      ],
    ];
  }
  if (mode === "blanks") {
    return [
      [
        "Wall",
        "136 suited/honors + blank tiles used as flower/season stand-ins (house count, often 8).",
      ],
      [
        "Remove",
        "Printed flower &amp; season tiles. Also remove jokers if present.",
      ],
      [
        "Keep / add",
        "Blank tiles in place of flowers &amp; seasons. Suited tiles and honors stay in.",
      ],
    ];
  }
  // exclude (default)
  return [
    ["Wall", "136 tiles — 4 of each suited tile and honor (no bonus tiles)."],
    [
      "Remove",
      "All flowers &amp; seasons (8 tiles). Remove jokers and blanks if your set has them.",
    ],
    ["Keep", "Only the 34×4 suited and honor tiles."],
  ];
}

function filipinoSeasonRows(mode) {
  const honorNote =
    "Winds and dragons usually stay in as bonus “flowers” — only remove them if your house rules say so.";
  if (mode === "include") {
    return [
      [
        "Wall",
        "Typically 144+ — suited tiles, honors, flowers &amp; seasons; jokers by house rule.",
      ],
      [
        "Remove",
        "Nothing required for flowers/seasons. Confirm joker count with your table.",
      ],
      ["Honors", honorNote],
    ];
  }
  if (mode === "blanks") {
    return [
      [
        "Wall",
        "Suited + honors, plus blanks as flower/season stand-ins; jokers by house rule.",
      ],
      [
        "Remove",
        "Printed flower &amp; season tiles; use blanks instead.",
      ],
      ["Honors", honorNote],
    ];
  }
  return [
    [
      "Wall",
      "Often 136 suited/honors (no printed flowers/seasons); jokers by house rule.",
    ],
    [
      "Remove",
      "Flowers &amp; seasons if present. Confirm whether jokers are in or out.",
    ],
    ["Honors", honorNote],
  ];
}

/**
 * @param {"riichi"|"nmjl"|"hk"|"filipino"} style
 * @param {typeof DEFAULT_SETTINGS} settings
 */
function getQuickStartHtml(style, settings) {
  if (style === "riichi") {
    return quickStartDl([
      [
        "Deal",
        "<strong>13</strong> tiles each; dealer takes a <strong>14th</strong> to start.",
      ],
      [
        "Wall",
        "136 tiles (4 × 34 suited &amp; honor tiles). Standard Japanese set has no flowers or jokers.",
      ],
      [
        "Remove",
        "Flower, season, joker, and blank tiles if your set includes them.",
      ],
      [
        "Optional",
        "Red fives (aka dora): keep or swap in one red 5m / 5p / 5s per table rules.",
      ],
    ]);
  }

  if (style === "nmjl") {
    return quickStartDl([
      [
        "Deal",
        "<strong>13</strong> tiles each; dealer gets a <strong>14th</strong>. Charleston exchanges happen before the first discard.",
      ],
      [
        "Wall",
        "152 tiles — 136 suited/honors + <strong>8 flowers</strong> + <strong>8 jokers</strong>.",
      ],
      [
        "Remove",
        "Nothing from a standard American set. Leave out extra blanks if your set has unused blanks.",
      ],
      [
        "Keep",
        "All flowers and jokers. One white dragon is the soap (0); dragons/winds stay in as honors.",
      ],
    ]);
  }

  if (style === "hk") {
    const mode = settings.hkSeasons || "exclude";
    const modeLabel =
      mode === "include"
        ? "Include seasons"
        : mode === "blanks"
          ? "Blanks as seasons"
          : "Exclude seasons & flowers";
    return (
      `<p class="quick-start-mode">Setup follows <strong>${escapeHtml(modeLabel)}</strong>.</p>` +
      quickStartDl([
        [
          "Deal",
          "<strong>13</strong> tiles each; dealer takes a <strong>14th</strong> to start.",
        ],
        ...hkSeasonRows(mode),
      ])
    );
  }

  if (style === "filipino") {
    const mode = settings.hkSeasons || "exclude";
    const modeLabel =
      mode === "include"
        ? "Include seasons"
        : mode === "blanks"
          ? "Blanks as seasons"
          : "Exclude seasons & flowers";
    return (
      `<p class="quick-start-mode">17-tile hands · setup follows <strong>${escapeHtml(modeLabel)}</strong>.</p>` +
      quickStartDl([
        [
          "Deal",
          "<strong>16</strong> tiles each; dealer receives a <strong>17th</strong> (five melds + pair).",
        ],
        ...filipinoSeasonRows(mode),
      ])
    );
  }

  return "";
}

function renderQuickStart(style, settings) {
  const el = document.getElementById("quick-start-body");
  if (!el) return;
  el.innerHTML = getQuickStartHtml(style, settings);
}

window.AppSettings = {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  getQuickStartHtml,
  renderQuickStart,
};
