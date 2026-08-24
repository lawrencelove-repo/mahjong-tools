/**
 * Synthetic warps + tiny TF.js digit classifier for Maison Lude numerals.
 * Loads pretrained weights from assets/models/lemon-digit/ when present;
 * can also train in-browser from style-2 warps.
 */
(function () {
  const W = 32;
  const H = 40;
  const MODEL_URL = "assets/models/lemon-digit/model.json";
  const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  /** @type {any} */
  let model = null;
  /** @type {Promise<any>|null} */
  let modelPromise = null;

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Apply a photo-like warp to a B/W digit canvas (black ink on white).
   * @param {HTMLCanvasElement} src
   * @param {() => number} rnd
   * @param {"mild"|"medium"|"strong"} [intensity]
   */
  function warpDigitCanvas(src, rnd, intensity = "medium") {
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);

    const scale =
      intensity === "mild" ? 0.35 : intensity === "strong" ? 1 : 0.65;
    const ang = (((rnd() - 0.5) * 22 * scale) * Math.PI) / 180;
    const sx = 1 + (rnd() - 0.5) * 0.35 * scale;
    const sy = 1 + (rnd() - 0.5) * 0.35 * scale;
    const tx = (rnd() - 0.5) * 6 * scale;
    const ty = (rnd() - 0.5) * 6 * scale;
    const skewX = (rnd() - 0.5) * 0.2 * scale;

    ctx.save();
    ctx.translate(W / 2 + tx, H / 2 + ty);
    ctx.rotate(ang);
    ctx.transform(sx, 0, skewX, sy, 0, 0);
    ctx.drawImage(src, -W / 2, -H / 2);
    ctx.restore();

    if (intensity !== "mild" && rnd() > 0.4) {
      const img = ctx.getImageData(0, 0, W, H);
      const copy = new Uint8ClampedArray(img.data);
      const r = intensity === "strong" && rnd() > 0.5 ? 2 : 1;
      for (let y = r; y < H - r; y++) {
        for (let x = r; x < W - r; x++) {
          let s = 0;
          let n = 0;
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              s += copy[((y + dy) * W + (x + dx)) * 4];
              n++;
            }
          }
          const v = (s / n) | 0;
          const i = (y * W + x) * 4;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    {
      const img = ctx.getImageData(0, 0, W, H);
      const thr = 120 + (rnd() - 0.5) * 50 * scale;
      const noiseAmp = 20 * scale;
      for (let i = 0; i < img.data.length; i += 4) {
        let v = img.data[i] + (rnd() - 0.5) * noiseAmp;
        v = v < thr ? 0 : 255;
        if (rnd() < 0.004 * scale) v = 255 - v;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      }
      ctx.putImageData(img, 0, 0);
    }

    return out;
  }

  /**
   * Warp a full RGBA ImageData (tile face) before digit extraction.
   * @param {ImageData} src
   * @param {() => number} rnd
   * @param {"mild"|"medium"|"strong"} intensity
   */
  function warpImageData(src, rnd, intensity = "medium") {
    const scale =
      intensity === "mild" ? 0.4 : intensity === "strong" ? 1 : 0.7;
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.putImageData(src, 0, 0);

    const out = document.createElement("canvas");
    out.width = src.width;
    out.height = src.height;
    const octx = out.getContext("2d", { willReadFrequently: true });
    octx.fillStyle = "#f5f0e6";
    octx.fillRect(0, 0, out.width, out.height);

    const ang = (((rnd() - 0.5) * 18 * scale) * Math.PI) / 180;
    const sx = 1 + (rnd() - 0.5) * 0.28 * scale;
    const sy = 1 + (rnd() - 0.5) * 0.28 * scale;
    const tx = (rnd() - 0.5) * src.width * 0.08 * scale;
    const ty = (rnd() - 0.5) * src.height * 0.08 * scale;
    const skewX = (rnd() - 0.5) * 0.18 * scale;

    octx.save();
    octx.translate(src.width / 2 + tx, src.height / 2 + ty);
    octx.rotate(ang);
    octx.transform(sx, 0, skewX, sy, 0, 0);
    octx.drawImage(c, -src.width / 2, -src.height / 2);
    octx.restore();

    // Mild brightness noise
    const img = octx.getImageData(0, 0, out.width, out.height);
    const amp = 18 * scale;
    for (let i = 0; i < img.data.length; i += 4) {
      const d = (rnd() - 0.5) * amp;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + d));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + d));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + d));
    }
    octx.putImageData(img, 0, 0);
    return octx.getImageData(0, 0, out.width, out.height);
  }

  /** Canvas (ink black) → Float32Array length W*H in [0,1] (1=ink). */
  function canvasToInkVector(canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const d = ctx.getImageData(0, 0, W, H).data;
    const out = new Float32Array(W * H);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      out[p] = d[i] < 128 ? 1 : 0;
    }
    return out;
  }

  function createModel(tf) {
    const m = tf.sequential();
    m.add(
      tf.layers.conv2d({
        inputShape: [H, W, 1],
        filters: 16,
        kernelSize: 3,
        activation: "relu",
        padding: "same",
      })
    );
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(
      tf.layers.conv2d({
        filters: 32,
        kernelSize: 3,
        activation: "relu",
        padding: "same",
      })
    );
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.flatten());
    m.add(tf.layers.dense({ units: 64, activation: "relu" }));
    m.add(tf.layers.dropout({ rate: 0.35 }));
    m.add(tf.layers.dense({ units: 9, activation: "softmax" }));
    m.compile({
      optimizer: tf.train.adam(0.001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
    return m;
  }

  /**
   * @param {Map<string, HTMLCanvasElement[]>} baseByDigit clean digit canvases
   * @param {Map<string, ImageData[]>|null} faceCrops optional full-face crops (same pipeline as photos)
   * @param {{warpsPerDigit?: number, epochs?: number, seed?: number, onProgress?: Function}} opts
   */
  async function trainFromCanvases(baseByDigit, opts = {}) {
    const tf = window.tf;
    if (!tf) throw new Error("TensorFlow.js not loaded");

    const warpsPerDigit = opts.warpsPerDigit ?? 80;
    const epochs = opts.epochs ?? 30;
    const rnd = mulberry32(opts.seed ?? 42);
    /** @type {Map<string, ImageData[]>|undefined} */
    const faceByDigit = opts.faceByDigit;

    const xs = [];
    const ys = [];
    for (let di = 0; di < DIGITS.length; di++) {
      const digit = DIGITS[di];
      const bases = baseByDigit.get(digit) || [];
      const faces = faceByDigit?.get(digit) || [];
      if (!bases.length && !faces.length) continue;

      for (let w = 0; w < warpsPerDigit; w++) {
        let vec = null;
        // Half from face→ink pipeline (photo-like), half from clean digit warps.
        if (faces.length && (w % 2 === 0 || !bases.length)) {
          const face = faces[(w / 2) % faces.length | 0];
          const warpedFace = warpImageData(face, rnd, w % 5 === 0 ? "mild" : w % 5 < 3 ? "medium" : "strong");
          // Caller supplies extractor via opts.extractInk(imageData) -> {raw}
          if (opts.extractInk) {
            const extracted = opts.extractInk(warpedFace);
            vec = extracted.raw || extracted;
          }
        }
        if (!vec && bases.length) {
          const src = bases[w % bases.length];
          const intensity = w % 5 === 0 ? "mild" : w % 5 < 3 ? "medium" : "strong";
          const sample = w === 1 ? src : warpDigitCanvas(src, rnd, intensity);
          vec = canvasToInkVector(sample);
        }
        if (!vec) continue;
        xs.push(vec);
        const label = new Float32Array(9);
        label[di] = 1;
        ys.push(label);
      }
      opts.onProgress?.({
        phase: "warp",
        digit,
        done: di + 1,
        total: DIGITS.length,
      });
    }

    const n = xs.length;
    const xData = new Float32Array(n * H * W);
    const yData = new Float32Array(n * 9);
    for (let i = 0; i < n; i++) {
      xData.set(xs[i], i * H * W);
      yData.set(ys[i], i * 9);
    }

    const xTensor = tf.tensor4d(xData, [n, H, W, 1]);
    const yTensor = tf.tensor2d(yData, [n, 9]);

    if (model) {
      model.dispose();
      model = null;
    }
    const m = createModel(tf);
    await m.fit(xTensor, yTensor, {
      epochs,
      batchSize: 32,
      shuffle: true,
      validationSplit: 0.15,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          opts.onProgress?.({
            phase: "train",
            epoch: epoch + 1,
            epochs,
            loss: logs.loss,
            acc: logs.acc,
            val_acc: logs.val_acc,
          });
        },
      },
    });

    xTensor.dispose();
    yTensor.dispose();
    model = m;
    return m;
  }

  async function loadPretrained() {
    const tf = window.tf;
    if (!tf) return null;
    try {
      const m = await tf.loadLayersModel(MODEL_URL);
      model = m;
      return m;
    } catch (e) {
      console.warn("[digit-model] no pretrained model", e.message || e);
      return null;
    }
  }

  /**
   * @param {Float32Array|HTMLCanvasElement} inkVecOrCanvas
   */
  async function predict(inkVecOrCanvas) {
    const tf = window.tf;
    if (!tf || !model) return null;
    const vec =
      inkVecOrCanvas instanceof Float32Array
        ? inkVecOrCanvas
        : canvasToInkVector(inkVecOrCanvas);
    return tf.tidy(() => {
      const t = tf.tensor4d(vec, [1, H, W, 1]);
      const p = model.predict(t);
      const data = p.dataSync();
      let best = 0;
      for (let i = 1; i < 9; i++) if (data[i] > data[best]) best = i;
      const second = data.map((v, i) => (i === best ? -1 : v)).reduce((a, b, i, arr) => (b > arr[a] ? i : a), 0);
      return {
        digit: DIGITS[best],
        confidence: Math.round(data[best] * 100),
        margin: data[best] - data[second],
        probs: Array.from(data),
        method: "tfjs",
      };
    });
  }

  async function ensureModel(opts = {}) {
    if (model) return model;
    if (modelPromise) return modelPromise;
    modelPromise = (async () => {
      const loaded = await loadPretrained();
      if (loaded) return loaded;
      if (opts.trainIfMissing && opts.baseByDigit) {
        return trainFromCanvases(opts.baseByDigit, opts);
      }
      return null;
    })();
    try {
      return await modelPromise;
    } catch (e) {
      modelPromise = null;
      throw e;
    }
  }

  function clearModel() {
    if (model) {
      try {
        model.dispose();
      } catch {
        /* ignore */
      }
    }
    model = null;
    modelPromise = null;
  }

  /** Export model artifacts (for Node/Playwright trainers). */
  async function exportArtifacts() {
    if (!model) throw new Error("No model");
    const tf = window.tf;
    /** @type {any} */
    let artifacts = null;
    await model.save(
      tf.io.withSaveHandler(async (art) => {
        artifacts = art;
        return {
          modelArtifactsInfo: {
            dateSaved: new Date(),
            modelTopologyType: "JSON",
          },
        };
      })
    );
    return artifacts;
  }

  window.TileScanDigitModel = {
    W,
    H,
    DIGITS,
    MODEL_URL,
    warpDigitCanvas,
    warpImageData,
    canvasToInkVector,
    createModel,
    trainFromCanvases,
    loadPretrained,
    predict,
    ensureModel,
    exportArtifacts,
    mulberry32,
    clearModel,
    getModel: () => model,
  };
})();
