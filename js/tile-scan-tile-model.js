/**
 * Full-tile TF.js classifier for Maison Lude / style-2 suited tiles.
 * Trains on synthetic “table photo” crops (dark BG + warped tile faces),
 * matching what the classical detector hands to classifyCrop.
 */
(function () {
  const W = 48;
  const H = 64;
  const MODEL_URL = "assets/models/lemon-tile/model.json";

  /** Suited classes only for v1 (27). */
  const CLASSES = [];
  for (const suit of ["P", "B", "C"]) {
    for (let n = 1; n <= 9; n++) CLASSES.push(`${n}${suit}`);
  }

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

  function createModel(tf) {
    const m = tf.sequential();
    m.add(
      tf.layers.conv2d({
        inputShape: [H, W, 3],
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
    m.add(
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: "relu",
        padding: "same",
      })
    );
    m.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    m.add(tf.layers.flatten());
    m.add(tf.layers.dense({ units: 128, activation: "relu" }));
    m.add(tf.layers.dropout({ rate: 0.35 }));
    m.add(tf.layers.dense({ units: CLASSES.length, activation: "softmax" }));
    m.compile({
      optimizer: tf.train.adam(0.001),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });
    return m;
  }

  /** Draw a fabric-like dark background. */
  function fillTableBackground(ctx, w, h, rnd) {
    const base = 40 + rnd() * 35;
    ctx.fillStyle = `rgb(${base | 0},${(base + 2) | 0},${(base + 5) | 0})`;
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (rnd() - 0.5) * 28;
      img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
      img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
      img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n * 0.8));
    }
    // Soft horizontal weave
    for (let y = 0; y < h; y += 2 + ((rnd() * 2) | 0)) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        img.data[i] = Math.max(0, img.data[i] - 6);
        img.data[i + 1] = Math.max(0, img.data[i + 1] - 6);
        img.data[i + 2] = Math.max(0, img.data[i + 2] - 4);
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /**
   * Paste a style-2 tile onto a table BG with photo-like warp; return WxH RGB float [0,1].
   * @param {HTMLImageElement} tileImg
   * @param {() => number} rnd
   * @param {"mild"|"medium"|"strong"} intensity
   */
  function synthesizeDetectorCrop(tileImg, rnd, intensity = "medium") {
    const scale =
      intensity === "mild" ? 0.35 : intensity === "strong" ? 1 : 0.65;
    const pad = 24;
    const tw = tileImg.naturalWidth || tileImg.width;
    const th = tileImg.naturalHeight || tileImg.height;
    const sceneW = tw + pad * 2;
    const sceneH = th + pad * 2;

    const scene = document.createElement("canvas");
    scene.width = sceneW;
    scene.height = sceneH;
    const sctx = scene.getContext("2d", { willReadFrequently: true });
    fillTableBackground(sctx, sceneW, sceneH, rnd);

    const ang = (((rnd() - 0.5) * 16 * scale) * Math.PI) / 180;
    const sx = 0.92 + rnd() * 0.16 * (0.5 + scale);
    const sy = 0.92 + rnd() * 0.16 * (0.5 + scale);
    const skewX = (rnd() - 0.5) * 0.14 * scale;
    const tx = (rnd() - 0.5) * 10 * scale;
    const ty = (rnd() - 0.5) * 10 * scale;

    sctx.save();
    sctx.translate(sceneW / 2 + tx, sceneH / 2 + ty);
    sctx.rotate(ang);
    sctx.transform(sx, 0, skewX, sy, 0, 0);
    sctx.drawImage(tileImg, -tw / 2, -th / 2);
    sctx.restore();

    // Brightness / contrast jitter
    const img = sctx.getImageData(0, 0, sceneW, sceneH);
    const bright = (rnd() - 0.5) * 40 * scale;
    const contrast = 1 + (rnd() - 0.5) * 0.25 * scale;
    for (let i = 0; i < img.data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        let v = img.data[i + c];
        v = (v - 128) * contrast + 128 + bright;
        img.data[i + c] = Math.max(0, Math.min(255, v));
      }
    }
    sctx.putImageData(img, 0, 0);

    // Crop around tile with detector-like margins (sometimes tight, sometimes loose)
    const marginFrac = 0.02 + rnd() * 0.12 * scale;
    const cropX = Math.max(0, ((pad - tw * marginFrac) | 0));
    const cropY = Math.max(0, ((pad - th * marginFrac) | 0));
    const cropW = Math.min(sceneW - cropX, (tw + tw * marginFrac * 2) | 0);
    const cropH = Math.min(sceneH - cropY, (th + th * marginFrac * 2 + th * 0.08) | 0);

    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const octx = out.getContext("2d", { willReadFrequently: true });
    octx.fillStyle = "#333";
    octx.fillRect(0, 0, W, H);
    octx.drawImage(scene, cropX, cropY, cropW, cropH, 0, 0, W, H);

    // Optional light blur
    if (intensity !== "mild" && rnd() > 0.55) {
      octx.filter = "blur(0.6px)";
      octx.drawImage(out, 0, 0);
      octx.filter = "none";
    }

    return canvasToRgbVector(out);
  }

  function canvasToRgbVector(canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const d = ctx.getImageData(0, 0, W, H).data;
    const out = new Float32Array(W * H * 3);
    for (let i = 0, p = 0; i < d.length; i += 4, p += 3) {
      out[p] = d[i] / 255;
      out[p + 1] = d[i + 1] / 255;
      out[p + 2] = d[i + 2] / 255;
    }
    return out;
  }

  /** Normalize ImageData crop → model input vector. */
  function imageDataToRgbVector(imageData) {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const tmp = document.createElement("canvas");
    tmp.width = imageData.width;
    tmp.height = imageData.height;
    tmp.getContext("2d").putImageData(imageData, 0, 0);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(tmp, 0, 0, W, H);
    return canvasToRgbVector(c);
  }

  async function loadTileImages() {
    /** @type {Map<string, HTMLImageElement>} */
    const map = new Map();
    await Promise.all(
      CLASSES.map(async (id) => {
        const url = style2Url(id);
        if (!url) return;
        try {
          map.set(id, await loadImage(url));
        } catch {
          /* optional */
        }
      })
    );
    return map;
  }

  /**
   * @param {{samplesPerClass?: number, epochs?: number, seed?: number, onProgress?: Function}} opts
   */
  async function train(opts = {}) {
    const tf = window.tf;
    if (!tf) throw new Error("TensorFlow.js not loaded");

    const samplesPerClass = opts.samplesPerClass ?? 40;
    const epochs = opts.epochs ?? 24;
    const rnd = mulberry32(opts.seed ?? 2026);
    const tiles = await loadTileImages();

    const xs = [];
    const ys = [];
    for (let ci = 0; ci < CLASSES.length; ci++) {
      const id = CLASSES[ci];
      const img = tiles.get(id);
      if (!img) continue;
      for (let s = 0; s < samplesPerClass; s++) {
        const intensity =
          s === 0 ? "mild" : s % 5 < 3 ? "medium" : "strong";
        // Include one near-clean sample
        let vec;
        if (s === 0) {
          const c = document.createElement("canvas");
          c.width = W;
          c.height = H;
          const ctx = c.getContext("2d");
          ctx.fillStyle = "#f2efe6";
          ctx.fillRect(0, 0, W, H);
          ctx.drawImage(img, 2, 2, W - 4, H - 4);
          vec = canvasToRgbVector(c);
        } else {
          vec = synthesizeDetectorCrop(img, rnd, intensity);
        }
        xs.push(vec);
        const label = new Float32Array(CLASSES.length);
        label[ci] = 1;
        ys.push(label);
      }
      opts.onProgress?.({
        phase: "synth",
        classId: id,
        done: ci + 1,
        total: CLASSES.length,
      });
    }

    const n = xs.length;
    const xData = new Float32Array(n * H * W * 3);
    const yData = new Float32Array(n * CLASSES.length);
    for (let i = 0; i < n; i++) {
      xData.set(xs[i], i * H * W * 3);
      yData.set(ys[i], i * CLASSES.length);
    }

    const xTensor = tf.tensor4d(xData, [n, H, W, 3]);
    const yTensor = tf.tensor2d(yData, [n, CLASSES.length]);

    clearModel();
    const m = createModel(tf);
    await m.fit(xTensor, yTensor, {
      epochs,
      batchSize: 32,
      shuffle: true,
      validationSplit: 0.12,
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
      console.warn("[tile-model] no pretrained model", e.message || e);
      return null;
    }
  }

  async function ensureModel() {
    if (model) return model;
    if (modelPromise) return modelPromise;
    modelPromise = (async () => {
      const loaded = await loadPretrained();
      return loaded;
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

  /**
   * @param {ImageData|Float32Array} crop
   */
  async function predict(crop) {
    const tf = window.tf;
    if (!tf || !model) return null;
    const vec =
      crop instanceof Float32Array ? crop : imageDataToRgbVector(crop);
    return tf.tidy(() => {
      const t = tf.tensor4d(vec, [1, H, W, 3]);
      const p = /** @type {any} */ (model.predict(t));
      const data = p.dataSync();
      let best = 0;
      for (let i = 1; i < CLASSES.length; i++) {
        if (data[i] > data[best]) best = i;
      }
      let second = best === 0 ? 1 : 0;
      for (let i = 0; i < CLASSES.length; i++) {
        if (i !== best && data[i] > data[second]) second = i;
      }
      const top = [...data]
        .map((score, i) => ({ id: CLASSES[i], score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      return {
        id: CLASSES[best],
        confidence: Math.round(data[best] * 100),
        margin: data[best] - data[second],
        top,
        method: "tile-cnn",
      };
    });
  }

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

  /**
   * Augment a real detector crop (ImageData) into model RGB vector.
   * @param {ImageData} src
   * @param {() => number} rnd
   * @param {"identity"|"mild"|"medium"|"strong"} intensity
   */
  function augmentRealCrop(src, rnd, intensity = "mild") {
    if (intensity === "identity") return imageDataToRgbVector(src);

    const scale =
      intensity === "mild" ? 0.4 : intensity === "strong" ? 1 : 0.7;
    const c = document.createElement("canvas");
    c.width = src.width;
    c.height = src.height;
    c.getContext("2d").putImageData(src, 0, 0);

    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d", { willReadFrequently: true });
    // Dark margin like a loose detector crop
    const bg = 35 + rnd() * 40;
    ctx.fillStyle = `rgb(${bg | 0},${bg | 0},${(bg + 4) | 0})`;
    ctx.fillRect(0, 0, W, H);

    const ang = (((rnd() - 0.5) * 14 * scale) * Math.PI) / 180;
    const sx = 0.9 + rnd() * 0.2 * scale;
    const sy = 0.9 + rnd() * 0.2 * scale;
    const skewX = (rnd() - 0.5) * 0.12 * scale;
    const tx = (rnd() - 0.5) * 6 * scale;
    const ty = (rnd() - 0.5) * 6 * scale;

    ctx.save();
    ctx.translate(W / 2 + tx, H / 2 + ty);
    ctx.rotate(ang);
    ctx.transform(sx, 0, skewX, sy, 0, 0);
    const drawW = W * (0.88 + rnd() * 0.1);
    const drawH = H * (0.88 + rnd() * 0.1);
    ctx.drawImage(c, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const img = ctx.getImageData(0, 0, W, H);
    const bright = (rnd() - 0.5) * 36 * scale;
    for (let i = 0; i < img.data.length; i += 4) {
      for (let ch = 0; ch < 3; ch++) {
        img.data[i + ch] = Math.max(
          0,
          Math.min(255, img.data[i + ch] + bright + (rnd() - 0.5) * 12 * scale)
        );
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvasToRgbVector(out);
  }

  /**
   * Fine-tune pretrained model on labeled real crops.
   * @param {{id: string, imageData: ImageData}[]} labeled
   * @param {{augmentsPerCrop?: number, epochs?: number, seed?: number, includeSynthetic?: number, onProgress?: Function}} opts
   */
  async function finetuneFromLabeled(labeled, opts = {}) {
    const tf = window.tf;
    if (!tf) throw new Error("TensorFlow.js not loaded");
    await ensureModel();
    if (!model) throw new Error("No base model to fine-tune");

    const augmentsPerCrop = opts.augmentsPerCrop ?? 24;
    const epochs = opts.epochs ?? 30;
    const rnd = mulberry32(opts.seed ?? 4242);
    const classIndex = new Map(CLASSES.map((id, i) => [id, i]));

    const xs = [];
    const ys = [];

    for (const item of labeled) {
      const ci = classIndex.get(item.id);
      if (ci == null || !item.imageData) continue;
      const intensities = ["identity", "mild", "mild", "medium", "medium", "strong"];
      for (let a = 0; a < augmentsPerCrop; a++) {
        const intensity = intensities[a % intensities.length];
        xs.push(augmentRealCrop(item.imageData, rnd, intensity));
        const label = new Float32Array(CLASSES.length);
        label[ci] = 1;
        ys.push(label);
      }
    }

    // Optional light synthetic mix so we don't totally forget other tiles
    const synthPerClass = opts.includeSynthetic ?? 4;
    if (synthPerClass > 0) {
      const tiles = await loadTileImages();
      for (let ci = 0; ci < CLASSES.length; ci++) {
        const img = tiles.get(CLASSES[ci]);
        if (!img) continue;
        for (let s = 0; s < synthPerClass; s++) {
          xs.push(
            synthesizeDetectorCrop(
              img,
              rnd,
              s === 0 ? "mild" : "medium"
            )
          );
          const label = new Float32Array(CLASSES.length);
          label[ci] = 1;
          ys.push(label);
        }
      }
    }

    const n = xs.length;
    const xData = new Float32Array(n * H * W * 3);
    const yData = new Float32Array(n * CLASSES.length);
    for (let i = 0; i < n; i++) {
      xData.set(xs[i], i * H * W * 3);
      yData.set(ys[i], i * CLASSES.length);
    }
    const xTensor = tf.tensor4d(xData, [n, H, W, 3]);
    const yTensor = tf.tensor2d(yData, [n, CLASSES.length]);

    model.compile({
      optimizer: tf.train.adam(0.0004),
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    await model.fit(xTensor, yTensor, {
      epochs,
      batchSize: 16,
      shuffle: true,
      validationSplit: 0.1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          opts.onProgress?.({
            phase: "finetune",
            epoch: epoch + 1,
            epochs,
            loss: logs.loss,
            acc: logs.acc,
            val_acc: logs.val_acc,
            samples: n,
          });
        },
      },
    });

    xTensor.dispose();
    yTensor.dispose();
    return model;
  }

  /** Sanity: classify clean style-2 renders. */
  async function evaluateCleanAssets() {
    const tiles = await loadTileImages();
    let ok = 0;
    let n = 0;
    const bad = [];
    for (const id of CLASSES) {
      const img = tiles.get(id);
      if (!img) continue;
      n++;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#f2efe6";
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 2, 2, W - 4, H - 4);
      const pred = await predict(canvasToRgbVector(c));
      if (pred?.id === id) ok++;
      else bad.push(`${id}->${pred?.id || "?"}`);
    }
    return { ok, n, bad };
  }

  window.TileScanTileModel = {
    W,
    H,
    CLASSES,
    MODEL_URL,
    mulberry32,
    synthesizeDetectorCrop,
    imageDataToRgbVector,
    canvasToRgbVector,
    train,
    finetuneFromLabeled,
    augmentRealCrop,
    ensureModel,
    loadPretrained,
    predict,
    clearModel,
    exportArtifacts,
    evaluateCleanAssets,
    getModel: () => model,
    loadTileImages,
  };
})();
