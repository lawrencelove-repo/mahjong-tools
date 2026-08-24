/**
 * Train full-tile lemon classifier and write assets/models/lemon-tile/.
 *
 * Usage: node scripts/train-lemon-tile-model.cjs
 */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets", "models", "lemon-tile");

const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".json": "application/json",
  ".bin": "application/octet-stream",
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

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" || t.includes("epoch") || t.includes("synth")) {
      console.log(t);
    }
  });

  await page.goto(`http://127.0.0.1:${port}/tile-scan.html`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await page.waitForFunction(
    () => window.tf && window.TileScanTileModel && window.Tiles,
    null,
    { timeout: 60000 }
  );

  console.log("Training full-tile CNN (synthetic detector crops)…");
  const meta = await page.evaluate(async () => {
    await window.TileScanTileModel.train({
      samplesPerClass: 48,
      epochs: 26,
      seed: 2026,
      onProgress: (p) => {
        if (p.phase === "synth" && p.done % 9 === 0) {
          console.log(`synth ${p.done}/${p.total}`);
        }
        if (p.phase === "train" && (p.epoch % 4 === 0 || p.epoch === p.epochs)) {
          console.log(
            `epoch ${p.epoch}/${p.epochs} acc=${(p.acc || 0).toFixed(3)} val=${(p.val_acc || 0).toFixed(3)}`
          );
        }
      },
    });
    const clean = await window.TileScanTileModel.evaluateCleanAssets();
    const art = await window.TileScanTileModel.exportArtifacts();
    const bytes = new Uint8Array(art.weightData);
    let s = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return {
      cleanAcc: `${clean.ok}/${clean.n}`,
      bad: clean.bad,
      modelTopology: art.modelTopology,
      weightSpecs: art.weightSpecs,
      weightDataBase64: btoa(s),
      format: art.format,
      generatedBy: art.generatedBy,
      convertedBy: art.convertedBy,
    };
  });

  console.log("Clean asset accuracy:", meta.cleanAcc);
  if (meta.bad?.length) console.log("Misses:", meta.bad.join(", "));

  const weightData = Buffer.from(meta.weightDataBase64, "base64");
  const modelJson = {
    modelTopology: meta.modelTopology,
    format: meta.format || "layers-model",
    generatedBy: meta.generatedBy || "train-lemon-tile-model.cjs",
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
  fs.writeFileSync(
    path.join(outDir, "README.md"),
    `# Lemon full-tile classifier (TF.js)

27-class CNN (1P–9P, 1B–9B, 1C–9C) trained on synthetic table crops.

## Retrain

\`\`\`bash
npm install --no-save playwright@1.62.1
npx playwright install chromium
node scripts/train-lemon-tile-model.cjs
\`\`\`
`
  );
  console.log(
    "Wrote",
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
