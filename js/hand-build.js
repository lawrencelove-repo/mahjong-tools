/**
 * Shared tile-pool builders for pattern-aware hand randomization
 * (Riichi / HK / Filipino 14- or 17-tile examples).
 */
(function () {
  const SUITS = ["B", "C", "P"];
  const WINDS = ["EW", "SW", "WW", "NW"];
  const DRAGONS = ["WD", "GD", "RD"];
  const HONORS = [...WINDS, ...DRAGONS];

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function suitedIds(opts = {}) {
    const suits = opts.suits || SUITS;
    const nums = opts.nums || [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const ids = [];
    for (const s of suits) for (const n of nums) ids.push(`${n}${s}`);
    return ids;
  }

  function makePool(opts = {}) {
    /** @type {Record<string, number>} */
    const pool = {};
    for (const id of suitedIds(opts)) pool[id] = 4;
    if (opts.honors !== false) {
      for (const id of HONORS) pool[id] = 4;
    }
    return pool;
  }

  function idOk(id, opts = {}) {
    if (/^[1-9][BCP]$/.test(id)) {
      const n = +id[0];
      const s = id[1];
      if (opts.suits && !opts.suits.includes(s)) return false;
      if (opts.nums && !opts.nums.includes(n)) return false;
      return true;
    }
    if (HONORS.includes(id)) return opts.allowHonors !== false && opts.honors !== false;
    return false;
  }

  function tryChow(pool, opts = {}) {
    const suits = opts.suits || SUITS;
    const candidates = [];
    for (const suit of suits) {
      for (let start = 1; start <= 7; start++) {
        if (opts.nums && ![start, start + 1, start + 2].every((n) => opts.nums.includes(n))) {
          continue;
        }
        const ids = [`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`];
        if (ids.every((id) => pool[id] > 0)) candidates.push(ids);
      }
    }
    if (!candidates.length) return null;
    const ids = pick(candidates);
    for (const id of ids) pool[id] -= 1;
    return ids;
  }

  function tryPung(pool, opts = {}) {
    const candidates = Object.keys(pool).filter((id) => pool[id] >= 3 && idOk(id, opts));
    if (!candidates.length) return null;
    const id = pick(candidates);
    pool[id] -= 3;
    return [id, id, id];
  }

  function tryKong(pool, opts = {}) {
    const candidates = Object.keys(pool).filter((id) => pool[id] >= 4 && idOk(id, opts));
    if (!candidates.length) return null;
    const id = pick(candidates);
    pool[id] -= 4;
    return [id, id, id, id];
  }

  function tryPair(pool, opts = {}) {
    const candidates = Object.keys(pool).filter((id) => pool[id] >= 2 && idOk(id, opts));
    if (!candidates.length) return null;
    const id = pick(candidates);
    pool[id] -= 2;
    return [id, id];
  }

  function takePung(pool, id) {
    if ((pool[id] || 0) < 3) return null;
    pool[id] -= 3;
    return [id, id, id];
  }

  function takeKong(pool, id) {
    if ((pool[id] || 0) < 4) return null;
    pool[id] -= 4;
    return [id, id, id, id];
  }

  function takePair(pool, id) {
    if ((pool[id] || 0) < 2) return null;
    pool[id] -= 2;
    return [id, id];
  }

  function takeStraight(pool, suit) {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `${n}${suit}`);
    if (!ids.every((id) => pool[id] > 0)) return null;
    for (const id of ids) pool[id] -= 1;
    return [
      [`1${suit}`, `2${suit}`, `3${suit}`],
      [`4${suit}`, `5${suit}`, `6${suit}`],
      [`7${suit}`, `8${suit}`, `9${suit}`],
    ];
  }

  function takeSanshokuChow(pool, start) {
    const groups = [];
    for (const suit of SUITS) {
      const ids = [`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`];
      if (!ids.every((id) => pool[id] > 0)) return null;
      for (const id of ids) pool[id] -= 1;
      groups.push(ids);
    }
    return groups;
  }

  function takeSanshokuPung(pool, num) {
    const groups = [];
    for (const suit of SUITS) {
      const id = `${num}${suit}`;
      if ((pool[id] || 0) < 3) return null;
      pool[id] -= 3;
      groups.push([id, id, id]);
    }
    return groups;
  }

  /**
   * Build N melds + pair via meldFn.
   * @param {(pool: Record<string, number>, opts: object) => string[]|null} meldFn
   * @param {number} meldCount
   * @param {object} [opts]
   */
  function buildHand(meldFn, meldCount, opts = {}) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const pool = makePool(opts);
      const groups = [];
      let ok = true;
      for (let i = 0; i < meldCount; i++) {
        const meld = meldFn(pool, opts);
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      const pair = tryPair(pool, opts);
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return null;
  }

  function randomMixedMeld(pool, opts = {}) {
    const preferChow = opts.chowBias != null ? Math.random() < opts.chowBias : Math.random() < 0.55;
    const chowOpts = { ...opts, allowHonors: false };
    let meld = preferChow ? tryChow(pool, chowOpts) : tryPung(pool, opts);
    if (!meld) meld = preferChow ? tryPung(pool, opts) : tryChow(pool, chowOpts);
    return meld;
  }

  /** Standard 4 melds + pair (14 tiles). */
  function randomStandard14(opts = {}) {
    return (
      buildHand((pool, o) => randomMixedMeld(pool, o), 4, { chowBias: 0.55, ...opts }) ||
      fallback14()
    );
  }

  function randomAllChows14(opts = {}) {
    return (
      buildHand((pool, o) => tryChow(pool, { ...o, allowHonors: false }), 4, {
        ...opts,
        allowHonors: false,
        honors: false,
      }) || fallback14()
    );
  }

  function randomAllPungs14(opts = {}) {
    return buildHand((pool, o) => tryPung(pool, o), 4, opts) || fallback14();
  }

  function randomSevenPairs(opts = {}) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const pool = makePool(opts);
      const types = shuffle(Object.keys(pool).filter((id) => idOk(id, opts)));
      const pairs = [];
      for (const id of types) {
        if (pairs.length >= 7) break;
        if (pool[id] < 2) continue;
        pool[id] -= 2;
        pairs.push([id, id]);
      }
      if (pairs.length === 7) return pairs;
    }
    return [
      ["1P", "1P"],
      ["3P", "3P"],
      ["5B", "5B"],
      ["7B", "7B"],
      ["2C", "2C"],
      ["8C", "8C"],
      ["WD", "WD"],
    ];
  }

  function randomFullFlush14(opts = {}) {
    const forced = opts.suit && SUITS.includes(opts.suit) ? opts.suit : null;
    for (let attempt = 0; attempt < 60; attempt++) {
      const suit = forced || pick(SUITS);
      const groups = buildHand(
        (pool, o) => randomMixedMeld(pool, o),
        4,
        { suits: [suit], honors: false, allowHonors: false, chowBias: 0.55 }
      );
      if (groups) return groups;
    }
    return fallback14();
  }

  function randomHalfFlush14(opts = {}) {
    const forced = opts.suit && SUITS.includes(opts.suit) ? opts.suit : null;
    for (let attempt = 0; attempt < 80; attempt++) {
      const suit = forced || pick(SUITS);
      const pool = makePool({ suits: [suit] });
      const groups = [];
      let ok = true;
      // 3 suited melds
      for (let i = 0; i < 3; i++) {
        const meld = randomMixedMeld(pool, {
          suits: [suit],
          allowHonors: false,
          chowBias: 0.5,
        });
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      // 1 honor pung
      const honorCandidates = HONORS.filter((id) => pool[id] >= 3);
      if (!honorCandidates.length) continue;
      const fourth = takePung(pool, pick(honorCandidates));
      if (!fourth) continue;
      groups.push(fourth);
      const pair =
        tryPair(pool, { suits: [suit], allowHonors: false }) ||
        tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function fallback14() {
    return [
      ["1P", "2P", "3P"],
      ["4P", "5P", "6P"],
      ["7B", "8B", "9B"],
      ["2C", "3C", "4C"],
      ["8C", "8C"],
    ];
  }

  function groupsToNotation(groups) {
    return groups
      .map((g) => {
        if (g.length === 2) return `${g[0]} ${g[1]}`;
        if (g.length >= 3 && g.every((id) => id === g[0])) {
          if (/^[1-9][BCP]$/.test(g[0])) {
            const n = g[0][0];
            const suit = g[0][1];
            return n.repeat(g.length) + suit;
          }
          return g.join(" ");
        }
        if (g.length === 3) {
          const suit = g[0].slice(1);
          const nums = g.map((id) => parseInt(id[0], 10));
          if (
            /^[1-9][BCP]$/.test(g[0]) &&
            g.every((id) => id.slice(1) === suit) &&
            nums[1] === nums[0] + 1 &&
            nums[2] === nums[0] + 2
          ) {
            return `${nums[0]}${nums[1]}${nums[2]}${suit}`;
          }
        }
        return g.join(" ");
      })
      .join(" | ");
  }

  function isFixedBonusExample(tiles) {
    const t = String(tiles).trim();
    if (/^F[1-8](\s+F[1-8])*$/i.test(t) && !t.includes("|")) return true;
    return false;
  }

  function kokushiNotation() {
    const orphans = ["1P", "9P", "1B", "9B", "1C", "9C", ...WINDS, ...DRAGONS];
    const dup = pick(orphans);
    return `1P 9P | 1B 9B | 1C 9C | EW SW WW NW | WD GD RD | ${dup}`;
  }

  function nineGatesNotation() {
    const suit = pick(SUITS);
    const extra = 1 + Math.floor(Math.random() * 9);
    const t = (n) => `${n}${suit}`;
    const tiles = [
      `${t(1)} ${t(1)} ${t(1)}`,
      `${t(2)} ${t(3)} ${t(4)} ${t(5)} ${t(6)} ${t(7)} ${t(8)}`,
      `${t(9)} ${t(9)} ${t(9)}`,
      t(extra),
    ].join(" | ");
    const suitNames = {
      B: "Souzu (Bamboo)",
      C: "Manzu (Craks)",
      P: "Pinzu (Dots)",
    };
    return {
      tiles,
      label: `${suitNames[suit] || suit} + ${extra}`,
      suit,
      extra,
    };
  }

  window.HAND_BUILD = {
    SUITS,
    WINDS,
    DRAGONS,
    HONORS,
    pick,
    shuffle,
    suitedIds,
    makePool,
    tryChow,
    tryPung,
    tryKong,
    tryPair,
    takePung,
    takeKong,
    takePair,
    takeStraight,
    takeSanshokuChow,
    takeSanshokuPung,
    buildHand,
    randomMixedMeld,
    randomStandard14,
    randomAllChows14,
    randomAllPungs14,
    randomSevenPairs,
    randomFullFlush14,
    randomHalfFlush14,
    groupsToNotation,
    isFixedBonusExample,
    kokushiNotation,
    nineGatesNotation,
    fallback14,
  };
})();
