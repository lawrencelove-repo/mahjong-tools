/**
 * American Mahjong (NMJL-style) cheatsheet UI
 * Reuses tiles, settings subset, and browser print/PDF.
 */

(function () {
  let settings = AppSettings.loadSettings();

  const $ = (sel, el = document) => el.querySelector(sel);

  function availableYears() {
    return NMJL_REGISTRY.years.filter((y) => NMJL_REGISTRY.cards[y]);
  }

  function currentYear() {
    const y = Number(settings.nmjlYear) || NMJL_REGISTRY.defaultYear;
    return NMJL_REGISTRY.cards[y] ? y : availableYears()[0];
  }

  function currentCard() {
    return NMJL_REGISTRY.cards[currentYear()];
  }

  function tileOpts() {
    return {
      rankLabels: settings.rankLabels,
      nmjlText: true,
    };
  }

  function render() {
    const card = currentCard();
    const root = $("#nmjl-root");
    root.innerHTML = "";
    AppSettings.renderQuickStart("nmjl", settings);

    const yearSel = $("#nmjl-year");
    if (yearSel) yearSel.value = String(card.year);

    $("#sheet-title").textContent = `American Mahjong · ${card.year}`;
    $("#sheet-subtitle").textContent = card.blurb
      ? `${card.title} · US Letter landscape`
      : "Cheat sheet · US Letter landscape";

    for (const cat of card.categories) {
      const section = document.createElement("section");
      section.className = "yaku-section nmjl-section";
      section.dataset.group = cat.id;

      const h = document.createElement("h2");
      h.textContent = cat.title;
      section.appendChild(h);

      const grid = document.createElement("div");
      grid.className = "yaku-grid nmjl-grid";

      for (const hand of cat.hands) {
        grid.appendChild(renderHandCard(hand));
      }
      section.appendChild(grid);
      root.appendChild(section);
    }

    renderLegend();
    renderTileKey();

    document.body.dataset.tileStyle = settings.tileStyle;
    document.body.dataset.allowPage2 = settings.allowPage2 ? "true" : "false";
    document.body.dataset.rankLabels = settings.rankLabels;
    $("#tile-style").value = settings.tileStyle;
  }

  function renderHandCard(hand) {
    const card = document.createElement("article");
    card.className = "yaku-card nmjl-hand";
    card.dataset.id = hand.id;
    if (hand.verify) card.classList.add("needs-verify");

    const head = document.createElement("div");
    head.className = "yaku-head";

    const badges = document.createElement("div");
    badges.className = "yaku-badges";

    const val = document.createElement("span");
    val.className = "badge nmjl-value";
    val.textContent = String(hand.value);
    badges.appendChild(val);

    if (hand.concealed) {
      const c = document.createElement("span");
      c.className = "badge nmjl-concealed";
      c.textContent = "C";
      c.title = "Concealed";
      badges.appendChild(c);
    } else {
      const x = document.createElement("span");
      x.className = "badge nmjl-exposed";
      x.textContent = "X";
      x.title = "Exposed (may be open)";
      badges.appendChild(x);
    }
    if (hand.verify) {
      const v = document.createElement("span");
      v.className = "badge verify";
      v.textContent = "verify";
      v.title = "Placeholder — correct against your licensed card";
      badges.appendChild(v);
    }
    head.appendChild(badges);

    if (hand.note) {
      const note = document.createElement("p");
      note.className = "yaku-desc";
      note.textContent = hand.note;
      head.appendChild(note);
    }

    card.appendChild(head);

    const versions = Array.isArray(hand.tiles) ? hand.tiles : [hand.tiles];
    versions.forEach((tiles, i) => {
      if (i > 0) {
        const or = document.createElement("div");
        or.className = "nmjl-or";
        or.textContent = "-or-";
        card.appendChild(or);
      }
      const ex = document.createElement("div");
      ex.className = "example";
      const expanded = NMJL_NOTATION.expandHand(tiles);
      ex.appendChild(
        Tiles.renderHand(expanded, settings.tileStyle, tileOpts())
      );
      card.appendChild(ex);
    });
    return card;
  }

  function renderLegend() {
    const el = $("#tile-legend");
    if (!settings.showExtraTiles && settings.tileStyle !== "text") {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    el.replaceChildren();

    if (settings.tileStyle === "text") {
      const key = document.createElement("div");
      key.className = "nmjl-text-key";
      key.innerHTML = [
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-green">6</span> bam</span>`,
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-red">6</span> crak</span>`,
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-black">6</span> dot</span>`,
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-red">D</span> <span class="tile tile-text suit-green">D</span> <span class="tile tile-text suit-black">D</span> dragons</span>`,
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-black">N</span><span class="tile tile-text suit-black">E</span><span class="tile tile-text suit-black">W</span><span class="tile tile-text suit-black">S</span> winds</span>`,
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-black">F</span> flowers</span>`,
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-black">0</span> soap</span>`,
      ].join("");
      el.appendChild(key);
    }

    if (settings.showExtraTiles) {
      const row = document.createElement("div");
      row.className = "nmjl-extras-row";
      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = "Extras";
      const hand = Tiles.renderHand("F F | J J | 0P | RD BD PD", settings.tileStyle, tileOpts());
      row.append(label, hand);
      el.appendChild(row);
    }
  }

  function renderTileKey() {
    let el = $("#tile-key");
    if (!settings.showTileKey) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("div");
      el.id = "tile-key";
      el.className = "aux-panel";
      $("#aux-root").appendChild(el);
    }
    const opts = tileOpts();
    const style = settings.tileStyle;
    el.innerHTML = "<h2>Tile key</h2>";
    const rows = [
      ["Bam", "123456789B"],
      ["Dot", "123456789P"],
      ["Crak", "123456789C"],
      ["Winds (NEWS)", "NW EW WW SW"],
      ["Dragons", "RD BD PD"],
      ["Soap / extras", "0P F J X"],
    ];
    for (const [label, tilesRaw] of rows) {
      const tiles = Tiles.filterTilesNotation(tilesRaw, style);
      if (!tiles) continue;
      const row = document.createElement("div");
      row.className = "example";
      const lab = document.createElement("span");
      lab.className = "example-label";
      lab.textContent = label;
      row.appendChild(lab);
      row.appendChild(Tiles.renderHand(tiles, style, opts));
      el.appendChild(row);
    }
  }

  function setSettingsOpen(open) {
    const panel = $("#settings-panel");
    const btn = $("#btn-settings");
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindControls() {
    AppSettings.bindTileStyleSelect($("#tile-style"), (style, saved) => {
      Object.assign(settings, saved);
      settings.tileStyle = style;
      render();
    });

    $("#nmjl-year").addEventListener("change", (e) => {
      settings.nmjlYear = Number(e.target.value);
      persist();
      render();
    });

    AppSettings.bindRankLabelsSelect($("#rank-labels"), (mode, saved) => {
      Object.assign(settings, saved);
      settings.rankLabels = mode;
      render();
    });

    const toggles = [
      ["showExtraTiles", "#opt-extras"],
      ["allowPage2", "#opt-page2"],
      ["showTileKey", "#opt-tile-key"],
    ];
    for (const [key, sel] of toggles) {
      const el = $(sel);
      el.checked = !!settings[key];
      el.addEventListener("change", () => {
        settings[key] = el.checked;
        persist();
        render();
      });
    }

    $("#btn-settings").addEventListener("click", () => {
      setSettingsOpen($("#settings-panel").hidden);
    });
    const closeSettings = () => setSettingsOpen(false);
    $("#btn-settings-collapse").addEventListener("click", closeSettings);
    $("#btn-settings-close")?.addEventListener("click", closeSettings);

    $("#btn-print").addEventListener("click", () => window.print());

    let builderWin = null;
    $("#btn-hand-builder").addEventListener("click", () => {
      const url = new URL("nmjl-hand-builder.html", window.location.href).href;
      if (builderWin && !builderWin.closed) {
        builderWin.focus();
        return;
      }
      builderWin = window.open(
        url,
        "nmjlHandBuilder",
        "popup=yes,width=980,height=860,scrollbars=yes,resizable=yes"
      );
    });

    let handEvalWin = null;
    $("#btn-hand-eval")?.addEventListener("click", () => {
      const url = new URL("nmjl-evaluation.html", window.location.href).href;
      if (handEvalWin && !handEvalWin.closed) {
        handEvalWin.focus();
        return;
      }
      handEvalWin = window.open(
        url,
        "nmjlHandEvaluation",
        "popup=yes,width=980,height=860,scrollbars=yes,resizable=yes"
      );
    });
  }

  function fillYearSelect() {
    const sel = $("#nmjl-year");
    sel.innerHTML = "";
    for (const y of availableYears()) {
      const opt = document.createElement("option");
      opt.value = String(y);
      opt.textContent = String(y);
      sel.appendChild(opt);
    }
  }

  function persist() {
    Object.assign(settings, AppSettings.saveSettings(settings));
  }

  fillYearSelect();
  bindControls();
  render();
})();
