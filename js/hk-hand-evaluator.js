/**
 * Hong Kong hand evaluation UI — closed 14-tile picker + HkScore.
 */
(function () {
  const PALETTE = [
    { label: "Bam", tiles: ["1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B"] },
    { label: "Crak", tiles: ["1C", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C"] },
    { label: "Dot", tiles: ["1P", "2P", "3P", "4P", "5P", "6P", "7P", "8P", "9P"] },
    { label: "Winds", tiles: ["EW", "SW", "WW", "NW"] },
    { label: "Dragons", tiles: ["WD", "GD", "RD"] },
  ];

  function countInHand(hand, id) {
    return hand.filter((t) => t === id).length;
  }

  function maxCopies() {
    return 4;
  }

  function getCtx(root) {
    return {
      selfDraw: root.querySelector("#hv-tsumo").checked,
      fullyConcealed: root.querySelector("#hv-concealed").checked,
      robKong: root.querySelector("#hv-rob-kong").checked,
      lastDraw: root.querySelector("#hv-last-draw").checked,
      kongReplace: root.querySelector("#hv-kong-replace").checked,
      doubleKongReplace: root.querySelector("#hv-double-kong").checked,
      heavenly: root.querySelector("#hv-heavenly").checked,
      earthly: root.querySelector("#hv-earthly").checked,
      humanly: root.querySelector("#hv-humanly").checked,
      roundWind: root.querySelector("#hv-round-wind").value,
      seatWind: root.querySelector("#hv-seat-wind").value,
      minFaan: parseInt(root.querySelector("#hv-min-faan").value, 10) || 3,
    };
  }

  function mount(container, getSettings) {
    const state = {
      hand: [],
      winIndex: -1,
    };

    container.innerHTML = `
      <h2>Build Your Hand</h2>
      <p class="hv-note">
        Hong Kong / Cantonese faan check for a <strong>closed 14-tile</strong> hand (v1).
        Open melds and flower bonuses are not modeled yet. Pattern list follows the
        <a href="hk.html">HK cheatsheet</a> — confirm minimum faan and stacking with your table.
      </p>

      <div class="hv-palette" id="hv-palette"></div>

      <div class="hv-rack-label">Your hand <span class="hv-count">0 / 14</span></div>
      <div class="hv-hand" id="hv-hand"></div>
      <div class="hv-win-hint" id="hv-win-hint"></div>

      <div class="hv-toolbar">
        <button type="button" class="hv-btn" id="hv-set-win">Set win tile</button>
        <button type="button" class="hv-btn" id="hv-clear">Clear hand</button>
        <button type="button" class="hv-btn primary" id="hv-eval">Evaluate</button>
      </div>

      <div class="hv-options">
        <label><input type="radio" name="hv-winmode" id="hv-tsumo" checked /> Self-draw</label>
        <label><input type="radio" name="hv-winmode" id="hv-discard" /> On discard</label>
        <label>Round
          <select id="hv-round-wind">
            <option value="east">East</option>
            <option value="south">South</option>
            <option value="west">West</option>
            <option value="north">North</option>
          </select>
        </label>
        <label>Seat
          <select id="hv-seat-wind">
            <option value="east">East</option>
            <option value="south" selected>South</option>
            <option value="west">West</option>
            <option value="north">North</option>
          </select>
        </label>
        <label>Min faan
          <input type="number" id="hv-min-faan" min="0" max="13" value="3" />
        </label>
        <label><input type="checkbox" id="hv-concealed" checked /> Fully concealed</label>
        <label><input type="checkbox" id="hv-rob-kong" /> Rob kong</label>
        <label><input type="checkbox" id="hv-last-draw" /> Last wall tile</label>
        <label><input type="checkbox" id="hv-kong-replace" /> Kong replacement</label>
        <label><input type="checkbox" id="hv-double-kong" /> Double kong replacement</label>
        <label><input type="checkbox" id="hv-heavenly" /> Heavenly hand</label>
        <label><input type="checkbox" id="hv-earthly" /> Earthly hand</label>
        <label><input type="checkbox" id="hv-humanly" /> Humanly hand</label>
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
                  "Winning tile marked (informational). Adjust options, then Evaluate.";
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

    function addTile(id) {
      if (state.hand.length >= 14) return;
      if (countInHand(state.hand, id) >= maxCopies(id)) return;
      state.hand.push(id);
      if (state.hand.length === 14 && state.winIndex < 0) {
        state.winIndex = 13;
        winHint.textContent = "Last tile marked as winning (change with Set win tile).";
      }
      refreshHand();
    }

    function fillPalette() {
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
    }

    fillPalette();

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
      winHint.textContent = "Click a tile in your hand to mark it as the winning tile.";
    });

    const tsumo = container.querySelector("#hv-tsumo");
    const discard = container.querySelector("#hv-discard");
    tsumo.addEventListener("change", () => {
      if (tsumo.checked) discard.checked = false;
    });
    discard.addEventListener("change", () => {
      if (discard.checked) tsumo.checked = false;
    });

    container.querySelector("#hv-eval").addEventListener("click", () => {
      if (!window.HkScore) {
        resultEl.hidden = false;
        resultEl.className = "hv-result is-error";
        resultEl.textContent = "Scoring engine failed to load.";
        return;
      }
      const ctx = getCtx(container);
      ctx.selfDraw = tsumo.checked;
      const result = HkScore.evaluate(state.hand, ctx);
      resultEl.hidden = false;
      const fmt = HkScore.formatResult(result);
      if (!result.ok) {
        resultEl.className = "hv-result is-error";
        const errs = (result.errors || []).join("\n");
        resultEl.textContent = [errs, fmt.summary, fmt.detail].filter(Boolean).join("\n\n");
        return;
      }
      resultEl.className = "hv-result is-ok";
      resultEl.textContent = fmt.summary + "\n\n" + fmt.detail;
    });

    refreshHand();

    return {
      remountTiles() {
        fillPalette();
        refreshHand();
      },
    };
  }

  window.HkHandEvaluator = { mount };
  window.dispatchEvent(new Event("hk-hand-evaluator-ready"));
})();
