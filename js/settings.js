/**
 * App settings — persisted in localStorage
 */

const SETTINGS_KEY = "riichi-cheatsheet-settings";

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
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

window.AppSettings = {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
};
