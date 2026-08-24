/**
 * Label sample-photo detector crops with SAMPLE_EXPECTED, fine-tune the
 * lemon-tile CNN, and rewrite assets/models/lemon-tile/.
 *
 * Usage: node scripts/finetune-lemon-tile-from-sample.cjs
 */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets", "models", "lemon-tile");
const cropDir = path.join(root, "assets", "fixtures", "labeled-crops");

const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".json": "application/json",
  ".bin": "application/octet-stream",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split("?")[0]);
      const file = path.join(root, p.replace(/^\//, ""));
      if (
        !file.startsWith(root) ||
        !fs.existsSync(file) ||
        fs.statSync(file).isDirectory()
      ) {
        res.writeHead(404);
        res.end("no");
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, () => resolve(server));
  });
}

function dataUrlToBuffer(dataUrl) {
  const m = /^data:image\/\w+;base64,(.+)$/.exec(dataUrl);
  if (!m) throw new Error("bad data url");
  return Buffer.from(m[1], "base64");
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(cropDir, { recursive: true });

  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" || t.includes("finetune") || t.includes("epoch")) {
      console.log(t);
    }
  });

  await page.goto(`http://127.0.0.1:${port}/tile-scan.html`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForFunction(
    () =>
      window.tf &&
      window.TileScanCv &&
      window.TileScanTileModel &&
      window.Tiles,
    null,
    { timeout: 60000 }
  );

  console.log("Extracting labeled crops from sample photo…");
  const extracted = await page.evaluate(async () => {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = TileScanCv.SAMPLE_URL;
    });
    const crops = await TileScanCv.extractCrops(img, { expectedCount: 14 });
    const expected = TileScanCv.SAMPLE_EXPECTED;
    return {
      count: crops.length,
      expected,
      items: crops.map((c, i) => ({
        index: i,
        label: expected[i] || "?",
        pngDataUrl: c.pngDataUrl,
        thumbDataUrl: c.thumbDataUrl,
        width: c.width,
        height: c.height,
        // pixel buffer for fine-tune (RGBA)
        rgba: Array.from(c.imageData.data),
      })),
    };
  });

  console.log(`Got ${extracted.count} crops (expected 14).`);
  const manifest = [];
  for (const item of extracted.items) {
    const name = `${String(item.index).padStart(2, "0")}_${item.label}.png`;
    fs.writeFileSync(path.join(cropDir, name), dataUrlToBuffer(item.pngDataUrl));
    manifest.push({ file: name, id: item.label, index: item.index });
  }
  fs.writeFileSync(
    path.join(cropDir, "manifest.json"),
    JSON.stringify({ source: "maison-lude-hand-sample.png", crops: manifest }, null, 2)
  );
  console.log("Wrote labeled crops to", cropDir);

  console.log("Fine-tuning tile CNN on real crops…");
  const meta = await page.evaluate(async (payload) => {
    await TileScanTileModel.ensureModel();
    const labeled = payload.items.map((item) => {
      const imageData = new ImageData(
        new Uint8ClampedArray(item.rgba),
        item.width,
        item.height
      );
      return { id: item.label, imageData };
    });

    await TileScanTileModel.finetuneFromLabeled(labeled, {
      augmentsPerCrop: 16,
      epochs: 20,
      seed: 2026,
      includeSynthetic: 2,
      onProgress: (p) => {
        if (p.phase === "finetune") {
          console.log(
            `finetune ${p.epoch}/${p.epochs} acc=${(p.acc || 0).toFixed(3)} val=${(p.val_acc || 0).toFixed(3)} n=${p.samples}`
          );
        }
      },
    });

    // Score sample hand end-to-end
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = TileScanCv.SAMPLE_URL;
    });
    const r = await TileScanCv.analyzePhoto(img, {
      expectedCount: 14,
      useTileCnn: true,
    });
    const got = r.tiles.map((t) => t.id);
    const expected = TileScanCv.SAMPLE_EXPECTED;
    let ok = 0;
    let suitOk = 0;
    for (let i = 0; i < Math.min(got.length, expected.length); i++) {
      if (got[i] === expected[i]) ok++;
      if (got[i].length === 2 && got[i][1] === expected[i][1]) suitOk++;
    }

    const art = await TileScanTileModel.exportArtifacts();
    const bytes = new Uint8Array(art.weightData);
    let s = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }

    return {
      ok,
      suitOk,
      got: got.join(" "),
      expected: expected.join(" "),
      detail: r.tiles.map((t, i) => ({
        exp: expected[i],
        id: t.id,
        conf: t.tileCnn?.confidence,
      })),
      modelTopology: art.modelTopology,
      weightSpecs: art.weightSpecs,
      weightDataBase64: btoa(s),
      format: art.format,
      generatedBy: art.generatedBy,
      convertedBy: art.convertedBy,
    };
  }, extracted);

  console.log(`Sample score: ${meta.ok}/14 exact, ${meta.suitOk}/14 suit`);
  console.log("Got:     ", meta.got);
  console.log("Expected:", meta.expected);
  console.log(JSON.stringify(meta.detail, null, 2));

  const weightData = Buffer.from(meta.weightDataBase64, "base64");
  const modelJson = {
    modelTopology: meta.modelTopology,
    format: meta.format || "layers-model",
    generatedBy: meta.generatedBy || "finetune-lemon-tile-from-sample.cjs",
    convertedBy: meta.convertedBy || null,
    weightsManifest: [
      {
        paths: ["./weights.bin"],
        weights: meta.weightSpecs,
      },
    ],
  };
  fs.writeFileSync(path.join(outDir, "model.json"), JSON.stringify(modelJson));
  fs.writeFileSync(path.join(outDir, "weights.bin"), weightData);
  console.log(
    "Updated",
    path.join(outDir, "model.json"),
    `and weights.bin (${weightData.length} bytes)`
  );

  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
