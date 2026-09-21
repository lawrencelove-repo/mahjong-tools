/**
 * Rule-aware randomization for NMJL cheatsheet hand examples.
 * Remaps suits / numbers / dragons / winds from card notes + category,
 * keeping each hand's structural pattern intact.
 */
(function () {
  const SUITS = ["B", "C", "P"];
  const DRAGONS = ["RD", "BD", "PD"];
  const WINDS = ["NW", "EW", "WW", "SW"];
  const MATCH_DRAGON = { B: "BD", C: "RD", P: "PD" };
  const OPP_DRAGON = { B: "RD", C: "BD", P: "RD" };
  const DRAGON_TO_SUIT = { BD: "B", GD: "B", RD: "C", PD: "P", WD: "P" };

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

  function uniq(arr) {
    return [...new Set(arr)];
  }

  /**
   * @param {string} [note]
   * @param {string} [categoryId]
   */
  function parseRules(note = "", categoryId = "") {
    const n = String(note).toLowerCase().replace(/\s+/g, " ").trim();
    /** @type {{
     *   numbers: "fixed"|"like"|"consecutive"|"twoNos"|"likeKongFromSet"|"kongFromSet"|"pairMatchKongs",
     *   numberSet: number[]|null,
     *   consecCount: number|null,
     *   dragons: "keep"|"matching"|"opposite"|"matchingOrOpp"|"any"|"anyTwo"|"matchMiddle",
     *   winds: "keep"|"any"|"ewOnly"|"nsOnly",
     * }} */
    const rules = {
      numbers: "fixed",
      numberSet: null,
      consecCount: null,
      dragons: "keep",
      winds: "keep",
    };

    if (categoryId === "like-numbers") rules.numbers = "like";

    if (/these nos/.test(n)) rules.numbers = "fixed";

    if (/any like odd/.test(n)) {
      rules.numbers = "like";
      rules.numberSet = [1, 3, 5, 7, 9];
    } else if (/any like even/.test(n)) {
      rules.numbers = "like";
      rules.numberSet = [2, 4, 6, 8];
    } else if (/any like nos|any like numbers/.test(n)) {
      rules.numbers = "like";
    }

    if (/like kongs?\s*2,\s*4,\s*5,\s*6,\s*or\s*8/.test(n)) {
      rules.numbers = "likeKongFromSet";
      rules.numberSet = [2, 4, 5, 6, 8];
    } else if (/kong\s*2,\s*4,\s*6,\s*8/.test(n)) {
      rules.numbers = "kongFromSet";
      rules.numberSet = [2, 4, 6, 8];
    }

    const consec = n.match(/any\s+(\d+)\s+consec/);
    if (consec) {
      rules.numbers = "consecutive";
      rules.consecCount = parseInt(consec[1], 10);
    } else if (/any run/.test(n)) {
      rules.numbers = "consecutive";
    }

    if (/any 2 nos|any two nos/.test(n)) rules.numbers = "twoNos";

    if (/pair any odd/.test(n)) {
      rules.numbers = "pairMatchKongs";
      rules.numberSet = [1, 3, 5, 7, 9];
    } else if (/pair\s*3/.test(n) && /9/.test(n) && /kongs match pair/.test(n)) {
      rules.numbers = "pairMatchKongs";
      rules.numberSet = [3, 6, 9];
    }

    if (/matching or opp/.test(n)) rules.dragons = "matchingOrOpp";
    else if (/ds match middle/.test(n)) rules.dragons = "matchMiddle";
    else if (/matching dragon/.test(n)) rules.dragons = "matching";
    else if (/opp\.?\s*dragon/.test(n)) rules.dragons = "opposite";
    else if (/any 2 dragons/.test(n)) rules.dragons = "anyTwo";
    else if (/any dragon/.test(n)) rules.dragons = "any";

    if (/east and west only/.test(n)) rules.winds = "ewOnly";
    else if (/north and south only/.test(n)) rules.winds = "nsOnly";
    else if (/any wind/.test(n)) rules.winds = "any";
    else if (/only these winds/.test(n)) rules.winds = "keep";

    return rules;
  }

  /**
   * Parse one whitespace token after NMJL_NOTATION.expandHand.
   * @param {string} raw
   */
  function parsePart(raw) {
    if (raw === "|") return { kind: "break", raw };

    const rep = raw.match(/^(.+)\*(\d+)$/);
    if (rep) {
      const inner = parsePart(rep[1]);
      return { ...inner, raw, repeat: parseInt(rep[2], 10) };
    }

    if (/^0[BCP]?$/i.test(raw) || raw === "0") {
      const suit = raw.length > 1 ? raw[1].toUpperCase() : "";
      return { kind: "soap", raw, suit: suit || "P", num: 0, id: raw.toUpperCase() };
    }

    const suited = raw.match(/^([1-9])([BCP])(r)?$/i);
    if (suited) {
      return {
        kind: "suited",
        raw,
        num: parseInt(suited[1], 10),
        suit: suited[2].toUpperCase(),
        red: !!suited[3],
      };
    }

    const up = raw.toUpperCase();
    if (DRAGONS.includes(up) || up === "GD" || up === "WD") {
      return { kind: "dragon", raw, id: up === "GD" ? "BD" : up === "WD" ? "PD" : up };
    }
    if (WINDS.includes(up)) return { kind: "wind", raw, id: up };
    if (up === "F" || /^F[1-8]$/.test(up) || up === "J" || up === "X" || /^J[12]$/.test(up)) {
      return { kind: "extra", raw, id: up };
    }
    return { kind: "other", raw };
  }

  function formatPart(part) {
    if (part.kind === "break") return "|";
    let id;
    if (part.kind === "suited") {
      id = `${part.num}${part.suit}${part.red ? "r" : ""}`;
    } else if (part.kind === "soap") {
      id = part.suit ? `0${part.suit}` : "0P";
    } else if (part.kind === "dragon" || part.kind === "wind" || part.kind === "extra") {
      id = part.id;
    } else {
      return part.raw;
    }
    return part.repeat ? `${id}*${part.repeat}` : id;
  }

  function partCount(part) {
    return part.repeat || 1;
  }

  function isSoapPart(part, suitsWithNumbers) {
    if (part.kind !== "soap") return false;
    return !suitsWithNumbers.has(part.suit);
  }

  function buildSuitMap(usedSuits) {
    const from = uniq(usedSuits);
    if (!from.length) return {};
    const to = shuffle(SUITS).slice(0, from.length);
    /** If template uses all 3, use a full permutation */
    const dest = from.length === 3 ? shuffle(SUITS) : to;
    const map = {};
    from.forEach((s, i) => {
      map[s] = dest[i];
    });
    return map;
  }

  function collectSuitedNums(parts) {
    /** @type {Map<string, number[]>} */
    const bySuit = new Map();
    const all = [];
    for (const p of parts) {
      if (p.kind === "suited") {
        all.push(p.num);
        if (!bySuit.has(p.suit)) bySuit.set(p.suit, []);
        bySuit.get(p.suit).push(p.num);
      }
    }
    return { all: uniq(all).sort((a, b) => a - b), bySuit };
  }

  function countByNumber(parts) {
    /** @type {Map<number, number>} */
    const counts = new Map();
    for (const p of parts) {
      if (p.kind !== "suited") continue;
      counts.set(p.num, (counts.get(p.num) || 0) + partCount(p));
    }
    return counts;
  }

  /**
   * @param {ReturnType<typeof parsePart>[]} parts
   * @param {ReturnType<typeof parseRules>} rules
   * @returns {Record<number, number>}
   */
  function buildNumberMap(parts, rules) {
    const { all } = collectSuitedNums(parts);
    if (!all.length || rules.numbers === "fixed") return {};

    const pool = rules.numberSet || [1, 2, 3, 4, 5, 6, 7, 8, 9];

    if (rules.numbers === "like") {
      if (all.length !== 1) {
        // Multiple numbers: remap the most-common (like) number only.
        const counts = countByNumber(parts);
        let best = all[0];
        let bestN = 0;
        for (const num of all) {
          const c = counts.get(num) || 0;
          if (c > bestN) {
            best = num;
            bestN = c;
          }
        }
        const choices = pool.filter((n) => n !== best);
        if (!choices.length) return {};
        return { [best]: pick(choices) };
      }
      {
        const choices = pool.filter((n) => n !== all[0]);
        return { [all[0]]: pick(choices.length ? choices : pool) };
      }
    }

    if (rules.numbers === "consecutive") {
      const min = Math.min(...all);
      const max = Math.max(...all);
      const span = max - min;
      const maxStart = 9 - span;
      if (maxStart < 1) return {};
      let start = 1 + Math.floor(Math.random() * maxStart);
      // Prefer a different window when possible
      const options = [];
      for (let s = 1; s <= maxStart; s++) if (s !== min) options.push(s);
      if (options.length) start = pick(options);
      else start = min;
      const delta = start - min;
      if (!delta) return {};
      /** @type {Record<number, number>} */
      const map = {};
      for (const n of all) map[n] = n + delta;
      return map;
    }

    if (rules.numbers === "twoNos") {
      if (all.length < 2) return {};
      const sorted = all.slice().sort((a, b) => a - b);
      const picks = shuffle(pool).slice(0, sorted.length).sort((a, b) => a - b);
      /** @type {Record<number, number>} */
      const map = {};
      sorted.forEach((n, i) => {
        map[n] = picks[i];
      });
      return map;
    }

    if (rules.numbers === "likeKongFromSet" || rules.numbers === "kongFromSet") {
      const counts = countByNumber(parts);
      const kongNums = [...counts.entries()]
        .filter(([num, c]) => c >= 4 && pool.includes(num))
        .map(([num]) => num);
      if (!kongNums.length) {
        // Fallback: highest-count number in pool
        let best = null;
        let bestC = 0;
        for (const [num, c] of counts) {
          if (pool.includes(num) && c > bestC) {
            best = num;
            bestC = c;
          }
        }
        if (best == null) return {};
        kongNums.push(best);
      }
      const from = kongNums[0];
      const choices = pool.filter((n) => n !== from);
      const next = pick(choices.length ? choices : pool);
      // Remap only kong-sized groups so fixed runs (e.g. 2468) keep their digits.
      return { [from]: next, __kongOnly: true };
    }

    if (rules.numbers === "pairMatchKongs") {
      const counts = countByNumber(parts);
      // Pair+kong number: appears as pair (2) in one place and kong (4+) elsewhere, or total >= 6
      let pairNum = null;
      for (const num of all) {
        if (!pool.includes(num)) continue;
        const c = counts.get(num) || 0;
        if (c >= 6) {
          pairNum = num;
          break;
        }
      }
      if (pairNum == null) {
        for (const num of all) {
          if (pool.includes(num) && (counts.get(num) || 0) >= 2) {
            pairNum = num;
            break;
          }
        }
      }
      if (pairNum == null) return {};
      const next = pick(pool);
      if (next === pairNum) return {};
      /** @type {Record<number, number>} */
      const map = { [pairNum]: next };
      // If next already exists in the "set" tiles, swap so we don't collide
      if (all.includes(next)) map[next] = pairNum;
      return map;
    }

    return {};
  }

  function middleNumber(parts) {
    const { all } = collectSuitedNums(parts);
    if (!all.length) return null;
    const min = Math.min(...all);
    const max = Math.max(...all);
    return Math.round((min + max) / 2);
  }

  function suitForMiddle(parts, mid) {
    for (const p of parts) {
      if (p.kind === "suited" && p.num === mid) return p.suit;
    }
    return null;
  }

  /**
   * Randomize one hand notation string (card sugar or expanded).
   * @param {string} notation
   * @param {{ note?: string, categoryId?: string }} [ctx]
   * @returns {string}
   */
  function randomizeNotation(notation, ctx = {}) {
    if (!notation) return notation;
    const expand = window.NMJL_NOTATION?.expandHand;
    const expanded = expand ? expand(notation) : notation;
    const rules = parseRules(ctx.note, ctx.categoryId);
    const parts = expanded.trim().split(/\s+/).map(parsePart);

    const suitsWithNumbers = new Set();
    for (const p of parts) {
      if (p.kind === "suited") suitsWithNumbers.add(p.suit);
    }

    const usedSuits = [];
    for (const p of parts) {
      if (p.kind === "suited") usedSuits.push(p.suit);
      else if (p.kind === "soap" && !isSoapPart(p, suitsWithNumbers)) usedSuits.push(p.suit);
    }
    const suitMap = buildSuitMap(usedSuits);
    const numMapRaw = buildNumberMap(parts, rules);
    const kongOnly = !!numMapRaw.__kongOnly;
    /** @type {Record<number, number>} */
    const numMap = { ...numMapRaw };
    delete numMap.__kongOnly;

    let dragonMode =
      rules.dragons === "matchingOrOpp"
        ? pick(["matching", "opposite"])
        : rules.dragons;

    // If the template dragons already match present suits, keep that pairing
    // when the note does not say otherwise (e.g. 2468 with Ds beside kongs).
    if (dragonMode === "keep") {
      const dragParts = parts.filter((p) => p.kind === "dragon");
      const suited = uniq(parts.filter((p) => p.kind === "suited").map((p) => p.suit));
      if (
        dragParts.length &&
        suited.length &&
        dragParts.every((d) => suited.includes(DRAGON_TO_SUIT[d.id]))
      ) {
        dragonMode = "matching";
      }
    }

    let anyDragon = null;
    if (dragonMode === "any") anyDragon = pick(DRAGONS);

    /** @type {Record<string, string>} */
    let dragonTypeMap = {};
    if (dragonMode === "anyTwo") {
      const present = uniq(parts.filter((p) => p.kind === "dragon").map((p) => p.id));
      const chosen = shuffle(DRAGONS).slice(0, Math.max(2, present.length));
      present.forEach((d, i) => {
        dragonTypeMap[d] = chosen[i % chosen.length];
      });
    }

    let anyWind = null;
    if (rules.winds === "any") {
      const present = parts.find((p) => p.kind === "wind");
      if (present) {
        const options = WINDS.filter((w) => w !== present.id);
        anyWind = pick(options.length ? options : WINDS);
      }
    }

    const mid = middleNumber(parts);
    // Capture original middle suit before remaps (for matchMiddle)
    const midSuitOrig = mid != null ? suitForMiddle(parts, mid) : null;
    const origSuitedSuits = uniq(
      parts.filter((p) => p.kind === "suited").map((p) => p.suit)
    );

    // Like-kong remaps: only change numbers inside kong-sized groups so fixed
    // runs (2468, etc.) keep their digits after expandHand splits 2222C → 2C×4.
    if (kongOnly && Object.keys(numMap).length) {
      let segment = [];
      const flush = () => {
        /** @type {Record<string, number>} */
        const keyCounts = {};
        for (const p of segment) {
          if (p.kind !== "suited") continue;
          const k = `${p.num}${p.suit}`;
          keyCounts[k] = (keyCounts[k] || 0) + partCount(p);
        }
        for (const p of segment) {
          if (p.kind !== "suited") continue;
          const k = `${p.num}${p.suit}`;
          if (numMap[p.num] != null && keyCounts[k] >= 4) {
            p.num = numMap[p.num];
          }
        }
        segment = [];
      };
      for (const p of parts) {
        if (p.kind === "break") flush();
        else segment.push(p);
      }
      flush();
    }

    const out = parts.map((p) => {
      if (p.kind === "break" || p.kind === "other" || p.kind === "extra") return formatPart(p);

      if (p.kind === "suited") {
        let num = p.num;
        if (!kongOnly && numMap[num] != null) num = numMap[num];
        const suit = suitMap[p.suit] || p.suit;
        return formatPart({ ...p, num, suit });
      }

      if (p.kind === "soap") {
        if (isSoapPart(p, suitsWithNumbers)) {
          // Standalone soap stays white (0P)
          return formatPart({ ...p, suit: "P" });
        }
        const suit = suitMap[p.suit] || p.suit;
        return formatPart({ ...p, suit });
      }

      if (p.kind === "dragon") {
        if (dragonMode === "keep") return formatPart(p);
        if (dragonMode === "any") return formatPart({ ...p, id: anyDragon || p.id });
        if (dragonMode === "anyTwo") {
          return formatPart({ ...p, id: dragonTypeMap[p.id] || p.id });
        }

        let refSuit = DRAGON_TO_SUIT[p.id];
        if (dragonMode === "matchMiddle" && midSuitOrig) {
          refSuit = midSuitOrig;
        } else if (origSuitedSuits.length === 1) {
          // Single-suit hands: dragon tracks that suit (matching / opposite)
          refSuit = origSuitedSuits[0];
        }
        const newSuit = (refSuit && suitMap[refSuit]) || refSuit;
        if (!newSuit) return formatPart(p);
        const finalId =
          dragonMode === "opposite" ? OPP_DRAGON[newSuit] : MATCH_DRAGON[newSuit];
        return formatPart({ ...p, id: finalId || p.id });
      }

      if (p.kind === "wind") {
        if (rules.winds === "any" && anyWind) return formatPart({ ...p, id: anyWind });
        // ewOnly / nsOnly / keep: leave winds as written
        return formatPart(p);
      }

      return formatPart(p);
    });

    return out.join(" ");
  }

  /**
   * Randomize one hand entry (single notation or alternate versions).
   * @param {{ tiles: string|string[], note?: string }} hand
   * @param {{ categoryId?: string }} [ctx]
   * @returns {string[]}
   */
  function randomizeHand(hand, ctx = {}) {
    const versions = Array.isArray(hand.tiles) ? hand.tiles : [hand.tiles];
    return versions.map((tiles) =>
      randomizeNotation(tiles, { note: hand.note, categoryId: ctx.categoryId })
    );
  }

  window.NMJL_RANDOMIZE = {
    parseRules,
    randomizeNotation,
    randomizeHand,
  };
})();
