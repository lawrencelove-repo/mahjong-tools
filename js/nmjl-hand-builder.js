/**
 * NMJL hand builder — pick 14 tiles (plus optional alternates), copy JS for nmjl-data.js
 * Hand racks may include "|" break markers for meld splits.
 */

(function () {
  const HAND_SIZE = 14;
  const BREAK = "|";

  const PALETTE = [
    { label: "Bam", tiles: ["1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B"] },
    { label: "Crak", tiles: ["1C", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C"] },
    { label: "Dot", tiles: ["1P", "2P", "3P", "4P", "5P", "6P", "7P", "8P", "9P"] },
    { label: "Winds (NEWS)", tiles: ["NW", "EW", "WW", "SW"] },
    { label: "Dragons", tiles: ["RD", "BD", "PD"] },
    { label: "Soap", tiles: ["0B", "0C", "0P"] },
    { label: "Extras", tiles: ["F", "J"] },
  ];

  let settings = AppSettings.loadSettings();
  /** @type {string[][]} — tile ids and optional "|" breaks */
  let variants = [[]];
  let activeIndex = 0;

  const $ = (sel) => document.querySelector(sel);

  function tileOpts() {
    return {
      rankLabels: settings.rankLabels || "hover",
      nmjlText: true,
    };
  }

  function maxCopies(id) {
    if (id === "F" || id === "J" || /^F[1-8]$/.test(id)) return 8;
    if (/^0[BCP]?$/.test(id)) return 6;
    return 6;
  }

  function activeHand() {
    return variants[activeIndex];
  }

  function isBreak(tok) {
    return tok === BREAK;
  }

  function tileCount(hand) {
    return hand.filter((t) => !isBreak(t)).length;
  }

  function countInHand(hand, id) {
    return hand.filter((t) => t === id).length;
  }

  function allComplete() {
    return variants.length > 0 && variants.every((h) => tileCount(h) === HAND_SIZE);
  }

  /**
   * Compact one meld group (no "|" tokens).
   * @param {string[]} ids
   */
  function compactGroup(ids) {
    const parts = [];
    let i = 0;
    while (i < ids.length) {
      if (
        i + 4 <= ids.length &&
        ids[i] === "NW" &&
        ids[i + 1] === "EW" &&
        ids[i + 2] === "WW" &&
        ids[i + 3] === "SW"
      ) {
        parts.push("NEWS");
        i += 4;
        continue;
      }

      const year = matchDigitRun(ids, i);
      if (year) {
        parts.push(year.token);
        i = year.next;
        continue;
      }

      let j = i + 1;
      while (j < ids.length && ids[j] === ids[i]) j += 1;
      const n = j - i;
      const id = ids[i];
      if (n === 1) {
        parts.push(id);
      } else if (/^[1-9][BCP]$/.test(id) && n === 2) {
        parts.push(`${id[0]}${id[0]}${id[1]}`);
      } else if (/^0[BCP]$/.test(id) && n >= 2) {
        parts.push(`${"0".repeat(n)}${id[1]}`);
      } else {
        parts.push(`${id}*${n}`);
      }
      i = j;
    }
    return parts.join(" | ");
  }

  /**
   * @param {string[]} tokens tiles and optional "|"
   */
  function compactTiles(tokens) {
    const groups = [];
    let cur = [];
    for (const tok of tokens) {
      if (isBreak(tok)) {
        if (cur.length) {
          groups.push(compactGroup(cur));
          cur = [];
        }
        continue;
      }
      cur.push(tok);
    }
    if (cur.length) groups.push(compactGroup(cur));
    return groups.join(" | ");
  }

  /** Digit/soap runs like 2026B / 2468P — only single consecutive non-repeated tiles */
  function matchDigitRun(ids, start) {
    const first = ids[start].match(/^([0-9])([BCP])$/);
    if (!first) return null;
    const suit = first[2];
    let digits = first[1];
    let j = start + 1;
    while (j < ids.length && j - start < 5) {
      if (ids[j] === ids[j - 1]) break;
      const m = ids[j].match(/^([0-9])([BCP])$/);
      if (!m || m[2] !== suit) break;
      digits += m[1];
      j += 1;
    }
    if (j - start >= 3) return { token: `${digits}${suit}`, next: j };
    return null;
  }

  function escapeJsString(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  /** 2468-h → 2468-i; 2468-z → 2468-aa; 2026-9 → 2026-10 */
  function nextId(id) {
    const raw = String(id || "").trim();
    if (!raw) return "new-hand-b";

    const letter = raw.match(/^(.*-)([a-z])$/i);
    if (letter) {
      const prefix = letter[1];
      const ch = letter[2];
      const upper = ch === ch.toUpperCase() && ch !== ch.toLowerCase();
      const code = ch.toLowerCase().charCodeAt(0);
      if (code >= 97 && code < 122) {
        const next = String.fromCharCode(code + 1);
        return prefix + (upper ? next.toUpperCase() : next);
      }
      return prefix + (upper ? "AA" : "aa");
    }

    const num = raw.match(/^(.*-)(\d+)$/);
    if (num) return num[1] + String(Number(num[2]) + 1);

    return `${raw}-b`;
  }

  function buildSnippet() {
    const id = ($("#nb-id").value || "").trim() || "new-hand";
    const valueRaw = ($("#nb-value").value || "").trim();
    const value = valueRaw === "" ? 25 : Number(valueRaw);
    const concealed = $("#nb-concealed").checked;
    const note = ($("#nb-note").value || "").trim();
    const compacted = variants.map((h) => compactTiles(h));

    const lines = ["            {"];
    lines.push(`              id: "${escapeJsString(id)}",`);
    if (compacted.length === 1) {
      lines.push(`              tiles: "${escapeJsString(compacted[0])}",`);
    } else {
      lines.push("              tiles: [");
      for (const t of compacted) {
        lines.push(`                "${escapeJsString(t)}",`);
      }
      lines.push("              ],");
    }
    lines.push(`              value: ${Number.isFinite(value) ? value : 25},`);
    if (concealed) lines.push("              concealed: true,");
    if (note) lines.push(`              note: "${escapeJsString(note)}",`);
    lines.push("            },");
    return lines.join("\n");
  }

  function renderTileButton(id, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hv-tile-btn";
    btn.appendChild(
      Tiles.renderTile(
        id,
        settings.tileStyle || "traditional",
        settings.rankLabels || "hover",
        tileOpts()
      )
    );
    btn.title = id;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function renderBreakButton(onClick, title = "Meld split — click to remove") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hv-tile-btn nb-break-btn";
    btn.textContent = "|";
    btn.title = title;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function renderPalette() {
    const paletteEl = $("#nb-palette");
    paletteEl.replaceChildren();
    for (const row of PALETTE) {
      const line = document.createElement("div");
      line.className = "tile-key-row";
      const lab = document.createElement("span");
      lab.className = "tile-key-label";
      lab.textContent = row.label;
      const tiles = document.createElement("div");
      tiles.className = "hv-palette-tiles";
      for (const id of row.tiles) {
        tiles.appendChild(renderTileButton(id, () => addTile(id)));
      }
      tiles.appendChild(renderBreakButton((e) => {
        e.stopPropagation();
        addSplit();
      }, "Add meld split (|)"));
      line.append(lab, tiles);
      paletteEl.appendChild(line);
    }
  }

  function renderRacks() {
    const root = $("#nb-racks");
    root.replaceChildren();

    variants.forEach((hand, vi) => {
      if (vi > 0) {
        const or = document.createElement("div");
        or.className = "nmjl-or";
        or.textContent = "-or-";
        root.appendChild(or);
      }

      const block = document.createElement("div");
      block.className = "nb-rack" + (vi === activeIndex ? " is-active" : "");
      block.dataset.index = String(vi);

      const label = document.createElement("div");
      label.className = "hv-rack-label";
      const title = vi === 0 ? "Hand" : `Alternate ${vi}`;
      const n = tileCount(hand);
      label.innerHTML = `${title} <span class="hv-count">${n} / ${HAND_SIZE}</span>`;
      if (vi === activeIndex) {
        const mark = document.createElement("span");
        mark.className = "nb-active-mark";
        mark.textContent = " · active";
        label.appendChild(mark);
      }

      const handEl = document.createElement("div");
      handEl.className = "hv-hand";
      hand.forEach((tok, i) => {
        const onRemove = (e) => {
          e.stopPropagation();
          hand.splice(i, 1);
          activeIndex = vi;
          refresh();
        };
        if (isBreak(tok)) {
          handEl.appendChild(renderBreakButton(onRemove));
        } else {
          handEl.appendChild(renderTileButton(tok, onRemove));
        }
      });

      block.append(label, handEl);
      block.addEventListener("click", () => {
        if (activeIndex !== vi) {
          activeIndex = vi;
          setStatus(`Editing ${vi === 0 ? "primary hand" : `alternate ${vi}`}.`);
          refresh();
        }
      });
      root.appendChild(block);
    });

    $("#nb-generate").disabled = !allComplete();
    $("#nb-remove-alt").disabled = variants.length < 2 || activeIndex === 0;
    updateSplitButton();
  }

  function updateSplitButton() {
    const btn = $("#nb-add-split");
    if (!btn) return;
    const hand = activeHand();
    const n = tileCount(hand);
    const last = hand[hand.length - 1];
    btn.disabled = n === 0 || n >= HAND_SIZE || isBreak(last);
  }

  function addTile(id) {
    const hand = activeHand();
    if (tileCount(hand) >= HAND_SIZE) {
      setStatus(`Active hand is full (${HAND_SIZE}). Select another rack or remove a tile.`);
      return;
    }
    if (countInHand(hand, id) >= maxCopies(id)) {
      setStatus(`Already have ${maxCopies(id)}× ${id} in the active hand.`);
      return;
    }
    hand.push(id);
    setStatus("");
    refresh();
  }

  function addSplit() {
    const hand = activeHand();
    const n = tileCount(hand);
    const last = hand[hand.length - 1];
    if (n === 0) {
      setStatus("Add tiles before a split.");
      return;
    }
    if (n >= HAND_SIZE) {
      setStatus("Hand is already full.");
      return;
    }
    if (isBreak(last)) {
      setStatus("Split already at the end.");
      return;
    }
    hand.push(BREAK);
    setStatus("Split added — next tiles start a new meld group.");
    refresh();
  }

  function addAlternate() {
    variants.push([]);
    activeIndex = variants.length - 1;
    setStatus(`Added alternate ${activeIndex}. Click Key tiles to fill it.`);
    refresh();
  }

  function removeActiveAlternate() {
    if (variants.length < 2 || activeIndex === 0) {
      setStatus("Cannot remove the primary hand.");
      return;
    }
    variants.splice(activeIndex, 1);
    activeIndex = Math.min(activeIndex, variants.length - 1);
    setStatus("Removed alternate.");
    refresh();
  }

  function clearAll() {
    const usedId = ($("#nb-id").value || "").trim() || "new-hand";
    $("#nb-id").value = nextId(usedId);
    variants = [[]];
    activeIndex = 0;
    $("#nb-output").value = "";
    setStatus(`Cleared — id advanced to ${$("#nb-id").value}.`);
    refresh();
  }

  async function generate() {
    if (!allComplete()) {
      const incomplete = variants
        .map((h, i) => (tileCount(h) === HAND_SIZE ? null : i))
        .filter((i) => i != null);
      setStatus(
        `Each version needs ${HAND_SIZE} tiles. Incomplete: ${incomplete
          .map((i) => (i === 0 ? "Hand" : `Alt ${i}`))
          .join(", ")}.`
      );
      return;
    }
    // Drop trailing splits before export
    for (const h of variants) {
      while (h.length && isBreak(h[h.length - 1])) h.pop();
    }
    const snippet = buildSnippet();
    $("#nb-output").value = snippet;
    try {
      await navigator.clipboard.writeText(snippet);
      setStatus("Copied to clipboard — paste into nmjl-data.js.");
    } catch {
      $("#nb-output").focus();
      $("#nb-output").select();
      setStatus("Generated — select the snippet and copy manually (clipboard blocked).");
    }
    refresh();
  }

  function setStatus(msg) {
    $("#nb-status").textContent = msg || "";
  }

  function refresh() {
    renderRacks();
  }

  function remountTiles() {
    document.body.dataset.tileStyle = settings.tileStyle;
    document.body.dataset.rankLabels = settings.rankLabels;
    renderPalette();
    renderRacks();
  }

  function syncChrome() {
    document.body.dataset.tileStyle = settings.tileStyle;
    document.body.dataset.rankLabels = settings.rankLabels || "hover";
    $("#tile-style").value = settings.tileStyle;
    $("#rank-labels").value = settings.rankLabels || "hover";
  }

  document.addEventListener("DOMContentLoaded", () => {
    AppSettings.bindTileStyleSelect($("#tile-style"), (style, saved) => {
      Object.assign(settings, saved);
      settings.tileStyle = style;
      remountTiles();
    });

    $("#rank-labels").value = settings.rankLabels || "hover";
    document.body.dataset.rankLabels = settings.rankLabels || "hover";

    $("#rank-labels").addEventListener("change", (e) => {
      settings.rankLabels = e.target.value;
      Object.assign(settings, AppSettings.saveSettings(settings));
      remountTiles();
    });

    syncChrome();
    renderPalette();
    renderRacks();

    $("#nb-add-split").addEventListener("click", addSplit);
    $("#nb-add-alt").addEventListener("click", addAlternate);
    $("#nb-remove-alt").addEventListener("click", removeActiveAlternate);
    $("#nb-clear").addEventListener("click", clearAll);
    $("#nb-generate").addEventListener("click", generate);
  });
})();
