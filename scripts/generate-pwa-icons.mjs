import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const SOURCE_LOGO = path.resolve(
  'public/assets/aistudio/Gemini_Generated_Image_wjhm64wjhm64wjhm__1__f0410cd8.png',
);
const BRAND_LOGO = path.resolve('public/assets/brand/logo-39-bharat-nagar.png');

if (!fs.existsSync(SOURCE_LOGO)) {
  console.error(`Source logo missing at ${SOURCE_LOGO}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(BRAND_LOGO), { recursive: true });
fs.copyFileSync(SOURCE_LOGO, BRAND_LOGO);

const srcPng = PNG.sync.read(fs.readFileSync(SOURCE_LOGO));

// Trim transparent margins first so the crest scales with exact known safe-zone padding
let minX = srcPng.width;
let minY = srcPng.height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < srcPng.height; y++) {
  for (let x = 0; x < srcPng.width; x++) {
    const a = srcPng.data[(y * srcPng.width + x) * 4 + 3];
    if (a > 12) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

const cropW = Math.max(1, maxX - minX + 1);
const cropH = Math.max(1, maxY - minY + 1);

/**
 * Generates an icon PNG from the official 39 Bharat Nagar logo using area-averaged
 * downsampling (preserves crisp dark outlines while preventing pixel shimmer).
 */
function renderIcon({ size, paddingRatio, bgRgba, outPath }) {
  const dst = new PNG({ width: size, height: size });

  // Fill background (rich dark mahogany/indigo brand palette or transparent)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      if (bgRgba) {
        // Subtle radial warmth behind crest on opaque icons
        const dx = (x - size * 0.5) / (size * 0.5);
        const dy = (y - size * 0.48) / (size * 0.5);
        const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy));
        const boost = Math.round((1 - dist) * 18);
        dst.data[idx] = Math.min(255, bgRgba[0] + boost);
        dst.data[idx + 1] = Math.min(255, bgRgba[1] + Math.round(boost * 0.65));
        dst.data[idx + 2] = Math.min(255, bgRgba[2] + Math.round(boost * 0.45));
        dst.data[idx + 3] = bgRgba[3];
      } else {
        dst.data[idx] = 0;
        dst.data[idx + 1] = 0;
        dst.data[idx + 2] = 0;
        dst.data[idx + 3] = 0;
      }
    }
  }

  const innerSize = size * (1 - paddingRatio * 2);
  const scale = Math.min(innerSize / cropW, innerSize / cropH);
  const drawW = Math.round(cropW * scale);
  const drawH = Math.round(cropH * scale);
  const offsetX = Math.floor((size - drawW) / 2);
  const offsetY = Math.floor((size - drawH) / 2);

  for (let dy = 0; dy < drawH; dy++) {
    const sy0 = minY + Math.floor((dy / drawH) * cropH);
    const sy1 = Math.min(maxY, minY + Math.max(sy0 - minY, Math.floor(((dy + 1) / drawH) * cropH) - 1));
    for (let dx = 0; dx < drawW; dx++) {
      const sx0 = minX + Math.floor((dx / drawW) * cropW);
      const sx1 = Math.min(maxX, minX + Math.max(sx0 - minX, Math.floor(((dx + 1) / drawW) * cropW) - 1));

      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let aSum = 0;
      let count = 0;

      for (let sy = sy0; sy <= sy1; sy++) {
        for (let sx = sx0; sx <= sx1; sx++) {
          const sIdx = (sy * srcPng.width + sx) * 4;
          const a = srcPng.data[sIdx + 3] / 255;
          rSum += srcPng.data[sIdx] * a;
          gSum += srcPng.data[sIdx + 1] * a;
          bSum += srcPng.data[sIdx + 2] * a;
          aSum += a;
          count++;
        }
      }

      const avgA = count > 0 ? aSum / count : 0;
      if (avgA <= 0.005) continue;

      const sr = rSum / aSum;
      const sg = gSum / aSum;
      const sb = bSum / aSum;

      const tx = offsetX + dx;
      const ty = offsetY + dy;
      if (tx < 0 || ty < 0 || tx >= size || ty >= size) continue;

      const dIdx = (ty * size + tx) * 4;
      const bgA = dst.data[dIdx + 3] / 255;
      const outA = avgA + bgA * (1 - avgA);

      if (outA > 0) {
        dst.data[dIdx] = Math.round((sr * avgA + dst.data[dIdx] * bgA * (1 - avgA)) / outA);
        dst.data[dIdx + 1] = Math.round((sg * avgA + dst.data[dIdx + 1] * bgA * (1 - avgA)) / outA);
        dst.data[dIdx + 2] = Math.round((sb * avgA + dst.data[dIdx + 2] * bgA * (1 - avgA)) / outA);
        dst.data[dIdx + 3] = Math.round(outA * 255);
      }
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, PNG.sync.write(dst));
  console.log(`Generated ${path.relative(process.cwd(), outPath)} (${size}x${size})`);
}

// Brand dark obsidian-mahogany backing matching the 39 Bharat Nagar logo shadow palette
const BRAND_BG = [16, 11, 18, 255];

renderIcon({
  size: 192,
  paddingRatio: 0.07,
  bgRgba: BRAND_BG,
  outPath: path.resolve('public/pwa-192x192.png'),
});

renderIcon({
  size: 512,
  paddingRatio: 0.07,
  bgRgba: BRAND_BG,
  outPath: path.resolve('public/pwa-512x512.png'),
});

// Maskable icon with 15% safe-zone padding so circular/squircle OS masks never clip the roof or title
renderIcon({
  size: 512,
  paddingRatio: 0.15,
  bgRgba: BRAND_BG,
  outPath: path.resolve('public/pwa-maskable-512x512.png'),
});

// iOS Apple Touch Icon (180x180 opaque PNG)
renderIcon({
  size: 180,
  paddingRatio: 0.09,
  bgRgba: BRAND_BG,
  outPath: path.resolve('public/apple-touch-icon.png'),
});

// Optional 1024x1024 master icon
renderIcon({
  size: 1024,
  paddingRatio: 0.08,
  bgRgba: BRAND_BG,
  outPath: path.resolve('public/pwa-1024x1024.png'),
});
