/**
 * Favicon theme-color sync + service worker registration for PWA install/offline.
 */
(function () {
  function syncThemeColor() {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    const dark = document.documentElement.dataset.theme === "dark";
    meta.content = dark ? "#161513" : "#2c5f4a";
  }

  syncThemeColor();

  if (!("serviceWorker" in navigator)) return;

  // Only register when served over http(s) (not file://)
  if (!/^https?:$/i.test(location.protocol)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline install optional — ignore registration errors */
    });
  });
})();
