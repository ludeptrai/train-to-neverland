import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processNewYorkTheme() {
  const bgPath = 'public/assets/landscapes/newyork/a9c67827-09c2-405d-91e1-bf61460b906c-0.jpg';
  const mgPath = 'public/assets/landscapes/newyork/ed09bcaa-4641-4f1d-8453-4d60e709ccf1-0.jpg';
  const outDir = 'public/assets/landscapes/newyork';

  // --- 1. Process Background (Manhattan Skyline) ---
  console.log('Processing New York Background...');
  const bgImg = sharp(bgPath);
  const { data: dBg, info: iBg } = await bgImg.raw().toBuffer({ resolveWithObject: true });

  const bgTop = 175;
  const bgBottom = 655;
  const bgCropHeight = bgBottom - bgTop;
  const bgCropWidth = iBg.width;

  const bgRgba = Buffer.alloc(bgCropWidth * bgCropHeight * 4);
  const bgLightsRgba = Buffer.alloc(bgCropWidth * bgCropHeight * 4);

  for (let y = 0; y < bgCropHeight; y++) {
    const origY = bgTop + y;
    for (let x = 0; x < bgCropWidth; x++) {
      const srcIdx = (origY * bgCropWidth + x) * 3;
      const destIdx = (y * bgCropWidth + x) * 4;

      const r = dBg[srcIdx];
      const g = dBg[srcIdx + 1];
      const b = dBg[srcIdx + 2];

      // White background threshold
      const isWhite = r > 240 && g > 240 && b > 240;

      if (isWhite) {
        bgRgba[destIdx + 3] = 0; // Transparent
        bgLightsRgba[destIdx + 3] = 0;
      } else {
        // Color quantization to clean pixel blocks
        const pr = Math.round(r / 10) * 10;
        const pg = Math.round(g / 10) * 10;
        const pb = Math.round(b / 10) * 10;

        bgRgba[destIdx] = Math.min(255, pr);
        bgRgba[destIdx + 1] = Math.min(255, pg);
        bgRgba[destIdx + 2] = Math.min(255, pb);
        bgRgba[destIdx + 3] = 255;

        // Window detection for night lights: bright yellow, amber, or light cyan windows
        const isYellowWindow = (r > 210 && g > 190 && b < 160);
        const isCyanWindow = (b > 180 && g > 160 && r < 140);
        const isWhiteWindow = (r > 200 && g > 200 && b > 200 && r < 240);

        if (isYellowWindow || isCyanWindow || isWhiteWindow) {
          bgLightsRgba[destIdx] = 255;
          bgLightsRgba[destIdx + 1] = isYellowWindow ? 220 : isCyanWindow ? 240 : 255;
          bgLightsRgba[destIdx + 2] = isYellowWindow ? 100 : isCyanWindow ? 255 : 200;
          bgLightsRgba[destIdx + 3] = 255;
        } else {
          bgLightsRgba[destIdx + 3] = 0;
        }
      }
    }
  }

  // Scale background to 1920x520 px with Nearest Neighbor for crisp pixel art
  await sharp(bgRgba, { raw: { width: bgCropWidth, height: bgCropHeight, channels: 4 } })
    .resize(1920, 520, { kernel: 'nearest' })
    .png()
    .toFile(path.join(outDir, 'background.png'));

  await sharp(bgLightsRgba, { raw: { width: bgCropWidth, height: bgCropHeight, channels: 4 } })
    .resize(1920, 520, { kernel: 'nearest' })
    .png()
    .toFile(path.join(outDir, 'background_lights.png'));

  console.log('✅ Created New York background.png & background_lights.png (1920x520)');

  // --- 2. Process Midground (Tracks & Greenery) ---
  console.log('Processing New York Midground Track...');
  const mgImg = sharp(mgPath);
  const { data: dMg, info: iMg } = await mgImg.raw().toBuffer({ resolveWithObject: true });

  const mgTop = 350;
  const mgBottom = 735;
  const mgCropHeight = mgBottom - mgTop;
  const mgCropWidth = iMg.width;

  const mgRgba = Buffer.alloc(mgCropWidth * mgCropHeight * 4);

  for (let y = 0; y < mgCropHeight; y++) {
    const origY = mgTop + y;
    for (let x = 0; x < mgCropWidth; x++) {
      const srcIdx = (origY * mgCropWidth + x) * 3;
      const destIdx = (y * mgCropWidth + x) * 4;

      const r = dMg[srcIdx];
      const g = dMg[srcIdx + 1];
      const b = dMg[srcIdx + 2];

      const isWhite = r > 240 && g > 240 && b > 240;

      if (isWhite) {
        mgRgba[destIdx + 3] = 0; // Transparent
      } else {
        const pr = Math.round(r / 10) * 10;
        const pg = Math.round(g / 10) * 10;
        const pb = Math.round(b / 10) * 10;

        mgRgba[destIdx] = Math.min(255, pr);
        mgRgba[destIdx + 1] = Math.min(255, pg);
        mgRgba[destIdx + 2] = Math.min(255, pb);
        mgRgba[destIdx + 3] = 255;
      }
    }
  }

  // Scale midground to standard 1680x240 px (matching standard rail height)
  await sharp(mgRgba, { raw: { width: mgCropWidth, height: mgCropHeight, channels: 4 } })
    .resize(1680, 240, { kernel: 'nearest' })
    .png()
    .toFile(path.join(outDir, 'midground_track.png'));

  console.log('✅ Created New York midground_track.png (1680x240)');
}

processNewYorkTheme().catch(console.error);
