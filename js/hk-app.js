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

    $("#rank-labels").value = settings.rankLabels || "hover";
    $("#rank-labels").addEventListener("change", (e) => {
      settings.rankLabels = e.target.value;
      persist();
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
    $("#btn-settings-collapse").addEventListener("click", () => setSettingsOpen(false));
    $("#btn-print").addEventListener("click", () => window.print());
  }

  function persist() {
    Object.assign(settings, AppSettings.saveSettings(settings));
  }

  bindControls();
  render();
})();
