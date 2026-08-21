/**
 * Popup page bootstrap for Hand Evaluation.
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
    if (!window.HandEvaluator) {
      root.innerHTML = `<h2>Build Your Hand</h2><p class="hv-note">Loading scoring engine…</p>`;
      window.addEventListener("hand-evaluator-ready", mountWhenReady, { once: true });
      return;
    }
    root.replaceChildren();
    api = window.HandEvaluator.mount(root, () => settings);
    syncChrome();
  }

  document.addEventListener("DOMContentLoaded", () => {
    syncChrome();

    $("#tile-style").addEventListener("change", (e) => {
      settings.tileStyle = e.target.value;
      AppSettings.saveSettings(settings);
      document.body.dataset.tileStyle = settings.tileStyle;
      api?.remountTiles?.();
    });

    $("#rank-labels").addEventListener("change", (e) => {
      settings.rankLabels = e.target.value;
      AppSettings.saveSettings(settings);
      api?.remountTiles?.();
    });

    mountWhenReady();
  });
})();
