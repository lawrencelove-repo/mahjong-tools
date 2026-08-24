/**
 * Hand Evaluation — closed 14-tile picker + full score via riichi-score.
 * Loaded as ES module; exposes window.HandEvaluator (and HandVerifier alias).
 */
import {
  calculate,
  createGameState,
} from "https://cdn.jsdelivr.net/npm/riichi-score@2.0.0/dist/esm/index.js";

const PALETTE = [
  { label: "Bam", tiles: ["1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B"] },
  { label: "Crak", tiles: ["1C", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C"] },
  { label: "Dot", tiles: ["1P", "2P", "3P", "4P", "5P", "6P", "7P", "8P", "9P"] },
  { label: "Winds", tiles: ["EW", "SW", "WW", "NW"] },
  { label: "Dragons", tiles: ["WD", "GD", "RD"] },
  { label: "Aka", tiles: ["5Br", "5Cr", "5Pr"] },
];

const YAKU_EN = {
  chiitoitsu: "Seven Pairs",
  "kokushi-musou": "Thirteen Orphans",
  "menzen-tsumo": "Fully Concealed Hand",
  pinfu: "Pinfu",
  riichi: "Riichi",
  "double-riichi": "Double Riichi",
  ippatsu: "Ippatsu",
  haitei: "Under the Sea",
  houtei: "Under the River",
  "rinshan-kaihou": "After a Kan",
  chankan: "Robbing a Kan",
  tanyao: "All Simples",
  iipeiko: "Pure Double Sequence",
  ryanpeikou: "Twice Pure Double Sequence",
  sanankou: "Three Concealed Triplets",
  suuankou: "Four Concealed Triplets",
  toitoi: "All Triplets",
  honitsu: "Half Flush",
  chinitsu: "Full Flush",
  chanta: "Half Outside Hand",
  junchan: "Pure Outside Hand",
  honroutou: "All Terminals and Honors",
  sanshoku: "Three Color Straight",
  "sanshoku-doukou": "Three Color Triplets",
  ittsuu: "Pure Straight",
  shousangen: "Little Three Dragons",
  sankantsu: "Three Quads",
  daisangen: "Big Three Dragons",
  shousuushii: "Little Four Winds",
  daisuushii: "Big Four Winds",
  tsuuiisou: "All Honors",
  chinroutou: "All Terminals",
  ryuuiisou: "All Green",
  "chuuren-poutou": "Nine Gates",
  suukantsu: "Four Quads",
  tenhou: "Blessing of Heaven",
  chiihou: "Blessing of Earth",
  "round-wind": "Round Wind",
  "seat-wind": "Seat Wind",
  haku: "White Dragon",
  hatsu: "Green Dragon",
  chun: "Red Dragon",
};

/** Our ID → riichi-score tile string (MPSZ / z) */
function toScoreTile(id) {
  if (id === "5Br") return "0s";
  if (id === "5Cr") return "0m";
  if (id === "5Pr") return "0p";
  const suited = id.match(/^([1-9])([BCP])$/);
  if (suited) {
    const suit = { B: "s", C: "m", P: "p" }[suited[2]];
    return `${suited[1]}${suit}`;
  }
  const honors = {
    EW: "1z",
    SW: "2z",
    WW: "3z",
    NW: "4z",
    WD: "5z",
    GD: "6z",
    RD: "7z",
  };
  return honors[id] || null;
}

function fromScoreTile(t) {
  if (t === "0s") return "5Br";
  if (t === "0m") return "5Cr";
  if (t === "0p") return "5Pr";
  const m = t.match(/^([1-9])([mps])$/);
  if (m) {
    const suit = { s: "B", m: "C", p: "P" }[m[2]];
    return `${m[1]}${suit}`;
  }
  const honors = {
    "1z": "EW",
    "2z": "SW",
    "3z": "WW",
    "4z": "NW",
    "5z": "WD",
    "6z": "GD",
    "7z": "RD",
  };
  return honors[t] || t;
}

function countInHand(hand, id) {
  return hand.filter((t) => t === id).length;
}

function maxCopies(id) {
  if (id.endsWith("r")) return 1;
  return 4;
}

function getUiState(root) {
  return {
    tsumo: root.querySelector("#hv-tsumo").checked,
    riichi: root.querySelector("#hv-riichi").checked,
    doubleRiichi: root.querySelector("#hv-double-riichi").checked,
    ippatsu: root.querySelector("#hv-ippatsu").checked,
    rinshan: root.querySelector("#hv-rinshan").checked,
    chankan: root.querySelector("#hv-chankan").checked,
    haitei: root.querySelector("#hv-haitei").checked,
    houtei: root.querySelector("#hv-houtei").checked,
    roundWind: root.querySelector("#hv-round-wind").value,
    seatWind: root.querySelector("#hv-seat-wind").value,
    ronFrom: root.querySelector("#hv-ron-from").value,
    honba: parseInt(root.querySelector("#hv-honba").value, 10) || 0,
  };
}

function evaluate(handIds, winIndex, ui, doraIds, uraIds) {
  if (handIds.length !== 14) {
    return { ok: false, errors: [`Need exactly 14 tiles (have ${handIds.length}).`] };
  }
  if (winIndex < 0 || winIndex >= 14) {
    return { ok: false, errors: ["Select a winning tile (click a tile in your hand)."] };
  }

  const scored = handIds.map(toScoreTile);
  if (scored.some((t) => !t)) {
    return { ok: false, errors: ["Hand contains unsupported tiles for scoring."] };
  }

  const winning = scored[winIndex];
  const closedTiles = scored.filter((_, i) => i !== winIndex);

  const doraIndicators = doraIds.map(toScoreTile).filter(Boolean);
  const uradoraIndicators = uraIds.map(toScoreTile).filter(Boolean);

  const winningTile = ui.tsumo
    ? { tile: winning, isTsumo: true }
    : { tile: winning, from: ui.ronFrom };

  try {
    const analysis = calculate({
      closedTiles,
      openMelds: [],
      winningTile,
      gameState: createGameState({
        roundWind: ui.roundWind,
        seatWind: ui.seatWind,
        doraIndicators,
        uradoraIndicators,
        isRiichi: ui.riichi || ui.doubleRiichi,
        isDoubleRiichi: ui.doubleRiichi,
        isIppatsu: ui.ippatsu,
        isRinshan: ui.rinshan,
        isChankan: ui.chankan,
        isHaitei: ui.haitei,
        isHoutei: ui.houtei,
        honbaCount: ui.honba,
      }),
    });

    if (!analysis.valid) {
      return {
        ok: false,
        errors: analysis.errors?.length
          ? analysis.errors
          : ["Not a valid winning hand (or no yaku)."],
        analysis,
      };
    }

    return { ok: true, analysis };
  } catch (err) {
    return { ok: false, errors: [err.message || String(err)] };
  }
}

function formatResult(analysis) {
  const best = analysis.handInterpretations?.[0];
  if (!best) return { summary: "No scoring interpretation.", detail: "" };

  const yakuLines = (best.yaku || [])
    .map((y) => {
      const name = YAKU_EN[y.name] || y.name;
      if (y.limit) return `${name} (${y.limit})`;
      return `${name} · ${y.han} han`;
    })
    .join(", ");

  const fuLines = (best.fuList || [])
    .map((f) => `${f.reason}: ${f.value}`)
    .join("; ");

  const payments = (best.seatPayments || [])
    .map((p) => `${p.seat}: ${p.value}`)
    .join(" · ");

  const limit = best.limit ? ` · ${best.limit}` : "";
  const summary = best.limit
    ? `${best.limit} · ${best.totalWinnings} points`
    : `${best.han} han · ${best.fu} fu · ${best.basicPoints} basic · ${best.totalWinnings} points${limit}`;

  const detail = [
    yakuLines && `Yaku: ${yakuLines}`,
    `Dora ${best.dora ?? 0} · Aka ${best.akadora ?? 0} · Ura ${best.uradora ?? 0}`,
    fuLines && `Fu: ${best.fu} (raw ${best.rawFu}) — ${fuLines}`,
    payments && `Payments: ${payments}`,
    best.isTsumo ? "Win: Tsumo" : "Win: Ron",
  ]
    .filter(Boolean)
    .join("\n");

  return { summary, detail, best };
}

function mount(container, getSettings) {
  const state = {
    hand: [],
    winIndex: -1,
    dora: [],
    ura: [],
    doraMode: null, // 'dora' | 'ura' | null — next palette clicks go here
  };

  container.innerHTML = `
    <h2>Build Your Hand</h2>
    <p class="hv-note">Build a closed 14-tile hand (v1). Click palette to add, click a hand tile to remove.
      Click <strong>Set win tile</strong> then a hand tile to mark the winning tile. Uses
      <a href="https://github.com/cwebley/kotenho" target="_blank" rel="noopener">riichi-score</a> (Tenhou-style).</p>

    <div class="hv-palette" id="hv-palette"></div>

    <div class="hv-rack-label">Your hand <span class="hv-count">0 / 14</span></div>
    <div class="hv-hand" id="hv-hand"></div>
    <div class="hv-win-hint" id="hv-win-hint"></div>

    <div class="hv-toolbar">
      <button type="button" class="hv-btn" id="hv-set-win">Set win tile</button>
      <button type="button" class="hv-btn" id="hv-clear">Clear hand</button>
      <button type="button" class="hv-btn" id="hv-pick-dora">Add dora indicator</button>
      <button type="button" class="hv-btn" id="hv-pick-ura">Add ura indicator</button>
      <button type="button" class="hv-btn primary" id="hv-eval">Evaluate</button>
    </div>

    <div class="hv-indicators">
      <div><span class="hv-ind-label">Dora indicators:</span> <span id="hv-dora-row" class="hv-ind-row"></span></div>
      <div><span class="hv-ind-label">Ura indicators:</span> <span id="hv-ura-row" class="hv-ind-row"></span></div>
    </div>

    <div class="hv-options">
      <label><input type="radio" name="hv-winmode" id="hv-tsumo" checked /> Tsumo</label>
      <label><input type="radio" name="hv-winmode" id="hv-ron" /> Ron from
        <select id="hv-ron-from">
          <option value="east">East</option>
          <option value="south">South</option>
          <option value="west">West</option>
          <option value="north">North</option>
        </select>
      </label>
      <label>Round <select id="hv-round-wind">
        <option value="east">East</option><option value="south">South</option>
        <option value="west">West</option><option value="north">North</option>
      </select></label>
      <label>Seat <select id="hv-seat-wind">
        <option value="east">East</option><option value="south" selected>South</option>
        <option value="west">West</option><option value="north">North</option>
      </select></label>
      <label>Honba <input type="number" id="hv-honba" min="0" max="12" value="0" /></label>
      <label><input type="checkbox" id="hv-riichi" /> Riichi</label>
      <label><input type="checkbox" id="hv-double-riichi" /> Double riichi</label>
      <label><input type="checkbox" id="hv-ippatsu" /> Ippatsu</label>
      <label><input type="checkbox" id="hv-rinshan" /> Rinshan</label>
      <label><input type="checkbox" id="hv-chankan" /> Chankan</label>
      <label><input type="checkbox" id="hv-haitei" /> Haitei</label>
      <label><input type="checkbox" id="hv-houtei" /> Houtei</label>
    </div>

    <div class="hv-result" id="hv-result" hidden></div>
  `;

  let awaitingWinPick = false;
  const handEl = container.querySelector("#hv-hand");
  const paletteEl = container.querySelector("#hv-palette");
  const resultEl = container.querySelector("#hv-result");
  const countEl = container.querySelector(".hv-count");
  const winHint = container.querySelector("#hv-win-hint");

  function tileOpts() {
    const s = getSettings();
    return {
      rankLabels: s.rankLabels || "hover",
      style: s.tileStyle || "style-1",
    };
  }

  function renderTileButton(id, { winning = false, onClick } = {}) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hv-tile-btn" + (winning ? " is-win" : "");
    const { style, rankLabels } = tileOpts();
    btn.appendChild(Tiles.renderTile(id, style, rankLabels));
    btn.title = id + (winning ? " (winning tile)" : "");
    btn.addEventListener("click", onClick);
    return btn;
  }

  function refreshHand() {
    handEl.replaceChildren();
    state.hand.forEach((id, i) => {
      handEl.appendChild(
        renderTileButton(id, {
          winning: i === state.winIndex,
          onClick: () => {
            if (awaitingWinPick) {
              state.winIndex = i;
              awaitingWinPick = false;
              winHint.textContent =
                "Winning tile set. Adjust options, then Evaluate.";
              refreshHand();
              return;
            }
            state.hand.splice(i, 1);
            if (state.winIndex === i) state.winIndex = -1;
            else if (state.winIndex > i) state.winIndex -= 1;
            refreshHand();
          },
        })
      );
    });
    countEl.textContent = `${state.hand.length} / 14`;
  }

  function refreshIndicators() {
    const doraRow = container.querySelector("#hv-dora-row");
    const uraRow = container.querySelector("#hv-ura-row");
    doraRow.replaceChildren();
    uraRow.replaceChildren();
    state.dora.forEach((id, i) => {
      doraRow.appendChild(
        renderTileButton(id, {
          onClick: () => {
            state.dora.splice(i, 1);
            refreshIndicators();
          },
        })
      );
    });
    state.ura.forEach((id, i) => {
      uraRow.appendChild(
        renderTileButton(id, {
          onClick: () => {
            state.ura.splice(i, 1);
            refreshIndicators();
          },
        })
      );
    });
  }

  function addTile(id) {
    if (state.doraMode === "dora") {
      if (state.dora.length >= 4) return;
      state.dora.push(id);
      state.doraMode = null;
      winHint.textContent = "";
      refreshIndicators();
      return;
    }
    if (state.doraMode === "ura") {
      if (state.ura.length >= 4) return;
      state.ura.push(id);
      state.doraMode = null;
      winHint.textContent = "";
      refreshIndicators();
      return;
    }
    if (state.hand.length >= 14) return;
    if (countInHand(state.hand, id) >= maxCopies(id)) return;
    state.hand.push(id);
    if (state.hand.length === 14 && state.winIndex < 0) {
      state.winIndex = 13;
      winHint.textContent = "Last tile marked as winning (change with Set win tile).";
    }
    refreshHand();
  }

  // Palette
  for (const row of PALETTE) {
    const line = document.createElement("div");
    line.className = "tile-key-row";
    const lab = document.createElement("span");
    lab.className = "tile-key-label";
    lab.textContent = row.label;
    const tiles = document.createElement("div");
    tiles.className = "hv-palette-tiles";
    for (const id of row.tiles) {
      tiles.appendChild(
        renderTileButton(id, {
          onClick: () => addTile(id),
        })
      );
    }
    line.append(lab, tiles);
    paletteEl.appendChild(line);
  }

  container.querySelector("#hv-clear").addEventListener("click", () => {
    state.hand = [];
    state.winIndex = -1;
    awaitingWinPick = false;
    winHint.textContent = "";
    resultEl.hidden = true;
    refreshHand();
  });

  container.querySelector("#hv-set-win").addEventListener("click", () => {
    awaitingWinPick = true;
    state.doraMode = null;
    winHint.textContent = "Click a tile in your hand to mark it as the winning tile.";
  });

  container.querySelector("#hv-pick-dora").addEventListener("click", () => {
    state.doraMode = "dora";
    awaitingWinPick = false;
    winHint.textContent = "Click a palette tile to add a dora indicator.";
  });

  container.querySelector("#hv-pick-ura").addEventListener("click", () => {
    state.doraMode = "ura";
    awaitingWinPick = false;
    winHint.textContent = "Click a palette tile to add an ura-dora indicator.";
  });

  container.querySelector("#hv-tsumo").addEventListener("change", () => {});
  container.querySelector("#hv-ron").addEventListener("change", (e) => {
    if (e.target.checked) container.querySelector("#hv-tsumo").checked = false;
  });
  container.querySelector("#hv-tsumo").addEventListener("change", (e) => {
    if (e.target.checked) container.querySelector("#hv-ron").checked = false;
  });

  container.querySelector("#hv-eval").addEventListener("click", () => {
    const ui = getUiState(container);
    ui.tsumo = container.querySelector("#hv-tsumo").checked;
    const result = evaluate(state.hand, state.winIndex, ui, state.dora, state.ura);
    resultEl.hidden = false;
    if (!result.ok) {
      resultEl.className = "hv-result is-error";
      resultEl.textContent = (result.errors || ["Invalid hand."]).join("\n");
      // Still show analysis text if library returned "no yaku"
      if (result.analysis?.handInterpretations?.length) {
        const fmt = formatResult(result.analysis);
        resultEl.textContent += "\n\n" + fmt.summary + "\n" + fmt.detail;
      }
      return;
    }
    const fmt = formatResult(result.analysis);
    resultEl.className = "hv-result is-ok";
    resultEl.textContent = fmt.summary + "\n" + fmt.detail;
  });

  refreshHand();
  refreshIndicators();

  return {
    remountTiles() {
      // Re-render palette/hand when tile style changes
      const rows = [...paletteEl.querySelectorAll(".tile-key-row")];
      paletteEl.replaceChildren();
      for (const row of PALETTE) {
        const line = document.createElement("div");
        line.className = "tile-key-row";
        const lab = document.createElement("span");
        lab.className = "tile-key-label";
        lab.textContent = row.label;
        const tiles = document.createElement("div");
        tiles.className = "hv-palette-tiles";
        for (const id of row.tiles) {
          tiles.appendChild(renderTileButton(id, { onClick: () => addTile(id) }));
        }
        line.append(lab, tiles);
        paletteEl.appendChild(line);
      }
      refreshHand();
      refreshIndicators();
    },
  };
}

window.HandEvaluator = {
  mount,
  toScoreTile,
  fromScoreTile,
  evaluate,
  YAKU_EN,
};
window.HandVerifier = window.HandEvaluator; // back-compat alias

window.dispatchEvent(new Event("hand-evaluator-ready"));
window.dispatchEvent(new Event("hand-verifier-ready"));
