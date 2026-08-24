/**
 * App settings — persisted in a cookie (with localStorage migration).
 * tileStyle, rankLabels, uiScale, and darkMode also have dedicated cookies shared across all pages.
 */

const SETTINGS_KEY = "riichi-cheatsheet-settings";
const TILE_STYLE_COOKIE = "riichi-cheatsheet-tile-style";
const RANK_LABELS_COOKIE = "riichi-cheatsheet-rank-labels";
const UI_SCALE_COOKIE = "riichi-cheatsheet-ui-scale";
const DARK_MODE_COOKIE = "riichi-cheatsheet-dark-mode";
const SETTINGS_COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~13 months
const VALID_TILE_STYLES = ["traditional", "custom", "text"];
const VALID_RANK_LABELS = ["off", "hover", "always"];
const UI_SCALE_STEPS = [100, 125, 150, 200];

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
  uiScale: 100, // 100 | 125 | 150 | 200 — fonts, columns, tiles
  darkMode: false, // global theme; dedicated cookie
  showTileKey: false, // full tileset key / legend section
  nmjlYear: 2026, // American Mahjong card year (nmjl.html)
  hkGroupBy: "faan", // faan | category — Hong Kong page
  hkSeasons: "exclude", // include | exclude | blanks — flowers/seasons display
  hkLanguage: "en-zh", // en | zh | en-zh — English and/or Chinese (Cantonese names)
  filipinoGroupBy: "points", // points | category — Filipino page
  updatedAt: 0,
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
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return null;
  }
}

function normalizeTileStyle(value) {
  return VALID_TILE_STYLES.includes(value) ? value : DEFAULT_SETTINGS.tileStyle;
}

function normalizeRankLabels(value) {
  return VALID_RANK_LABELS.includes(value) ? value : DEFAULT_SETTINGS.rankLabels;
}

function normalizeUiScale(value) {
  const n = Number(value);
  if (UI_SCALE_STEPS.includes(n)) return n;
  // Snap nearest valid step if an older/odd value appears.
  let best = UI_SCALE_STEPS[0];
  let bestDist = Infinity;
  for (const step of UI_SCALE_STEPS) {
    const d = Math.abs(step - n);
    if (d < bestDist) {
      best = step;
      bestDist = d;
    }
  }
  return best;
}

function normalizeDarkMode(value) {
  if (value === true || value === 1 || value === "1" || value === "true" || value === "dark") {
    return true;
  }
  return false;
}

function stepUiScale(current, delta) {
  const cur = normalizeUiScale(current);
  const idx = UI_SCALE_STEPS.indexOf(cur);
  const next = UI_SCALE_STEPS[Math.max(0, Math.min(UI_SCALE_STEPS.length - 1, idx + delta))];
  return next;
}

function readStorageSettings() {
  try {
    return parseSettingsJson(localStorage.getItem(SETTINGS_KEY));
  } catch {
    return null;
  }
}

function pickNewerSettings(a, b) {
  if (!a) return b;
  if (!b) return a;
  return (Number(b.updatedAt) || 0) >= (Number(a.updatedAt) || 0) ? b : a;
}

function applyDedicatedCookies(settings) {
  let next = {
    ...settings,
    tileStyle: normalizeTileStyle(settings.tileStyle),
    rankLabels: normalizeRankLabels(settings.rankLabels),
    uiScale: normalizeUiScale(settings.uiScale),
    darkMode: normalizeDarkMode(settings.darkMode),
  };
  const tileCookie = readCookie(TILE_STYLE_COOKIE);
  if (tileCookie) next.tileStyle = normalizeTileStyle(tileCookie);
  const rankCookie = readCookie(RANK_LABELS_COOKIE);
  if (rankCookie) next.rankLabels = normalizeRankLabels(rankCookie);
  const scaleCookie = readCookie(UI_SCALE_COOKIE);
  if (scaleCookie) next.uiScale = normalizeUiScale(scaleCookie);
  const darkCookie = readCookie(DARK_MODE_COOKIE);
  if (darkCookie !== null && darkCookie !== "") {
    next.darkMode = normalizeDarkMode(darkCookie);
  }
  return next;
}

function loadSettings() {
  const fromCookie = parseSettingsJson(readCookie(SETTINGS_KEY));
  const fromStorage = readStorageSettings();
  const settings = pickNewerSettings(fromCookie, fromStorage) || { ...DEFAULT_SETTINGS };
  return applyDedicatedCookies(settings);
}

function saveSettings(settings) {
  const next = {
    ...settings,
    tileStyle: normalizeTileStyle(settings.tileStyle),
    rankLabels: normalizeRankLabels(settings.rankLabels),
    uiScale: normalizeUiScale(settings.uiScale),
    darkMode: normalizeDarkMode(settings.darkMode),
    updatedAt: Date.now(),
  };
  const payload = JSON.stringify(next);
  writeCookie(SETTINGS_KEY, payload);
  writeCookie(TILE_STYLE_COOKIE, next.tileStyle);
  writeCookie(RANK_LABELS_COOKIE, next.rankLabels);
  writeCookie(UI_SCALE_COOKIE, String(next.uiScale));
  writeCookie(DARK_MODE_COOKIE, next.darkMode ? "1" : "0");
  try {
    localStorage.setItem(SETTINGS_KEY, payload);
  } catch {
    /* ignore quota / private mode */
  }
  return next;
}

/**
 * Apply persisted tileset to <select id="tile-style"> and body[data-tile-style].
 * @param {HTMLSelectElement|null} [select]
 * @param {typeof DEFAULT_SETTINGS} [settings]
 */
function applyTileStyle(select = document.getElementById("tile-style"), settings = loadSettings()) {
  const style = normalizeTileStyle(settings.tileStyle);
  if (document.body) document.body.dataset.tileStyle = style;
  if (select && select.value !== style) select.value = style;
  return style;
}

/**
 * Apply persisted Arabic-numbers mode to <select id="rank-labels"> and body dataset.
 * @param {HTMLSelectElement|null} [select]
 * @param {typeof DEFAULT_SETTINGS} [settings]
 */
function applyRankLabels(select = document.getElementById("rank-labels"), settings = loadSettings()) {
  const mode = normalizeRankLabels(settings.rankLabels);
  if (document.body) document.body.dataset.rankLabels = mode;
  if (select && select.value !== mode) select.value = mode;
  return mode;
}

/**
 * Shared binder for global selects persisted via dedicated cookies.
 * @param {HTMLSelectElement|null} select
 * @param {{
 *   readValue: (settings: object) => string,
 *   writeValue: (settings: object, value: string) => object,
 *   apply: (select: HTMLSelectElement, settings: object) => string,
 *   onChange?: (value: string, settings: object) => void,
 * }} opts
 */
function bindGlobalSelect(select, opts) {
  if (!select) return () => {};

  const syncFromStore = () => {
    const settings = loadSettings();
    opts.apply(select, settings);
    return settings;
  };

  syncFromStore();

  const onSelect = () => {
    const settings = opts.writeValue(loadSettings(), select.value);
    const saved = saveSettings(settings);
    const value = opts.apply(select, saved);
    opts.onChange?.(value, saved);
  };
  select.addEventListener("change", onSelect);

  const onStorage = (e) => {
    if (e.key && e.key !== SETTINGS_KEY) return;
    const prev = select.value;
    const settings = syncFromStore();
    const next = opts.readValue(settings);
    if (next !== prev) opts.onChange?.(next, settings);
  };
  window.addEventListener("storage", onStorage);

  const onPageShow = () => {
    const prev = select.value;
    const settings = syncFromStore();
    const next = opts.readValue(settings);
    if (next !== prev) opts.onChange?.(next, settings);
  };
  window.addEventListener("pageshow", onPageShow);

  return () => {
    select.removeEventListener("change", onSelect);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("pageshow", onPageShow);
  };
}

/**
 * Wire a tileset <select> to the shared cookie/localStorage value.
 * @param {HTMLSelectElement|null} select
 * @param {(style: string, settings: object) => void} [onChange]
 * @returns {() => void} dispose
 */
function bindTileStyleSelect(select, onChange) {
  return bindGlobalSelect(select, {
    readValue: (s) => normalizeTileStyle(s.tileStyle),
    writeValue: (s, value) => ({ ...s, tileStyle: normalizeTileStyle(value) }),
    apply: applyTileStyle,
    onChange,
  });
}

/**
 * Wire Arabic-numbers <select> to the shared cookie/localStorage value.
 * @param {HTMLSelectElement|null} select
 * @param {(mode: string, settings: object) => void} [onChange]
 * @returns {() => void} dispose
 */
function bindRankLabelsSelect(select, onChange) {
  return bindGlobalSelect(select, {
    readValue: (s) => normalizeRankLabels(s.rankLabels),
    writeValue: (s, value) => ({ ...s, rankLabels: normalizeRankLabels(value) }),
    apply: applyRankLabels,
    onChange,
  });
}

/**
 * Apply display scale (fonts / columns / tiles) from settings.
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @param {ParentNode|null} [controlRoot]
 */
function applyUiScale(settings = loadSettings(), controlRoot = document) {
  const pct = normalizeUiScale(settings.uiScale);
  const root = document.documentElement;
  root.style.setProperty("--ui-scale", String(pct / 100));
  root.dataset.uiScale = String(pct);
  if (document.body) document.body.dataset.uiScale = String(pct);

  const label = controlRoot?.querySelector?.("#ui-scale-label") || document.getElementById("ui-scale-label");
  if (label) label.textContent = `${pct}%`;

  const down = controlRoot?.querySelector?.("#btn-scale-down") || document.getElementById("btn-scale-down");
  const up = controlRoot?.querySelector?.("#btn-scale-up") || document.getElementById("btn-scale-up");
  if (down) down.disabled = pct <= UI_SCALE_STEPS[0];
  if (up) up.disabled = pct >= UI_SCALE_STEPS[UI_SCALE_STEPS.length - 1];
  return pct;
}

function setUiScale(percent, onChange) {
  const settings = saveSettings({ ...loadSettings(), uiScale: normalizeUiScale(percent) });
  applyUiScale(settings);
  onChange?.(settings.uiScale, settings);
  return settings.uiScale;
}

/**
 * Wire +/- display-size control (steps 100 / 125 / 150 / 200).
 * @param {ParentNode} root
 * @param {(pct: number, settings: object) => void} [onChange]
 */
function bindUiScaleControl(root, onChange) {
  if (!root) return () => {};

  const syncFromStore = () => {
    const settings = loadSettings();
    applyUiScale(settings, root);
    return settings;
  };

  syncFromStore();

  const down = root.querySelector("#btn-scale-down");
  const up = root.querySelector("#btn-scale-up");

  const onDown = () => {
    const cur = normalizeUiScale(loadSettings().uiScale);
    setUiScale(stepUiScale(cur, -1), onChange);
  };
  const onUp = () => {
    const cur = normalizeUiScale(loadSettings().uiScale);
    setUiScale(stepUiScale(cur, 1), onChange);
  };

  down?.addEventListener("click", onDown);
  up?.addEventListener("click", onUp);

  const onStorage = (e) => {
    if (e.key && e.key !== SETTINGS_KEY) return;
    const prev = root.querySelector("#ui-scale-label")?.textContent;
    const settings = syncFromStore();
    if (`${settings.uiScale}%` !== prev) onChange?.(settings.uiScale, settings);
  };
  window.addEventListener("storage", onStorage);

  const onPageShow = () => {
    const prev = root.querySelector("#ui-scale-label")?.textContent;
    const settings = syncFromStore();
    if (`${settings.uiScale}%` !== prev) onChange?.(settings.uiScale, settings);
  };
  window.addEventListener("pageshow", onPageShow);

  return () => {
    down?.removeEventListener("click", onDown);
    up?.removeEventListener("click", onUp);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("pageshow", onPageShow);
  };
}

/**
 * Insert +/- scale control into Settings (#ui-scale-host) if missing.
 * Landing / pages without a settings host only apply the cookie scale (no controls).
 * @param {Element|null} [host]
 */
function mountUiScaleControl(host) {
  if (document.body?.classList.contains("landing-page")) {
    applyUiScale(loadSettings());
    return null;
  }
  const parent =
    host ||
    document.getElementById("ui-scale-host") ||
    document.querySelector("#settings-panel .settings-options");
  if (!parent) {
    applyUiScale(loadSettings());
    return null;
  }
  let el = parent.querySelector(".ui-scale-control") || document.querySelector(".ui-scale-control");
  if (!el) {
    el = document.createElement("div");
    el.className = "ui-scale-control no-print";
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", "Display size");
    el.innerHTML = `
      <button type="button" id="btn-scale-down" class="icon-btn" aria-label="Decrease display size" title="Smaller">−</button>
      <span id="ui-scale-label" class="ui-scale-label" aria-live="polite">100%</span>
      <button type="button" id="btn-scale-up" class="icon-btn" aria-label="Increase display size" title="Larger">+</button>
    `;
  }
  if (el.parentElement !== parent) {
    parent.appendChild(el);
  }
  bindUiScaleControl(el);
  return el;
}

function initUiScaleUi() {
  applyUiScale(loadSettings());
  mountUiScaleControl();
}

/**
 * Apply light/dark theme from settings (html[data-theme]).
 * @param {typeof DEFAULT_SETTINGS} [settings]
 * @param {HTMLInputElement|null} [checkbox]
 */
function applyDarkMode(settings = loadSettings(), checkbox = document.getElementById("opt-dark-mode")) {
  const on = normalizeDarkMode(settings.darkMode);
  const theme = on ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  if (document.body) document.body.dataset.theme = theme;
  if (checkbox) checkbox.checked = on;
  return on;
}

/**
 * Wire Settings → Dark mode checkbox to the dedicated cookie.
 * @param {HTMLInputElement|null} [checkbox]
 * @param {(on: boolean, settings: object) => void} [onChange]
 */
function bindDarkModeCheckbox(checkbox = document.getElementById("opt-dark-mode"), onChange) {
  applyDarkMode(loadSettings(), checkbox || null);
  if (!checkbox) return () => {};

  const onToggle = () => {
    const settings = saveSettings({ ...loadSettings(), darkMode: checkbox.checked });
    applyDarkMode(settings, checkbox);
    onChange?.(checkbox.checked, settings);
  };
  checkbox.addEventListener("change", onToggle);

  const onStorage = (e) => {
    if (e.key && e.key !== SETTINGS_KEY) return;
    const prev = checkbox.checked;
    const settings = loadSettings();
    applyDarkMode(settings, checkbox);
    if (checkbox.checked !== prev) onChange?.(checkbox.checked, settings);
  };
  window.addEventListener("storage", onStorage);

  return () => {
    checkbox.removeEventListener("change", onToggle);
    window.removeEventListener("storage", onStorage);
  };
}

function initThemeUi() {
  applyDarkMode(loadSettings());
  bindDarkModeCheckbox();
}

function initDisplayPrefsUi() {
  initUiScaleUi();
  initThemeUi();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDisplayPrefsUi);
} else {
  initDisplayPrefsUi();
}

// Apply theme as soon as this deferred script runs (DOM already parsed).
try {
  applyDarkMode(loadSettings(), null);
} catch {
  /* ignore */
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
  VALID_TILE_STYLES,
  VALID_RANK_LABELS,
  UI_SCALE_STEPS,
  loadSettings,
  saveSettings,
  normalizeTileStyle,
  normalizeRankLabels,
  normalizeUiScale,
  normalizeDarkMode,
  stepUiScale,
  applyTileStyle,
  applyRankLabels,
  applyUiScale,
  applyDarkMode,
  setUiScale,
  bindTileStyleSelect,
  bindRankLabelsSelect,
  bindUiScaleControl,
  bindDarkModeCheckbox,
  mountUiScaleControl,
  getQuickStartHtml,
  renderQuickStart,
};
