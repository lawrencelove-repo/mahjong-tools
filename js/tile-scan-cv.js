/**
 * Browser classical CV: detect mahjong tile faces in a photo and classify
 * them (Maison Lude / style-2 first). Canvas ImageData only — github.io friendly.
 *
 * Pipeline: cream-face mask → group blobs → seam split → suit from numeral
 * color → rank from digit templates cut from style-2 assets.
 */
(function () {
  const MAX_PROCESS_W = 960;
  const DIGIT_W = 24;
  const DIGIT_H = 32;

  /** @type {Map<string, Float32Array>|null} digit key "1".."9" → fingerprint */
  let digitCache = null;
  /** @type {Promise<Map<string, Float32Array>>|null} */
  let digitPromise = null;

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function luminance(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function drawToProcessCanvas(source, maxW = MAX_PROCESS_W) {
    const sw = source.naturalWidth || source.width;
    const sh = source.naturalHeight || source.height;
    const scale = sw > maxW ? maxW / sw : 1;
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, w, h);
    return { canvas, ctx, scale, width: w, height: h };
  }

  function buildFaceMask(imageData) {
    const { data, width, height } = imageData;
    const mask = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const L = luminance(r, g, b);
      const maxc = Math.max(r, g, b);
      const minc = Math.min(r, g, b);
      const sat = maxc === 0 ? 0 : (maxc - minc) / maxc;
      if (L >= 150 && sat < 0.3) mask[p] = 1;
      else if (L >= 170 && sat < 0.4) mask[p] = 1;
    }
    return mask;
  }

  function morphClose(mask, width, height) {
    const tmp = new Uint8Array(mask.length);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            n += mask[(y + dy) * width + (x + dx)];
          }
        }
        tmp[y * width + x] = n >= 3 ? 1 : 0;
      }
    }
    return tmp;
  }

  function connectedComponents(mask, width, height) {
    const seen = new Uint8Array(mask.length);
    /** @type {{x:number,y:number,w:number,h:number,area:number}[]} */
    const boxes = [];
    const stack = new Int32Array(mask.length);
    const imgArea = width * height;
    const minArea = imgArea * 0.008;
    const maxArea = imgArea * 0.2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const start = y * width + x;
        if (!mask[start] || seen[start]) continue;

        let top = 0;
        stack[top++] = start;
        seen[start] = 1;
        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        let area = 0;

        while (top > 0) {
          const idx = stack[--top];
          const cx = idx % width;
          const cy = (idx / width) | 0;
          area++;
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
          for (const n of [idx - 1, idx + 1, idx - width, idx + width]) {
            if (n < 0 || n >= mask.length || seen[n] || !mask[n]) continue;
            const nx = n % width;
            const ny = (n / width) | 0;
            if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
            seen[n] = 1;
            stack[top++] = n;
          }
        }

        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        if (area < minArea || area > maxArea) continue;
        const aspect = bw / bh;
        if (aspect < 0.3 || aspect > 8) continue;
        if (bh < height * 0.06) continue;
        boxes.push({ x: minX, y: minY, w: bw, h: bh, area });
      }
    }
    return boxes;
  }

  function smooth1d(arr, radius = 2) {
    const out = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      let sum = 0;
      let n = 0;
      for (let d = -radius; d <= radius; d++) {
        const j = i + d;
        if (j < 0 || j >= arr.length) continue;
        sum += arr[j];
        n++;
      }
      out[i] = sum / n;
    }
    return out;
  }

  /**
   * Vertical seam energy from image gradients (works when faces touch).
   * @param {ImageData} imageData
   * @param {{x:number,y:number,w:number,h:number}} box
   */
  function columnSeamEnergy(imageData, box) {
    const { data, width } = imageData;
    const energy = new Float32Array(box.w);
    const y0 = box.y + Math.floor(box.h * 0.12);
    const y1 = box.y + Math.floor(box.h * 0.72);
    for (let x = 1; x < box.w - 1; x++) {
      let sum = 0;
      let n = 0;
      const gx = box.x + x;
      for (let y = y0; y < y1; y++) {
        const i = (y * width + gx) * 4;
        const il = (y * width + (gx - 1)) * 4;
        const ir = (y * width + (gx + 1)) * 4;
        const L = luminance(data[i], data[i + 1], data[i + 2]);
        const Ll = luminance(data[il], data[il + 1], data[il + 2]);
        const Lr = luminance(data[ir], data[ir + 1], data[ir + 2]);
        sum += Math.abs(Lr - Ll) + Math.abs(L - Ll);
        n++;
      }
      energy[x] = n ? sum / n : 0;
    }
    return smooth1d(energy, 2);
  }

  /**
   * @param {ImageData} imageData
   * @param {{x:number,y:number,w:number,h:number,area:number}} box
   */
  function maybeSplitBox(imageData, box) {
    const aspect = box.w / box.h;
    if (aspect < 0.95) return [box];

    const seam = columnSeamEnergy(imageData, box);

    let bestN = Math.max(2, Math.round(box.w / (box.h * 0.55)));
    let bestScore = -Infinity;
    for (const ratio of [0.45, 0.48, 0.5, 0.52, 0.55, 0.58, 0.62, 0.68]) {
      const n = Math.max(2, Math.round(box.w / (box.h * ratio)));
      if (n < 2 || n > 10) continue;
      const tileW = box.w / n;
      let score = 0;
      for (let k = 1; k < n; k++) {
        const center = Math.round(k * tileW);
        const lo = Math.max(2, center - Math.floor(tileW * 0.22));
        const hi = Math.min(box.w - 3, center + Math.floor(tileW * 0.22));
        let maxE = 0;
        for (let x = lo; x <= hi; x++) maxE = Math.max(maxE, seam[x]);
        score += maxE;
      }
      const faceAspect = tileW / box.h;
      // Prefer face-like aspect (~0.5–0.65 for this set in photo).
      score =
        score / (n - 1) -
        Math.abs(faceAspect - 0.52) * 14 -
        Math.abs(faceAspect - 0.58) * 4;
      if (score > bestScore) {
        bestScore = score;
        bestN = n;
      }
    }

    const cuts = [];
    const tileW = box.w / bestN;
    for (let k = 1; k < bestN; k++) {
      const center = Math.round(k * tileW);
      const lo = Math.max(Math.floor(tileW * 0.55), center - Math.floor(tileW * 0.25));
      const hi = Math.min(
        box.w - Math.floor(tileW * 0.55),
        center + Math.floor(tileW * 0.25)
      );
      let bestX = center;
      let bestE = -1;
      for (let x = lo; x <= hi; x++) {
        if (seam[x] > bestE) {
          bestE = seam[x];
          bestX = x;
        }
      }
      cuts.push(bestX);
    }

    const parts = [];
    let prev = 0;
    for (const c of cuts) {
      const w = c - prev;
      if (w >= box.h * 0.25) {
        parts.push({
          x: box.x + prev,
          y: box.y,
          w,
          h: box.h,
          area: w * box.h * 0.7,
        });
      }
      prev = c;
    }
    const wLast = box.w - prev;
    if (wLast >= box.h * 0.25) {
      parts.push({
        x: box.x + prev,
        y: box.y,
        w: wLast,
        h: box.h,
        area: wLast * box.h * 0.7,
      });
    }

    const filtered = parts.filter((p) => {
      const a = p.w / p.h;
      return a >= 0.28 && a <= 1.1;
    });
    return filtered.length >= 2 ? filtered : [box];
  }

  function sortReadingOrder(boxes) {
    if (!boxes.length) return boxes;
    const hs = boxes.map((b) => b.h).sort((a, b) => a - b);
    const medH = hs[(hs.length / 2) | 0];
    const rowTol = medH * 0.55;
    const sorted = boxes.slice().sort((a, b) => a.y + a.h / 2 - (b.y + b.h / 2));
    /** @type {typeof boxes[]} */
    const rows = [];
    for (const b of sorted) {
      const cy = b.y + b.h / 2;
      const row = rows.find((r) => Math.abs(r[0].y + r[0].h / 2 - cy) < rowTol);
      if (row) row.push(b);
      else rows.push([b]);
    }
    rows.sort((a, b) => a[0].y - b[0].y);
    const out = [];
    for (const row of rows) {
      row.sort((a, b) => a.x - b.x);
      out.push(...row);
    }
    return out;
  }

  /**
   * Prefer the bright cream face inside a bbox (trim visible side bevels).
   * @param {ImageData} full
   * @param {{x:number,y:number,w:number,h:number}} box
   */
  function extractFaceCrop(full, box) {
    const { data, width } = full;
    let minX = box.x + box.w;
    let maxX = box.x;
    let minY = box.y + box.h;
    let maxY = box.y;
    let found = 0;
    for (let y = box.y; y < box.y + box.h; y++) {
      for (let x = box.x; x < box.x + box.w; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const L = luminance(r, g, b);
        const maxc = Math.max(r, g, b);
        const minc = Math.min(r, g, b);
        const sat = maxc === 0 ? 0 : (maxc - minc) / maxc;
        if (L >= 145 && sat < 0.35) {
          found++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (found < 40) {
      return {
        x: box.x,
        y: box.y,
        w: box.w,
        h: Math.round(box.h * 0.78),
      };
    }
    // Trim a little; keep top for numeral.
    const pad = 1;
    return {
      x: clamp(minX - pad, box.x, box.x + box.w - 1),
      y: clamp(minY - pad, box.y, box.y + box.h - 1),
      w: clamp(maxX - minX + 1 + pad * 2, 1, box.x + box.w - minX),
      h: clamp(maxY - minY + 1 + pad * 2, 1, box.y + box.h - minY),
    };
  }

  function cropRect(ctx, rect) {
    const x = clamp(rect.x, 0, ctx.canvas.width - 1);
    const y = clamp(rect.y, 0, ctx.canvas.height - 1);
    const w = clamp(rect.w, 1, ctx.canvas.width - x);
    const h = clamp(rect.h, 1, ctx.canvas.height - y);
    return ctx.getImageData(x, y, w, h);
  }

  /**
   * Suit from icon palette: Pins≈yellow, Bams≈green, Craks≈red.
   * @returns {"P"|"B"|"C"|null}
   */
  function detectSuitFromIcon(imageData) {
    const { data, width, height } = imageData;
    const x1 = Math.floor(width * 0.15);
    const x2 = Math.floor(width * 0.85);
    const y1 = Math.floor(height * 0.28);
    const y2 = Math.floor(height * 0.92);
    let yellow = 0;
    let green = 0;
    let red = 0;
    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const L = luminance(r, g, b);
        const maxc = Math.max(r, g, b);
        const minc = Math.min(r, g, b);
        if (L < 50 || L > 230) continue;
        if (maxc - minc < 28) continue;
        if (r > 100 && g > 85 && b < 140 && r + g > b * 1.8 + 20) yellow += 2;
        else if (g > r + 5 && g > b + 3 && g > 70) green += 2;
        else if (r > g + 15 && r > b + 15 && r > 90) red++;
      }
    }
    const total = yellow + green + red;
    if (total < 12) return null;
    if (yellow >= green && yellow >= red) return "P";
    if (green >= yellow && green >= red) return "B";
    return "C";
  }

  /**
   * Fallback: Maison Lude numeral ink color in top-left.
   * @returns {"P"|"B"|"C"|null}
   */
  function detectSuitFromNumeral(imageData) {
    const { data, width, height } = imageData;
    const x1 = Math.floor(width * 0.02);
    const x2 = Math.floor(width * 0.42);
    const y1 = Math.floor(height * 0.02);
    const y2 = Math.floor(height * 0.34);
    let blue = 0;
    let green = 0;
    let red = 0;
    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const L = luminance(r, g, b);
        const maxc = Math.max(r, g, b);
        const minc = Math.min(r, g, b);
        if (L < 30 || L > 210) continue;
        if (maxc - minc < 22) continue;
        if (r > 140 && g > 120 && b < 110 && r + g > 2 * b + 40) continue;
        if (b > r + 12 && b >= g - 8) blue++;
        else if (g > r + 10 && g > b + 6) green++;
        else if (r > g + 14 && r > b + 14) red++;
      }
    }
    const total = blue + green + red;
    if (total < 4) return null;
    if (blue >= green && blue >= red) return "P";
    if (green >= blue && green >= red) return "B";
    return "C";
  }

  /** Top-left digit window as ink-mask fingerprint. */
  function digitFingerprintFromImageData(imageData) {
    const { data, width, height } = imageData;
    const x1 = Math.floor(width * 0.02);
    const x2 = Math.max(x1 + 1, Math.floor(width * 0.45));
    const y1 = Math.floor(height * 0.02);
    const y2 = Math.max(y1 + 1, Math.floor(height * 0.36));
    const cw = x2 - x1;
    const ch = y2 - y1;
    const tmp = document.createElement("canvas");
    tmp.width = cw;
    tmp.height = ch;
    const tctx = tmp.getContext("2d", { willReadFrequently: true });
    const crop = tctx.createImageData(cw, ch);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const si = ((y1 + y) * width + (x1 + x)) * 4;
        const di = (y * cw + x) * 4;
        crop.data[di] = data[si];
        crop.data[di + 1] = data[si + 1];
        crop.data[di + 2] = data[si + 2];
        crop.data[di + 3] = 255;
      }
    }
    tctx.putImageData(crop, 0, 0);

    const outC = document.createElement("canvas");
    outC.width = DIGIT_W;
    outC.height = DIGIT_H;
    const octx = outC.getContext("2d", { willReadFrequently: true });
    octx.drawImage(tmp, 0, 0, DIGIT_W, DIGIT_H);
    const d = octx.getImageData(0, 0, DIGIT_W, DIGIT_H).data;
    const fp = new Float32Array(DIGIT_W * DIGIT_H);
    let sum = 0;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const L = luminance(r, g, b) / 255;
      const maxc = Math.max(r, g, b);
      const minc = Math.min(r, g, b);
      const sat = maxc === 0 ? 0 : (maxc - minc) / maxc;
      const ink = sat > 0.1 || L < 0.58 ? 1 - L : 0;
      fp[p] = ink;
      sum += ink;
    }
    if (sum < 1e-6) return fp;
    const mean = sum / fp.length;
    let varSum = 0;
    for (let i = 0; i < fp.length; i++) {
      fp[i] -= mean;
      varSum += fp[i] * fp[i];
    }
    const norm = Math.sqrt(varSum) || 1;
    for (let i = 0; i < fp.length; i++) fp[i] /= norm;
    return fp;
  }

  function similarity(a, b) {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
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

  async function ensureDigitTemplates() {
    if (digitCache) return digitCache;
    if (digitPromise) return digitPromise;
    digitPromise = (async () => {
      /** @type {Map<string, Float32Array[]>} */
      const buckets = new Map();
      for (let n = 1; n <= 9; n++) buckets.set(String(n), []);

      await Promise.all(
        ["P", "B", "C"].flatMap((suit) =>
          Array.from({ length: 9 }, (_, i) => i + 1).map(async (n) => {
            const id = `${n}${suit}`;
            const url = style2Url(id);
            if (!url) return;
            try {
              const img = await loadImage(url);
              const { ctx } = drawToProcessCanvas(img, 160);
              const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
              buckets.get(String(n)).push(digitFingerprintFromImageData(data));
            } catch {
              /* optional */
            }
          })
        )
      );

      const map = new Map();
      for (const [digit, list] of buckets) {
        if (!list.length) continue;
        const avg = new Float32Array(DIGIT_W * DIGIT_H);
        for (const fp of list) {
          for (let i = 0; i < avg.length; i++) avg[i] += fp[i];
        }
        for (let i = 0; i < avg.length; i++) avg[i] /= list.length;
        let sum = 0;
        for (let i = 0; i < avg.length; i++) sum += avg[i];
        const mean = sum / avg.length;
        let varSum = 0;
        for (let i = 0; i < avg.length; i++) {
          avg[i] -= mean;
          varSum += avg[i] * avg[i];
        }
        const norm = Math.sqrt(varSum) || 1;
        for (let i = 0; i < avg.length; i++) avg[i] /= norm;
        map.set(digit, avg);
      }
      digitCache = map;
      return map;
    })();
    return digitPromise;
  }

  /** @type {Map<string, Float32Array>|null} */
  let tileGridCache = null;
  /** @type {Promise<Map<string, Float32Array>>|null} */
  let tileGridPromise = null;
  const GRID_W = 8;
  const GRID_H = 10;

  function colorGrid(imageData, gw = GRID_W, gh = GRID_H) {
    const { data, width, height } = imageData;
    const out = new Float32Array(gw * gh * 3);
    const cellW = width / gw;
    const cellH = height / gh;
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let n = 0;
        const x0 = Math.floor(gx * cellW);
        const x1 = Math.floor((gx + 1) * cellW);
        const y0 = Math.floor(gy * cellH);
        const y1 = Math.floor((gy + 1) * cellH);
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const i = (y * width + x) * 4;
            rSum += data[i];
            gSum += data[i + 1];
            bSum += data[i + 2];
            n++;
          }
        }
        const o = (gy * gw + gx) * 3;
        out[o] = n ? rSum / n / 255 : 0;
        out[o + 1] = n ? gSum / n / 255 : 0;
        out[o + 2] = n ? bSum / n / 255 : 0;
      }
    }
    // Mean-center for lighting robustness.
    let mr = 0;
    let mg = 0;
    let mb = 0;
    const cells = gw * gh;
    for (let i = 0; i < cells; i++) {
      mr += out[i * 3];
      mg += out[i * 3 + 1];
      mb += out[i * 3 + 2];
    }
    mr /= cells;
    mg /= cells;
    mb /= cells;
    let varSum = 0;
    for (let i = 0; i < cells; i++) {
      out[i * 3] -= mr;
      out[i * 3 + 1] -= mg;
      out[i * 3 + 2] -= mb;
      varSum +=
        out[i * 3] ** 2 + out[i * 3 + 1] ** 2 + out[i * 3 + 2] ** 2;
    }
    const norm = Math.sqrt(varSum) || 1;
    for (let i = 0; i < out.length; i++) out[i] /= norm;
    return out;
  }

  async function ensureTileGrids() {
    if (tileGridCache) return tileGridCache;
    if (tileGridPromise) return tileGridPromise;
    tileGridPromise = (async () => {
      const map = new Map();
      const ids = [];
      for (const suit of ["P", "B", "C"]) {
        for (let n = 1; n <= 9; n++) ids.push(`${n}${suit}`);
      }
      await Promise.all(
        ids.map(async (id) => {
          const url = style2Url(id);
          if (!url) return;
          try {
            const img = await loadImage(url);
            const { ctx } = drawToProcessCanvas(img, 120);
            const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            map.set(id, colorGrid(data));
          } catch {
            /* optional */
          }
        })
      );
      tileGridCache = map;
      return map;
    })();
    return tileGridPromise;
  }

  function classifyCrop(imageData, digits, tileGrids) {
    const suitHint =
      detectSuitFromIcon(imageData) || detectSuitFromNumeral(imageData);
    const grid = colorGrid(imageData);
    /** @type {{id:string, score:number}[]} */
    const ranked = [];
    for (const [id, tmpl] of tileGrids) {
      if (suitHint && id[1] !== suitHint) continue;
      ranked.push({ id, score: similarity(grid, tmpl) });
    }
    if (!ranked.length) {
      for (const [id, tmpl] of tileGrids) {
        ranked.push({ id, score: similarity(grid, tmpl) });
      }
    }
    ranked.sort((a, b) => b.score - a.score);

    // Digit vote as a soft prior when margin is weak.
    const fp = digitFingerprintFromImageData(imageData);
    /** @type {Map<string, number>} */
    const digitScores = new Map();
    for (const [digit, tmpl] of digits) {
      digitScores.set(digit, similarity(fp, tmpl));
    }
    for (const c of ranked) {
      const d = c.id[0];
      c.score += (digitScores.get(d) || 0) * 0.15;
    }
    ranked.sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const second = ranked[1];
    return {
      id: best?.id || "?",
      rank: best?.id?.[0] || "?",
      suitHint: suitHint || best?.id?.[1] || null,
      score: best?.score ?? 0,
      margin: (best?.score ?? 0) - (second?.score ?? 0),
      top: ranked.slice(0, 5),
    };
  }

  /**
   * @param {HTMLImageElement|ImageBitmap} source
   * @param {{expectedCount?: number}} [opts]
   */
  async function analyzePhoto(source, opts = {}) {
    const expectedCount = opts.expectedCount ?? 14;
    const [digits, tileGrids] = await Promise.all([
      ensureDigitTemplates(),
      ensureTileGrids(),
    ]);
    const { canvas, ctx, scale, width, height } = drawToProcessCanvas(source);
    const imageData = ctx.getImageData(0, 0, width, height);
    let mask = buildFaceMask(imageData);
    mask = morphClose(mask, width, height);

    const rawBoxes = connectedComponents(mask, width, height);
    /** @type {typeof rawBoxes} */
    let boxes = [];
    for (const b of rawBoxes) {
      boxes.push(...maybeSplitBox(imageData, b));
    }
    boxes = sortReadingOrder(boxes);

    if (boxes.length > expectedCount) {
      const keep = boxes
        .slice()
        .sort((a, b) => b.area - a.area)
        .slice(0, expectedCount);
      boxes = sortReadingOrder(keep);
    }

    const tiles = boxes.map((box, index) => {
      const face = extractFaceCrop(imageData, box);
      const crop = cropRect(ctx, face);
      const match = classifyCrop(crop, digits, tileGrids);
      const thumb = document.createElement("canvas");
      thumb.width = 48;
      thumb.height = 64;
      thumb
        .getContext("2d")
        .drawImage(canvas, box.x, box.y, box.w, box.h, 0, 0, 48, 64);
      return {
        index,
        id: match.id,
        score: match.score,
        margin: match.margin,
        suitHint: match.suitHint,
        rank: match.rank,
        top: match.top,
        box: {
          x: box.x / scale,
          y: box.y / scale,
          w: box.w / scale,
          h: box.h / scale,
        },
        processBox: box,
        thumbDataUrl: thumb.toDataURL("image/jpeg", 0.7),
      };
    });

    return {
      processSize: { width, height, scale },
      boxCount: boxes.length,
      tiles,
      debug: {
        maskDensity: mask.reduce((a, b) => a + b, 0) / Math.max(1, mask.length),
        groupCount: rawBoxes.length,
      },
    };
  }

  const SAMPLE_EXPECTED = [
    "1P",
    "1P",
    "8P",
    "4P",
    "5P",
    "2B",
    "7B",
    "9B",
    "1C",
    "1C",
    "3C",
    "5C",
    "8C",
    "8C",
  ];

  window.TileScanCv = {
    analyzePhoto,
    ensureTemplates: async () => {
      await Promise.all([ensureDigitTemplates(), ensureTileGrids()]);
    },
    SAMPLE_EXPECTED,
    SAMPLE_URL: "assets/fixtures/maison-lude-hand-sample.png",
  };
})();
