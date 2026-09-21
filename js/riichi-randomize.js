/**
 * Riichi cheatsheet — regenerate yaku examples from pattern rules.
 */
(function () {
  function B() {
    return window.HAND_BUILD;
  }

  function notation(groups) {
    return B().groupsToNotation(groups);
  }

  function withYakuhai(honorId) {
    const { makePool, takePung, randomMixedMeld, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool();
      const pung = takePung(pool, honorId);
      if (!pung) continue;
      const groups = [pung];
      let ok = true;
      for (let i = 0; i < 3; i++) {
        const meld = randomMixedMeld(pool, { allowHonors: false, chowBias: 0.65 });
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

  function pinfu() {
    // All chows + valueless pair (2–8, not dragon/seat wind — use suited 2–8)
    return (
      B().buildHand((pool, o) => B().tryChow(pool, o), 4, {
        nums: [2, 3, 4, 5, 6, 7, 8],
        honors: false,
        allowHonors: false,
      }) || B().randomAllChows14({ nums: [2, 3, 4, 5, 6, 7, 8], honors: false })
    );
  }

  function tanyao() {
    return B().randomStandard14({
      nums: [2, 3, 4, 5, 6, 7, 8],
      honors: false,
      allowHonors: false,
      chowBias: 0.5,
    });
  }

  function iipeikou() {
    const { makePool, SUITS, pick, tryChow, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool({ honors: false });
      const suit = pick(SUITS);
      const start = 1 + Math.floor(Math.random() * 7);
      const ids = [`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`];
      if (!ids.every((id) => pool[id] >= 2)) continue;
      for (const id of ids) pool[id] -= 2;
      const groups = [ids.slice(), ids.slice()];
      const chow = tryChow(pool, {});
      if (!chow) continue;
      groups.push(chow);
      const chow2 = tryChow(pool, {});
      if (!chow2) continue;
      groups.push(chow2);
      const pair = tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      // Actually need: 2 identical chows + 2 more melds + pair = 5 groups for 14 tiles
      // 2*3 + 3 + 3 + 2 = 14. So 2 identical + 2 melds + pair. We have 2 identical + 2 chows + need pair, that's 5. Good.
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function ryanpeikou() {
    const { makePool, SUITS, shuffle, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 80; attempt++) {
      const pool = makePool({ honors: false });
      const groups = [];
      let ok = true;
      for (let pairIdx = 0; pairIdx < 2; pairIdx++) {
        const suit = shuffle(SUITS)[0];
        const start = 1 + Math.floor(Math.random() * 7);
        const ids = [`${start}${suit}`, `${start + 1}${suit}`, `${start + 2}${suit}`];
        if (!ids.every((id) => pool[id] >= 2)) {
          ok = false;
          break;
        }
        for (const id of ids) pool[id] -= 2;
        groups.push(ids.slice(), ids.slice());
      }
      if (!ok) continue;
      const pair = tryPair(pool, { allowHonors: false });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function sanshokuDoujun() {
    const { makePool, takeSanshokuChow, tryChow, tryPair, tryPung, fallback14 } = B();
    for (let attempt = 0; attempt < 50; attempt++) {
      const pool = makePool();
      const start = 1 + Math.floor(Math.random() * 7);
      const three = takeSanshokuChow(pool, start);
      if (!three) continue;
      const meld =
        Math.random() < 0.5 ? tryChow(pool, {}) : tryPung(pool, { allowHonors: true });
      if (!meld) continue;
      const pair = tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      return [...three, meld, pair];
    }
    return fallback14();
  }

  function ittsu() {
    const { makePool, SUITS, pick, takeStraight, randomMixedMeld, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 50; attempt++) {
      const pool = makePool();
      const suit = pick(SUITS);
      const straight = takeStraight(pool, suit);
      if (!straight) continue;
      const meld = randomMixedMeld(pool, { allowHonors: true, chowBias: 0.5 });
      if (!meld) continue;
      const pair = tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      return [...straight, meld, pair];
    }
    return fallback14();
  }

  function sanshokuDoukou() {
    const { makePool, takeSanshokuPung, tryChow, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 50; attempt++) {
      const pool = makePool();
      const num = 1 + Math.floor(Math.random() * 9);
      const three = takeSanshokuPung(pool, num);
      if (!three) continue;
      const chow = tryChow(pool, {});
      if (!chow) continue;
      const pair = tryPair(pool, { allowHonors: true });
      if (!pair) continue;
      return [...three, chow, pair];
    }
    return fallback14();
  }

  function sanankou() {
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

  function sankantsu() {
    const { makePool, tryKong, tryChow, tryPair, fallback14 } = B();
    for (let attempt = 0; attempt < 60; attempt++) {
      const pool = makePool();
      const groups = [];
      let ok = true;
      for (let i = 0; i < 3; i++) {
        const kong = tryKong(pool, { allowHonors: true });
        if (!kong) {
          ok = false;
          break;
        }
        groups.push(kong);
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

  function shousangen() {
    const { makePool, DRAGONS, shuffle, takePung, takePair, tryChow, fallback14 } = B();
    for (let attempt = 0; attempt < 40; attempt++) {
      const pool = makePool();
      const [d1, d2, d3] = shuffle(DRAGONS);
      const g1 = takePung(pool, d1);
      const g2 = takePung(pool, d2);
      const g3 = takePair(pool, d3);
      if (!g1 || !g2 || !g3) continue;
      const chow = tryChow(pool, {});
      if (!chow) continue;
      const meld = tryChow(pool, {}) || B().tryPung(pool, { allowHonors: false });
      if (!meld) continue;
      return [g1, g2, chow, meld, g3];
    }
    return fallback14();
  }

  function chantaLike(allowHonors) {
    const { makePool, tryChow, tryPung, tryPair, fallback14 } = B();
    // Prefer edge chows 123/789 and terminal/honor pungs
    for (let attempt = 0; attempt < 100; attempt++) {
      const pool = makePool();
      const groups = [];
      let ok = true;
      for (let i = 0; i < 4; i++) {
        let meld = null;
        if (Math.random() < 0.5) {
          // edge chow
          const edgeOpts = { nums: undefined };
          meld = tryChow(pool, {});
          if (meld) {
            const n = +meld[0][0];
            if (n !== 1 && n !== 7) {
              // put back
              for (const id of meld) pool[id] += 1;
              meld = null;
            }
          }
        }
        if (!meld) {
          meld = tryPung(pool, {
            nums: [1, 9],
            allowHonors: allowHonors,
          });
        }
        if (!meld && allowHonors) {
          meld = tryPung(pool, { allowHonors: true });
        }
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      const pair = tryPair(pool, {
        nums: [1, 9],
        allowHonors: allowHonors,
      });
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function honroutou() {
    return (
      B().buildHand((pool, o) => B().tryPung(pool, o), 4, {
        nums: [1, 9],
        allowHonors: true,
      }) || B().fallback14()
    );
  }

  function ryuuiisou() {
    const { makePool, tryChow, tryPung, tryPair, takePung, fallback14 } = B();
    // Green: 2,3,4,6,8 B and GD
    for (let attempt = 0; attempt < 80; attempt++) {
      const pool = makePool({ suits: ["B"], nums: [2, 3, 4, 6, 8] });
      pool.GD = 4;
      const groups = [];
      let ok = true;
      for (let i = 0; i < 4; i++) {
        let meld =
          Math.random() < 0.4
            ? tryChow(pool, { suits: ["B"], nums: [2, 3, 4, 6, 8] })
            : tryPung(pool, { suits: ["B"], nums: [2, 3, 4, 6, 8], allowHonors: false });
        if (!meld && pool.GD >= 3) meld = takePung(pool, "GD");
        if (!meld) {
          ok = false;
          break;
        }
        groups.push(meld);
      }
      if (!ok) continue;
      const pair =
        tryPair(pool, { suits: ["B"], nums: [2, 3, 4, 6, 8], allowHonors: false }) ||
        (pool.GD >= 2 ? B().takePair(pool, "GD") : null);
      if (!pair) continue;
      groups.push(pair);
      return groups;
    }
    return fallback14();
  }

  function suukantsu() {
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

  /**
   * @param {{ id: string }} yaku
   * @param {{ tiles: string, label?: string }} example
   */
  function randomizeExample(yaku, example) {
    const b = B();
    if (!b) return example?.tiles || "";

    let groups;
    switch (yaku.id) {
      case "pinfu":
        groups = pinfu();
        break;
      case "iipeikou":
        groups = iipeikou();
        break;
      case "tanyao":
        groups = tanyao();
        break;
      case "yakuhai-haku":
        groups = withYakuhai("WD");
        break;
      case "yakuhai-hatsu":
        groups = withYakuhai("GD");
        break;
      case "yakuhai-chun":
        groups = withYakuhai("RD");
        break;
      case "yakuhai-wind":
        groups = withYakuhai(b.pick(b.WINDS));
        break;
      case "chiitoitsu":
        groups = b.randomSevenPairs();
        break;
      case "sanshoku-doujun":
        groups = sanshokuDoujun();
        break;
      case "ittsu":
        groups = ittsu();
        break;
      case "chanta":
        groups = chantaLike(true);
        break;
      case "sanshoku-doukou":
        groups = sanshokuDoukou();
        break;
      case "sanankou":
      case "suuankou":
      case "suuankou-tanki":
        groups = yaku.id === "sanankou" ? sanankou() : b.randomAllPungs14();
        break;
      case "sankantsu":
        groups = sankantsu();
        break;
      case "toitoi":
        groups = b.randomAllPungs14();
        break;
      case "shousangen":
        groups = shousangen();
        break;
      case "honroutou":
        groups = honroutou();
        break;
      case "ryanpeikou":
        groups = ryanpeikou();
        break;
      case "junchan":
        groups = chantaLike(false);
        break;
      case "honitsu":
        groups = b.randomHalfFlush14();
        break;
      case "chinitsu":
        groups = b.randomFullFlush14();
        break;
      case "kokushi":
      case "kokushi-13":
        return b.kokushiNotation();
      case "daisangen": {
        const { makePool, DRAGONS, takePung, tryChow, tryPair, fallback14 } = b;
        for (let i = 0; i < 40; i++) {
          const pool = makePool();
          const gs = DRAGONS.map((d) => takePung(pool, d));
          if (gs.some((g) => !g)) continue;
          const chow = tryChow(pool, {});
          if (!chow) continue;
          const pair = tryPair(pool, { allowHonors: false });
          if (!pair) continue;
          return notation([...gs, chow, pair]);
        }
        return notation(fallback14());
      }
      case "shousuushii": {
        const { makePool, WINDS, shuffle, takePung, takePair, tryChow, fallback14 } = b;
        for (let i = 0; i < 40; i++) {
          const pool = makePool();
          const w = shuffle(WINDS);
          const gs = [takePung(pool, w[0]), takePung(pool, w[1]), takePung(pool, w[2]), takePair(pool, w[3])];
          if (gs.some((g) => !g)) continue;
          const chow = tryChow(pool, {});
          if (!chow) continue;
          return notation([gs[0], gs[1], gs[2], chow, gs[3]]);
        }
        return notation(fallback14());
      }
      case "daisuushii": {
        const { makePool, WINDS, takePung, tryPair, fallback14 } = b;
        for (let i = 0; i < 40; i++) {
          const pool = makePool();
          const gs = WINDS.map((w) => takePung(pool, w));
          if (gs.some((g) => !g)) continue;
          const pair = tryPair(pool, { allowHonors: false });
          if (!pair) continue;
          return notation([...gs, pair]);
        }
        return notation(fallback14());
      }
      case "tsuuiisou": {
        const { makePool, tryPung, tryPair, HONORS, fallback14 } = b;
        for (let i = 0; i < 60; i++) {
          const pool = {};
          for (const id of HONORS) pool[id] = 4;
          const gs = [];
          let ok = true;
          for (let j = 0; j < 4; j++) {
            const pung = tryPung(pool, { allowHonors: true });
            if (!pung) {
              ok = false;
              break;
            }
            gs.push(pung);
          }
          if (!ok) continue;
          const pair = tryPair(pool, { allowHonors: true });
          if (!pair) continue;
          return notation([...gs, pair]);
        }
        return notation(fallback14());
      }
      case "chinroutou":
        groups = b.buildHand((pool, o) => b.tryPung(pool, o), 4, {
          nums: [1, 9],
          honors: false,
          allowHonors: false,
        });
        break;
      case "ryuuiisou":
        groups = ryuuiisou();
        break;
      case "chuuren":
        return b.nineGatesNotation();
      case "suukantsu":
        groups = suukantsu();
        break;
      default:
        // Timing / luck yaku with no tile constraint — any standard hand
        groups = b.randomStandard14();
        break;
    }
    return notation(groups || b.fallback14());
  }

  window.RIICHI_RANDOMIZE = { randomizeExample };
})();
