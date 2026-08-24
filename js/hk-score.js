/**
 * Hong Kong / Cantonese closed-hand faan analysis (v1).
 * Study aid aligned with hk-data.js patterns — not a substitute for your table sheet.
 */
(function () {
  const SUIT = { C: 0, P: 1, B: 2 }; // man, pin, sou
  const HONOR = {
    EW: 27,
    SW: 28,
    WW: 29,
    NW: 30,
    WD: 31,
    GD: 32,
    RD: 33,
  };
  const WIND_KEYS = { east: 27, south: 28, west: 29, north: 30 };
  const DRAGONS = [31, 32, 33];
  const WINDS = [27, 28, 29, 30];

  function tileToIndex(id) {
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
    const suit = ["C", "P", "B"][Math.floor(idx / 9)];
    return `${(idx % 9) + 1}${suit}`;
  }

  function countsFromIds(ids) {
    const c = new Array(34).fill(0);
    for (const id of ids) {
      const i = tileToIndex(id);
      if (i < 0) return null;
      c[i]++;
      if (c[i] > 4) return null;
    }
    return c;
  }

  function cloneCounts(c) {
    return c.slice();
  }

  function removeChow(c, i) {
    // i is lowest of three consecutive in same suit
    if (i >= 27) return false;
    const r = i % 9;
    if (r > 6) return false;
    if (c[i] && c[i + 1] && c[i + 2]) {
      c[i]--;
      c[i + 1]--;
      c[i + 2]--;
      return true;
    }
    return false;
  }

  function removePung(c, i) {
    if (c[i] >= 3) {
      c[i] -= 3;
      return true;
    }
    return false;
  }

  /** Recursively strip melds; push { melds } when empty. */
  function findMelds(c, melds, out) {
    let first = -1;
    for (let i = 0; i < 34; i++) {
      if (c[i] > 0) {
        first = i;
        break;
      }
    }
    if (first < 0) {
      out.push(melds.map((m) => ({ ...m })));
      return;
    }

    // Pung
    if (c[first] >= 3) {
      const next = cloneCounts(c);
      removePung(next, first);
      findMelds(next, [...melds, { type: "pung", tile: first }], out);
    }

    // Chow starting at first (only if first is a suited tile that can start)
    if (first < 27 && first % 9 <= 6 && c[first] && c[first + 1] && c[first + 2]) {
      const next = cloneCounts(c);
      removeChow(next, first);
      findMelds(
        next,
        [...melds, { type: "chow", tile: first }], // tile = lowest
        out
      );
    }
  }

  function standardInterpretations(counts) {
    const results = [];
    for (let pair = 0; pair < 34; pair++) {
      if (counts[pair] < 2) continue;
      const c = cloneCounts(counts);
      c[pair] -= 2;
      const meldSets = [];
      findMelds(c, [], meldSets);
      for (const melds of meldSets) {
        if (melds.length === 4) {
          results.push({ kind: "standard", pair, melds });
        }
      }
    }
    // Deduplicate by signature
    const seen = new Set();
    return results.filter((r) => {
      const sig = `${r.pair}|${r.melds
        .map((m) => `${m.type}:${m.tile}`)
        .sort()
        .join(",")}`;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }

  function isSevenPairs(counts) {
    let pairs = 0;
    for (let i = 0; i < 34; i++) {
      if (counts[i] === 2) pairs++;
      else if (counts[i] !== 0) return false;
    }
    return pairs === 7;
  }

  function isThirteenOrphans(counts) {
    const need = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];
    let extra = false;
    for (let i = 0; i < 34; i++) {
      if (need.includes(i)) {
        if (counts[i] === 0) return false;
        if (counts[i] === 2) {
          if (extra) return false;
          extra = true;
        } else if (counts[i] !== 1) return false;
      } else if (counts[i] !== 0) return false;
    }
    return extra;
  }

  function isNineGates(counts) {
    for (let suit = 0; suit < 3; suit++) {
      const base = suit * 9;
      const need = [3, 1, 1, 1, 1, 1, 1, 1, 3];
      let ok = true;
      let extras = 0;
      for (let r = 0; r < 9; r++) {
        const n = counts[base + r];
        if (n < need[r]) {
          ok = false;
          break;
        }
        extras += n - need[r];
      }
      if (!ok || extras !== 1) continue;
      // no tiles outside suit
      for (let i = 0; i < 34; i++) {
        if (i >= base && i < base + 9) continue;
        if (counts[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return true;
    }
    return false;
  }

  function suitedUsed(counts) {
    const suits = new Set();
    for (let i = 0; i < 27; i++) {
      if (counts[i]) suits.add(Math.floor(i / 9));
    }
    return suits;
  }

  function hasOnlyTerminalsAndHonors(counts) {
    for (let i = 0; i < 27; i++) {
      if (!counts[i]) continue;
      const r = i % 9;
      if (r !== 0 && r !== 8) return false;
    }
    return true;
  }

  function hasOnlyTerminals(counts) {
    for (let i = 0; i < 34; i++) {
      if (!counts[i]) continue;
      if (i >= 27) return false;
      const r = i % 9;
      if (r !== 0 && r !== 8) return false;
    }
    return true;
  }

  function hasOnlyHonors(counts) {
    for (let i = 0; i < 27; i++) if (counts[i]) return false;
    return true;
  }

  function pungTiles(interp) {
    return interp.melds.filter((m) => m.type === "pung").map((m) => m.tile);
  }

  function scoreStandard(interp, counts, ctx) {
    const faan = [];
    const pungs = pungTiles(interp);
    const chows = interp.melds.filter((m) => m.type === "chow");
    const allPungs = chows.length === 0;
    const allChows = pungs.length === 0;
    const dragonPungs = pungs.filter((t) => DRAGONS.includes(t));
    const windPungs = pungs.filter((t) => WINDS.includes(t));

    // Limit / high patterns first
    if (hasOnlyHonors(counts)) {
      faan.push({ id: "all-honors", name: "All Honors", faan: 13 });
      return faan;
    }
    if (hasOnlyTerminals(counts)) {
      faan.push({ id: "all-terminals", name: "All Terminals", faan: 13 });
      return faan;
    }
    if (windPungs.length === 4) {
      faan.push({ id: "big-winds", name: "Big Four Winds", faan: 13 });
      return faan;
    }
    if (dragonPungs.length === 3) {
      faan.push({ id: "big-dragons", name: "Big Three Dragons", faan: 8 });
      // often stacks with other suit patterns below
    }

    if (allPungs && pungs.length === 4) {
      faan.push({
        id: "all-concealed-triplets",
        name: "All Concealed Triplets",
        faan: 8,
      });
    } else if (allPungs) {
      faan.push({ id: "all-pungs", name: "All Triplets", faan: 3 });
    }

    if (allChows) {
      faan.push({ id: "ping-wu", name: "All Sequences", faan: 1 });
    }

    // Suit patterns
    let suitedSuit = null;
    let hasHonor = false;
    let multiSuit = false;
    for (let i = 0; i < 34; i++) {
      if (!counts[i]) continue;
      if (i >= 27) {
        hasHonor = true;
        continue;
      }
      const s = Math.floor(i / 9);
      if (suitedSuit == null) suitedSuit = s;
      else if (suitedSuit !== s) multiSuit = true;
    }
    if (!multiSuit && suitedSuit != null && !hasHonor) {
      faan.push({ id: "full-flush", name: "Full Flush", faan: 7 });
    } else if (!multiSuit && suitedSuit != null && hasHonor) {
      faan.push({ id: "half-flush", name: "Mixed One Suit", faan: 3 });
    } else if (suitedUsed(counts).size === 2) {
      faan.push({ id: "voided-suit", name: "Voided Suit", faan: 2 });
    }

    if (windPungs.length === 3 && WINDS.includes(interp.pair)) {
      faan.push({ id: "small-winds", name: "Small Four Winds", faan: 6 });
    }

    if (dragonPungs.length === 2 && DRAGONS.includes(interp.pair)) {
      // don't double-count if big dragons already
      if (!faan.some((f) => f.id === "big-dragons")) {
        faan.push({ id: "small-dragons", name: "Small Three Dragons", faan: 5 });
      }
    }

    if (
      hasOnlyTerminalsAndHonors(counts) &&
      !hasOnlyTerminals(counts) &&
      !hasOnlyHonors(counts)
    ) {
      faan.push({ id: "mixed-terminals", name: "Mixed Terminals", faan: 3 });
    }

    if (pungs.length >= 3 && !faan.some((f) => f.id === "all-concealed-triplets")) {
      faan.push({
        id: "three-concealed",
        name: "Three Concealed Triplets",
        faan: 2,
      });
    }

    // Per-dragon / winds (skip if absorbed into big/small dragons or big/small winds)
    const skipDragonSingles = faan.some(
      (f) => f.id === "big-dragons" || f.id === "small-dragons"
    );
    const skipWindSeatRound = faan.some(
      (f) => f.id === "big-winds" || f.id === "small-winds"
    );

    if (!skipDragonSingles) {
      for (const d of dragonPungs) {
        const names = { 31: "White Dragon", 32: "Green Dragon", 33: "Red Dragon" };
        faan.push({
          id: "dragon-pung",
          name: names[d] || "Dragon",
          faan: 1,
        });
      }
    }

    if (!skipWindSeatRound) {
      if (pungs.includes(WIND_KEYS[ctx.seatWind])) {
        faan.push({ id: "seat-wind", name: "Seat Wind", faan: 1 });
      }
      if (pungs.includes(WIND_KEYS[ctx.roundWind])) {
        // same tile can be both seat and round
        faan.push({ id: "round-wind", name: "Round Wind", faan: 1 });
      }
    }

    return faan;
  }

  function situationalFaan(ctx) {
    const faan = [];
    if (ctx.selfDraw) {
      faan.push({ id: "self-draw", name: "Self-Drawn", faan: 1 });
    }
    if (ctx.fullyConcealed) {
      faan.push({ id: "fully-concealed", name: "Fully Concealed", faan: 1 });
    }
    if (ctx.robKong) {
      faan.push({ id: "rob-kong", name: "Robbing the Kong", faan: 1 });
    }
    if (ctx.lastDraw) {
      faan.push({
        id: "under-the-sea",
        name: "Moon from the Bottom of the Sea",
        faan: 1,
      });
    }
    if (ctx.kongReplace) {
      faan.push({
        id: "kong-replacement",
        name: "Win by Kong Replacement",
        faan: 2,
      });
    }
    if (ctx.doubleKongReplace) {
      faan.push({
        id: "double-kong-replacement",
        name: "Double Kong Replacement",
        faan: 9,
      });
    }
    if (ctx.heavenly) {
      faan.push({ id: "heavenly-hand", name: "Blessing of Heaven", faan: 13 });
    }
    if (ctx.earthly) {
      faan.push({ id: "earthly-hand", name: "Blessing of Earth", faan: 13 });
    }
    if (ctx.humanly) {
      faan.push({ id: "humanly-hand", name: "Blessing of Man", faan: 13 });
    }
    return faan;
  }

  function dedupeFaan(list) {
    // Keep multiple dragon-pung entries; collapse identical ids except dragon-pung
    const out = [];
    const seen = new Set();
    for (const f of list) {
      if (f.id === "dragon-pung") {
        out.push(f);
        continue;
      }
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      out.push(f);
    }
    return out;
  }

  /**
   * @param {string[]} handIds 14 tile ids
   * @param {object} ctx
   */
  function evaluate(handIds, ctx = {}) {
    const minFaan = ctx.minFaan ?? 3;
    const errors = [];
    if (!handIds || handIds.length !== 14) {
      return {
        ok: false,
        errors: [`Need exactly 14 tiles (have ${handIds?.length ?? 0}).`],
      };
    }

    const counts = countsFromIds(handIds);
    if (!counts) {
      return { ok: false, errors: ["Invalid or over-copied tiles."] };
    }

    const options = [];

    if (isThirteenOrphans(counts)) {
      options.push({
        kind: "thirteen-orphans",
        patternFaan: [
          { id: "thirteen-orphans", name: "Thirteen Orphans", faan: 13 },
        ],
      });
    }
    if (isNineGates(counts)) {
      options.push({
        kind: "nine-gates",
        patternFaan: [{ id: "nine-gates", name: "Nine Gates", faan: 13 }],
      });
    }
    if (isSevenPairs(counts)) {
      options.push({
        kind: "seven-pairs",
        patternFaan: [{ id: "seven-pairs", name: "Seven Pairs", faan: 4 }],
      });
    }

    for (const interp of standardInterpretations(counts)) {
      options.push({
        kind: "standard",
        interp,
        patternFaan: scoreStandard(interp, counts, ctx),
      });
    }

    if (!options.length) {
      return {
        ok: false,
        errors: ["Not a winning hand shape (need four melds + pair, or a special hand)."],
      };
    }

    const situ = situationalFaan({
      selfDraw: !!ctx.selfDraw,
      fullyConcealed: ctx.fullyConcealed !== false, // closed v1 default true
      robKong: !!ctx.robKong,
      lastDraw: !!ctx.lastDraw,
      kongReplace: !!ctx.kongReplace,
      doubleKongReplace: !!ctx.doubleKongReplace,
      heavenly: !!ctx.heavenly,
      earthly: !!ctx.earthly,
      humanly: !!ctx.humanly,
    });

    const scored = options.map((o) => {
      let items = dedupeFaan([...(o.patternFaan || []), ...situ]);
      // If any 13-faan limit pattern from tiles, prefer that total as limit
      const limit = items.find((f) => f.faan >= 13);
      const total = items.reduce((s, f) => s + f.faan, 0);
      return {
        kind: o.kind,
        interp: o.interp,
        items,
        total,
        isLimit: !!limit && limit.faan >= 13 && o.patternFaan?.some((p) => p.faan >= 13),
        meetsMinimum: total >= minFaan,
      };
    });

    scored.sort((a, b) => b.total - a.total);
    const best = scored[0];

    if (!best.meetsMinimum) {
      errors.push(
        `Hand is a valid shape but only ${best.total} faan (table minimum ${minFaan}).`
      );
    }

    return {
      ok: best.meetsMinimum,
      errors,
      best,
      alternatives: scored.slice(1, 4),
      minFaan,
    };
  }

  function formatResult(result) {
    if (!result.best) return { summary: "No result.", detail: "" };
    const b = result.best;
    const lines = b.items.map((f) => `${f.name} · ${f.faan} faan`);
    const summary = b.isLimit
      ? `Limit hand · ${b.total} faan`
      : `${b.total} faan` + (b.meetsMinimum ? "" : ` (below min ${result.minFaan})`);
    const detail = [
      lines.join("\n"),
      b.interp
        ? `Pair: ${indexToId(b.interp.pair)} · Melds: ${b.interp.melds
            .map((m) =>
              m.type === "chow"
                ? `chow ${indexToId(m.tile)}-${indexToId(m.tile + 2)}`
                : `pung ${indexToId(m.tile)}`
            )
            .join(", ")}`
        : `Shape: ${b.kind}`,
      "Closed hand · study aid (house rules may differ).",
    ]
      .filter(Boolean)
      .join("\n");
    return { summary, detail };
  }

  window.HkScore = {
    evaluate,
    formatResult,
    tileToIndex,
    indexToId,
  };
})();
