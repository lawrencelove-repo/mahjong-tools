/**
 * Teach module — interactive starting-hand trainer (modal).
 * Opened from Filipino Quick Start with the current sample hand.
 */
(function () {
  const $ = (sel, el = document) => el.querySelector(sel);

  const HAND_SIZE = {
    filipino: 16,
    riichi: 13,
    hk: 13,
    nmjl: 13,
  };

  const RULESETS = [
    {
      id: "riichi",
      title: "Riichi",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <text x="12" y="18.5" text-anchor="middle" fill="currentColor" font-size="20" font-weight="700"
          font-family="Georgia, 'Noto Serif CJK JP', 'Yu Mincho', 'Hiragino Mincho ProN', 'Songti SC', serif">中</text>
      </svg>`,
    },
    {
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

  const HIGHLIGHT_COLORS = [
    { id: "red", label: "Red", value: "#e53935" },
    { id: "orange", label: "Orange", value: "#fb8c00" },
    { id: "yellow", label: "Yellow", value: "#fdd835" },
    { id: "green", label: "Green", value: "#43a047" },
    { id: "blue", label: "Blue", value: "#1e88e5" },
    { id: "purple", label: "Purple", value: "#8e24aa" },
    { id: "pink", label: "Pink", value: "#d81b60" },
    { id: "teal", label: "Teal", value: "#00897b" },
  ];

  const ICONS = {
    refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`,
    group: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4"/></svg>`,
    highlight: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    move: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M12 2l-3 3"/><path d="M12 2l3 3"/><path d="M12 22l-3-3"/><path d="M12 22l3-3"/><path d="M2 12l3-3"/><path d="M2 12l3 3"/><path d="M22 12l-3-3"/><path d="M22 12l-3 3"/></svg>`,
  };

  const SUITS = ["B", "C", "P"];
  const WINDS = ["EW", "SW", "WW", "NW"];
  const DRAGONS = ["WD", "GD", "RD"];
  const FLOWERS = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"];
  const JOKER_IDS = ["J1", "J2", "J"];

  /** @type {HTMLDialogElement|null} */
  let dialog = null;
  /** @type {"filipino"|"riichi"|"hk"|"nmjl"} */
  let styleId = "filipino";
  /** @type {{ id: string|null, groupId: number|null, highlight: string|null }[]} */
  let seats = [];
  let nextGroupId = 1;
  /** @type {"idle"|"group"|"highlight"|"move"} */
  let mode = "idle";
  /** @type {number[]} */
  let selection = [];
  /** @type {number|null} */
  let moveFrom = null;
  let highlightColor = HIGHLIGHT_COLORS[0].value;
  /** @type {number|null} */
  let dragFrom = null;
  /** Extra empty seats revealed during the current drag (by index). */
  /** @type {Set<number>} */
  let dragRevealed = new Set();
  let layoutListenerBound = false;

  function settings() {
    return AppSettings?.loadSettings?.() || {};
  }

  function flowersEnabled() {
    return (settings().hkSeasons || "exclude") === "flowers";
  }

  function jokersEnabled() {
    return !!settings().includeJokers;
  }

  function tileOpts() {
    const s = settings();
    return {
      style: s.tileStyle || Tiles?.DEFAULT_TILE_STYLE || "style-1",
      rankLabels: s.rankLabels || "hover",
    };
  }

  function isJokerId(id) {
    return id === "J" || id === "J1" || id === "J2";
  }

  function suitedIds() {
    const ids = [];
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 9; rank++) ids.push(`${rank}${suit}`);
    }
    return ids;
  }

  function availableJokers(tileStyle) {
    if (!jokersEnabled()) return [];
    if (!window.Tiles?.isExcludedTile) return JOKER_IDS.slice(0, 1);
    return JOKER_IDS.filter((id) => !Tiles.isExcludedTile(tileStyle, id));
  }

  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function sortTiles(ids) {
    const suitOrder = { B: 0, C: 1, P: 2 };
    const honorOrder = [...WINDS, ...DRAGONS, ...FLOWERS];
    return ids.slice().sort((a, b) => {
      const ja = isJokerId(a);
      const jb = isJokerId(b);
      if (ja !== jb) return ja ? 1 : -1;
      if (ja && jb) return String(a).localeCompare(String(b));

      const suitA = a.length === 2 && suitOrder[a[1]] != null;
      const suitB = b.length === 2 && suitOrder[b[1]] != null;
      if (suitA && suitB) {
        if (suitOrder[a[1]] !== suitOrder[b[1]]) return suitOrder[a[1]] - suitOrder[b[1]];
        return Number(a[0]) - Number(b[0]);
      }
      if (suitA !== suitB) return suitA ? -1 : 1;

      const ia = honorOrder.indexOf(a);
      const ib = honorOrder.indexOf(b);
      if (ia !== -1 || ib !== -1) {
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      }
      return String(a).localeCompare(String(b));
    });
  }

  /**
   * Build a deal pool for the active Teach style, respecting joker/flower settings.
   */
  function dealPool(ruleset) {
    const { style } = tileOpts();
    const pool = [];
    const pushN = (id, n) => {
      for (let i = 0; i < n; i++) pool.push(id);
    };

    for (const id of suitedIds()) pushN(id, 4);

    if (ruleset === "filipino") {
      // Starting hands are suited (+ optional jokers); flowers are replaced when drawn.
      const jokers = availableJokers(style);
      if (jokers.length) pushN(jokers[0], 4);
      return shuffle(pool);
    }

    // Riichi / HK / NMJL include honors in the wall.
    for (const id of WINDS) pushN(id, 4);
    for (const id of DRAGONS) pushN(id, 4);

    if (ruleset === "nmjl" || (ruleset === "hk" && flowersEnabled()) || (ruleset === "riichi" && flowersEnabled())) {
      for (const id of FLOWERS) pushN(id, 1);
    }

    if (ruleset === "nmjl" || (ruleset !== "riichi" && jokersEnabled())) {
      const jokers = availableJokers(style);
      const jid = jokers[0] || (ruleset === "nmjl" ? "J" : null);
      if (jid) pushN(jid, ruleset === "nmjl" ? 8 : 4);
    }

    return shuffle(pool);
  }

  function seatCountFor(ruleset) {
    return HAND_SIZE[ruleset] || 13;
  }

  /**
   * Seat grid by viewport:
   * - Mobile portrait: 5×4 (20)
   * - Mobile landscape: 3×8 (24)
   * - Wide iPad/desktop (≥1000px): one row of hand + 4 extras
   */
  function getLayout() {
    const hand = seatCountFor(styleId);
    const wide = window.innerWidth >= 1000;
    const portrait = window.matchMedia("(orientation: portrait)").matches;
    if (wide) {
      return { cols: hand + 4, rows: 1, total: hand + 4 };
    }
    if (!portrait) {
      return { cols: 8, rows: 3, total: 24 };
    }
    return { cols: 4, rows: 5, total: 20 };
  }

  function makeSeat(id) {
    return { id: id || null, groupId: null, highlight: null };
  }

  function makeEmptySeat() {
    return { id: null, groupId: null, highlight: null };
  }

  function isFilled(seat) {
    return !!(seat && seat.id);
  }

  function isExtraIndex(index) {
    return index >= seatCountFor(styleId);
  }

  function ensureSeatCapacity() {
    const { total } = getLayout();
    while (seats.length < total) seats.push(makeEmptySeat());
    // Don't trim if trailing seats hold tiles beyond hand size.
    if (seats.length > total) {
      let lastFilled = -1;
      for (let i = 0; i < seats.length; i++) {
        if (isFilled(seats[i])) lastFilled = i;
      }
      const keep = Math.max(total, lastFilled + 1);
      if (seats.length > keep) seats.length = keep;
    }
  }

  function padEmptySeats() {
    ensureSeatCapacity();
  }

  function hasAnnotations() {
    return seats.some((s) => isFilled(s) && (s.groupId != null || s.highlight != null));
  }

  function confirmClearAnnotations(actionLabel) {
    if (!hasAnnotations()) return true;
    return window.confirm(
      `${actionLabel} will clear all groups and highlights. Continue?`
    );
  }

  function dealRandom() {
    const pool = dealPool(styleId);
    const n = seatCountFor(styleId);
    seats = sortTiles(pool.slice(0, n)).map(makeSeat);
    padEmptySeats();
    nextGroupId = 1;
    selection = [];
  }

  function loadFromIds(ids) {
    const list = (ids || []).filter(Boolean);
    if (!list.length) {
      dealRandom();
      return;
    }
    seats = list.map(makeSeat);
    padEmptySeats();
    nextGroupId = 1;
    selection = [];
  }

  function groupMemberIndices(gid) {
    if (gid == null) return [];
    const out = [];
    for (let i = 0; i < seats.length; i++) {
      if (seats[i].groupId === gid && isFilled(seats[i])) out.push(i);
    }
    return out;
  }

  function dissolveGroupIfTooSmall(gid) {
    if (gid == null) return;
    const members = groupMemberIndices(gid);
    if (members.length < 2) {
      for (const i of members) seats[i].groupId = null;
    }
  }

  function leaveGroup(index) {
    const seat = seats[index];
    if (!seat || seat.groupId == null) return;
    const gid = seat.groupId;
    seat.groupId = null;
    dissolveGroupIfTooSmall(gid);
  }

  /** Find first empty seat at or after `start` (wrapping search after that). */
  function findEmptyFrom(start) {
    for (let i = Math.max(0, start); i < seats.length; i++) {
      if (!isFilled(seats[i])) return i;
    }
    seats.push(makeEmptySeat());
    return seats.length - 1;
  }

  /**
   * Shift filled seats one step toward `hole`, opening `insertAt`.
   * `hole` must be empty and >= insertAt.
   */
  function shiftRightIntoHole(insertAt, hole) {
    if (hole < insertAt) return;
    for (let i = hole; i > insertAt; i--) {
      seats[i] = seats[i - 1];
    }
    seats[insertAt] = makeEmptySeat();
  }

  /** After a group occupies [start, start+count), sort same-suit ranks in place. */
  function sortGroupRangeIfSameSuit(start, count) {
    const slice = seats.slice(start, start + count);
    if (!slice.every(isFilled)) return;
    const sorted = sortPickedIfSameSuit(slice);
    if (sorted === slice) return;
    // sortPickedIfSameSuit returns same ref if no sort — check by ids
    const changed = sorted.some((s, i) => s !== slice[i]);
    if (!changed) return;
    for (let i = 0; i < count; i++) {
      seats[start + i] = sorted[i];
    }
  }

  /**
   * Move a tile.
   * - Empty target: relocate and leave a hole (no compacting).
   * - Grouped/highlighted target: join that group.
   * - Occupied ungrouped: insert at `to` and shift the rest (no swap).
   */
  function moveSeat(from, to) {
    if (from === to || from < 0 || to < 0 || from >= seats.length || to >= seats.length) return;
    if (!isFilled(seats[from])) return;

    const target = seats[to];
    const joiningGroup = isFilled(target) && (target.groupId != null || target.highlight != null);

    if (!isFilled(target)) {
      const moving = seats[from];
      const oldGid = moving.groupId;
      seats[from] = makeEmptySeat();
      seats[to] = {
        id: moving.id,
        groupId: null,
        highlight: null,
      };
      dissolveGroupIfTooSmall(oldGid);
      return;
    }

    if (joiningGroup) {
      joinGroupByDrop(from, to);
      return;
    }

    insertAndShift(from, to);
  }

  /**
   * Insert tile at `to`, shifting neighbors (e.g. A@5 → seat 2 pushes 2–4 → 3–5).
   * Peels the moved tile out of any prior group.
   */
  function insertAndShift(from, to) {
    const oldGid = seats[from].groupId;
    const moving = {
      id: seats[from].id,
      groupId: null,
      highlight: null,
    };
    const next = seats.slice();
    next.splice(from, 1);
    // After removal, `to` still means “end up at this seat index”.
    next.splice(to, 0, moving);
    seats = next;
    dissolveGroupIfTooSmall(oldGid);
  }

  function joinGroupByDrop(from, to) {
    const target = seats[to];
    const moving = seats[from];
    if (!isFilled(moving) || !isFilled(target)) return;

    const oldGid = moving.groupId;
    let gid = target.groupId;
    const highlight = target.highlight;

    // Detach from source seat first.
    seats[from] = makeEmptySeat();
    dissolveGroupIfTooSmall(oldGid);

    // Ensure a group id exists (singleton highlight becomes a real group on join).
    if (gid == null) {
      gid = nextGroupId++;
      target.groupId = gid;
    }

    // Insert at `to` (indices unchanged — we only clear, never splice).
    const insertAt = to;
    const hole = findEmptyFrom(insertAt);
    if (hole !== insertAt) shiftRightIntoHole(insertAt, hole);

    seats[insertAt] = {
      id: moving.id,
      groupId: gid,
      highlight: highlight,
    };

    // Contiguous group range → same-suit sort.
    const members = groupMemberIndices(gid);
    if (members.length) {
      const start = members[0];
      const end = members[members.length - 1];
      // Only sort if contiguous (should be after insert).
      const contiguous = members.every((v, i) => i === 0 || v === members[i - 1] + 1);
      if (contiguous) sortGroupRangeIfSameSuit(start, end - start + 1);
    }
  }

  /** Gather selected tiles into a contiguous block at the first-selected seat. */
  function gatherSelection(indices) {
    const filled = indices.filter((i) => isFilled(seats[i]));
    if (!filled.length) return { start: 0, count: 0 };

    const firstSelected = filled[0];
    let picked = filled.map((i) => ({
      id: seats[i].id,
      groupId: null,
      highlight: null,
    }));
    picked = sortPickedIfSameSuit(picked);

    // Clear sources (leave holes).
    for (const i of filled) seats[i] = makeEmptySeat();

    let insertAt = firstSelected;
    // Make room for the block without compacting the whole hand.
    for (let k = 0; k < picked.length; k++) {
      const dest = insertAt + k;
      while (dest >= seats.length) seats.push(makeEmptySeat());
      if (isFilled(seats[dest])) {
        const hole = findEmptyFrom(dest + 1);
        shiftRightIntoHole(dest, hole);
      }
    }

    for (let k = 0; k < picked.length; k++) {
      seats[insertAt + k] = picked[k];
    }
    return { start: insertAt, count: picked.length };
  }

  /** If every picked tile is the same suit, order ranks low → high. */
  function sortPickedIfSameSuit(picked) {
    if (picked.length < 2) return picked;
    const suited = picked.every((s) => /^[1-9][BCP]$/.test(s.id));
    if (!suited) return picked;
    const suit = picked[0].id[1];
    if (!picked.every((s) => s.id[1] === suit)) return picked;
    return picked.slice().sort((a, b) => Number(a.id[0]) - Number(b.id[0]));
  }

  function applyGroupFromSelection() {
    const filledSel = selection.filter((i) => isFilled(seats[i]));
    if (filledSel.length < 2) return false;
    const { start, count } = gatherSelection(filledSel);
    if (count < 2) return false;
    const gid = nextGroupId++;
    for (let i = start; i < start + count; i++) {
      seats[i].groupId = gid;
    }
    return true;
  }

  function applyHighlightFromSelection() {
    const filledSel = selection.filter((i) => isFilled(seats[i]));
    if (filledSel.length < 1) return false;
    const { start, count } = gatherSelection(filledSel);
    if (count < 1) return false;
    const gid = count >= 2 ? nextGroupId++ : null;
    for (let i = start; i < start + count; i++) {
      seats[i].highlight = highlightColor;
      seats[i].groupId = gid;
    }
    return true;
  }

  function ungroupAt(index) {
    const seat = seats[index];
    if (!seat || !isFilled(seat) || seat.groupId == null) return;
    leaveGroup(index);
  }

  function unhighlightAt(index) {
    const seat = seats[index];
    if (!seat || !isFilled(seat) || seat.highlight == null) return;
    const gid = seat.groupId;
    seat.highlight = null;
    seat.groupId = null;
    dissolveGroupIfTooSmall(gid);
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "teach-dialog";
    dialog.innerHTML = `
      <div class="teach-chrome">
        <div class="teach-chrome-left">
          <div class="teach-ruleset-switcher" data-teach-ruleset-switcher>
            <button type="button" class="icon-btn teach-ruleset-btn" id="teach-ruleset-btn" aria-label="Play style" title="Play style" aria-expanded="false" aria-haspopup="true" aria-controls="teach-ruleset-menu">
              <span class="ruleset-switcher-glyph" aria-hidden="true"></span>
            </button>
            <nav id="teach-ruleset-menu" class="ruleset-switcher-menu teach-ruleset-menu" aria-label="Play styles" hidden></nav>
          </div>
          <h2 class="teach-title">Teach</h2>
        </div>
        <button type="button" class="icon-btn teach-close" id="teach-close" aria-label="Close" title="Close">${ICONS.close}</button>
      </div>
      <div class="teach-toolbar" role="toolbar" aria-label="Teach tools">
        <button type="button" class="icon-btn teach-tool" data-teach-action="group" aria-label="Group" title="Group">${ICONS.group}</button>
        <button type="button" class="icon-btn teach-tool" data-teach-action="highlight" aria-label="Highlight" title="Highlight">${ICONS.highlight}</button>
        <button type="button" class="icon-btn teach-tool" data-teach-action="move" aria-label="Move" title="Move">${ICONS.move}</button>
        <div class="teach-color-picker" id="teach-color-picker" role="group" aria-label="Highlight color"></div>
        <button type="button" class="icon-btn teach-tool" data-teach-action="refresh" aria-label="Refresh hand" title="Refresh">${ICONS.refresh}</button>
      </div>
      <div class="teach-board" id="teach-board" aria-live="polite"></div>
      <p class="teach-hint" id="teach-hint">Drag tiles between seats to rearrange. Use Group / Highlight / Move to plan melds.</p>
    `;
    document.body.appendChild(dialog);

    const colorHost = $("#teach-color-picker", dialog);
    for (const c of HIGHLIGHT_COLORS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "teach-color-swatch";
      btn.style.setProperty("--teach-swatch", c.value);
      btn.dataset.color = c.value;
      btn.title = c.label;
      btn.setAttribute("aria-label", c.label);
      btn.addEventListener("click", () => {
        highlightColor = c.value;
        syncColorPicker();
      });
      colorHost.appendChild(btn);
    }

    const menu = $("#teach-ruleset-menu", dialog);
    menu.innerHTML = RULESETS.map((r) => {
      return `<button type="button" class="site-menu-link ruleset-switcher-link teach-ruleset-link" data-ruleset="${r.id}">
        <span>${r.title}</span><span class="site-menu-link-icon">${r.icon}</span>
      </button>`;
    }).join("");

    $("#teach-close", dialog)?.addEventListener("click", () => close());
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) close();
    });
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });

    $("#teach-ruleset-btn", dialog)?.addEventListener("click", (e) => {
      e.stopPropagation();
      const wrap = $("[data-teach-ruleset-switcher]", dialog);
      setRulesetMenuOpen(!wrap?.classList.contains("is-open"));
    });

    menu.addEventListener("click", (e) => {
      const btn = e.target.closest?.("[data-ruleset]");
      if (!btn) return;
      const id = btn.getAttribute("data-ruleset");
      setRulesetMenuOpen(false);
      if (id) changeStyle(id);
    });

    document.addEventListener("pointerdown", (e) => {
      const wrap = $("[data-teach-ruleset-switcher]", dialog);
      if (!wrap?.classList.contains("is-open")) return;
      if (e.target instanceof Node && wrap.contains(e.target)) return;
      setRulesetMenuOpen(false);
    });

    dialog.querySelector(".teach-toolbar")?.addEventListener("click", (e) => {
      const btn = e.target.closest?.("[data-teach-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-teach-action");
      onTool(action);
    });

    if (!layoutListenerBound) {
      layoutListenerBound = true;
      const onLayoutChange = () => {
        if (!dialog?.open) return;
        ensureSeatCapacity();
        render();
      };
      window.addEventListener("resize", onLayoutChange);
      try {
        window.matchMedia("(orientation: portrait)").addEventListener("change", onLayoutChange);
        window.matchMedia("(min-width: 1000px)").addEventListener("change", onLayoutChange);
      } catch (_) {
        /* older browsers */
      }
    }

    return dialog;
  }

  function setRulesetMenuOpen(open) {
    const wrap = $("[data-teach-ruleset-switcher]", dialog);
    const btn = $("#teach-ruleset-btn", dialog);
    const menu = $("#teach-ruleset-menu", dialog);
    if (!wrap || !btn || !menu) return;
    wrap.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  }

  function syncRulesetButton() {
    const current = RULESETS.find((r) => r.id === styleId) || RULESETS[0];
    const glyph = $(".teach-ruleset-btn .ruleset-switcher-glyph", dialog);
    if (glyph) glyph.innerHTML = current.icon;
    const btn = $("#teach-ruleset-btn", dialog);
    if (btn) {
      btn.title = current.title;
      btn.setAttribute("aria-label", `Play style: ${current.title}`);
    }
    for (const link of dialog.querySelectorAll(".teach-ruleset-link")) {
      link.classList.toggle("is-current", link.getAttribute("data-ruleset") === styleId);
    }
  }

  function syncColorPicker() {
    for (const btn of dialog.querySelectorAll(".teach-color-swatch")) {
      btn.classList.toggle("is-selected", btn.dataset.color === highlightColor);
    }
  }

  function syncToolbar() {
    const hint = $("#teach-hint", dialog);
    if (mode === "group") {
      if (hint) {
        hint.textContent =
          selection.length > 0
            ? `Group mode — ${selection.length} selected. Tap more tiles, or tap Group again to finish (min 2). Tap a grouped tile to ungroup.`
            : "Group mode — tap tiles to select, tap Group again to finish. Tap a grouped tile to ungroup.";
      }
    } else if (mode === "highlight") {
      if (hint) {
        hint.textContent =
          selection.length > 0
            ? `Highlight mode — ${selection.length} selected. Tap more tiles, or tap Highlight again to finish. Tap a highlighted tile to clear it.`
            : "Highlight mode — tap tiles to select, tap Highlight again to finish. Tap a highlighted tile to clear it.";
      }
    } else if (mode === "move") {
      if (hint) {
        hint.textContent = moveFrom == null
          ? "Move mode — tap a tile, then tap a seat to place it."
          : "Move mode — tap a seat to place the selected tile (or tap it again to cancel).";
      }
    } else if (hint) {
      hint.textContent = "Drag tiles between seats to rearrange. Use Group / Highlight / Move to plan melds.";
    }

    for (const btn of dialog.querySelectorAll(".teach-tool[data-teach-action]")) {
      const a = btn.getAttribute("data-teach-action");
      btn.classList.toggle("is-active", a === mode);
    }

    dialog.classList.toggle("teach-move-mode", mode === "move");
    dialog.classList.toggle("teach-dragging", dragFrom != null);
  }

  function exitModeApplying() {
    if (mode === "group") applyGroupFromSelection();
    else if (mode === "highlight") applyHighlightFromSelection();
    selection = [];
    moveFrom = null;
    mode = "idle";
  }

  function onTool(action) {
    if (action === "refresh") {
      if (!confirmClearAnnotations("Refreshing")) return;
      dealRandom();
      mode = "idle";
      selection = [];
      moveFrom = null;
      render();
      return;
    }

    if (action === "group" || action === "highlight" || action === "move") {
      if (mode === action) {
        // Toggle off — Group/Highlight apply current selection.
        if (action === "group" || action === "highlight") exitModeApplying();
        else {
          mode = "idle";
          moveFrom = null;
          selection = [];
        }
      } else {
        // Switching tools: discard unfinished selection without applying.
        selection = [];
        moveFrom = null;
        mode = action;
      }
      render();
      return;
    }
  }

  function changeStyle(nextId) {
    if (!HAND_SIZE[nextId] || nextId === styleId) return;
    if (!confirmClearAnnotations("Changing play style")) return;
    styleId = nextId;
    dealRandom();
    mode = "idle";
    selection = [];
    moveFrom = null;
    render();
  }

  function onSeatClick(index, e) {
    e.preventDefault();

    if (mode === "move") {
      if (moveFrom == null) {
        if (!isFilled(seats[index])) return;
        moveFrom = index;
        render();
        return;
      }
      if (moveFrom === index) {
        moveFrom = null;
        render();
        return;
      }
      moveSeat(moveFrom, index);
      moveFrom = null;
      render();
      return;
    }

    if (mode === "group") {
      if (!isFilled(seats[index])) return;
      if (seats[index].groupId != null) {
        ungroupAt(index);
        selection = selection.filter((i) => i !== index);
        render();
        return;
      }
      const pos = selection.indexOf(index);
      if (pos >= 0) selection.splice(pos, 1);
      else selection.push(index);
      render();
      return;
    }

    if (mode === "highlight") {
      if (!isFilled(seats[index])) return;
      if (seats[index].highlight != null) {
        unhighlightAt(index);
        selection = selection.filter((i) => i !== index);
        render();
        return;
      }
      const pos = selection.indexOf(index);
      if (pos >= 0) selection.splice(pos, 1);
      else selection.push(index);
      render();
      return;
    }
  }

  function bindSeatDrag(seatEl, index) {
    const filled = isFilled(seats[index]);
    seatEl.draggable = mode === "idle" && filled;
    seatEl.addEventListener("dragstart", (e) => {
      if (mode !== "idle" || !isFilled(seats[index])) {
        e.preventDefault();
        return;
      }
      dragFrom = index;
      dragRevealed = new Set();
      seatEl.classList.add("is-dragging");
      dialog?.classList.add("teach-dragging");
      e.dataTransfer?.setData("text/plain", String(index));
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    });
    seatEl.addEventListener("dragend", () => {
      seatEl.classList.remove("is-dragging");
      dragFrom = null;
      dragRevealed = new Set();
      dialog?.classList.remove("teach-dragging");
      dialog?.querySelectorAll(".teach-seat.is-drag-over, .teach-seat.is-revealed").forEach((el) => {
        el.classList.remove("is-drag-over", "is-revealed");
      });
      // Re-render so extra seats hide again.
      render();
    });
    seatEl.addEventListener("dragover", (e) => {
      if (mode !== "idle" || dragFrom == null || dragFrom === index) return;
      e.preventDefault();
      seatEl.classList.add("is-drag-over");
      if (!isFilled(seats[index]) && isExtraIndex(index)) {
        seatEl.classList.add("is-revealed");
        dragRevealed.add(index);
      }
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    });
    seatEl.addEventListener("dragleave", () => {
      seatEl.classList.remove("is-drag-over");
    });
    seatEl.addEventListener("drop", (e) => {
      e.preventDefault();
      seatEl.classList.remove("is-drag-over");
      if (mode !== "idle" || dragFrom == null) return;
      const to = index;
      const from = dragFrom;
      dragFrom = null;
      dragRevealed = new Set();
      dialog?.classList.remove("teach-dragging");
      moveSeat(from, to);
      render();
    });
  }

  function emptySeatVisible(index) {
    if (isFilled(seats[index])) return true;
    if (!isExtraIndex(index)) return true; // mid-hand gaps stay visible
    if (mode === "move") return true;
    if (dragFrom != null && dragRevealed.has(index)) return true;
    return false;
  }

  /**
   * Shrink --tile-h so each layout row (layout.cols seats) fits the board width.
   * Applies to every form factor / orientation. Overflow can still scroll if needed.
   */
  function fitBoardSeats(board, rowsWrap, layout) {
    if (!board || !rowsWrap) return;

    board.classList.add("teach-fit-seats");
    board.style.removeProperty("--tile-h");

    const apply = () => {
      if (!board.isConnected || !rowsWrap.isConnected) return;

      board.style.removeProperty("--tile-h");

      // Reveal collapsed extras so measurement includes the full seat budget.
      const extras = [...rowsWrap.querySelectorAll(".teach-seat.is-extra")];
      for (const el of extras) el.classList.add("is-revealed");

      const rows = [...rowsWrap.querySelectorAll(".teach-seat-row")];
      const available = board.clientWidth;
      let needed = 0;
      for (const row of rows) needed = Math.max(needed, row.scrollWidth);

      for (const el of extras) {
        const idx = Number(el.dataset.seat);
        if (!emptySeatVisible(idx)) el.classList.remove("is-revealed");
      }

      if (available < 1 || needed < 1) return;

      const cs = getComputedStyle(board);
      const basePx = parseFloat(cs.getPropertyValue("--tile-h")) || 64;

      if (needed > available) {
        const next = Math.max(20, basePx * (available / needed) * 0.98);
        board.style.setProperty("--tile-h", `${next.toFixed(2)}px`);
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(apply);
      const imgs = [...rowsWrap.querySelectorAll("img.tile-img")];
      const pending = imgs.filter((img) => !img.complete);
      if (!pending.length) return;
      Promise.all(
        pending.map(
          (img) =>
            new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
        )
      ).then(() => requestAnimationFrame(apply));
    });
  }

  function render() {
    ensureDialog();
    ensureSeatCapacity();
    syncRulesetButton();
    syncColorPicker();
    syncToolbar();

    const board = $("#teach-board", dialog);
    if (!board || !window.Tiles?.renderTile) return;
    board.replaceChildren();

    const { style, rankLabels } = tileOpts();
    const layout = getLayout();
    const n = seats.length;
    const rowSize = layout.cols;

    const rowsWrap = document.createElement("div");
    rowsWrap.className = "teach-seat-rows";
    rowsWrap.style.setProperty("--teach-cols", String(rowSize));

    let row = null;
    for (let i = 0; i < n; i++) {
      if (i % rowSize === 0) {
        row = document.createElement("div");
        row.className = "teach-seat-row";
        rowsWrap.appendChild(row);
      }

      const seat = seats[i];
      const filled = isFilled(seat);
      const seatEl = document.createElement("div");
      seatEl.className = "teach-seat";
      if (!filled) {
        seatEl.classList.add("is-empty");
        if (isExtraIndex(i)) seatEl.classList.add("is-extra");
        if (emptySeatVisible(i)) seatEl.classList.add("is-revealed");
      }
      seatEl.dataset.seat = String(i);
      seatEl.setAttribute("role", "listitem");
      seatEl.setAttribute("aria-label", filled ? `Seat ${i + 1}` : `Empty seat ${i + 1}`);

      if (filled) {
        const prev = seats[i - 1];
        const next = seats[i + 1];
        const inGroup = seat.groupId != null;
        const groupStart = inGroup && (!prev || !isFilled(prev) || prev.groupId !== seat.groupId);
        const groupEnd = inGroup && (!next || !isFilled(next) || next.groupId !== seat.groupId);
        if (inGroup) {
          seatEl.classList.add("is-grouped");
          if (groupStart) seatEl.classList.add("is-group-start");
          if (groupEnd) seatEl.classList.add("is-group-end");
          if (!groupStart && !groupEnd) seatEl.classList.add("is-group-mid");
        }
        if (seat.highlight) {
          seatEl.classList.add("is-highlighted");
          seatEl.style.setProperty("--teach-highlight", seat.highlight);
          const hlStart =
            !prev ||
            !isFilled(prev) ||
            prev.highlight !== seat.highlight ||
            prev.groupId !== seat.groupId;
          const hlEnd =
            !next ||
            !isFilled(next) ||
            next.highlight !== seat.highlight ||
            next.groupId !== seat.groupId;
          if (hlStart) seatEl.classList.add("is-hl-start");
          if (hlEnd) seatEl.classList.add("is-hl-end");
          if (!hlStart && !hlEnd) seatEl.classList.add("is-hl-mid");
        }
        if (selection.includes(i) || moveFrom === i) seatEl.classList.add("is-selected");

        const tile = Tiles.renderTile(seat.id, style, rankLabels);
        seatEl.appendChild(tile);

        if (i > 0) {
          const prevSeat = seats[i - 1];
          const breakBefore =
            isFilled(prevSeat) &&
            ((seat.groupId != null && prevSeat.groupId !== seat.groupId) ||
              (prevSeat.groupId != null && seat.groupId !== prevSeat.groupId));
          if (breakBefore) seatEl.classList.add("has-meld-break");
        }
      }

      seatEl.addEventListener("click", (e) => onSeatClick(i, e));
      bindSeatDrag(seatEl, i);

      row.appendChild(seatEl);
    }

    board.appendChild(rowsWrap);
    fitBoardSeats(board, rowsWrap, layout);
  }

  function open(opts = {}) {
    ensureDialog();
    styleId = opts.styleId || "filipino";
    mode = "idle";
    selection = [];
    moveFrom = null;
    dragFrom = null;
    dragRevealed = new Set();
    highlightColor = HIGHLIGHT_COLORS[0].value;

    if (Array.isArray(opts.tiles) && opts.tiles.length) {
      loadFromIds(opts.tiles);
    } else {
      dealRandom();
    }

    render();
    if (!dialog.open) dialog.showModal();
  }

  function close() {
    if (!dialog) return;
    setRulesetMenuOpen(false);
    mode = "idle";
    selection = [];
    moveFrom = null;
    if (dialog.open) dialog.close();
  }

  window.Teach = {
    open,
    close,
    HAND_SIZE,
  };
})();
