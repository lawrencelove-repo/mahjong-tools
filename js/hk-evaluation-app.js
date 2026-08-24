/**
 * Popup page bootstrap for Hong Kong Hand Evaluation.
 */
(function () {
  let settings = AppSettings.loadSettings();
  let api = null;

  const $ = (sel) => document.querySelector(sel);

  function syncChrome() {
    document.body.dataset.tileStyle = settings.tileStyle;
    $("#tile-style").value = settings.tileStyle;
    $("#rank-labels").value = settings.rankLabels || "hover";
  }

  function mountWhenReady() {
    const root = $("#hand-eval-root");
    if (!window.HkHandEvaluator || !window.HkScore) {
      root.innerHTML = `<h2>Build Your Hand</h2><p class="hv-note">Loading scoring engine…</p>`;
      window.addEventListener("hk-hand-evaluator-ready", mountWhenReady, { once: true });
      return;
    }
    root.replaceChildren();
    api = window.HkHandEvaluator.mount(root, () => settings);
    syncChrome();
  }

  document.addEventListener("DOMContentLoaded", () => {
    AppSettings.bindTileStyleSelect($("#tile-style"), (style, saved) => {
      Object.assign(settings, saved);
      settings.tileStyle = style;
      document.body.dataset.tileStyle = style;
      api?.remountTiles?.();
    });

    AppSettings.bindRankLabelsSelect($("#rank-labels"), (mode, saved) => {
      Object.assign(settings, saved);
      settings.rankLabels = mode;
      api?.remountTiles?.();
    });

    syncChrome();
    mountWhenReady();
  });
})();
