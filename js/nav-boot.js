/**
 * Early compact-nav detection (sync, no defer).
 * Modern iPads use a desktop Mac UA and unreliable hover/pointer media features,
 * so CSS-only queries miss landscape tablets. Sets html.nav-compact before paint.
 */
(function () {
  // 13" iPad Pro landscape is ~1376 CSS px; leave headroom for future / zoomed layouts
  var TABLET_LANDSCAPE_MAX = 1600;

  function mq(query) {
    try {
      return window.matchMedia(query).matches;
    } catch (e) {
      return false;
    }
  }

  /** iPhone / iPad, including iPadOS 13+ which reports as Macintosh. */
  function isAppleTouchDevice() {
    var ua = navigator.userAgent || "";
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
    if (/Macintosh|Mac OS X/.test(ua) && navigator.maxTouchPoints > 1) return true;
    return false;
  }

  /**
   * Touch tablet / phone: Apple touch devices, or multi-touch with a coarse pointer.
   * Excludes mouse-only desktops and MacBooks (maxTouchPoints is 0).
   */
  function isTouchTablet() {
    if (isAppleTouchDevice()) return true;
    if (navigator.maxTouchPoints > 1 && mq("(any-pointer: coarse)")) return true;
    return false;
  }

  function isCompactNav() {
    // Phones / small tablets in portrait (touch)
    if (mq("(max-width: 900px) and (orientation: portrait) and (hover: none)")) return true;
    // Narrow portrait (covers odd hover reporting)
    if (mq("(max-width: 480px) and (orientation: portrait)")) return true;
    // Touch tablets / phones in landscape — any-pointer catches trackpad+touch combos
    if (
      mq("(max-width: " + TABLET_LANDSCAPE_MAX + "px) and (orientation: landscape) and (any-pointer: coarse)")
    ) {
      return true;
    }
    // iPadOS desktop-UA fallback: ignore hover/pointer media features entirely
    if (
      isTouchTablet() &&
      mq("(orientation: landscape)") &&
      window.innerWidth <= TABLET_LANDSCAPE_MAX
    ) {
      return true;
    }
    return false;
  }

  function syncNavCompact() {
    var compact = isCompactNav();
    document.documentElement.classList.toggle("nav-compact", compact);
    document.documentElement.classList.toggle("is-touch-tablet", isTouchTablet());
    return compact;
  }

  syncNavCompact();

  window.__riichiNavBoot = {
    isCompactNav: isCompactNav,
    isTouchTablet: isTouchTablet,
    isAppleTouchDevice: isAppleTouchDevice,
    syncNavCompact: syncNavCompact,
    TABLET_LANDSCAPE_MAX: TABLET_LANDSCAPE_MAX,
  };
})();
