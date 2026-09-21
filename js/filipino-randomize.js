/**
 * Filipino cheatsheet hand randomization — rebuild legal example hands from
 * pattern rules (not fixed template numbers), unless the description requires
 * specific tiles (e.g. Pure Straight 123–456–789, flower/season sets).
 */
(function () {
  const SUITS = ["B", "C", "P"];

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

  function suitedIds() {
    const ids = [];
    for (const s of SUITS) for (let n = 1; n <= 9; n++) ids.push(`${n}${s}`);
    return ids;
  }

  function makePool() {
    /** @type {Record<string, number>} */
    const pool = {};
    for (const id of suitedIds()) pool[id] = 4;
    return pool;
  }

  function tryChow(pool, suitFilter) {
    const suits = suitFilter ? [suitFilter] : SUITS;
    const candidates = [];
    for (const suit of suits) {
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

  function tryPung(pool, suitFilter) {
    const candidates = suitedIds().filter((id) => {
      if (pool[id] < 3) return false;
      if (suitFilter && id[1] !== suitFilter) return false;
      return true;
    });
    if (!candidates.length) return null;
    const id = pick(candidates);
    pool[id] -= 3;
    return [id, id, id];
  }

  function tryPair(pool, suitFilter) {
    const candidates = suitedIds().filter((id) => {
      if (pool[id] < 2) return false;
      if (suitFilter && id[1] !== suitFilter) return false;
      return true;
    });
    if (!candidates.length) return null;
    const id = pick(candidates);
    pool[id] -= 2;
    return [id, id];
  }

  function takeStraight(pool, suit) {
    const ids = [
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ].map((n) => `${n}${suit}`);
    if (!ids.every((id) => pool[id] > 0)) return null;
    for (const id of ids) pool[id] -= 1;
    return [
      [`1${suit}`, `2${suit}`, `3${suit}`],
      [`4${suit}`, `5${suit}`, `6${suit}`],
      [`7${suit}`, `8${suit}`, `9${suit}`],
    ];
  }

  /**
   * @param {(pool: Record<string, number>) => (string[]|null)} meldFn
   * @param {number} meldCount
   * @param {string|null} [suitFilter]
   */
  function buildHand(meldFn, meldCount, suitFilter = null) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const pool = makePool();
      const groups = [];
      let ok = true;
      for (let i = 0; i < meldCount; i++) {
        const meld = meldFn(pool, suitFilter);
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      const pair = tryPair(pool, suitFilter);
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return null;
  }

  function randomTodas() {
    return (
      buildHand((pool) => {
        const preferChow = Math.random() < 0.55;
        let meld = preferChow ? tryChow(pool) : tryPung(pool);
        if (!meld) meld = preferChow ? tryPung(pool) : tryChow(pool);
        return meld;
      }, 5) || fallbackTodas()
    );
  }

  function randomAllChows() {
    return buildHand((pool, suit) => tryChow(pool, suit), 5) || fallbackTodas();
  }

  function randomAllPungs() {
    return buildHand((pool, suit) => tryPung(pool, suit), 5) || fallbackTodas();
  }

  function randomFullFlush() {
    for (let attempt = 0; attempt < 60; attempt++) {
      const suit = pick(SUITS);
      const groups = buildHand((pool, s) => {
        const preferChow = Math.random() < 0.55;
        let meld = preferChow ? tryChow(pool, s) : tryPung(pool, s);
        if (!meld) meld = preferChow ? tryPung(pool, s) : tryChow(pool, s);
        return meld;
      }, 5, suit);
      if (groups) return groups;
    }
    return fallbackTodas();
  }

  function randomPureStraight() {
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool();
      const suit = pick(SUITS);
      const straight = takeStraight(pool, suit);
      if (!straight) continue;
      const groups = [...straight];
      let ok = true;
      for (let i = 0; i < 2; i++) {
        const preferChow = Math.random() < 0.5;
        let meld = preferChow ? tryChow(pool) : tryPung(pool);
        if (!meld) meld = preferChow ? tryPung(pool) : tryChow(pool);
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
      return groups;
    }
    return fallbackTodas();
  }

  function randomSevenPairs() {
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool();
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
      pairs.push([pid, pid, pid]);
      return pairs;
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

  function randomJokerEye() {
    const groups = randomTodas();
    // Replace pair with tile + joker
    const pairIdx = groups.findIndex((g) => g.length === 2);
    if (pairIdx >= 0) {
      const tile = groups[pairIdx][0];
      groups[pairIdx] = [tile, "J"];
    }
    return groups;
  }

  function fallbackTodas() {
    return [
      ["1P", "2P", "3P"],
      ["4P", "5P", "6P"],
      ["7B", "8B", "9B"],
      ["2C", "3C", "4C"],
      ["5C", "6C", "7C"],
      ["9C", "9C"],
    ];
  }

  function groupsToNotation(groups) {
    return groups
      .map((g) => {
        if (g.length === 2) return `${g[0]} ${g[1]}`;
        if (g.length === 3 && g[0] === g[1] && g[1] === g[2]) {
          const n = g[0][0];
          const suit = g[0].slice(1);
          return `${n}${n}${n}${suit}`;
        }
        if (g.length === 3) {
          const suit = g[0].slice(1);
          const nums = g.map((id) => parseInt(id[0], 10));
          if (
            g.every((id) => id.slice(1) === suit) &&
            nums[1] === nums[0] + 1 &&
            nums[2] === nums[0] + 2
          ) {
            return `${nums[0]}${nums[1]}${nums[2]}${suit}`;
          }
        }
        if (g.length === 4 && g.every((id) => id === g[0])) {
          const n = g[0][0];
          const suit = g[0].slice(1);
          return `${n}${n}${n}${n}${suit}`;
        }
        return g.join(" ");
      })
      .join(" | ");
  }

  function isFixedBonusExample(tiles) {
    const t = String(tiles).trim();
    if (/^F[1-4](\s+F[1-4]){3}$/i.test(t)) return true;
    if (/^F[5-8](\s+F[5-8]){3}$/i.test(t)) return true;
    return false;
  }

  /**
   * @param {{ id: string, description?: string }} hand
   * @param {{ tiles: string, label?: string }} example
   * @returns {string}
   */
  function randomizeExample(hand, example) {
    const tiles = example?.tiles || "";
    if (isFixedBonusExample(tiles)) return tiles;

    let groups;
    switch (hand.id) {
      case "all-chows":
        groups = randomAllChows();
        break;
      case "all-pungs":
        groups = randomAllPungs();
        break;
      case "pure-straight":
        groups = randomPureStraight();
        break;
      case "full-flush":
        groups = randomFullFlush();
        break;
      case "seven-pairs":
        groups = randomSevenPairs();
        break;
      case "joker-eye":
        groups = randomJokerEye();
        break;
      case "flower-set":
      case "season-set":
        // Winning-hand companion examples only (fixed sets handled above)
        groups = randomTodas();
        break;
      default:
        // Winning, concealed, all-revealed, quick-win, difficult-wait, no-flowers…
        groups = randomTodas();
        break;
    }
    return groupsToNotation(groups);
  }

  window.FILIPINO_RANDOMIZE = {
    randomizeExample,
    groupsToNotation,
  };
})();
