/**
 * HK cheatsheet — regenerate example hands from pattern rules.
 */
(function () {
  function B() {
    return window.HAND_BUILD;
  }

  function notation(groups) {
    return B().groupsToNotation(groups);
  }

  function withHonorPung(honorId, restMelds = 3) {
    const { makePool, takePung, randomMixedMeld, tryPair, fallback14, pick, HONORS } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool();
      const id = honorId || pick(HONORS);
      const pung = takePung(pool, id);
      if (!pung) continue;
      const groups = [pung];
      let ok = true;
      for (let i = 0; i < restMelds; i++) {
        const meld = randomMixedMeld(pool, { allowHonors: false, chowBias: 0.6 });
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      const pair = tryPair(pool, { allowHonors: false });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function voidedSuit() {
    const { SUITS, pick, makePool, randomMixedMeld, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const drop = pick(SUITS);
      const suits = SUITS.filter((s) => s !== drop);
      const pool = makePool({ suits });
      const groups = [];
      let ok = true;
      for (let i = 0; i < 4; i++) {
        const meld = randomMixedMeld(pool, { suits, allowHonors: true, chowBias: 0.5 });
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      const pair = tryPair(pool, { suits, allowHonors: true });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function threeConcealed() {
    const { makePool, tryPung, tryChow, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool();
      const groups = [];
      let ok = true;
      for (let i = 0; i < 3; i++) {
        const pung = tryPung(pool, { allowHonors: true });
        if (!pung) {
          ok = false;
          break;
        }
        groups.push(pung);
      }
      if (!ok) continue;
      const chow = tryChow(pool, {});
      if (!chow) continue;
      groups.push(chow);
      const pair = tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function mixedTerminals() {
    const { makePool, tryPung, tryPair, HONORS, pick, takePung, fallback14 } = B();
    for (let attempt = 0; attempt < 80; attempt++) {
      const pool = makePool({ nums: [1, 9] });
      const groups = [];
      let ok = true;
      for (let i = 0; i < 3; i++) {
        const pung = tryPung(pool, { nums: [1, 9], allowHonors: true });
        if (!pung) {
          ok = false;
          break;
        }
        groups.push(pung);
      }
      if (!ok) continue;
      const h = pick(HONORS.filter((id) => pool[id] >= 3));
      if (!h) continue;
      groups.push(takePung(pool, h));
      const pair = tryPair(pool, { nums: [1, 9], allowHonors: true });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function smallDragons() {
    const { makePool, DRAGONS, shuffle, takePung, takePair, randomMixedMeld, tryPair, fallback14 } =
      B();
    for (let attempt = 0; attempt < 50; attempt++) {
      const pool = makePool();
      const [d1, d2, d3] = shuffle(DRAGONS);
      const groups = [takePung(pool, d1), takePung(pool, d2), takePair(pool, d3)];
      if (groups.some((g) => !g)) continue;
      const meld = randomMixedMeld(pool, { allowHonors: false }) || tryPair(pool, {});
      // need one more meld (pung or chow)
      const meld2 = randomMixedMeld(pool, { allowHonors: false });
      if (!meld2) continue;
      // Template: 2 dragon pungs, dragon pair, 1 chow, 1 pung — that's 5 groups = 3+3+2+3+3 = 14
      // So: 2 pungs + pair + 1 meld + 1 meld = need pair separate
      // groups currently has 2 pungs + pair. Need 2 more melds (no extra pair).
      // Wait: 2 pungs (6) + pair (2) + meld (3) + meld (3) = 14. Good — no second pair.
      const meld3 = randomMixedMeld(pool, { allowHonors: false });
      if (!meld3) continue;
      return [groups[0], groups[1], meld2, meld3, groups[2]];
    }
    return fallback14();
  }

  function smallWinds() {
    const { makePool, WINDS, shuffle, takePung, takePair, randomMixedMeld, fallback14 } = B();
    for (let attempt = 0; attempt < 50; attempt++) {
      const pool = makePool();
      const winds = shuffle(WINDS);
      const groups = [
        takePung(pool, winds[0]),
        takePung(pool, winds[1]),
        takePung(pool, winds[2]),
        takePair(pool, winds[3]),
      ];
      if (groups.some((g) => !g)) continue;
      const meld = randomMixedMeld(pool, { allowHonors: false });
      if (!meld) continue;
      // 3 pungs + pair + 1 meld = 3*3+2+3 = 14
      return [groups[0], groups[1], groups[2], meld, groups[3]];
    }
    return fallback14();
  }

  function bigDragons() {
    const { makePool, DRAGONS, takePung, randomMixedMeld, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 40; attempt++) {
      const pool = makePool();
      const groups = DRAGONS.map((d) => takePung(pool, d));
      if (groups.some((g) => !g)) continue;
      const meld = randomMixedMeld(pool, { allowHonors: false });
      if (!meld) continue;
      const pair = tryPair(pool, { allowHonors: false });
      if (!pair) continue;
      return [...groups, meld, pair];
    }
    return fallback14();
  }

  function bigWinds() {
    const { makePool, WINDS, takePung, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 40; attempt++) {
      const pool = makePool();
      const groups = WINDS.map((w) => takePung(pool, w));
      if (groups.some((g) => !g)) continue;
      const pair = tryPair(pool, { allowHonors: false });
      if (!pair) continue;
      return [...groups, pair];
    }
    return fallback14();
  }

  function allHonors() {
    const { makePool, tryPung, tryPair, HONORS, fallback14 } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool({ suits: [] });
      // only honors in pool
      for (const id of Object.keys(pool)) {
        if (!HONORS.includes(id)) delete pool[id];
      }
      for (const id of HONORS) pool[id] = 4;
      const groups = [];
      let ok = true;
      for (let i = 0; i < 4; i++) {
        const pung = tryPung(pool, { allowHonors: true });
        if (!pung) {
          ok = false;
          break;
        }
        groups.push(pung);
      }
      if (!ok) continue;
      const pair = tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function allTerminals() {
    const { buildHand, tryPung, fallback14 } = B();
    return (
      buildHand((pool, o) => tryPung(pool, o), 4, {
        nums: [1, 9],
        honors: false,
        allowHonors: false,
      }) || fallback14()
    );
  }

  function allKongs() {
    const { makePool, tryKong, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool();
      const groups = [];
      let ok = true;
      for (let i = 0; i < 4; i++) {
        const kong = tryKong(pool, { allowHonors: true });
        if (!kong) {
          ok = false;
          break;
        }
        groups.push(kong);
      }
      if (!ok) continue;
      const pair = tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function thirteenOrphans() {
    return B().kokushiNotation();
  }

  function nineGates() {
    const ng = B().nineGatesNotation();
    return typeof ng === "string" ? ng : ng.tiles;
  }

  /**
   * @param {{ id: string }} hand
   * @param {{ tiles: string, label?: string }} example
   */
  function randomizeExample(hand, example) {
    const b = B();
    if (!b) return example?.tiles || "";
    const tiles = example?.tiles || "";
    if (b.isFixedBonusExample(tiles)) return tiles;

    let groups;
    switch (hand.id) {
      case "ping-wu":
        groups = b.randomAllChows14();
        break;
      case "dragon-pung":
        groups = withHonorPung(b.pick(b.DRAGONS));
        break;
      case "seat-wind":
      case "round-wind":
        groups = withHonorPung(b.pick(b.WINDS));
        break;
      case "voided-suit":
        groups = voidedSuit();
        break;
      case "three-concealed":
      case "all-concealed-triplets":
        groups = hand.id === "all-concealed-triplets" ? b.randomAllPungs14() : threeConcealed();
        break;
      case "all-pungs":
        groups = b.randomAllPungs14();
        break;
      case "half-flush":
        groups = b.randomHalfFlush14();
        break;
      case "mixed-terminals":
        groups = mixedTerminals();
        break;
      case "small-dragons":
        groups = smallDragons();
        break;
      case "seven-pairs":
        groups = b.randomSevenPairs();
        break;
      case "small-winds":
        groups = smallWinds();
        break;
      case "full-flush":
        groups = b.randomFullFlush14();
        break;
      case "big-dragons":
        groups = bigDragons();
        break;
      case "big-winds":
        groups = bigWinds();
        break;
      case "all-honors":
        groups = allHonors();
        break;
      case "all-terminals":
        groups = allTerminals();
        break;
      case "thirteen-orphans":
        return thirteenOrphans();
      case "nine-gates":
        return nineGates();
      case "all-kongs":
        groups = allKongs();
        break;
      case "flower-set":
      case "season-set":
      case "self-draw":
      case "fully-concealed":
      case "no-flowers":
      default:
        groups = b.randomStandard14();
        break;
    }
    return notation(groups);
  }

  window.HK_RANDOMIZE = { randomizeExample };
})();
