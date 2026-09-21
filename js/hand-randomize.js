/**
 * Shared hand-example randomization for Riichi / HK / Filipino cheatsheets.
 * Remaps bam/crak/dot suits while preserving numbers, honors, flowers, and structure.
 * NMJL uses nmjl-randomize.js for note-aware rules; this module also provides refresh UI helpers.
 */
(function () {
  const SUITS = ["B", "C", "P"];

  const REFRESH_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>';

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function uniq(arr) {
    return [...new Set(arr)];
  }

  /** Suit letter in a standard tiles.js token (123P, 5Pr, 8C, …). */
  function tokenSuit(tok) {
    if (!tok || tok === "|") return null;
    const m = tok.match(/^([0-9]+)([BCP])(r)?$/i);
    return m ? m[2].toUpperCase() : null;
  }

  function mapToken(tok, suitMap) {
    if (!tok || tok === "|") return tok;
    const m = tok.match(/^([0-9]+)([BCP])(r)?$/i);
    if (!m) return tok;
    const suit = suitMap[m[2].toUpperCase()] || m[2].toUpperCase();
    return `${m[1]}${suit}${m[3] || ""}`;
  }

  function buildSuitMap(usedSuits) {
    const from = uniq(usedSuits);
    if (!from.length) return {};
    let dest;
    if (from.length === 1) {
      // Always pick a different suit so refresh visibly changes one-suit hands
      dest = [shuffle(SUITS.filter((s) => s !== from[0]))[0]];
    } else if (from.length === 3) {
      dest = shuffle(SUITS);
      // Avoid rare identity permutation
      if (from.every((s, i) => s === dest[i])) dest = [dest[1], dest[2], dest[0]];
    } else {
      dest = shuffle(SUITS).slice(0, from.length);
      if (from.every((s, i) => s === dest[i])) dest = dest.slice().reverse();
    }
    /** @type {Record<string, string>} */
    const map = {};
    from.forEach((s, i) => {
      map[s] = dest[i];
    });
    return map;
  }

  /**
   * Randomize suits in a hand notation string. Honors / flowers / breaks unchanged.
   * @param {string} notation
   * @returns {string}
   */
  function randomizeSuits(notation) {
    if (!notation || !notation.trim()) return notation;
    const tokens = notation.trim().split(/\s+/);
    const used = [];
    for (const t of tokens) {
      const s = tokenSuit(t);
      if (s) used.push(s);
    }
    const suitMap = buildSuitMap(used);
    if (!Object.keys(suitMap).length) return notation;
    return tokens.map((t) => mapToken(t, suitMap)).join(" ");
  }

  /**
   * @param {() => void} onClick
   * @returns {HTMLButtonElement}
   */
  function createRefreshButton(onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rules-meld-refresh yaku-hand-refresh no-print";
    btn.setAttribute("aria-label", "Randomize hand example");
    btn.title = "Randomize";
    btn.innerHTML = REFRESH_SVG;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }

  /**
   * Attach refresh control + click-to-reroll on an examples host when enabled.
   * @param {{
   *   head: HTMLElement,
   *   host: HTMLElement,
   *   enabled: boolean,
   *   onRefresh: () => void,
   * }} opts
   */
  function attachRefresh({ head, host, enabled, onRefresh }) {
    host.classList.add("yaku-hand-examples");
    if (!enabled) {
      host.removeAttribute("tabindex");
      host.removeAttribute("role");
      host.removeAttribute("aria-label");
      host.classList.remove("is-randomizable");
      return;
    }
    host.classList.add("is-randomizable");
    host.tabIndex = 0;
    host.setAttribute("role", "button");
    host.setAttribute("aria-label", "Randomize hand example");
    head.appendChild(createRefreshButton(onRefresh));
    host.addEventListener("click", onRefresh);
    host.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRefresh();
      }
    });
  }

  window.HAND_RANDOMIZE = {
    REFRESH_SVG,
    randomizeSuits,
    createRefreshButton,
    attachRefresh,
  };
})();
