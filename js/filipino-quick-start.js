/**
 * Filipino Quick Start — setup, wall, tiles, melds, winning hands, full tileset.
 */
(function () {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const SUITS = ["B", "C", "P"];
  const JOKER_IDS = ["J1", "J2", "J"];
  const WINDS = ["EW", "SW", "WW", "NW"];
  const DRAGONS = ["WD", "GD", "RD"];
  const FLOWER_IDS = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"];

  const CLAIM_ARROW_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>';

  function setSettingsOpen(open) {
    const panel = $("#settings-panel");
    const btn = $("#btn-settings");
    if (!panel || !btn) return;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function settings() {
    return AppSettings?.loadSettings?.() || {};
  }

  function flowersEnabled() {
    return (settings().hkSeasons || "exclude") === "flowers";
  }

  function jokersEnabled() {
    return !!settings().includeJokers;
  }

  function tileCount() {
    let t = 108;
    if (flowersEnabled()) t += 16 + 12 + 8; // winds + dragons + 8 flowers
    if (jokersEnabled()) t += 4;
    return t;
  }

  function wallStats() {
    const T = tileCount();
    const stacks = Math.floor(T / 8);
    const leftover = T - stacks * 8;
    return { T, stacks, leftover, perSide: T / 4 };
  }

  function suitedIds() {
    const ids = [];
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 9; rank++) ids.push(`${rank}${suit}`);
    }
    return ids;
  }

  function makeSuitedPool() {
    const pool = Object.create(null);
    for (const id of suitedIds()) pool[id] = 4;
    return pool;
  }

  function availableJokers(style) {
    if (!jokersEnabled()) return [];
    if (!window.Tiles?.isExcludedTile) return JOKER_IDS.slice(0, 1);
    return JOKER_IDS.filter((id) => !Tiles.isExcludedTile(style, id));
  }

  function isJokerId(id) {
    return id === "J" || id === "J1" || id === "J2";
  }

  function maybeInsertJoker(ids, style) {
    const jokers = availableJokers(style);
    if (!jokers.length || ids.length < 2 || Math.random() > 0.4) return ids;
    const out = ids.slice();
    out[Math.floor(Math.random() * out.length)] = pick(jokers);
    return out;
  }

  function maybeJokerizeGroups(groups, style) {
    const jokers = availableJokers(style);
    if (!jokers.length || Math.random() > 0.4) return groups;
    const slots = [];
    for (let gi = 0; gi < groups.length; gi++) {
      for (let ti = 0; ti < groups[gi].length; ti++) slots.push({ gi, ti });
    }
    if (!slots.length) return groups;
    const { gi, ti } = pick(slots);
    const out = groups.map((g) => g.slice());
    out[gi][ti] = pick(jokers);
    return out;
  }

  function groupsToNotation(groups) {
    return groups.map((g) => g.join(" ")).join(" | ");
  }

  function tileOpts() {
    const s = settings();
    return {
      style: s.tileStyle || Tiles?.DEFAULT_TILE_STYLE || "style-1",
      rankLabels: s.rankLabels || "hover",
    };
  }

  function randomPongIds(style) {
    const id = pick(suitedIds());
    return maybeInsertJoker([id, id, id], style);
  }

  function randomChowIds(style) {
    const suit = pick(SUITS);
    const start = 1 + Math.floor(Math.random() * 7);
    return maybeInsertJoker([`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`], style);
  }

  function randomKongIds(style) {
    const id = pick(suitedIds());
    return maybeInsertJoker([id, id, id, id], style);
  }

  function idsForKind(kind, style) {
    if (kind === "chow") return randomChowIds(style);
    if (kind === "kong") return randomKongIds(style);
    return randomPongIds(style);
  }

  function tryChow(pool) {
    const candidates = [];
    for (const suit of SUITS) {
      for (let start = 1; start <= 7; start++) {
        const ids = [`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`];
        if (ids.every((id) => pool[id] > 0)) candidates.push(ids);
      }
    }
    if (!candidates.length) return null;
    const ids = pick(candidates);
    for (const id of ids) pool[id] -= 1;
    return ids;
  }

  function tryPong(pool) {
    const candidates = suitedIds().filter((id) => pool[id] >= 3);
    if (!candidates.length) return null;
    const id = pick(candidates);
    pool[id] -= 3;
    return [id, id, id];
  }

  function tryPair(pool) {
    const candidates = suitedIds().filter((id) => pool[id] >= 2);
    if (!candidates.length) return null;
    const id = pick(candidates);
    pool[id] -= 2;
    return [id, id];
  }

  function randomTodasGroups(style) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const pool = makeSuitedPool();
      const groups = [];
      let ok = true;
      for (let i = 0; i < 5; i++) {
        const preferChow = Math.random() < 0.55;
        let meld = preferChow ? tryChow(pool) : tryPong(pool);
        if (!meld) meld = preferChow ? tryPong(pool) : tryChow(pool);
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      const pair = tryPair(pool);
      if (!pair) continue;
      groups.push(pair);
      return maybeJokerizeGroups(groups, style);
    }
    return [
      ["1P", "2P", "3P"],
      ["4P", "5P", "6P"],
      ["7B", "8B", "9B"],
      ["2C", "3C", "4C"],
      ["5C", "6C", "7C"],
      ["9C", "9C"],
    ];
  }

  function randomSevenPairsGroups(style) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const pool = makeSuitedPool();
      const types = shuffle(suitedIds());
      const pairs = [];
      for (const id of types) {
        if (pairs.length >= 7) break;
        if (pool[id] < 2) continue;
        pool[id] -= 2;
        pairs.push([id, id]);
      }
      if (pairs.length < 7) continue;
      const pungCandidates = suitedIds().filter((id) => pool[id] >= 3);
      if (!pungCandidates.length) continue;
      const pid = pick(pungCandidates);
      const groups = pairs.slice();
      groups.splice(Math.floor(Math.random() * (groups.length + 1)), 0, [pid, pid, pid]);
      return maybeJokerizeGroups(groups, style);
    }
    return [
      ["1P", "1P"],
      ["2P", "2P"],
      ["3B", "3B"],
      ["4B", "4B"],
      ["5C", "5C"],
      ["6C", "6C"],
      ["7P", "7P"],
      ["8B", "8B", "8B"],
    ];
  }

  function notationForHand(kind, style) {
    const groups = kind === "seven-pairs" ? randomSevenPairsGroups(style) : randomTodasGroups(style);
    return groupsToNotation(groups);
  }

  function markClaimedTile(handEl, kind) {
    const tiles = [...handEl.querySelectorAll(".tile-wrap, .tile-text")];
    if (!tiles.length) return;

    let claimed;
    if (kind === "kong" && tiles.length >= 4) {
      claimed = tiles[3];
      if (isJokerId(claimed.dataset.id || "")) {
        claimed =
          [...tiles].reverse().find((el) => !isJokerId(el.dataset.id || "")) || claimed;
      }
    } else {
      const claimable = tiles.filter((el) => !isJokerId(el.dataset.id || ""));
      if (!claimable.length) return;
      claimed = pick(claimable);
    }

    claimed.classList.add("is-claimed");
    const arrow = document.createElement("span");
    arrow.className = "rules-claim-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.innerHTML = CLAIM_ARROW_SVG;
    claimed.prepend(arrow);
  }

  function renderMeldExample(article) {
    if (!window.Tiles?.renderHand) return;
    const host = article.querySelector(".rules-meld-tiles");
    if (!host) return;
    const kind = article.dataset.meld || "pong";
    const { style, rankLabels } = tileOpts();
    const hand = Tiles.renderHand(idsForKind(kind, style).join(" "), style, { rankLabels });
    hand.classList.add("rules-example-hand", "rules-meld-hand");
    markClaimedTile(hand, kind);
    host.replaceChildren(hand);
    equalizeTileWidths(host);
  }

  function renderHandExample(article) {
    if (!window.Tiles?.renderHand) return;
    const host = article.querySelector(".rules-meld-tiles");
    if (!host) return;
    const kind = article.dataset.hand || "todas";
    const { style, rankLabels } = tileOpts();
    const hand = Tiles.renderHand(notationForHand(kind, style), style, { rankLabels });
    hand.classList.add("rules-example-hand", "rules-full-hand");
    host.replaceChildren(hand);
  }

  function bindClickableExamples(selector, render) {
    for (const article of $$(selector)) {
      render(article);
      const refresh = () => render(article);
      article.querySelector(".rules-meld-tiles")?.addEventListener("click", refresh);
      article.querySelector(".rules-meld-refresh")?.addEventListener("click", refresh);
    }
  }

  function renderHandInto(host, notation, ...extraClasses) {
    if (!host || !window.Tiles?.renderHand) return;
    const { style, rankLabels } = tileOpts();
    const hand = Tiles.renderHand(notation, style, { rankLabels });
    hand.classList.add("rules-example-hand", ...(extraClasses.length ? extraClasses : ["rules-full-hand"]));
    host.replaceChildren(hand);
  }

  function repeatIds(ids, n) {
    const out = [];
    for (const id of ids) {
      for (let i = 0; i < n; i++) out.push(id);
    }
    return out.join(" ");
  }

  function renderSetup() {
    const el = $("#qs-setup-body");
    if (!el) return;
    const { T } = wallStats();
    const parts = [`<strong>${T}</strong> tiles in play`];
    if (flowersEnabled() && jokersEnabled()) {
      parts.push("(108 suited + winds, dragons &amp; flowers + 4 jokers)");
    } else if (flowersEnabled()) {
      parts.push("(108 suited + winds, dragons &amp; 8 flowers)");
    } else if (jokersEnabled()) {
      parts.push("(108 suited + 4 jokers)");
    } else {
      parts.push("(108 suited tiles)");
    }
    el.innerHTML = `<ul>
      <li>${parts.join(" ")}.</li>
      <li><strong>Starting hand:</strong> 16 tiles each; the máno (dealer) receives a 17th and plays first.</li>
    </ul>`;
  }

  function renderWall() {
    const el = $("#qs-wall-body");
    if (!el) return;
    const { T, stacks, leftover } = wallStats();
    let leftoverNote = "";
    if (leftover === 4) {
      leftoverNote =
        ` The remaining <strong>4</strong> tiles are added to the máno’s wall (one extra stack of two on that side).`;
    } else if (leftover > 0) {
      leftoverNote = ` The remaining <strong>${leftover}</strong> tiles are added to the máno’s wall.`;
    }
    el.innerHTML = `<p>
      With <strong>${T}</strong> tiles, build <strong>four walls</strong> (one per player).
      Each wall is <strong>two tiles high</strong> and <strong>${stacks}</strong> stacks long
      (${stacks * 2} tiles per side).${leftoverNote}
    </p>`;
  }

  function renderSuits() {
    const host = $("#qs-suits-body");
    if (!host) return;
    host.replaceChildren();
    const rows = [
      { name: "Characters (craks)", tiles: "1C 2C 3C 4C 5C 6C 7C 8C 9C" },
      { name: "Circles (dots)", tiles: "1P 2P 3P 4P 5P 6P 7P 8P 9P" },
      { name: "Bamboo (bams, sticks)", tiles: "1B 2B 3B 4B 5B 6B 7B 8B 9B" },
    ];
    for (const row of rows) {
      const block = document.createElement("div");
      block.className = "qs-tile-row";
      const lab = document.createElement("h3");
      lab.textContent = row.name;
      const tilesHost = document.createElement("div");
      block.append(lab, tilesHost);
      host.appendChild(block);
      renderHandInto(tilesHost, row.tiles, "rules-full-hand");
    }
    if (jokersEnabled()) {
      const block = document.createElement("div");
      block.className = "qs-tile-row";
      const lab = document.createElement("h3");
      lab.textContent = "Jokers";
      const tilesHost = document.createElement("div");
      block.append(lab, tilesHost);
      host.appendChild(block);
      const { style } = tileOpts();
      const jokers = availableJokers(style);
      const id = jokers[0] || "J1";
      renderHandInto(tilesHost, `${id} ${id} ${id} ${id}`, "rules-full-hand");
    }
  }

  function renderFlowersSection() {
    const section = $("#qs-flowers");
    if (!section) return;
    const on = flowersEnabled();
    section.hidden = !on;
    const toc = document.querySelector('.rules-toc a[href="#qs-flowers"]');
    if (toc) toc.hidden = !on;
    if (!on) return;
    const host = $("#qs-flowers-body");
    if (!host) return;
    host.replaceChildren();

    const intro = document.createElement("p");
    intro.textContent =
      'In Filipino mahjong, all the other tiles — winds, dragons, and flowers — are simplified to “Flowers.” These are not used in the hand and are always replaced when drawn.';
    host.appendChild(intro);

    const groups = [
      { name: "Winds", tiles: repeatIds(WINDS, 1) },
      { name: "Dragons", tiles: repeatIds(DRAGONS, 1) },
      { name: "Flower tiles", tiles: FLOWER_IDS.join(" ") },
    ];
    for (const row of groups) {
      const block = document.createElement("div");
      block.className = "qs-tile-row";
      const lab = document.createElement("h3");
      lab.textContent = row.name;
      const tilesHost = document.createElement("div");
      block.append(lab, tilesHost);
      host.appendChild(block);
      renderHandInto(tilesHost, row.tiles, "rules-full-hand");
    }
  }

  function equalizeTileWidths(root) {
    if (!root) return;
    root.classList.remove("qs-equal-tile-widths");
    root.style.removeProperty("--qs-tile-w");

    const imgs = [...root.querySelectorAll(".tile-img")];
    const texts = [...root.querySelectorAll(".tile-text")];
    if (!imgs.length && !texts.length) return;

    for (const img of imgs) {
      img.loading = "eager";
    }

    const apply = () => {
      let maxW = 0;
      for (const img of imgs) maxW = Math.max(maxW, img.getBoundingClientRect().width);
      for (const el of texts) maxW = Math.max(maxW, el.getBoundingClientRect().width);
      if (maxW < 1) return;
      root.style.setProperty("--qs-tile-w", `${Math.ceil(maxW)}px`);
      root.classList.add("qs-equal-tile-widths");
    };

    const pending = imgs
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          })
      );

    if (pending.length) {
      Promise.all(pending).then(() => requestAnimationFrame(apply));
    } else {
      requestAnimationFrame(apply);
    }
  }

  function renderFullTileset() {
    const host = $("#qs-full-tileset-body");
    if (!host) return;
    host.replaceChildren();

    const suitRows = [
      { name: "Bamboo (bams, sticks)", suit: "B" },
      { name: "Characters (craks)", suit: "C" },
      { name: "Circles (dots)", suit: "P" },
    ];
    for (const row of suitRows) {
      const oneThroughNine = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .map((rank) => `${rank}${row.suit}`)
        .join(" ");
      const notation = [oneThroughNine, oneThroughNine, oneThroughNine, oneThroughNine].join(" | ");
      const block = document.createElement("div");
      block.className = "qs-tile-row";
      const lab = document.createElement("h3");
      lab.textContent = row.name;
      const tilesHost = document.createElement("div");
      block.append(lab, tilesHost);
      host.appendChild(block);
      renderHandInto(tilesHost, notation, "rules-full-hand", "qs-suit-copies");
    }

    if (flowersEnabled()) {
      const honorsRow = [...WINDS, ...DRAGONS].join(" ");
      const honorNotation = [honorsRow, honorsRow, honorsRow, honorsRow].join(" | ");
      const flowerNotation = `${FLOWER_IDS.slice(0, 4).join(" ")} | ${FLOWER_IDS.slice(4).join(" ")}`;

      const block = document.createElement("div");
      block.className = "qs-tile-row";
      const lab = document.createElement("h3");
      lab.textContent = "Flowers";
      const tilesHost = document.createElement("div");
      block.append(lab, tilesHost);
      host.appendChild(block);

      const wrap = document.createElement("div");
      wrap.className = "qs-flowers-tileset";
      tilesHost.appendChild(wrap);

      const honorsHost = document.createElement("div");
      const flowersHost = document.createElement("div");
      wrap.append(honorsHost, flowersHost);
      renderHandInto(honorsHost, honorNotation, "rules-full-hand", "qs-suit-copies");
      renderHandInto(flowersHost, flowerNotation, "rules-full-hand", "qs-suit-copies");
    }

    if (jokersEnabled()) {
      const { style } = tileOpts();
      const jokers = availableJokers(style);
      const id = jokers[0] || "J1";
      const block = document.createElement("div");
      block.className = "qs-tile-row";
      const lab = document.createElement("h3");
      lab.textContent = "Jokers";
      const tilesHost = document.createElement("div");
      block.append(lab, tilesHost);
      host.appendChild(block);
      renderHandInto(tilesHost, `${id} ${id} ${id} ${id}`, "rules-full-hand");
    }

    equalizeTileWidths(host);
  }

  /** @type {string[]} */
  let startingHandTiles = [];
  /** @type {string|null} */
  let startingDealerTile = null;

  function dealPool() {
    const pool = [];
    for (const id of suitedIds()) {
      for (let i = 0; i < 4; i++) pool.push(id);
    }
    if (jokersEnabled()) {
      const { style } = tileOpts();
      const jokers = availableJokers(style);
      const id = jokers[0] || "J1";
      for (let i = 0; i < 4; i++) pool.push(id);
    }
    return shuffle(pool);
  }

  function sortStartingTiles(ids) {
    const suitOrder = { B: 0, C: 1, P: 2 };
    return ids.slice().sort((a, b) => {
      const ja = isJokerId(a);
      const jb = isJokerId(b);
      if (ja !== jb) return ja ? 1 : -1;
      if (ja && jb) return String(a).localeCompare(String(b));
      const suitA = a[1];
      const suitB = b[1];
      if (suitOrder[suitA] !== suitOrder[suitB]) return suitOrder[suitA] - suitOrder[suitB];
      return Number(a[0]) - Number(b[0]);
    });
  }

  function tilesToGroupedNotation(ids) {
    if (!ids.length) return "";
    return ids.join(" ");
  }

  function drawStartingHand() {
    const pool = dealPool();
    const wantDealer = !!$("#qs-dealer-mano")?.checked;
    const take = wantDealer ? 17 : 16;
    const drawn = pool.slice(0, take);
    if (wantDealer) {
      startingHandTiles = drawn.slice(0, 16);
      startingDealerTile = drawn[16];
    } else {
      startingHandTiles = drawn;
      startingDealerTile = null;
    }
  }

  function ensureDealerTile() {
    const counts = Object.create(null);
    for (const id of suitedIds()) counts[id] = 4;
    if (jokersEnabled()) {
      const { style } = tileOpts();
      const jokers = availableJokers(style);
      const id = jokers[0] || "J1";
      counts[id] = 4;
    }
    for (const id of startingHandTiles) {
      counts[id] = (counts[id] || 0) - 1;
    }
    const remaining = [];
    for (const [id, n] of Object.entries(counts)) {
      for (let i = 0; i < n; i++) remaining.push(id);
    }
    startingDealerTile = remaining.length ? pick(remaining) : pick(suitedIds());
  }

  function renderStartingHand() {
    const host = $("#qs-starting-hand-tiles");
    if (!host || !window.Tiles?.renderHand) return;
    if (!startingHandTiles.length) drawStartingHand();

    const { style, rankLabels } = tileOpts();
    const sorted = sortStartingTiles(startingHandTiles);
    const rows = [sorted.slice(0, 8), sorted.slice(8, 16)];

    const wrap = document.createElement("div");
    wrap.className = "qs-starting-hand-rows";

    rows.forEach((rowIds, index) => {
      let notation = tilesToGroupedNotation(rowIds);
      if (index === 1 && startingDealerTile) {
        notation = notation ? `${notation} | ${startingDealerTile}` : startingDealerTile;
      }
      if (!notation) return;
      const hand = Tiles.renderHand(notation, style, { rankLabels });
      hand.classList.add("rules-example-hand", "rules-full-hand", "qs-starting-hand-row");
      wrap.appendChild(hand);
    });

    host.replaceChildren(wrap);
    equalizeTileWidths(host);
  }

  function refreshStartingHand() {
    drawStartingHand();
    renderStartingHand();
  }

  function currentStartingHandIds() {
    const ids = sortStartingTiles(startingHandTiles);
    if (startingDealerTile) ids.push(startingDealerTile);
    return ids;
  }

  function bindStartingHand() {
    $("#qs-starting-hand-refresh")?.addEventListener("click", () => {
      refreshStartingHand();
    });
    $("#qs-dealer-mano")?.addEventListener("change", (e) => {
      const on = !!e.target.checked;
      if (on) {
        if (!startingHandTiles.length) drawStartingHand();
        else ensureDealerTile();
      } else {
        startingDealerTile = null;
      }
      renderStartingHand();
    });
    $("#qs-teach-open")?.addEventListener("click", () => {
      if (!startingHandTiles.length) drawStartingHand();
      window.Teach?.open?.({
        styleId: "filipino",
        tiles: currentStartingHandIds(),
      });
    });
  }

  window.FilipinoQuickStart = {
    getStartingHandIds: currentStartingHandIds,
  };

  function refreshStaticSections() {
    renderSetup();
    renderWall();
    renderSuits();
    renderFlowersSection();
    renderFullTileset();
    for (const note of $$("[data-jokers-example-note]")) {
      note.hidden = !jokersEnabled();
    }
  }

  function refreshAllExamples() {
    for (const article of $$(".rules-meld-ref[data-meld]")) renderMeldExample(article);
    for (const article of $$(".rules-hand-ref[data-hand]")) renderHandExample(article);
    refreshStartingHand();
  }

  function refreshAll() {
    refreshStaticSections();
    refreshAllExamples();
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
    const s = settings();
    select.value = s.hkSeasons || "exclude";
    if (![...select.options].some((o) => o.value === select.value)) {
      select.value = "exclude";
    }
    select.addEventListener("change", () => {
      AppSettings.saveSettings({ ...settings(), hkSeasons: select.value });
      refreshAll();
    });
  }

  function bind() {
    if (!document.body?.classList.contains("filipino-quick-start")) return;

    AppSettings.applyDarkMode?.();
    AppSettings.applyUiScale?.();
    AppSettings.applyTileStyle?.($("#tile-style"));
    AppSettings.applyIncludeJokers?.();
    AppSettings.bindDarkModeCheckbox?.($("#opt-dark-mode"));
    AppSettings.bindIncludeJokersCheckbox?.($("#opt-include-jokers"), () => refreshAll());
    AppSettings.mountUiScaleControl?.($("#ui-scale-host"));
    AppSettings.bindTileStyleSelect?.($("#tile-style"), () => refreshAll());
    bindSeasonsSelect();

    $("#btn-settings")?.addEventListener("click", () => {
      setSettingsOpen($("#settings-panel").hidden);
    });
    $("#btn-settings-close")?.addEventListener("click", () => setSettingsOpen(false));

    refreshStaticSections();
    bindStartingHand();
    refreshStartingHand();
    bindClickableExamples(".rules-meld-ref[data-meld]", renderMeldExample);
    bindClickableExamples(".rules-hand-ref[data-hand]", renderHandExample);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
