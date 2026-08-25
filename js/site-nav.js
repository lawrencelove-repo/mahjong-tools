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

  const RULES_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
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
    return file.endsWith("_rules.html") || Object.values(RULES_PAGES).includes(file);
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

  function injectRulesLink(actions) {
    if (!actions || actions.querySelector("[data-nav-rules]")) return;
    if (isRulesPage()) return;
    const id = currentRulesetId();
    const href = RULES_PAGES[id];
    if (!href) return;

    const a = document.createElement("a");
    a.href = href;
    a.className = "icon-btn";
    a.dataset.navRules = "1";
    a.setAttribute("aria-label", "Rules");
    a.title = "Rules";
    a.innerHTML = `<span class="site-menu-action-label">Rules</span>${RULES_ICON}`;

    const settings = actions.querySelector("#btn-settings");
    if (settings && settings.nextSibling) {
      actions.insertBefore(a, settings.nextSibling);
    } else if (settings) {
      settings.insertAdjacentElement("afterend", a);
    } else {
      actions.insertBefore(a, actions.firstChild);
    }
  }

  const COMPACT_MQ =
    "(max-width: 900px) and (orientation: portrait) and (hover: none), (max-width: 480px) and (orientation: portrait)";

  function isCompactNav() {
    return window.matchMedia(COMPACT_MQ).matches;
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
  }

  function syncMenuVisibility() {
    const menu = document.getElementById("site-menu");
    const toolbar = document.querySelector("header.toolbar");
    const btn = document.getElementById("btn-menu");
    const compact = isCompactNav();
    document.documentElement.classList.toggle("nav-compact", compact);
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

  function init() {
    if (document.body?.classList.contains("landing-page")) return;
    const toolbar = document.querySelector("header.toolbar");
    const menu = document.getElementById("site-menu");
    const btn = document.getElementById("btn-menu");
    if (!toolbar || !menu || !btn) return;

    fillRulesetNav(menu.querySelector(".site-menu-rulesets"));
    injectRulesLink(menu.querySelector(".toolbar-actions"));

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

    const mq = window.matchMedia(COMPACT_MQ);
    const onMq = () => syncMenuVisibility();
    if (mq.addEventListener) mq.addEventListener("change", onMq);
    else mq.addListener(onMq);
    window.addEventListener("resize", syncMenuVisibility);
    window.addEventListener("orientationchange", () => {
      setTimeout(syncMenuVisibility, 50);
    });
    syncMenuVisibility();
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

  window.SiteNav = { setMenuOpen, isCompactNav, syncMenuVisibility };
})();
