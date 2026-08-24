# Lemon full-tile classifier (TF.js)

27-class CNN (1P–9P, 1B–9B, 1C–9C) trained on synthetic table crops.

## Retrain

```bash
npm install --no-save playwright@1.62.1
npx playwright install chromium
node scripts/train-lemon-tile-model.cjs
```
