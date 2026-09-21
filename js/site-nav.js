/**
 * Shared toolbar menu: hamburger (mobile), ruleset links, scale host wiring.
 */

(function () {
  const RULESETS = [
    {
      href: "riichi.html",
      id: "riichi",
      title: "Riichi",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <text x="12" y="18.5" text-anchor="middle" fill="currentColor" font-size="20" font-weight="700"
          font-family="Georgia, 'Noto Serif CJK JP', 'Yu Mincho', 'Hiragino Mincho ProN', 'Songti SC', serif">中</text>
      </svg>`,
    },
    {
      href: "nmjl.html",
      id: "nmjl",
      title: "American",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">
          <rect x="2" y="4.5" width="20" height="15" rx="1"/>
        </g>
        <g stroke="currentColor" stroke-width="1.15">
          <path d="M2 7.1h20"/><path d="M2 9.3h20"/><path d="M11 11.5h11"/>
          <path d="M2 13.7h20"/><path d="M2 15.9h20"/><path d="M2 18.1h20"/>
        </g>
        <rect x="2" y="4.5" width="9" height="7" fill="currentColor"/>
        <g fill="var(--paper, #fff)">
          <circle cx="4" cy="6.2" r="0.55"/><circle cx="6.5" cy="6.2" r="0.55"/><circle cx="9" cy="6.2" r="0.55"/>
          <circle cx="5.25" cy="7.85" r="0.55"/><circle cx="7.75" cy="7.85" r="0.55"/>
          <circle cx="4" cy="9.5" r="0.55"/><circle cx="6.5" cy="9.5" r="0.55"/><circle cx="9" cy="9.5" r="0.55"/>
        </g>
      </svg>`,
    },
    {
      href: "hk.html",
      id: "hk",
      title: "Hong Kong",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <g fill="currentColor">
          <path d="M12 12c-1.4-2.2-2.6-5.2-1.7-7.1C11.1 3.2 12.9 3.2 13.7 4.9 14.6 6.8 13.4 9.8 12 12z"/>
          <path d="M12 12c-1.4-2.2-2.6-5.2-1.7-7.1C11.1 3.2 12.9 3.2 13.7 4.9 14.6 6.8 13.4 9.8 12 12z" transform="rotate(72 12 12)"/>
          <path d="M12 12c-1.4-2.2-2.6-5.2-1.7-7.1C11.1 3.2 12.9 3.2 13.7 4.9 14.6 6.8 13.4 9.8 12 12z" transform="rotate(144 12 12)"/>
          <path d="M12 12c-1.4-2.2-2.6-5.2-1.7-7.1C11.1 3.2 12.9 3.2 13.7 4.9 14.6 6.8 13.4 9.8 12 12z" transform="rotate(216 12 12)"/>
          <path d="M12 12c-1.4-2.2-2.6-5.2-1.7-7.1C11.1 3.2 12.9 3.2 13.7 4.9 14.6 6.8 13.4 9.8 12 12z" transform="rotate(288 12 12)"/>
          <circle cx="12" cy="12" r="2"/>
        </g>
      </svg>`,
    },
    {
      href: "filipino.html",
      id: "filipino",
      title: "Filipino",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <g fill="currentColor">
          <circle cx="12" cy="12" r="3.55"/>
          <g>
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
          <g transform="rotate(45 12 12)">
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
          <g transform="rotate(90 12 12)">
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
          <g transform="rotate(135 12 12)">
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
          <g transform="rotate(180 12 12)">
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
          <g transform="rotate(225 12 12)">
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
          <g transform="rotate(270 12 12)">
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
          <g transform="rotate(315 12 12)">
            <rect x="10.05" y="2.55" width="0.75" height="5.35"/>
            <rect x="13.2" y="2.55" width="0.75" height="5.35"/>
            <path d="M11.45 8V3.05L12 1.25L12.55 3.05V8Z"/>
          </g>
        </g>
      </svg>`,
    },
  ];

  const RULES_PAGES = {
    riichi: "riichi_rules.html",
    nmjl: "nmjl_rules.html",
    hk: "hk_rules.html",
    filipino: "filipino_rules.html",
  };

  const QUICK_START_PAGES = {
    filipino: "filipino-quick-start.html",
  };

  const RULES_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>`;

  const QUICK_START_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
  </svg>`;

  function currentRulesetId() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    if (file.includes("nmjl")) return "nmjl";
    if (file.includes("filipino")) return "filipino";
    if (file.includes("hk")) return "hk";
    if (file.includes("riichi") || file === "" || file === "index.html") return "riichi";
    return "";
  }

  function isRulesPage() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return (
      file.endsWith("_rules.html") ||
      file.includes("quick-start") ||
      Object.values(RULES_PAGES).includes(file) ||
      Object.values(QUICK_START_PAGES).includes(file)
    );
  }

  function isQuickStartPage() {
    const file = (location.pathname.split("/").pop() || "").toLowerCase();
    return file.includes("quick-start") || Object.values(QUICK_START_PAGES).includes(file);
  }

  function currentCheatsheetFile() {
    return (location.pathname.split("/").pop() || "").toLowerCase();
  }

  function isOnCheatsheet(rulesetId) {
    const file = currentCheatsheetFile();
    const href = (RULESETS.find((r) => r.id === rulesetId)?.href || "").toLowerCase();
    return !!href && file === href;
  }

  function fillRulesetNav(nav) {
    if (!nav || nav.dataset.ready === "1") return;
    const current = currentRulesetId();
    nav.innerHTML = RULESETS.map((r) => {
      const active = r.id === current;
      return `<a class="site-menu-link${active ? " is-current" : ""}" href="${r.href}"${
        active ? ' aria-current="page"' : ""
      }><span>${r.title}</span><span class="site-menu-link-icon">${r.icon}</span></a>`;
    }).join("");
    nav.dataset.ready = "1";
  }

  /**
   * Desktop-only ruleset glyph on the far right; expands to the four style links.
   * Hidden when compact (hamburger) nav is active.
   */
  function injectDesktopRulesetSwitcher(toolbar) {
    if (!toolbar || toolbar.querySelector("[data-desktop-ruleset-switcher]")) return;

    const currentId = currentRulesetId();
    const current = RULESETS.find((r) => r.id === currentId) || RULESETS[0];

    const wrap = document.createElement("div");
    wrap.className = "ruleset-switcher no-print";
    wrap.dataset.desktopRulesetSwitcher = "1";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-ruleset-switcher";
    btn.className = "icon-btn ruleset-switcher-btn";
    btn.setAttribute("aria-label", `Ruleset: ${current.title}. Switch ruleset`);
    btn.title = current.title;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-controls", "ruleset-switcher-menu");
    btn.innerHTML = `<span class="ruleset-switcher-glyph" aria-hidden="true">${current.icon}</span>`;

    const menu = document.createElement("nav");
    menu.id = "ruleset-switcher-menu";
    menu.className = "ruleset-switcher-menu";
    menu.setAttribute("aria-label", "Rulesets");
    menu.hidden = true;
    menu.innerHTML = RULESETS.map((r) => {
      const onSheet = isOnCheatsheet(r.id);
      const isCurrentStyle = r.id === currentId;
      const cls = [
        "site-menu-link",
        "ruleset-switcher-link",
        isCurrentStyle ? "is-current" : "",
      ]
        .filter(Boolean)
        .join(" ");
      if (onSheet) {
        return `<span class="${cls}" aria-current="page"><span>${r.title}</span><span class="site-menu-link-icon">${r.icon}</span></span>`;
      }
      return `<a class="${cls}" href="${r.href}"><span>${r.title}</span><span class="site-menu-link-icon">${r.icon}</span></a>`;
    }).join("");

    wrap.append(btn, menu);
    const title = toolbar.querySelector(".toolbar-main h1, h1");
    const main = toolbar.querySelector(".toolbar-main");
    if (title?.parentElement) {
      title.parentElement.insertBefore(wrap, title);
    } else if (main?.firstChild) {
      main.insertBefore(wrap, main.firstChild);
    } else {
      toolbar.insertBefore(wrap, toolbar.firstChild);
    }

    const setOpen = (open) => {
      wrap.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!wrap.classList.contains("is-open"));
    });

    menu.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest("a.ruleset-switcher-link")) setOpen(false);
    });

    document.addEventListener("pointerdown", (e) => {
      if (!wrap.classList.contains("is-open")) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (wrap.contains(t)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && wrap.classList.contains("is-open")) setOpen(false);
    });
  }

  function injectNavAction(actions, { datasetKey, href, label, iconHtml, skipIf }) {
    if (!actions || actions.querySelector(`[${datasetKey}]`)) return;
    if (skipIf?.()) return;
    if (!href) return;

    const a = document.createElement("a");
    a.href = href;
    a.className = "icon-btn";
    a.setAttribute(datasetKey, "1");
    if (label === "Quick Start" && isQuickStartPage()) a.classList.add("is-current");
    if (label === "Rules" && isRulesPage() && !isQuickStartPage()) a.classList.add("is-current");
    a.setAttribute("aria-label", label);
    a.title = label;
    a.innerHTML = `<span class="site-menu-action-label">${label}</span>${iconHtml}`;

    const settings = actions.querySelector("#btn-settings");
    if (settings && settings.nextSibling) {
      actions.insertBefore(a, settings.nextSibling);
    } else if (settings) {
      settings.insertAdjacentElement("afterend", a);
    } else {
      actions.insertBefore(a, actions.firstChild);
    }
  }

  function injectRulesLink(actions) {
    const id = currentRulesetId();
    injectNavAction(actions, {
      datasetKey: "data-nav-rules",
      href: RULES_PAGES[id],
      label: "Rules",
      iconHtml: RULES_ICON,
      skipIf: () => isRulesPage() && !isQuickStartPage(),
    });
  }

  function injectQuickStartLink(actions) {
    const id = currentRulesetId();
    injectNavAction(actions, {
      datasetKey: "data-nav-quick-start",
      href: QUICK_START_PAGES[id],
      label: "Quick Start",
      iconHtml: QUICK_START_ICON,
      skipIf: () => isQuickStartPage() || !QUICK_START_PAGES[id],
    });
  }

  const PRINT_FRIENDLY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
  </svg>`;

  /** @type {null | (() => void)} */
  let printRerender = null;

  function registerPrintRerender(fn) {
    printRerender = typeof fn === "function" ? fn : null;
  }

  function runPrintFriendly() {
    const body = document.body;
    if (!body || !document.getElementById("print-sheet")) return;

    const prevAllow = body.dataset.allowPage2;
    body.dataset.printFriendly = "true";
    body.dataset.allowPage2 = "true";

    let pageStyle = document.getElementById("print-friendly-page-style");
    if (!pageStyle) {
      pageStyle = document.createElement("style");
      pageStyle.id = "print-friendly-page-style";
      document.head.appendChild(pageStyle);
    }
    // Letter, no forced orientation — print dialog chooses portrait or landscape
    pageStyle.textContent = "@media print { @page { size: letter; margin: 0.25in; } }";

    try {
      printRerender?.();
    } catch (_) {
      /* keep going to print */
    }

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      window.clearTimeout(fallback);
      delete body.dataset.printFriendly;
      if (prevAllow !== undefined) body.dataset.allowPage2 = prevAllow;
      else delete body.dataset.allowPage2;
      pageStyle.remove();
      try {
        printRerender?.();
      } catch (_) {
        /* ignore */
      }
    };

    const fallback = window.setTimeout(cleanup, 120000);
    window.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(() => window.print(), 40);
  }

  function injectPrintFriendly(actions) {
    if (!actions || actions.querySelector("[data-nav-print-friendly]")) return;
    const printBtn = actions.querySelector("#btn-print");
    if (!printBtn) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-print-friendly";
    btn.className = "icon-btn";
    btn.dataset.navPrintFriendly = "1";
    btn.setAttribute("aria-label", "Printer-friendly");
    btn.title = "Printer-friendly";
    btn.innerHTML = `<span class="site-menu-action-label">Printer-friendly</span>${PRINT_FRIENDLY_ICON}`;
    printBtn.insertAdjacentElement("afterend", btn);
    btn.addEventListener("click", () => {
      if (burgerIsVisible(document.getElementById("btn-menu"))) setMenuOpen(false);
      runPrintFriendly();
    });
  }

  // Compact layout is driven by html.nav-compact (see js/nav-boot.js + css/styles.css)
  const boot = window.__riichiNavBoot;

  function isCompactNav() {
    if (boot && typeof boot.isCompactNav === "function") return boot.isCompactNav();
    // Fallback if nav-boot.js did not load
    try {
      if (window.matchMedia("(max-width: 900px) and (orientation: portrait) and (hover: none)").matches) {
        return true;
      }
      if (window.matchMedia("(max-width: 480px) and (orientation: portrait)").matches) return true;
      if (
        window.matchMedia("(max-width: 1600px) and (orientation: landscape) and (any-pointer: coarse)")
          .matches
      ) {
        return true;
      }
    } catch (e) {
      /* ignore */
    }
    const appleTouch =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      (/Macintosh|Mac OS X/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    return (
      appleTouch &&
      window.matchMedia("(orientation: landscape)").matches &&
      window.innerWidth <= 1600
    );
  }

  function burgerIsVisible(btn) {
    if (!btn) return false;
    const style = window.getComputedStyle(btn);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function setMenuOpen(open) {
    const toolbar = document.querySelector("header.toolbar");
    const btn = document.getElementById("btn-menu");
    const menu = document.getElementById("site-menu");
    if (!toolbar || !btn || !menu) return;

    // Compact panel mode only when the hamburger is shown by CSS
    if (!burgerIsVisible(btn)) {
      menu.removeAttribute("hidden");
      toolbar.classList.remove("is-menu-open");
      btn.setAttribute("aria-expanded", "false");
      return;
    }

    toolbar.classList.toggle("is-menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    if (open) menu.removeAttribute("hidden");
    else menu.setAttribute("hidden", "");
    requestAnimationFrame(syncToolbarHeight);
  }

  function syncMenuVisibility() {
    const menu = document.getElementById("site-menu");
    const toolbar = document.querySelector("header.toolbar");
    const btn = document.getElementById("btn-menu");
    const compact =
      boot && typeof boot.syncNavCompact === "function" ? boot.syncNavCompact() : isCompactNav();
    if (!(boot && typeof boot.syncNavCompact === "function")) {
      document.documentElement.classList.toggle("nav-compact", compact);
    }
    if (!menu) return;

    if (compact) {
      const open = toolbar?.classList.contains("is-menu-open");
      if (open) menu.removeAttribute("hidden");
      else menu.setAttribute("hidden", "");
    } else {
      menu.removeAttribute("hidden");
      toolbar?.classList.remove("is-menu-open");
      btn?.setAttribute("aria-expanded", "false");
    }
  }

  function syncToolbarHeight() {
    const toolbar = document.querySelector("header.toolbar");
    if (!toolbar) return;
    const h = Math.ceil(toolbar.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--toolbar-height", `${h}px`);
  }

  function init() {
    if (document.body?.classList.contains("landing-page")) return;
    const toolbar = document.querySelector("header.toolbar");
    const menu = document.getElementById("site-menu");
    const btn = document.getElementById("btn-menu");
    if (!toolbar || !menu || !btn) return;

    syncToolbarHeight();
    fillRulesetNav(menu.querySelector(".site-menu-rulesets"));
    injectRulesLink(menu.querySelector(".toolbar-actions"));
    injectQuickStartLink(menu.querySelector(".toolbar-actions"));
    injectPrintFriendly(menu.querySelector(".toolbar-actions"));
    injectDesktopRulesetSwitcher(toolbar);
    syncToolbarHeight();

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!burgerIsVisible(btn)) return;
      setMenuOpen(!toolbar.classList.contains("is-menu-open"));
    });

    menu.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest("a.site-menu-link, .toolbar-actions a, .toolbar-actions button")) {
        if (burgerIsVisible(btn)) setMenuOpen(false);
      }
    });

    document.getElementById("btn-settings")?.addEventListener("click", () => {
      if (burgerIsVisible(btn)) setMenuOpen(false);
      requestAnimationFrame(syncToolbarHeight);
    });

    document.addEventListener("pointerdown", (e) => {
      if (!toolbar.classList.contains("is-menu-open")) return;
      if (!burgerIsVisible(btn)) return;
      const t = e.target;
      if (!(t instanceof Node)) return;
      if (menu.contains(t) || btn.contains(t)) return;
      setMenuOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toolbar.classList.contains("is-menu-open")) {
        setMenuOpen(false);
      }
    });

    const onMq = () => {
      syncMenuVisibility();
      syncToolbarHeight();
    };
    const mqQueries = [
      "(orientation: landscape)",
      "(orientation: portrait)",
      "(any-pointer: coarse)",
      "(hover: none)",
      "(max-width: 900px)",
      "(max-width: 480px)",
      "(max-width: 1600px)",
    ];
    for (const q of mqQueries) {
      try {
        const mq = window.matchMedia(q);
        if (mq.addEventListener) mq.addEventListener("change", onMq);
        else mq.addListener(onMq);
      } catch (e) {
        /* ignore */
      }
    }
    window.addEventListener("resize", () => {
      syncMenuVisibility();
      syncToolbarHeight();
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        syncMenuVisibility();
        syncToolbarHeight();
      }, 50);
    });
    syncMenuVisibility();
    syncToolbarHeight();
    initBackToTop();
  }

  function initBackToTop() {
    if (document.getElementById("btn-back-to-top")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-back-to-top";
    btn.className = "back-to-top no-print";
    btn.setAttribute("aria-label", "Back to top");
    btn.setAttribute("aria-hidden", "true");
    btn.tabIndex = -1;
    btn.title = "Back to top";
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5"/>
        <path d="M5 12l7-7 7 7"/>
      </svg>
      <span>TOP</span>
    `;
    document.body.appendChild(btn);

    const SHOW_AFTER = 320;
    let ticking = false;

    const sync = () => {
      const show = window.scrollY > SHOW_AFTER;
      btn.classList.toggle("is-visible", show);
      btn.setAttribute("aria-hidden", show ? "false" : "true");
      btn.tabIndex = show ? 0 : -1;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(sync);
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    sync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.SiteNav = {
    setMenuOpen,
    isCompactNav,
    syncMenuVisibility,
    registerPrintRerender,
    runPrintFriendly,
  };
})();
