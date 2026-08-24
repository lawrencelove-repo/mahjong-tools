/**
 * Tile Scan UI — photo → detected tiles (editable) for browser CV spike.
 */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  /** @type {ReturnType<typeof window.TileScanCv.analyzePhoto> extends Promise<infer R> ? R : never | null} */
  let lastResult = null;
  /** @type {string[]} */
  let tileIds = [];
  /** @type {HTMLImageElement|null} */
  let sourceImage = null;

  function mount() {
    const root = $("#tile-scan-root");
    root.innerHTML = `
      <h2>Tile Scan <span class="hv-note">(browser CV spike · Maison Lude / Lemons)</span></h2>
      <p class="hv-note">
        Upload a photo or try the sample. Runs entirely in your browser (github.io friendly).
        Detection finds tile boxes; labels are a best-effort draft — edit any wrong IDs, then copy.
        Tuned for Maison Lude / Lemons (style-2) on a dark background.
      </p>
      <div class="hv-toolbar ts-toolbar">
        <label class="hv-btn primary ts-file-label">
          Choose photo
          <input type="file" id="ts-file" accept="image/*" capture="environment" hidden />
        </label>
        <button type="button" class="hv-btn" id="ts-sample">Load sample</button>
        <button type="button" class="hv-btn primary" id="ts-analyze" disabled>Analyze</button>
        <button type="button" class="hv-btn" id="ts-copy" disabled>Copy hand</button>
      </div>
      <p class="hv-note" id="ts-status">Choose a photo to begin.</p>
      <div class="ts-layout">
        <div class="ts-preview-wrap">
          <canvas id="ts-overlay" class="ts-overlay" aria-label="Photo with detections"></canvas>
        </div>
        <div class="ts-side">
          <div class="hv-rack-label">Detected tiles <span class="hv-count" id="ts-count">0</span></div>
          <div class="ts-tiles" id="ts-tiles"></div>
          <div class="hv-result" id="ts-score" hidden></div>
        </div>
      </div>
    `;

    $("#ts-file").addEventListener("change", onFile);
    $("#ts-sample").addEventListener("click", loadSample);
    $("#ts-analyze").addEventListener("click", () => analyze());
    $("#ts-copy").addEventListener("click", copyHand);

    // Warm templates in background
    window.TileScanCv?.ensureTemplates?.().catch(() => {});
  }

  function setStatus(msg) {
    $("#ts-status").textContent = msg;
  }

  function loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = url;
    });
  }

  async function onFile(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      sourceImage = await loadImageFromUrl(url);
      drawOverlay(null);
      $("#ts-analyze").disabled = false;
      $("#ts-copy").disabled = true;
      $("#ts-score").hidden = true;
      setStatus(`Loaded ${file.name}. Tap Analyze.`);
    } catch (e) {
      setStatus(String(e.message || e));
    }
  }

  async function loadSample() {
    try {
      setStatus("Loading sample…");
      sourceImage = await loadImageFromUrl(window.TileScanCv.SAMPLE_URL);
      drawOverlay(null);
      $("#ts-analyze").disabled = false;
      await analyze({ scoreAgainstSample: true });
    } catch (e) {
      setStatus(String(e.message || e));
    }
  }

  function drawOverlay(result) {
    const canvas = $("#ts-overlay");
    if (!sourceImage) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    const maxW = Math.min(720, window.innerWidth - 24);
    const scale = Math.min(1, maxW / sourceImage.naturalWidth);
    const w = Math.round(sourceImage.naturalWidth * scale);
    const h = Math.round(sourceImage.naturalHeight * scale);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(sourceImage, 0, 0, w, h);
    if (!result?.tiles?.length) return;
    ctx.lineWidth = Math.max(2, Math.round(2 * scale));
    ctx.font = `${Math.max(11, Math.round(13 * scale))}px sans-serif`;
    result.tiles.forEach((t, i) => {
      const b = t.box;
      const x = b.x * scale;
      const y = b.y * scale;
      const bw = b.w * scale;
      const bh = b.h * scale;
      ctx.strokeStyle = "#0a7a3e";
      ctx.fillStyle = "rgba(10,122,62,0.15)";
      ctx.fillRect(x, y, bw, bh);
      ctx.strokeRect(x, y, bw, bh);
      const label = `${i + 1}:${tileIds[i] || t.id}`;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      const tw = ctx.measureText(label).width + 6;
      ctx.fillRect(x, Math.max(0, y - 16), tw, 16);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x + 3, Math.max(12, y - 4));
    });
  }

  function renderTileList() {
    const host = $("#ts-tiles");
    host.replaceChildren();
    $("#ts-count").textContent = String(tileIds.length);
    tileIds.forEach((id, i) => {
      const row = document.createElement("div");
      row.className = "ts-tile-row";
      const thumb = document.createElement("img");
      thumb.className = "ts-thumb";
      thumb.alt = "";
      thumb.src = lastResult?.tiles?.[i]?.thumbDataUrl || "";
      const sel = document.createElement("select");
      sel.className = "ts-id-select";
      sel.setAttribute("aria-label", `Tile ${i + 1}`);
      const opts = buildIdOptions(id, lastResult?.tiles?.[i]);
      for (const o of opts) {
        const opt = document.createElement("option");
        opt.value = o;
        opt.textContent = o;
        if (o === id) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener("change", () => {
        tileIds[i] = sel.value;
        drawOverlay(lastResult);
      });
      const meta = document.createElement("span");
      meta.className = "ts-meta";
      const t = lastResult?.tiles?.[i];
      meta.textContent = t
        ? `conf ${t.score.toFixed(2)}${t.suitHint ? ` · hint ${t.suitHint}` : ""}`
        : "";
      row.append(thumb, sel, meta);
      host.appendChild(row);
    });
    $("#ts-copy").disabled = tileIds.length === 0;
  }

  function buildIdOptions(current, tile) {
    const set = new Set();
    if (current) set.add(current);
    for (const t of tile?.top || []) set.add(t.id);
    for (const suit of ["P", "B", "C"]) {
      for (let n = 1; n <= 9; n++) set.add(`${n}${suit}`);
    }
    [
      "EW",
      "SW",
      "WW",
      "NW",
      "GD",
      "RD",
      "WD",
      "F1",
      "F2",
      "F3",
      "F4",
      "J1",
      "J2",
      "?",
    ].forEach((id) => set.add(id));
    return [...set];
  }

  async function analyze(opts = {}) {
    if (!sourceImage || !window.TileScanCv) return;
    $("#ts-analyze").disabled = true;
    setStatus("Analyzing… (loading templates on first run)");
    const t0 = performance.now();
    try {
      await window.TileScanCv.ensureTemplates();
      lastResult = await window.TileScanCv.analyzePhoto(sourceImage, {
        expectedCount: 14,
      });
      tileIds = lastResult.tiles.map((t) => t.id);
      drawOverlay(lastResult);
      renderTileList();
      const ms = Math.round(performance.now() - t0);
      let msg = `Found ${lastResult.tiles.length} tile(s) in ${ms} ms.`;
      if (opts.scoreAgainstSample) {
        const expected = window.TileScanCv.SAMPLE_EXPECTED;
        const n = Math.min(expected.length, tileIds.length);
        let ok = 0;
        for (let i = 0; i < n; i++) if (tileIds[i] === expected[i]) ok++;
        const scoreEl = $("#ts-score");
        scoreEl.hidden = false;
        scoreEl.className =
          "hv-result " + (ok === expected.length ? "is-ok" : "is-error");
        scoreEl.textContent =
          `Sample score: ${ok} / ${expected.length} exact (order-sensitive)\n` +
          `Expected: ${expected.join(" ")}\n` +
          `Got:      ${tileIds.join(" ")}`;
        msg += ` Sample match ${ok}/${expected.length}.`;
        console.log("[tile-scan]", { ok, expected, got: tileIds, lastResult });
      } else {
        $("#ts-score").hidden = true;
        console.log("[tile-scan]", lastResult);
      }
      setStatus(msg);
    } catch (e) {
      console.error(e);
      setStatus(String(e.message || e));
    } finally {
      $("#ts-analyze").disabled = !sourceImage;
    }
  }

  async function copyHand() {
    const text = tileIds.join(" ");
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`Copied: ${text}`);
    } catch {
      setStatus(`Hand: ${text}`);
    }
    console.log("[tile-scan] hand", text);
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
