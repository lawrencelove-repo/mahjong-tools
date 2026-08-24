/**
 * Hong Kong mahjong cheatsheet UI
 */

(function () {
  let settings = AppSettings.loadSettings();
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function seasonsMode() {
    return settings.hkSeasons || "exclude";
  }

  function groupBy() {
    return settings.hkGroupBy || "faan";
  }

  function visibleHands() {
    const mode = seasonsMode();
    return HK_DATA.filter((h) => {
      if (mode !== "exclude") return true;
      const bonus =
        h.tags?.includes("bonus-flower") || h.tags?.includes("bonus-season");
      return !bonus;
    });
  }

  function faanLabel(h) {
    if (h.faanLabel) return h.faanLabel;
    return `${h.faan} faan`;
  }

  function displayName(h) {
    const lang = settings.hkLanguage || "en-zh";
    if (lang === "zh") return h.nameZh || h.nameEn;
    if (lang === "en-zh") {
      return h.nameZh ? `${h.nameEn} · ${h.nameZh}` : h.nameEn;
    }
    return h.nameEn;
  }

  function groupKey(h) {
    return groupBy() === "category" ? h.category : h.section;
  }

  function groupTitle(key) {
    const meta =
      groupBy() === "category" ? HK_CATEGORY_META[key] : HK_SECTION_META[key];
    return meta?.titleEn || key;
  }

  function sectionOrder() {
    if (groupBy() === "category") {
      return ["basic", "suit", "honor", "special", "limit", "bonus"];
    }
    return [
      "1-faan",
      "2-faan",
      "3-faan",
      "4-faan",
      "5-faan",
      "7-faan",
      "9-faan",
      "13-faan",
      "bonus",
    ];
  }

  function mapSeasonTiles(notation) {
    if (seasonsMode() !== "blanks") return notation;
    return notation
      .trim()
      .split(/\s+/)
      .map((tok) => {
        if (/^F[5-8]$/i.test(tok)) return "X";
        if (/^F[5-8]\*\d+$/i.test(tok)) {
          const n = tok.split("*")[1];
          return `X*${n}`;
        }
        return tok;
      })
      .join(" ");
  }

  function render() {
    const root = $("#hk-root");
    root.innerHTML = "";
    AppSettings.renderQuickStart("hk", settings);
    const list = visibleHands();
    const order = sectionOrder();
    const buckets = new Map(order.map((k) => [k, []]));

    for (const h of list) {
      const k = groupKey(h);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(h);
    }

    for (const key of [...buckets.keys()]) {
      const items = buckets.get(key);
      if (!items.length) continue;
      const section = document.createElement("section");
      section.className = "yaku-section";
      const heading = document.createElement("h2");
      heading.textContent = groupTitle(key);
      section.appendChild(heading);
      const grid = document.createElement("div");
      grid.className = "yaku-grid";
      for (const h of items) grid.appendChild(renderCard(h));
      section.appendChild(grid);
      root.appendChild(section);
    }

    renderLegend();
    renderTileKey();
    document.body.dataset.tileStyle = settings.tileStyle;
    document.body.dataset.allowPage2 = settings.allowPage2 ? "true" : "false";
    document.body.dataset.rankLabels = settings.rankLabels;
    $("#tile-style").value = settings.tileStyle;
    const yearLike = $("#hk-seasons");
    if (yearLike) yearLike.value = seasonsMode();
  }

  function renderCard(h) {
    const card = document.createElement("article");
    card.className = "yaku-card";
    card.dataset.id = h.id;

    const head = document.createElement("div");
    head.className = "yaku-head";
    const name = document.createElement("h3");
    name.className = "yaku-name";
    name.textContent = displayName(h);
    const badges = document.createElement("div");
    badges.className = "yaku-badges";
    const b = document.createElement("span");
    b.className = "badge nmjl-value";
    b.textContent = faanLabel(h);
    badges.appendChild(b);
    head.append(name, badges);
    card.appendChild(head);

    if (h.description) {
      const d = document.createElement("p");
      d.className = "yaku-desc";
      d.textContent = h.description;
      card.appendChild(d);
    }

    for (const ex of h.examples || []) {
      const wrap = document.createElement("div");
      wrap.className = "example";
      if (ex.label) {
        const lab = document.createElement("span");
        lab.className = "example-label";
        lab.textContent = ex.label;
        wrap.appendChild(lab);
      }
      wrap.appendChild(
        Tiles.renderHand(mapSeasonTiles(ex.tiles), settings.tileStyle, {
          rankLabels: settings.rankLabels,
        })
      );
      card.appendChild(wrap);
    }
    return card;
  }

  function renderLegend() {
    const el = $("#tile-legend");
    const mode = seasonsMode();
    if (!settings.showExtraTiles && settings.tileStyle !== "text" && mode === "exclude") {
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
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-blue">E</span> honors</span>`,
      ].join("");
      el.appendChild(key);
    }

    if (settings.showExtraTiles || mode !== "exclude") {
      const row = document.createElement("div");
      row.className = "nmjl-extras-row";
      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent =
        mode === "blanks" ? "Seasons as blanks · extras" : "Flowers / seasons";
      const seasonTiles =
        mode === "blanks" ? "X X X X" : "F1 F2 F3 F4 | F5 F6 F7 F8";
      row.append(
        label,
        Tiles.renderHand(seasonTiles, settings.tileStyle, {
          rankLabels: settings.rankLabels,
        })
      );
      el.appendChild(row);
    }
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
    const mode = seasonsMode();

    const rows = [
      { label: "Bam (souzu)", tiles: "1B 2B 3B 4B 5B 6B 7B 8B 9B" },
      { label: "Crak (manzu)", tiles: "1C 2C 3C 4C 5C 6C 7C 8C 9C" },
      { label: "Dot (pinzu)", tiles: "1P 2P 3P 4P 5P 6P 7P 8P 9P" },
      { label: "Winds", tiles: "EW SW WW NW" },
      { label: "Dragons", tiles: "WD GD RD" },
    ];
    if (mode !== "exclude") {
      rows.push({
        label: mode === "blanks" ? "Seasons as blanks" : "Flowers / seasons",
        tiles: mode === "blanks" ? "X X X X X X X X" : "F1 F2 F3 F4 F5 F6 F7 F8",
      });
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
        : "Tiles in the current tileset (excluded faces are omitted).";
    el.appendChild(note);

    for (const row of rows) {
      const tiles = Tiles.filterTilesNotation(row.tiles, style);
      if (!tiles) continue;
      const line = document.createElement("div");
      line.className = "tile-key-row";
      const lab = document.createElement("span");
      lab.className = "tile-key-label";
      lab.textContent = row.label;
      line.append(lab, Tiles.renderHand(tiles, style, opts));
      el.appendChild(line);
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

    $$("input[name=groupBy]").forEach((r) => {
      r.checked = r.value === groupBy();
      r.addEventListener("change", () => {
        if (r.checked) {
          settings.hkGroupBy = r.value;
          persist();
          render();
        }
      });
    });

    $("#hk-seasons").value = seasonsMode();
    $("#hk-seasons").addEventListener("change", (e) => {
      settings.hkSeasons = e.target.value;
      persist();
      render();
    });

    $("#hk-language").value = settings.hkLanguage || "en-zh";
    $("#hk-language").addEventListener("change", (e) => {
      settings.hkLanguage = e.target.value;
      persist();
      render();
    });

    AppSettings.bindRankLabelsSelect($("#rank-labels"), (mode, saved) => {
      Object.assign(settings, saved);
      settings.rankLabels = mode;
      render();
    });

    for (const [key, sel] of [
      ["showExtraTiles", "#opt-extras"],
      ["allowPage2", "#opt-page2"],
      ["showTileKey", "#opt-tile-key"],
    ]) {
      const el = $(sel);
      if (!el) continue;
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
  }

  function persist() {
    Object.assign(settings, AppSettings.saveSettings(settings));
  }

  bindControls();
  render();
})();
