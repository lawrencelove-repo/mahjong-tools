/**
 * Filipino mahjong cheatsheet UI
 */

(function () {
  let settings = AppSettings.loadSettings();
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  function seasonsMode() {
    return settings.hkSeasons || "exclude";
  }

  function groupBy() {
    return settings.filipinoGroupBy || "points";
  }

  function visibleHands() {
    const mode = seasonsMode();
    return FILIPINO_DATA.filter((h) => {
      if (mode !== "exclude") return true;
      const bonus =
        h.tags?.includes("bonus-flower") || h.tags?.includes("bonus-season");
      return !bonus;
    });
  }

  function pointsLabel(h) {
    if (h.points === 1) return "1";
    if (h.points === 0.5) return "½";
    if (h.points === 0.25) return "¼";
    return String(h.points);
  }

  function groupKey(h) {
    return groupBy() === "category" ? h.category : h.section;
  }

  function groupTitle(key) {
    const meta =
      groupBy() === "category"
        ? FILIPINO_CATEGORY_META[key]
        : FILIPINO_SECTION_META[key];
    return meta?.titleEn || key;
  }

  function sectionOrder() {
    if (groupBy() === "category") {
      return ["going-out", "chow", "pung", "suit", "wait", "flower"];
    }
    return ["1", "0.5", "0.25", "bonus"];
  }

  function mapSeasonTiles(notation) {
    if (seasonsMode() !== "blanks") return notation;
    return notation
      .trim()
      .split(/\s+/)
      .map((tok) => {
        if (/^F[5-8]$/i.test(tok)) return "X";
        if (/^F[5-8]\*\d+$/i.test(tok)) return `X*${tok.split("*")[1]}`;
        return tok;
      })
      .join(" ");
  }

  function render() {
    const root = $("#filipino-root");
    root.innerHTML = "";
    AppSettings.renderQuickStart("filipino", settings);
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
    document.body.dataset.tileStyle = settings.tileStyle;
    document.body.dataset.allowPage2 = settings.allowPage2 ? "true" : "false";
    document.body.dataset.rankLabels = settings.rankLabels;
    $("#tile-style").value = settings.tileStyle;
    const seasons = $("#hk-seasons");
    if (seasons) seasons.value = seasonsMode();
  }

  function renderCard(h) {
    const card = document.createElement("article");
    card.className = "yaku-card";
    const head = document.createElement("div");
    head.className = "yaku-head";
    const name = document.createElement("h3");
    name.className = "yaku-name";
    name.textContent = h.nameEn;
    const badges = document.createElement("div");
    badges.className = "yaku-badges";
    const b = document.createElement("span");
    b.className = "badge nmjl-value";
    b.textContent = pointsLabel(h);
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
        `<span class="nmjl-text-key-item"><span class="tile tile-text suit-blue">J</span> joker</span>`,
      ].join("");
      el.appendChild(key);
    }
    if (settings.showExtraTiles || mode !== "exclude") {
      const row = document.createElement("div");
      row.className = "nmjl-extras-row";
      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent =
        mode === "blanks"
          ? "Seasons as blanks · flowers"
          : "Flowers / seasons (often all “flowers” in Filipino play)";
      const tiles =
        mode === "blanks" ? "F1 F2 F3 F4 | X X X X | J" : "F1 F2 F3 F4 | F5 F6 F7 F8 | J";
      row.append(
        label,
        Tiles.renderHand(tiles, settings.tileStyle, { rankLabels: settings.rankLabels })
      );
      el.appendChild(row);
    }
  }

  function setSettingsOpen(open) {
    const panel = $("#settings-panel");
    $("#btn-settings").setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
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
          settings.filipinoGroupBy = r.value;
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

    AppSettings.bindRankLabelsSelect($("#rank-labels"), (mode, saved) => {
      Object.assign(settings, saved);
      settings.rankLabels = mode;
      render();
    });

    for (const [key, sel] of [
      ["showExtraTiles", "#opt-extras"],
      ["allowPage2", "#opt-page2"],
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
