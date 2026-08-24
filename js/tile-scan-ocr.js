/**
 * Digit recognition for Maison Lude / style-2 numerals.
 *
 * 1) Ink crop from face
 * 2) TF.js CNN (warped synthetic training / pretrained) when available
 * 3) Warp-augmented template bank as fallback
 */
(function () {
  const DIGIT_W = 32;
  const DIGIT_H = 40;
  const WARPS_PER_BASE = 12;

  /** @type {Map<string, Float32Array[]>|null} multi-template bank */
  let templateCache = null;
  /** @type {Promise<Map<string, Float32Array[]>>|null} */
  let templatePromise = null;
  /** @type {Map<string, HTMLCanvasElement[]>|null} clean canvases for TF training */
  let baseCanvasCache = null;

  function luminance(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function style2Url(tileId) {
    const files =
      window.Tiles?.STYLE2_FILES ||
      window.Tiles?.getTileset?.("style-2")?.files ||
      null;
    const name = files?.[tileId];
    if (!name) return null;
    return `assets/style-2/${name}.png`;
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load ${url}`));
      img.src = url;
    });
  }

  function normalizeFp(raw) {
    const fp = new Float32Array(raw.length);
    let sum = 0;
    for (let i = 0; i < raw.length; i++) sum += raw[i];
    const mean = sum / raw.length;
    let varSum = 0;
    for (let i = 0; i < raw.length; i++) {
      fp[i] = raw[i] - mean;
      varSum += fp[i] * fp[i];
    }
    const norm = Math.sqrt(varSum) || 1;
    for (let i = 0; i < fp.length; i++) fp[i] /= norm;
    return fp;
  }

  /**
   * Top-left numeral → fixed-size ink canvas + fingerprints.
   * @param {ImageData} imageData
   */
  function digitInkFingerprint(imageData) {
    const { data, width, height } = imageData;
    const x2 = Math.max(2, Math.floor(width * 0.5));
    const y2 = Math.max(2, Math.floor(height * 0.4));
    const cw = x2;
    const ch = y2;

    const score = new Float32Array(cw * ch);
    let thrSum = 0;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const L = luminance(r, g, b);
        const maxc = Math.max(r, g, b);
        const minc = Math.min(r, g, b);
        const chroma = maxc - minc;
        const yellowPenalty =
          r > 120 && g > 100 && b < 130 && r + g > 2 * b + 30 ? 40 : 0;
        const s = Math.max(0, chroma - yellowPenalty) + Math.max(0, 190 - L) * 0.25;
        score[y * cw + x] = s;
        thrSum += s;
      }
    }
    const mean = thrSum / score.length;
    const threshold = Math.max(16, mean * 1.25);

    const ink = new Uint8Array(cw * ch);
    let inkCount = 0;
    for (let i = 0; i < score.length; i++) {
      if (score[i] >= threshold) {
        ink[i] = 1;
        inkCount++;
      }
    }

    let minX = cw;
    let maxX = 0;
    let minY = ch;
    let maxY = 0;
    if (inkCount > 6) {
      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          if (!ink[y * cw + x]) continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    } else {
      minX = Math.floor(cw * 0.05);
      maxX = Math.floor(cw * 0.55);
      minY = Math.floor(ch * 0.05);
      maxY = Math.floor(ch * 0.65);
    }

    const pad = 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(cw - 1, maxX + pad);
    maxY = Math.min(ch - 1, maxY + pad);
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;

    const canvas = document.createElement("canvas");
    canvas.width = DIGIT_W;
    canvas.height = DIGIT_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, DIGIT_W, DIGIT_H);

    const src = document.createElement("canvas");
    src.width = bw;
    src.height = bh;
    const sctx = src.getContext("2d", { willReadFrequently: true });
    const srcImg = sctx.createImageData(bw, bh);
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const v = ink[(minY + y) * cw + (minX + x)] ? 0 : 255;
        const di = (y * bw + x) * 4;
        srcImg.data[di] = v;
        srcImg.data[di + 1] = v;
        srcImg.data[di + 2] = v;
        srcImg.data[di + 3] = 255;
      }
    }
    sctx.putImageData(srcImg, 0, 0);
    const scale = Math.min(DIGIT_W / bw, DIGIT_H / bh) * 0.88;
    const dw = Math.max(1, Math.round(bw * scale));
    const dh = Math.max(1, Math.round(bh * scale));
    const ox = ((DIGIT_W - dw) / 2) | 0;
    const oy = ((DIGIT_H - dh) / 2) | 0;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, ox, oy, dw, dh);

    const out = ctx.getImageData(0, 0, DIGIT_W, DIGIT_H).data;
    const raw = new Float32Array(DIGIT_W * DIGIT_H);
    let inkOut = 0;
    for (let i = 0, p = 0; i < out.length; i += 4, p++) {
      const v = out[i] < 128 ? 1 : 0;
      raw[p] = v;
      inkOut += v;
    }

    return {
      fp: normalizeFp(raw),
      raw,
      canvas,
      inkRatio: inkOut / raw.length,
    };
  }

  function similarity(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
  }

  async function loadBaseDigitCanvases() {
    if (baseCanvasCache) return baseCanvasCache;
    /** @type {Map<string, HTMLCanvasElement[]>} */
    const map = new Map();
    for (let n = 1; n <= 9; n++) map.set(String(n), []);

    await Promise.all(
      ["P", "B", "C"].flatMap((suit) =>
        Array.from({ length: 9 }, (_, i) => i + 1).map(async (n) => {
          const url = style2Url(`${n}${suit}`);
          if (!url) return;
          try {
            const img = await loadImage(url);
            const c = document.createElement("canvas");
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, c.width, c.height);
            map.get(String(n)).push(digitInkFingerprint(data).canvas);
          } catch {
            /* optional */
          }
        })
      )
    );
    baseCanvasCache = map;
    return map;
  }

  async function ensureDigitTemplates() {
    if (templateCache) return templateCache;
    if (templatePromise) return templatePromise;
    templatePromise = (async () => {
      const bases = await loadBaseDigitCanvases();
      const DM = window.TileScanDigitModel;
      const rnd = DM?.mulberry32?.(2026) || Math.random;

      /** @type {Map<string, Float32Array[]>} */
      const bank = new Map();
      for (let n = 1; n <= 9; n++) bank.set(String(n), []);

      for (const [digit, canvases] of bases) {
        for (let i = 0; i < canvases.length; i++) {
          const c = canvases[i];
          const raw = new Float32Array(DIGIT_W * DIGIT_H);
          const d = c.getContext("2d").getImageData(0, 0, DIGIT_W, DIGIT_H).data;
          for (let p = 0, j = 0; j < d.length; j += 4, p++) raw[p] = d[j] < 128 ? 1 : 0;
          bank.get(digit).push(normalizeFp(raw));

          if (DM?.warpDigitCanvas) {
            for (let w = 0; w < WARPS_PER_BASE; w++) {
              const intensity = w < 4 ? "mild" : w < 9 ? "medium" : "strong";
              const warped = DM.warpDigitCanvas(c, rnd, intensity);
              const wr = DM.canvasToInkVector(warped);
              bank.get(digit).push(normalizeFp(wr));
            }
          }
        }
      }
      templateCache = bank;
      return bank;
    })();
    return templatePromise;
  }

  async function recognizeDigitTemplate(faceCrop) {
    const bank = await ensureDigitTemplates();
    const { fp, inkRatio } = digitInkFingerprint(faceCrop);
    /** @type {{digit:string, score:number}[]} */
    const ranked = [];
    for (const [digit, list] of bank) {
      let best = -Infinity;
      for (const tmpl of list) {
        const s = similarity(fp, tmpl);
        if (s > best) best = s;
      }
      ranked.push({ digit, score: best });
    }
    ranked.sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const second = ranked[1];
    const margin = (best?.score ?? 0) - (second?.score ?? 0);
    const confident =
      inkRatio > 0.01 && (best?.score ?? 0) >= 0.18 && margin >= 0.02;
    return {
      digit: confident ? best.digit : null,
      confidence: Math.round(Math.max(0, Math.min(100, (best?.score ?? 0) * 100))),
      raw: `tmpl:${best?.digit}:${(best?.score ?? 0).toFixed(3)}/m${margin.toFixed(3)}`,
      method: "template",
      top: ranked.slice(0, 3),
      margin,
    };
  }

  async function recognizeDigitTf(faceCrop) {
    const DM = window.TileScanDigitModel;
    if (!DM || !window.tf) return null;
    await DM.ensureModel();
    if (!DM.getModel()) return null;
    const { raw, inkRatio } = digitInkFingerprint(faceCrop);
    if (inkRatio < 0.008) return null;
    const pred = await DM.predict(raw);
    if (!pred) return null;
    const confident = pred.confidence >= 55 && pred.margin >= 0.12;
    return {
      digit: pred.digit,
      confidence: pred.confidence,
      raw: `tfjs:${pred.digit}:${pred.confidence}%/m${pred.margin.toFixed(2)}`,
      method: "tfjs",
      margin: pred.margin,
      confident,
      top: pred.probs
        ?.map((p, i) => ({ digit: String(i + 1), score: p }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    };
  }

  /**
   * @param {ImageData} faceCrop
   * @param {{useTesseract?: boolean}} [opts]
   */
  async function recognizeDigit(faceCrop, opts = {}) {
    const tfResult = await recognizeDigitTf(faceCrop);
    const tmpl = await recognizeDigitTemplate(faceCrop);

    // Strongest signal: both methods agree.
    if (tfResult?.digit && tmpl.digit && tfResult.digit === tmpl.digit) {
      return {
        digit: tfResult.digit,
        confidence: Math.min(100, Math.round((tfResult.confidence + tmpl.confidence) / 2) + 10),
        raw: `${tfResult.raw}|${tmpl.raw}`,
        method: "tfjs+template",
        margin: Math.min(tfResult.margin || 0, tmpl.margin || 0),
        top: tmpl.top,
      };
    }

    // Template alone when TF disagrees or is weak (templates less overconfident on photos).
    if (tmpl.digit) {
      return {
        ...tmpl,
        raw: `${tmpl.raw}|${tfResult?.raw || "tfjs:?"}`,
      };
    }

    // TF alone only when clearly peaked.
    if (tfResult?.confident && (tfResult.margin || 0) >= 0.25) {
      return tfResult;
    }

    return {
      digit: null,
      confidence: Math.max(tfResult?.confidence || 0, tmpl.confidence || 0),
      raw: `${tfResult?.raw || ""}|${tmpl.raw || ""}`,
      method: tfResult ? "tfjs" : "template",
      top: tmpl.top || tfResult?.top,
    };
  }

  async function warmUp() {
    await ensureDigitTemplates();
    if (window.TileScanDigitModel && window.tf) {
      await window.TileScanDigitModel.ensureModel();
    }
    return true;
  }

  async function loadFaceImageDataByDigit() {
    /** @type {Map<string, ImageData[]>} */
    const map = new Map();
    for (let n = 1; n <= 9; n++) map.set(String(n), []);
    await Promise.all(
      ["P", "B", "C"].flatMap((suit) =>
        Array.from({ length: 9 }, (_, i) => i + 1).map(async (n) => {
          const url = style2Url(`${n}${suit}`);
          if (!url) return;
          try {
            const img = await loadImage(url);
            const c = document.createElement("canvas");
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            map.get(String(n)).push(ctx.getImageData(0, 0, c.width, c.height));
          } catch {
            /* optional */
          }
        })
      )
    );
    return map;
  }

  async function trainModel(opts = {}) {
    const bases = await loadBaseDigitCanvases();
    const faces = await loadFaceImageDataByDigit();
    window.TileScanDigitModel.clearModel();
    return window.TileScanDigitModel.trainFromCanvases(bases, {
      warpsPerDigit: opts.warpsPerDigit ?? 96,
      epochs: opts.epochs ?? 28,
      seed: opts.seed ?? 2026,
      faceByDigit: faces,
      extractInk: (imageData) => digitInkFingerprint(imageData),
      onProgress: opts.onProgress,
    });
  }

  window.TileScanOcr = {
    recognizeDigit,
    recognizeDigitTemplate,
    recognizeDigitTf,
    digitInkFingerprint,
    digitCropCanvas: (imageData) => digitInkFingerprint(imageData).canvas,
    warmUp,
    ensureDigitTemplates,
    loadBaseDigitCanvases,
    trainModel,
  };
})();
