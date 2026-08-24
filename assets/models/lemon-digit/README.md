# Lemon digit classifier (TF.js)

Tiny CNN for Maison Lude / style-2 corner numerals (1–9).

## Files
- `model.json` + `weights.bin` — pretrained layers model for `tf.loadLayersModel`

## Retrain
From repo root (needs Playwright + Chromium once):

```bash
npm install --no-save playwright@1.62.1
npx playwright install chromium
node scripts/train-lemon-digit-model.cjs
```

Training uses synthetic warps of style-2 faces run through the same ink extractor as photos.
