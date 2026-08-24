/**
 * Filipino closed-hand analysis (v1): 17 tiles = five melds + pair.
 * Study aid aligned with filipino-data.js — house sheets vary.
 */
(function () {
  const SUIT = { C: 0, P: 1, B: 2 };
  const HONOR = {
    EW: 27,
    SW: 28,
    WW: 29,
    NW: 30,
    WD: 31,
    GD: 32,
    RD: 33,
  };

  function isJokerId(id) {
    return id === "J" || id === "J1" || id === "J2";
  }

  function tileToIndex(id) {
    if (isJokerId(id)) return -2; // joker / wild
    if (HONOR[id] != null) return HONOR[id];
    const m = String(id).match(/^([1-9])([CPB])$/);
    if (!m) return -1;
    return SUIT[m[2]] * 9 + (Number(m[1]) - 1);
  }

  function indexToId(idx) {
    if (idx >= 27) {
      return (
        { 27: "EW", 28: "SW", 29: "WW", 30: "NW", 31: "WD", 32: "GD", 33: "RD" }[
          idx
        ] || "?"
      );
    }
    return `${(idx % 9) + 1}${["C", "P", "B"][Math.floor(idx / 9)]}`;
  }

  function countsFromIds(ids, wildId) {
    const c = new Array(34).fill(0);
    let wilds = 0;
    const wildIdx = wildId && !isJokerId(wildId) ? tileToIndex(wildId) : -1;
    for (const id of ids) {
      if (isJokerId(id)) {
        wilds++;
        continue;
      }
      const i = tileToIndex(id);
      if (i < 0) return null;
      if (wildIdx >= 0 && i === wildIdx) {
        wilds++;
        continue;
      }
      c[i]++;
      if (c[i] > 4) return null;
    }
    return { c, wilds, wildIdx };
  }

  function cloneCounts(c) {
    return c.slice();
  }

  function firstTile(c) {
    for (let i = 0; i < 34; i++) if (c[i] > 0) return i;
    return -1;
  }

  /**
   * Strip five melds using optional wilds.
   * @param {number} targetMelds
   */
  function findMelds(c, w, melds, targetMelds, out) {
    if (melds.length === targetMelds) {
      if (firstTile(c) < 0 && w === 0) out.push(melds.map((m) => ({ ...m })));
      return;
    }

    const first = firstTile(c);
    if (first < 0) {
      // only wilds left — need full wild melds (usually disallowed); stop
      return;
    }

    // Pung of `first` (may consume wilds)
    for (let nat = Math.min(3, c[first]); nat >= 1; nat--) {
      const need = 3 - nat;
      if (need > w) continue;
      const next = cloneCounts(c);
      next[first] -= nat;
      findMelds(
        next,
        w - need,
        [...melds, { type: "pung", tile: first, wilds: need }],
        targetMelds,
        out
      );
    }

    // Chows that include `first`
    if (first < 27) {
      const r = first % 9;
      const base = first - r;
      const starts = [];
      if (r <= 6) starts.push(first); // first is low
      if (r >= 1 && r <= 7) starts.push(first - 1); // first is mid
      if (r >= 2) starts.push(first - 2); // first is high
      for (const start of starts) {
        if (start < base || start > base + 6) continue;
        tryChow(c, w, melds, targetMelds, out, start, start + 1, start + 2);
      }
    }
  }

  function tryChow(c, w, melds, targetMelds, out, a, b, d) {
    if (a >= 27 || Math.floor(a / 9) !== Math.floor(d / 9)) return;
    let need = 0;
    const next = cloneCounts(c);
    for (const t of [a, b, d]) {
      if (next[t] > 0) next[t]--;
      else need++;
    }
    if (need > w) return;
    findMelds(
      next,
      w - need,
      [...melds, { type: "chow", tile: a, wilds: need }],
      targetMelds,
      out
    );
  }

  function standardInterpretations(counts, wilds) {
    const results = [];
    const targetMelds = 5;

    // Pair: two naturals, or one natural + wild, or two wilds
    for (let pair = 0; pair < 34; pair++) {
      for (let nat = Math.min(2, counts[pair]); nat >= 0; nat--) {
        const need = 2 - nat;
        if (need > wilds) continue;
        if (nat === 0 && need < 2) continue; // don't use single wild as "pair of tile X" without natural — allow 2 wilds as joker eye
        if (nat === 0 && need !== 2) continue;
        const c = cloneCounts(counts);
        c[pair] -= nat;
        const meldSets = [];
        findMelds(c, wilds - need, [], targetMelds, meldSets);
        for (const melds of meldSets) {
          results.push({
            kind: "standard",
            pair,
            pairWilds: need,
            jokerEye: need > 0,
            melds,
          });
        }
      }
    }

    // Two wilds as eye without assigning a pair tile — treat as joker eye on a free pair slot
    // Already covered by nat=0 need=2 for each pair index; dedupe later.

    const seen = new Set();
    return results.filter((r) => {
      const sig = `${r.pair}:${r.pairWilds}|${r.melds
        .map((m) => `${m.type}:${m.tile}:${m.wilds || 0}`)
        .sort()
        .join(",")}`;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }

  /** Seven pairs + one pung (17 tiles). */
  function sevenPairsPlusPung(counts, wilds) {
    const options = [];
    // Choose pung tile
    for (let pung = 0; pung < 34; pung++) {
      for (let pNat = Math.min(3, counts[pung]); pNat >= 0; pNat--) {
        const pNeed = 3 - pNat;
        if (pNeed > wilds) continue;
        if (pNat === 0 && pNeed !== 3) continue;
        const c = cloneCounts(counts);
        c[pung] -= pNat;
        let w = wilds - pNeed;
        // Remaining must form 7 pairs
        const pairs = [];
        let ok = true;
        for (let i = 0; i < 34 && ok; i++) {
          while (c[i] >= 2) {
            c[i] -= 2;
            pairs.push(i);
          }
          if (c[i] === 1) {
            if (w < 1) {
              ok = false;
              break;
            }
            w--;
            pairs.push(i);
            c[i] = 0;
          }
        }
        if (!ok) continue;
        // leftover wilds as full pairs
        while (w >= 2 && pairs.length < 7) {
          w -= 2;
          pairs.push(-1); // wild pair
        }
        if (w !== 0 || pairs.length !== 7) continue;
        options.push({
          kind: "seven-pairs",
          pung,
          pungWilds: pNeed,
          pairs,
        });
      }
    }
    return options;
  }

  function hasPureStraight(melds) {
    // 123, 456, 789 same suit
    for (let suit = 0; suit < 3; suit++) {
      const base = suit * 9;
      const need = new Set([base, base + 3, base + 6]);
      const have = new Set(
        melds.filter((m) => m.type === "chow" && need.has(m.tile)).map((m) => m.tile)
      );
      if (have.size === 3) return true;
    }
    return false;
  }

  function scoreStandard(interp, rawCounts, ctx) {
    const items = [];
    const pungs = interp.melds.filter((m) => m.type === "pung");
    const chows = interp.melds.filter((m) => m.type === "chow");
    const allPungs = chows.length === 0;
    const allChows = pungs.length === 0;

    items.push({ id: "winning", name: "Winning (Todas)", points: 1 });

    if (allChows) {
      items.push({ id: "all-chows", name: "All Chows", points: 0.25 });
    }
    if (allPungs) {
      items.push({ id: "all-pungs", name: "All Pungs", points: 0.25 });
    }
    if (ctx.concealed) {
      items.push({ id: "concealed", name: "Concealed Hand", points: 0.25 });
    }
    if (ctx.allRevealed) {
      items.push({ id: "all-revealed", name: "All Revealed", points: 0.25 });
    }
    if (ctx.quickWin) {
      items.push({ id: "quick-win", name: "Quick Win", points: 0.25 });
    }
    if (ctx.difficultWait) {
      items.push({ id: "difficult-wait", name: "Difficult Wait", points: 0.25 });
    }

    if (hasPureStraight(interp.melds)) {
      items.push({ id: "pure-straight", name: "Pure Straight", points: 0.5 });
    }

    // Full flush: all number tiles one suit (honors allowed as "bonus" aside — cheatsheet says number tiles single suit)
    let suitedSuit = null;
    let multi = false;
    let anySuited = false;
    for (let i = 0; i < 27; i++) {
      if (!rawCounts[i]) continue;
      anySuited = true;
      const s = Math.floor(i / 9);
      if (suitedSuit == null) suitedSuit = s;
      else if (suitedSuit !== s) multi = true;
    }
    // Also check melds/pair for suit consistency on suited tiles
    if (!multi && anySuited && suitedSuit != null) {
      let ok = true;
      if (interp.pair < 27 && Math.floor(interp.pair / 9) !== suitedSuit) ok = false;
      for (const m of interp.melds) {
        if (m.tile < 27 && Math.floor(m.tile / 9) !== suitedSuit) ok = false;
      }
      if (ok) {
        items.push({ id: "full-flush", name: "Full Flush", points: 0.5 });
      }
    }

    if (interp.jokerEye && ctx.selfDraw !== false) {
      items.push({ id: "joker-eye", name: "Joker Eye", points: 0.25 });
    } else if (interp.jokerEye && ctx.selfDraw === false) {
      // still note it but many tables require self-draw — mark only if self-draw
    }

    if (ctx.noFlowersDeal) {
      items.push({ id: "no-flowers-start", name: "No Flowers (deal)", points: 0.25 });
    }
    if (ctx.flowerSet) {
      items.push({ id: "flower-set", name: "Flower Set", points: 0.5 });
    }
    if (ctx.seasonSet) {
      items.push({ id: "season-set", name: "Season Set", points: 0.5 });
    }

    return items;
  }

  function scoreSevenPairs(opt, ctx) {
    const items = [
      { id: "winning", name: "Winning (Todas)", points: 1 },
      { id: "seven-pairs", name: "Seven Pairs", points: 0.5 },
    ];
    if (ctx.concealed) {
      items.push({ id: "concealed", name: "Concealed Hand", points: 0.25 });
    }
    if (ctx.quickWin) {
      items.push({ id: "quick-win", name: "Quick Win", points: 0.25 });
    }
    if (ctx.noFlowersDeal) {
      items.push({ id: "no-flowers-start", name: "No Flowers (deal)", points: 0.25 });
    }
    if (ctx.flowerSet) {
      items.push({ id: "flower-set", name: "Flower Set", points: 0.5 });
    }
    if (ctx.seasonSet) {
      items.push({ id: "season-set", name: "Season Set", points: 0.5 });
    }
    return items;
  }

  function totalPoints(items) {
    return items.reduce((s, x) => s + x.points, 0);
  }

  function evaluate(handIds, ctx = {}) {
    if (!handIds || handIds.length !== 17) {
      return {
        ok: false,
        errors: [`Need exactly 17 tiles (have ${handIds?.length ?? 0}).`],
      };
    }

    const parsed = countsFromIds(handIds, ctx.wildId || null);
    if (!parsed) {
      return { ok: false, errors: ["Invalid or over-copied tiles."] };
    }

    const { c, wilds } = parsed;
    // Raw counts including wilds as their face (for flush detection of naturals)
    const raw = countsFromIds(handIds, null);
    if (!raw) {
      return { ok: false, errors: ["Invalid tiles."] };
    }

    const options = [];

    for (const interp of standardInterpretations(c, wilds)) {
      options.push({
        kind: "standard",
        interp,
        items: scoreStandard(interp, raw.c, ctx),
      });
    }

    for (const sp of sevenPairsPlusPung(c, wilds)) {
      options.push({
        kind: "seven-pairs",
        interp: sp,
        items: scoreSevenPairs(sp, ctx),
      });
    }

    const jokerCount = handIds.filter(isJokerId).length;

    if (!options.length) {
      return {
        ok: false,
        errors: [
          "Not a winning hand shape (need five melds + pair, or seven pairs + pung).",
          "If using jokers, check that they can complete the missing tiles.",
        ],
        jokerCount,
      };
    }

    const scored = options.map((o) => ({
      ...o,
      total: totalPoints(o.items),
    }));
    scored.sort((a, b) => b.total - a.total);
    const best = scored[0];

    return {
      ok: true,
      errors: [],
      best,
      alternatives: scored.slice(1, 4),
      jokerCount,
    };
  }

  function formatResult(result) {
    if (!result.best) return { summary: "No result.", detail: "" };
    const b = result.best;
    const lines = b.items.map((f) => `${f.name} · ${f.points} pt`);
    const summary = `${b.total} point${b.total === 1 ? "" : "s"}`;
    let shape = "";
    if (b.kind === "seven-pairs") {
      shape = `Seven pairs + pung ${indexToId(b.interp.pung)}`;
    } else if (b.interp) {
      shape = `Pair: ${indexToId(b.interp.pair)}${
        b.interp.jokerEye ? " (joker eye)" : ""
      } · Melds: ${b.interp.melds
        .map((m) =>
          m.type === "chow"
            ? `chow ${indexToId(m.tile)}-${indexToId(m.tile + 2)}`
            : `pung ${indexToId(m.tile)}`
        )
        .join(", ")}`;
    }
    const detail = [
      lines.join("\n"),
      shape,
      handIdsHasJoker(result) ? "Includes joker wilds." : null,
      "Closed 17-tile hand · study aid (house rules may differ).",
    ]
      .filter(Boolean)
      .join("\n");
    return { summary, detail };
  }

  function handIdsHasJoker(result) {
    return (result.jokerCount || 0) > 0;
  }

  window.FilipinoScore = {
    evaluate,
    formatResult,
    tileToIndex,
    indexToId,
    isJokerId,
  };
})();
