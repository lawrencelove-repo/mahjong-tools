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

  function bind() {
    if (!document.body?.classList.contains("rules-page")) return;

    AppSettings.applyDarkMode?.();
    AppSettings.applyUiScale?.();
    AppSettings.bindDarkModeCheckbox?.($("#opt-dark-mode"));
    AppSettings.mountUiScaleControl?.($("#ui-scale-host"));

    $("#btn-settings")?.addEventListener("click", () => {
      setSettingsOpen($("#settings-panel").hidden);
    });
    $("#btn-settings-close")?.addEventListener("click", () => setSettingsOpen(false));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
