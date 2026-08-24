/**
 * Main UI: filters, grouping, render, print + PDF download
 */

(function () {
  let settings = AppSettings.loadSettings();

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function hanLabel(y) {
    const c = y.hanClosed;
    const o = y.hanOpen;
    if (c === "yakuman") {
      const dbl =
        settings.showDoubleYakumanNotes && y.tags?.includes("double-yakuman")
          ? " (often double)"
          : "";
      return `Yakuman${dbl}`;
    }
    if (c === "mangan") return "Mangan";
    if (o == null || o === c) return `${c} han`;
    return `${c} han (open ${o})`;
  }

  function displayName(y) {
    if (settings.language === "jp") return y.nameJp || y.nameEn;
    if (settings.language === "en-jp") {
      return y.nameJp ? `${y.nameEn} · ${y.nameJp}` : y.nameEn;
    }
    return y.nameEn;
  }

  function filteredYaku() {
    return YAKU_DATA.filter((y) => {
      if (y.tags?.includes("optional") && !settings.showOptional) return false;
      if (y.tags?.includes("double-yakuman") && y.tags?.includes("optional") && !settings.showOptional)
        return false;
      // Double-yakuman *notes* on core entries are handled in hanLabel; optional double variants need showOptional
      return true;
    });
  }

  function groupKey(y) {
    return settings.groupBy === "category" ? y.category : y.section;
  }

  function groupTitle(key) {
    const meta =
      settings.groupBy === "category" ? CATEGORY_META[key] : SECTION_META[key];
    if (!meta) return key;
    if (settings.language === "jp") return meta.titleJp || meta.titleEn;
    if (settings.language === "en-jp") return `${meta.titleEn} · ${meta.titleJp}`;
    return meta.titleEn;
  }

  function sectionOrder() {
    if (settings.groupBy === "category") {
      return ["sequence", "triplet", "flush", "terminals", "lucky", "special", "yakuman"];
    }
    return ["1-han", "2-han", "3-han", "6-han", "yakuman", "optional"];
  }

  function render() {
    const root = $("#yaku-root");
    root.innerHTML = "";
    const list = filteredYaku();
    const order = sectionOrder();
    const buckets = new Map(order.map((k) => [k, []]));

    for (const y of list) {
      const k = groupKey(y);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(y);
    }

    for (const key of [...buckets.keys()]) {
      const items = buckets.get(key);
      if (!items.length) continue;

      const section = document.createElement("section");
      section.className = "yaku-section";
      section.dataset.group = key;

      const h = document.createElement("h2");
      h.textContent = groupTitle(key);
      section.appendChild(h);

      const grid = document.createElement("div");
      grid.className = "yaku-grid";

      for (const y of items) {
        grid.appendChild(renderYakuCard(y));
      }
      section.appendChild(grid);
      root.appendChild(section);
    }

    renderDoraPanel();
    renderTileKey();
    renderScoringRef();
    renderLegend();
    AppSettings.renderQuickStart("riichi", settings);
    document.body.dataset.tileStyle = settings.tileStyle;
    document.body.dataset.allowPage2 =
      settings.allowPage2 || settings.showScoringRef ? "true" : "false";
    document.body.dataset.rankLabels = settings.rankLabels;
    $("#tile-style").value = settings.tileStyle;
  }

  function renderYakuCard(y) {
    const card = document.createElement("article");
    card.className = "yaku-card";
    card.dataset.id = y.id;

    const head = document.createElement("div");
    head.className = "yaku-head";

    const name = document.createElement("h3");
    name.className = "yaku-name";
    name.textContent = displayName(y);

    const badges = document.createElement("div");
    badges.className = "yaku-badges";
    const han = document.createElement("span");
    han.className = "badge han";
    han.textContent = hanLabel(y);
    badges.appendChild(han);
    if (y.closedOnly) {
      const c = document.createElement("span");
      c.className = "badge closed";
      c.textContent = "Closed";
      badges.appendChild(c);
    }

    head.append(name, badges);
    card.appendChild(head);

    const desc = document.createElement("p");
    desc.className = "yaku-desc";
    desc.textContent = y.description;
    card.appendChild(desc);

    if (y.examples?.length) {
      for (const ex of y.examples) {
        const block = document.createElement("div");
        block.className = "example";
        if (ex.label) {
          const lab = document.createElement("span");
          lab.className = "example-label";
          lab.textContent = ex.label;
          block.appendChild(lab);
        }
        block.appendChild(
          Tiles.renderHand(ex.tiles, settings.tileStyle, {
            rankLabels: settings.rankLabels,
          })
        );
        card.appendChild(block);
      }
    }

    return card;
  }

  function renderDoraPanel() {
    let el = $("#dora-panel");
    if (!settings.showDoraPanel) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("section");
      el.id = "dora-panel";
      el.className = "aux-panel";
      $("#aux-root").appendChild(el);
    }
    el.innerHTML = `
      <h2>Dora</h2>
      <p>Dora indicators add han but are not yaku. Ura-dora apply after riichi. Aka-dora are red fives (typically one per suit).</p>
      <div class="hand-demo"></div>
    `;
    const demo = el.querySelector(".hand-demo");
    demo.appendChild(
      Tiles.renderHand("5Pr 5Br 5Cr", settings.tileStyle, {
        rankLabels: settings.rankLabels,
      })
    );
  }

  function renderTileKey() {
    let el = $("#tile-key");
    if (!settings.showTileKey) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("section");
      el.id = "tile-key";
      el.className = "aux-panel tile-key";
      $("#aux-root").appendChild(el);
    }

    const opts = { rankLabels: settings.rankLabels };
    const style = settings.tileStyle;
    const styleName =
      typeof Tiles !== "undefined" && Tiles.labelForStyle
        ? Tiles.labelForStyle(style)
        : style;

    const rows = [
      { label: "Bam (souzu)", tiles: "1B 2B 3B 4B 5B 6B 7B 8B 9B" },
      { label: "Crak (manzu)", tiles: "1C 2C 3C 4C 5C 6C 7C 8C 9C" },
      { label: "Dot (pinzu)", tiles: "1P 2P 3P 4P 5P 6P 7P 8P 9P" },
      { label: "Winds", tiles: "EW SW WW NW" },
      { label: "Dragons", tiles: "WD GD RD" },
    ];
    if (settings.showDoraPanel) {
      rows.push({ label: "Aka (red fives)", tiles: "5Br 5Cr 5Pr" });
    }
    el.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = `Tile Key · ${styleName}`;
    el.appendChild(h);

    const note = document.createElement("p");
    note.className = "tile-key-note";
    note.textContent =
      style === "text"
        ? "Colored digits/letters: green = bam, red = crak, black = dot, blue = honors."
        : "All tiles in the current tileset.";
    el.appendChild(note);

    for (const row of rows) {
      const line = document.createElement("div");
      line.className = "tile-key-row";
      const lab = document.createElement("span");
      lab.className = "tile-key-label";
      lab.textContent = row.label;
      line.append(lab, Tiles.renderHand(row.tiles, style, opts));
      el.appendChild(line);
    }
  }

  function renderScoringRef() {
    let el = $("#scoring-ref");
    if (!settings.showScoringRef) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("section");
      el.id = "scoring-ref";
      el.className = "aux-panel scoring-ref print-page-break";
      $("#aux-root").appendChild(el);
    }
    const rows = SCORING_REF.limits
      .map(
        (r) =>
          `<tr><td>${r.name}</td><td>${r.han}</td><td>${r.dealerRon}</td><td>${r.nonDealerRon}</td><td>${r.dealerTsumo}</td></tr>`
      )
      .join("");
    el.innerHTML = `
      <h2>${SCORING_REF.title}</h2>
      <table class="score-table">
        <thead><tr><th>Limit</th><th>Requirement</th><th>Dealer ron</th><th>Non-dealer ron</th><th>Dealer tsumo</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <ul class="score-notes">${SCORING_REF.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
    `;
  }

  function renderLegend() {
    const el = $("#tile-legend");
    if (!settings.showExtraTiles && settings.tileStyle !== "text") {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const parts = [];
    if (settings.tileStyle === "text") {
      parts.push(
        `<span class="tile tile-text suit-green">6</span> bam`,
        `<span class="tile tile-text suit-red">6</span> crak`,
        `<span class="tile tile-text suit-black">6</span> dot`,
        `<span class="tile tile-text suit-blue">E</span> honors`
      );
    }
    if (settings.showExtraTiles) {
      const hand = Tiles.renderHand("F1 F2 F3 F4 | J1 J2", settings.tileStyle, {
        rankLabels: settings.rankLabels,
      });
      el.replaceChildren();
      const label = document.createElement("span");
      label.textContent = "Extras: ";
      el.append(label, hand);
      if (settings.tileStyle === "text") {
        const colors = document.createElement("span");
        colors.className = "legend-colors";
        colors.innerHTML = " · " + parts.join(" · ");
        el.appendChild(colors);
      }
      return;
    }
    el.innerHTML = parts.join(" · ");
  }

  function bindControls() {
    AppSettings.bindTileStyleSelect($("#tile-style"), (style, saved) => {
      Object.assign(settings, saved);
      settings.tileStyle = style;
      render();
    });

    $$("input[name=groupBy]").forEach((r) => {
      r.checked = r.value === settings.groupBy;
      r.addEventListener("change", () => {
        if (r.checked) {
          settings.groupBy = r.value;
          persist();
          render();
        }
      });
    });

    $("#language").value = settings.language;
    $("#language").addEventListener("change", (e) => {
      settings.language = e.target.value;
      persist();
      render();
    });

    AppSettings.bindRankLabelsSelect($("#rank-labels"), (mode, saved) => {
      Object.assign(settings, saved);
      settings.rankLabels = mode;
      render();
    });

    const toggles = [
      ["showOptional", "#opt-optional"],
      ["showDoubleYakumanNotes", "#opt-double"],
      ["showDoraPanel", "#opt-dora"],
      ["showExtraTiles", "#opt-extras"],
      ["showScoringRef", "#opt-scoring"],
      ["allowPage2", "#opt-page2"],
      ["showTileKey", "#opt-tile-key"],
    ];
    for (const [key, sel] of toggles) {
      const el = $(sel);
      el.checked = !!settings[key];
      el.addEventListener("change", () => {
        settings[key] = el.checked;
        // Scoring ref implies page 2 content
        if (key === "showScoringRef" && el.checked) {
          settings.allowPage2 = true;
          $("#opt-page2").checked = true;
        }
        persist();
        render();
      });
    }

    function setSettingsOpen(open) {
      const panel = $("#settings-panel");
      const btn = $("#btn-settings");
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    $("#btn-settings").addEventListener("click", () => {
      setSettingsOpen($("#settings-panel").hidden);
    });
    const closeSettings = () => setSettingsOpen(false);
    $("#btn-settings-collapse").addEventListener("click", closeSettings);
    $("#btn-settings-close")?.addEventListener("click", closeSettings);

    let handEvalWin = null;
    $("#btn-hand-eval").addEventListener("click", () => {
      const url = new URL("hand-evaluation.html", window.location.href).href;
      if (handEvalWin && !handEvalWin.closed) {
        handEvalWin.focus();
        return;
      }
      handEvalWin = window.open(
        url,
        "riichiHandEvaluation",
        "popup=yes,width=980,height=820,scrollbars=yes,resizable=yes"
      );
    });

    $("#btn-print").addEventListener("click", () => window.print());
  }

  function persist() {
    Object.assign(settings, AppSettings.saveSettings(settings));
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindControls();
    render();
  });
})();
