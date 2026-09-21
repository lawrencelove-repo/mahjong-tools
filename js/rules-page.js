/**
 * Shared helpers for rules summary pages (scale / dark / optional settings).
 */
(function () {
  const $ = (sel, el = document) => el.querySelector(sel);

  function setSettingsOpen(open) {
    const panel = $("#settings-panel");
    const btn = $("#btn-settings");
    if (!panel || !btn) return;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyJokersUi() {
    const on = !!AppSettings?.loadSettings?.()?.includeJokers;
    const block = $("#jokers-block");
    if (block) block.hidden = !on;
  }

  function ensureFilipinoFlowersOption(select) {
    if (!select) return;
    if ([...select.options].some((o) => o.value === "flowers")) return;
    const opt = document.createElement("option");
    opt.value = "flowers";
    opt.textContent = "Include Flowers";
    select.appendChild(opt);
  }

  function bindSeasonsSelect() {
    const select = $("#hk-seasons");
    if (!select) return;
    ensureFilipinoFlowersOption(select);
    const settings = AppSettings.loadSettings();
    select.value = settings.hkSeasons || "exclude";
    if (![...select.options].some((o) => o.value === select.value)) {
      select.value = "exclude";
    }
    select.addEventListener("change", () => {
      AppSettings.saveSettings({ ...AppSettings.loadSettings(), hkSeasons: select.value });
    });
  }

  function bind() {
    if (!document.body?.classList.contains("rules-page")) return;
    if (document.body.classList.contains("filipino-quick-start")) return;

    AppSettings.applyDarkMode?.();
    AppSettings.applyUiScale?.();
    AppSettings.applyTileStyle?.($("#tile-style"));
    AppSettings.applyIncludeJokers?.();
    AppSettings.bindDarkModeCheckbox?.($("#opt-dark-mode"));
    AppSettings.bindIncludeJokersCheckbox?.($("#opt-include-jokers"), () => {
      applyJokersUi();
    });
    AppSettings.mountUiScaleControl?.($("#ui-scale-host"));
    AppSettings.bindTileStyleSelect?.($("#tile-style"));
    bindSeasonsSelect();

    $("#btn-settings")?.addEventListener("click", () => {
      setSettingsOpen($("#settings-panel").hidden);
    });
    $("#btn-settings-close")?.addEventListener("click", () => setSettingsOpen(false));

    applyJokersUi();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
