/**
 * NMJL hand evaluation UI — 14-tile picker + NmjlScore (2026 card).
 */
(function () {
  const PALETTE = [
    { label: "Bam", tiles: ["1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B"] },
    { label: "Crak", tiles: ["1C", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C"] },
    { label: "Dot", tiles: ["1P", "2P", "3P", "4P", "5P", "6P", "7P", "8P", "9P"] },
    { label: "Winds", tiles: ["NW", "EW", "WW", "SW"] },
    { label: "Dragons", tiles: ["RD", "BD", "PD"] },
    { label: "Soap", tiles: ["0B", "0C", "0P"] },
    { label: "Extras", tiles: ["F", "J"] },
  ];

  function countInHand(hand, id) {
    return hand.filter((t) => t === id).length;
  }

  function maxCopies(id) {
    if (id === "F" || id === "J" || /^F[1-8]$/.test(id)) return 8;
    if (/^0[BCP]?$/.test(id)) return 4;
    return 4;
  }

  function mount(container, getSettings) {
    const state = { hand: [] };

    container.innerHTML = `
      <h2>Build Your Hand</h2>
      <p class="hv-note">
        Match a <strong>14-tile</strong> American (NMJL) hand against the
        <strong>2026</strong> card lines in this project. Notes such as
        “Any 2 Suits”, “These Nos. Only”, and matching dragons are applied when remapping
        the example tiles. Jokers may fill pungs/kongs/quints only (not pairs or singles).
        Confirm results against your <em>licensed</em> card —
        <a href="nmjl.html">cheatsheet</a>.
      </p>

      <div class="hv-palette" id="hv-palette"></div>

      <div class="hv-rack-label">Your hand <span class="hv-count">0 / 14</span></div>
      <div class="hv-hand" id="hv-hand"></div>
      <div class="hv-win-hint" id="hv-win-hint"></div>

      <div class="hv-toolbar">
        <button type="button" class="hv-btn" id="hv-clear">Clear hand</button>
        <button type="button" class="hv-btn primary" id="hv-eval">Evaluate</button>
      </div>

      <div class="hv-options">
        <label><input type="checkbox" id="hv-concealed" checked /> Concealed hand</label>
        <span class="hv-ind-label">Uncheck if you have exposures (concealed-only card lines will be skipped).</span>
      </div>

      <div class="hv-result" id="hv-result" hidden></div>
    `;

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
        nmjlText: true,
      };
    }

    function renderTileButton(id, { onClick } = {}) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hv-tile-btn";
      const { style, rankLabels, nmjlText } = tileOpts();
      btn.appendChild(Tiles.renderTile(id, style, rankLabels, { nmjlText }));
      btn.title = id;
      btn.addEventListener("click", onClick);
      return btn;
    }

    function refreshHand() {
      handEl.replaceChildren();
      state.hand.forEach((id, i) => {
        handEl.appendChild(
          renderTileButton(id, {
            onClick: () => {
              state.hand.splice(i, 1);
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
      winHint.textContent = "";
      resultEl.hidden = true;
      refreshHand();
    });

    container.querySelector("#hv-eval").addEventListener("click", () => {
      if (!window.NmjlScore) {
        resultEl.hidden = false;
        resultEl.className = "hv-result is-error";
        resultEl.textContent = "Scoring engine failed to load.";
        return;
      }
      const concealed = container.querySelector("#hv-concealed").checked;
      const result = NmjlScore.evaluate(state.hand, {
        year: 2026,
        concealed,
      });
      const dump = NmjlScore.formatDebugDump(result);
      console.log("[NMJL evaluate]", result);
      console.log(dump);
      try {
        navigator.clipboard?.writeText(dump);
        winHint.textContent = "Debug dump copied to clipboard (also in console).";
      } catch (_) {
        winHint.textContent = "Debug dump written to console (clipboard unavailable).";
      }

      resultEl.hidden = false;
      const fmt = NmjlScore.formatResult(result);
      if (!result.ok) {
        resultEl.className = "hv-result is-error";
        resultEl.textContent = fmt.summary + "\n\n" + fmt.detail;
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

  window.NmjlHandEvaluator = { mount };
  window.dispatchEvent(new Event("nmjl-hand-evaluator-ready"));
})();
