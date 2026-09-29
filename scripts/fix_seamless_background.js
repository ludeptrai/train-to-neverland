import sharp from 'sharp';
import path from 'path';

async function fixSeamlessBackground() {
  const bgPath = 'public/assets/landscapes/tokyo_fuji/background.png';
  const lightsPath = 'public/assets/landscapes/tokyo_fuji/background_lights.svg';
  const outDir = 'public/assets/landscapes/tokyo_fuji';

  // 1. Resize background to exact 1920x600 px with object-fit cover
  const targetW = 1920;
  const targetH = 600;

  console.log('Fixing Tokyo Fuji background to exact 1920x600 with seamless edge blending...');

  const resizedBg = await sharp(bgPath)
    .resize(targetW, targetH, { fit: 'cover', position: 'bottom' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resizedBg;
  const { width, height, channels } = info;

  // Soft fade outer 80 pixels on left & right to ensure smooth seamless wrapping
  const fadeWidth = 80;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      let alphaMultiplier = 1.0;

      if (x < fadeWidth) {
        alphaMultiplier = x / fadeWidth;
      } else if (x > width - fadeWidth) {
        alphaMultiplier = (width - x) / fadeWidth;
      }

      if (channels === 4) {
        data[idx + 3] = Math.round(data[idx + 3] * alphaMultiplier);
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(path.join(outDir, 'background_seamless.png'));

  console.log('✅ Created background_seamless.png!');
}

fixSeamlessBackground().catch(console.error);
