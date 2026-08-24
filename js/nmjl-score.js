/**
 * NMJL hand matcher (v1) — 2026 card via NMJL_REGISTRY.
 * Interprets pattern notation + note constraints (any suits, these nos., dragons, etc.).
 * Study aid; confirm against your licensed card.
 */
(function () {
  const SUITS = ["B", "C", "P"];
  const DRAGON_FOR_SUIT = { B: "BD", C: "RD", P: "PD" };
  const OPP_DRAGON = { B: "RD", C: "BD", P: "RD" }; // rough: opposite often red vs suit dragon
  const YEAR_DIGITS = ["2", "0", "2", "6"];

  function isJoker(id) {
    return id === "J" || id === "J1" || id === "J2";
  }

  function isFlower(id) {
    return id === "F" || /^F[1-8]$/.test(id);
  }

  function isWind(id) {
    return id === "EW" || id === "SW" || id === "WW" || id === "NW";
  }

  function isDragon(id) {
    return id === "RD" || id === "GD" || id === "WD" || id === "BD" || id === "PD";
  }

  function isSoap(id) {
    return /^0[BCP]?$/.test(id);
  }

  function isNumber(id) {
    return /^[1-9][BCP]$/.test(id);
  }

  /** Soap tint is cosmetic — normalize to bare "0" for matching. */
  function canonId(id) {
    if (isSoap(id)) return "0";
    if (id === "J1" || id === "J2") return "J";
    if (/^F[1-8]$/.test(id)) return "F";
    return id;
  }

  function canonList(ids) {
    return ids.map(canonId);
  }

  function suitOf(id) {
    // Soap is white dragon; card color tint is not a real suit for remapping
    if (isSoap(id) || id === "0") return null;
    if (isNumber(id)) return id[1];
    if (id === "BD" || id === "GD") return "B";
    if (id === "RD") return "C";
    if (id === "PD" || id === "WD") return "P";
    return null;
  }

  function digitOf(id) {
    if (isNumber(id)) return id[0];
    if (isSoap(id) || id === "0") return "0";
    return null;
  }

  /** Expand card sugar → tile id list (no breaks). */
  function expandToIds(notation) {
    if (!notation || !window.NMJL_NOTATION || !window.Tiles) return [];
    const expanded = window.NMJL_NOTATION.expandHand(notation);
    return window.Tiles.parseHand(expanded)
      .filter((t) => t.type === "tile")
      .map((t) => t.id);
  }

  function groupsFromNotation(notation) {
    if (!notation) return [];
    return notation
      .split("|")
      .map((g) => expandToIds(g.trim()))
      .filter((g) => g.length);
  }

  /**
   * Parse free-text note into matcher constraints.
   * @param {string} [note]
   */
  function parseNote(note) {
    const n = String(note || "");
    const lower = n.toLowerCase();
    const c = {
      raw: note || "",
      anySuits: null, // number or [min,max] of distinct number-suits allowed/required flexibility
      suitFlex: false, // remap example suits
      theseNosOnly: /these nos/i.test(n),
      noJokers: /no jokers/i.test(n),
      matchingDragons: /matching dragons?/i.test(n),
      oppDragon: /opp\.?\s*dragon/i.test(n),
      anyDragon: /any dragon/i.test(n) && !/matching|opp/i.test(n),
      likeNumbers: /like nos|like numbers|any like nos/i.test(n),
      consec: null, // e.g. 3, 4, 5, 7
      kongDigits: null, // allowed kong number digits
      windsOnly: null, // subset of winds
      yearHand: /2026/.test(n),
      fixedWinds: /only these winds/i.test(n),
    };

    const suitM = lower.match(
      /any\s+(\d+)\s*(?:or\s+(\d+)\s+)?suits?/
    );
    if (suitM) {
      c.suitFlex = true;
      if (suitM[2]) c.anySuits = [Number(suitM[1]), Number(suitM[2])];
      else c.anySuits = Number(suitM[1]);
    } else if (/any\s+1\s+suit/i.test(n)) {
      c.suitFlex = true;
      c.anySuits = 1;
    }

    if (/1 or 2 suits|1 or 3 suits|2 or 3 suits/i.test(n)) {
      c.suitFlex = true;
      if (/1 or 2/.test(lower)) c.anySuits = [1, 2];
      else if (/1 or 3/.test(lower)) c.anySuits = [1, 3];
      else if (/2 or 3/.test(lower)) c.anySuits = [2, 3];
    }

    const consec = lower.match(/any\s+(\d+)\s+consec/);
    if (consec) {
      c.consec = Number(consec[1]);
      c.suitFlex = true;
      if (!c.theseNosOnly) c.numberFlex = true;
    }

    if (c.likeNumbers && !c.theseNosOnly) {
      c.numberFlex = true;
      c.suitFlex = true;
    }

    // "Kong 2 or 6" / "Like Kongs 2, 4, 5, 6, or 8" / "Kong 2, 4, 6, 8"
    const kongList = n.match(
      /(?:like\s+)?kongs?\s+([\d,\sor]+?)(?:\s*[.;]|$)/i
    );
    if (kongList) {
      const digits = [...kongList[1].matchAll(/\d/g)].map((m) => m[0]);
      if (digits.length) c.kongDigits = [...new Set(digits)];
    }

    if (/east and west only/i.test(n)) c.windsOnly = ["EW", "WW"];
    if (/north and south only/i.test(n)) c.windsOnly = ["NW", "SW"];

    if (c.theseNosOnly) c.numberFlex = false;

    // Default: if note mentions Any suits, allow remapping; else keep literal suits from example
    if (!c.suitFlex && /any\s+\d/i.test(n)) c.suitFlex = true;

    return c;
  }

  /** Multiset counts from id list. */
  function countIds(ids) {
    const m = Object.create(null);
    for (const id of ids) m[id] = (m[id] || 0) + 1;
    return m;
  }

  function cloneCounts(m) {
    return { ...m };
  }

  /**
   * Match exact pattern tile multiset against hand, with NMJL joker rules.
   * Jokers fill only identical-tile groups of size >= 3 (pung/kong/quint).
   * Singles, pairs, NEWS, flowers: no jokers.
   */
  function matchExact(handIds, patternIds, opts = {}) {
    const noJokers = !!opts.noJokers;
    const hand = [];
    let jokers = 0;
    for (const id of canonList(handIds)) {
      if (isJoker(id) || id === "J") jokers++;
      else hand.push(id);
    }
    if (noJokers && jokers > 0) {
      return { ok: false, reason: "This hand does not allow jokers.", missingScore: 100 };
    }
    if (noJokers) jokers = 0;

    const need = countIds(canonList(patternIds));
    const have = countIds(hand);
    let jokersLeft = jokers;
    let missingScore = 0;

    for (const id of Object.keys(need)) {
      const n = need[id];
      if (n >= 3) continue;
      const h = have[id] || 0;
      if (h < n) {
        missingScore += n - h;
        return {
          ok: false,
          reason: `Need ${n}× ${id} without jokers (have ${h}).`,
          missingScore,
        };
      }
      have[id] = h - n;
    }

    for (const id of Object.keys(need)) {
      const n = need[id];
      if (n < 3) continue;
      const h = have[id] || 0;
      if (h >= n) {
        have[id] = h - n;
        continue;
      }
      const missing = n - h;
      if (missing > jokersLeft) {
        missingScore += missing - jokersLeft;
        return {
          ok: false,
          reason: `Need ${n}× ${id} (have ${h}, jokers left ${jokersLeft}).`,
          missingScore,
        };
      }
      jokersLeft -= missing;
      have[id] = 0;
    }

    let extras = 0;
    for (const id of Object.keys(have)) {
      if (have[id] > 0) extras += have[id];
    }
    if (extras > 0) {
      return {
        ok: false,
        reason: `Extra tile(s) after matching pattern groups.`,
        missingScore: extras,
      };
    }
    if (jokersLeft > 0) {
      return {
        ok: false,
        reason: `Unused joker(s): ${jokersLeft}.`,
        missingScore: jokersLeft,
      };
    }
    return { ok: true, jokersUsed: jokers - jokersLeft, missingScore: 0 };
  }

  /** Remap suited tiles by suit map {B:C, C:P, ...} and optional digit map. */
  function remapTile(id, suitMap, digitMap) {
    if (isSoap(id) || id === "0") return "0";
    if (isNumber(id)) {
      const d = digitMap && digitMap[id[0]] != null ? digitMap[id[0]] : id[0];
      const s = suitMap[id[1]] || id[1];
      return `${d}${s}`;
    }
    if (id === "BD" || id === "GD") {
      const s = suitMap.B || "B";
      return DRAGON_FOR_SUIT[s] || id;
    }
    if (id === "RD") {
      const s = suitMap.C || "C";
      return DRAGON_FOR_SUIT[s] || "RD";
    }
    if (id === "PD" || id === "WD") {
      const s = suitMap.P || "P";
      return DRAGON_FOR_SUIT[s] || id;
    }
    return id;
  }

  function remapIds(ids, suitMap, digitMap) {
    return ids.map((id) => remapTile(id, suitMap, digitMap));
  }

  /** All injections from used pattern suits → B,C,P */
  function suitMapsFor(patternIds, anySuits) {
    const used = [];
    for (const id of patternIds) {
      const s = suitOf(id);
      if (s && SUITS.includes(s) && !used.includes(s)) used.push(s);
    }
    if (!used.length) return [{}];

    const maps = [];
    const targets = SUITS;

    function perms(arr) {
      if (arr.length <= 1) return [arr];
      const out = [];
      for (let i = 0; i < arr.length; i++) {
        const rest = arr.slice(0, i).concat(arr.slice(i + 1));
        for (const p of perms(rest)) out.push([arr[i], ...p]);
      }
      return out;
    }

    // Assign each used pattern suit a unique real suit
    const assign = (i, taken, map) => {
      if (i === used.length) {
        maps.push({ ...map });
        return;
      }
      for (const t of targets) {
        if (taken.has(t)) continue;
        taken.add(t);
        map[used[i]] = t;
        assign(i + 1, taken, map);
        taken.delete(t);
      }
    };
    assign(0, new Set(), {});

    return maps.length ? maps : [{}];
  }

  /** Digit remaps for like-numbers (all same digit → any) or consecutive shift. */
  function digitMapsFor(patternIds, constraints) {
    if (constraints.theseNosOnly || constraints.yearHand) return [null];
    if (!constraints.numberFlex) return [null];

    const digits = [];
    for (const id of patternIds) {
      const d = digitOf(id);
      if (d != null && d !== "0" && !digits.includes(d)) digits.push(d);
    }
    if (!digits.length) return [null];

    // Like numbers: single digit class
    if (constraints.likeNumbers && digits.length === 1) {
      const maps = [];
      for (let d = 1; d <= 9; d++) {
        maps.push({ [digits[0]]: String(d) });
      }
      return maps;
    }

    // Consecutive: shift so min digit becomes start
    if (constraints.consec && digits.length >= 2) {
      const nums = digits.map(Number).sort((a, b) => a - b);
      const min = nums[0];
      const span = nums[nums.length - 1] - min;
      const maps = [];
      for (let start = 1; start + span <= 9; start++) {
        const shift = start - min;
        const map = {};
        for (const d of digits) map[d] = String(Number(d) + shift);
        maps.push(map);
      }
      return maps.length ? maps : [null];
    }

    // Generic: if all digits appear as "example" consecutive run in pattern
    if (digits.length >= 2 && constraints.suitFlex) {
      const nums = digits.map(Number).sort((a, b) => a - b);
      const min = nums[0];
      const max = nums[nums.length - 1];
      if (max - min === digits.length - 1) {
        const maps = [];
        for (let start = 1; start + (max - min) <= 9; start++) {
          const shift = start - min;
          const map = {};
          for (const d of digits) map[d] = String(Number(d) + shift);
          maps.push(map);
        }
        return maps;
      }
    }

    return [null];
  }

  function distinctNumberSuits(ids) {
    const s = new Set();
    for (const id of ids) {
      if (isNumber(id) || /^0[BCP]$/.test(id)) s.add(id[id.length - 1]);
    }
    return s.size;
  }

  function kongDigitsIn(ids) {
    const need = countIds(ids);
    const out = [];
    for (const id of Object.keys(need)) {
      if (need[id] >= 4 && isNumber(id)) out.push(id[0]);
    }
    return out;
  }

  function validateExtraConstraints(patternIds, constraints) {
    if (constraints.kongDigits) {
      const kongs = kongDigitsIn(patternIds);
      for (const d of kongs) {
        if (!constraints.kongDigits.includes(d)) return false;
      }
    }
    if (constraints.windsOnly) {
      for (const id of patternIds) {
        if (isWind(id) && !constraints.windsOnly.includes(id)) return false;
      }
    }
    if (constraints.anySuits != null) {
      const n = distinctNumberSuits(patternIds);
      if (typeof constraints.anySuits === "number") {
        // "Any 2 suits" means the hand uses (up to) that many — pattern after remap should use that count
        if (n > constraints.anySuits && constraints.anySuits >= 1) {
          // allow fewer suited if honors-heavy; typically exact
        }
      }
    }
    return true;
  }

  /**
   * Try to match one concrete pattern string (or alternate) against hand.
   */
  function matchPatternString(handIds, tilesStr, note, extra = {}) {
    const constraints = parseNote(note);
    if (extra.categoryId === "like-numbers") {
      constraints.likeNumbers = true;
      constraints.numberFlex = true;
      constraints.suitFlex = true;
    }
    if (extra.categoryId === "consecutive" && !constraints.theseNosOnly) {
      constraints.numberFlex = true;
      constraints.suitFlex = true;
    }
    if (extra.categoryId === "year" || constraints.yearHand) {
      constraints.yearHand = true;
      constraints.numberFlex = false;
    }
    if (extra.categoryId === "2468" && constraints.theseNosOnly) {
      constraints.numberFlex = false;
    }
    if (extra.categoryId === "13579" && constraints.theseNosOnly) {
      constraints.numberFlex = false;
    }
    if (extra.categoryId === "369" && !constraints.theseNosOnly) {
      // 3-6-9 set is usually fixed digits unless note says otherwise
      constraints.numberFlex = false;
    }

    const baseIds = expandToIds(tilesStr);
    if (baseIds.length !== 14) {
      return { ok: false, reason: `Pattern expands to ${baseIds.length} tiles (need 14).` };
    }

    const suitMaps = constraints.suitFlex
      ? suitMapsFor(baseIds, constraints.anySuits)
      : [{}];
    const digitMaps = digitMapsFor(baseIds, constraints);

    const attempts = [];
    let bestMiss = null;
    for (const sm of suitMaps) {
      for (const dm of digitMaps) {
        const ids = remapIds(baseIds, sm, dm);
        if (!validateExtraConstraints(ids, constraints)) continue;
        const m = matchExact(handIds, ids, { noJokers: constraints.noJokers });
        if (m.ok) {
          attempts.push({
            ok: true,
            patternIds: ids,
            suitMap: sm,
            digitMap: dm,
            jokersUsed: m.jokersUsed,
            constraints,
          });
        } else if (
          !bestMiss ||
          (m.missingScore != null && m.missingScore < bestMiss.missingScore)
        ) {
          bestMiss = {
            reason: m.reason,
            exampleIds: canonList(ids),
            suitMap: sm,
            digitMap: dm,
            missingScore: m.missingScore ?? 99,
          };
        }
      }
    }

    if (attempts.length) return attempts[0];

    return {
      ok: false,
      reason: bestMiss?.reason || "No suit/number remapping matched this pattern.",
      constraints,
      exampleIds: bestMiss?.exampleIds || canonList(baseIds),
      suitMap: bestMiss?.suitMap || null,
      digitMap: bestMiss?.digitMap || null,
      baseIds: canonList(baseIds),
      suitMapsTried: suitMaps.length,
      digitMapsTried: digitMaps.length,
    };
  }

  function summarizeHand(handIds) {
    const c = countIds(canonList(handIds));
    return Object.keys(c)
      .sort()
      .map((id) => `${id}×${c[id]}`)
      .join(" ");
  }

  /**
   * Evaluate hand against 2026 (or given year) card.
   * @param {string[]} handIds
   * @param {{ year?: number, concealed?: boolean }} [ctx]
   */
  function evaluate(handIds, ctx = {}) {
    const year = ctx.year || 2026;
    const reg = window.NMJL_REGISTRY;
    if (!reg?.cards?.[year]) {
      return { ok: false, errors: [`No card data for ${year}.`], debug: null };
    }
    if (!handIds || handIds.length !== 14) {
      return {
        ok: false,
        errors: [`Need exactly 14 tiles (have ${handIds?.length ?? 0}).`],
        debug: { hand: handIds || [] },
      };
    }

    const card = reg.cards[year];
    const matches = [];
    const debugLines = [];

    for (const cat of card.categories) {
      for (const hand of cat.hands) {
        const variants = Array.isArray(hand.tiles) ? hand.tiles : [hand.tiles];
        let lineMatched = false;
        for (let vi = 0; vi < variants.length; vi++) {
          const r = matchPatternString(handIds, variants[vi], hand.note, {
            categoryId: cat.id,
          });
          debugLines.push({
            id: hand.id,
            category: cat.id,
            variant: vi,
            tiles: variants[vi],
            note: hand.note || "",
            ok: !!r.ok,
            reason: r.ok ? "match" : r.reason || "no match",
            exampleIds: r.exampleIds || r.patternIds || null,
            suitMap: r.suitMap || null,
          });
          if (r.ok) {
            matches.push({
              id: hand.id,
              category: cat.title,
              categoryId: cat.id,
              value: hand.value,
              concealed: !!hand.concealed,
              note: hand.note || "",
              variantIndex: vi,
              jokersUsed: r.jokersUsed,
              patternIds: r.patternIds,
            });
            lineMatched = true;
            break;
          }
        }
        if (lineMatched) continue;
      }
    }

    // Concealed-only card hands: if user marked exposed, still show but warn
    const exposed = ctx.concealed === false;
    const filtered = matches.filter((m) => {
      if (exposed && m.concealed) return false;
      return true;
    });

    filtered.sort((a, b) => b.value - a.value);

    const debug = {
      year,
      concealed: ctx.concealed !== false,
      hand: handIds.slice(),
      handCanon: canonList(handIds),
      handSummary: summarizeHand(handIds),
      matchCount: filtered.length,
      matches: filtered.map((m) => ({
        id: m.id,
        value: m.value,
        note: m.note,
        patternIds: m.patternIds,
      })),
      lines: debugLines,
    };

    if (!filtered.length) {
      const yearMiss = debugLines.filter((l) => l.category === "year" && !l.ok);
      const hints = [];
      hints.push(`Hand: ${debug.handSummary}`);
      if (yearMiss.length) {
        hints.push("Year-line attempts:");
        for (const y of yearMiss) {
          hints.push(
            `  ${y.id}: ${y.reason}` +
              (y.exampleIds ? ` (e.g. pattern ${y.exampleIds.join(" ")})` : "")
          );
        }
        hints.push(
          "Note: 2026-a example is pung of 2s in suit A, soap pung, then kong of 2s AND kong of 6s in the same suit B (Any 2 Suits)."
        );
      }
      return {
        ok: false,
        errors: [
          matches.length
            ? "Matches found only for concealed-only lines (hand marked exposed)."
            : "No matching 2026 card line for this 14-tile hand.",
          ...hints,
        ],
        matches: [],
        year,
        debug,
      };
    }

    return {
      ok: true,
      errors: [],
      best: filtered[0],
      matches: filtered,
      year,
      debug,
    };
  }

  function formatResult(result) {
    if (!result.ok || !result.best) {
      return {
        summary: "No match",
        detail: (result.errors || []).join("\n"),
      };
    }
    const lines = result.matches.map(
      (m) =>
        `${m.category} · ${m.id} · ${m.value} pts${
          m.concealed ? " (concealed)" : ""
        }${m.note ? ` — ${m.note}` : ""}`
    );
    const b = result.best;
    return {
      summary: `Match: ${b.category} / ${b.id} · ${b.value} points`,
      detail: [
        b.note && `Note: ${b.note}`,
        b.jokersUsed ? `Jokers used: ${b.jokersUsed}` : "No jokers used",
        result.matches.length > 1
          ? `\nAll matches (${result.matches.length}):\n${lines.join("\n")}`
          : lines[0],
        `\nCard year: ${result.year} · confirm against your licensed card.`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  }

  /** Build a clipboard/console-friendly debug dump from an evaluate() result. */
  function formatDebugDump(result) {
    const d = result?.debug;
    if (!d) return JSON.stringify(result, null, 2);
    const failed = (d.lines || []).filter((l) => !l.ok);
    const matched = (d.lines || []).filter((l) => l.ok);
    return [
      `NMJL ${d.year} evaluate debug`,
      `concealed: ${d.concealed}`,
      `hand: ${JSON.stringify(d.hand)}`,
      `canon: ${JSON.stringify(d.handCanon)}`,
      `summary: ${d.handSummary}`,
      `matches: ${d.matchCount}`,
      matched.length
        ? `matched lines:\n${matched.map((l) => `  ✓ ${l.id} v${l.variant} ${l.tiles}`).join("\n")}`
        : "matched lines: (none)",
      `failed lines (${failed.length}):`,
      ...failed.map(
        (l) =>
          `  ✗ ${l.id} v${l.variant}: ${l.reason}\n    tiles: ${l.tiles}\n    note: ${l.note}`
      ),
      "",
      "JSON:",
      JSON.stringify(d, null, 2),
    ].join("\n");
  }

  window.NmjlScore = {
    evaluate,
    formatResult,
    formatDebugDump,
    parseNote,
    expandToIds,
    matchExact,
    matchPatternString,
    canonId,
    canonList,
  };
})();
