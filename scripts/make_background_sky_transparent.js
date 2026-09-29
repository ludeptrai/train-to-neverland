import sharp from 'sharp';

async function extractTransparentBackground() {
  const inputPath = 'public/assets/landscapes/tokyo_fuji/background.png';
  const outputPath = 'public/assets/landscapes/tokyo_fuji/background.png'; // overwrite with transparent PNG!

  const img = sharp(inputPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Multi-source BFS flood fill from the entire top row y = 0
  const isSky = new Uint8Array(width * height);
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed with top row pixels
  for (let x = 0; x < width; x++) {
    queue.push(x);
    visited[x] = 1;
    isSky[x] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const x = curr % width;
    const y = Math.floor(curr / width);

    const idx = curr * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    const neighbors = [
      curr - 1, curr + 1, curr - width, curr + width
    ];

    for (const n of neighbors) {
      if (n < 0 || n >= width * height || visited[n]) continue;
      const nx = n % width;
      const ny = Math.floor(n / width);
      if (Math.abs(nx - x) > 1) continue;

      const nIdx = n * channels;
      const nr = data[nIdx];
      const ng = data[nIdx + 1];
      const nb = data[nIdx + 2];

      // Difference with current pixel
      const diff = Math.abs(nr - r) + Math.abs(ng - g) + Math.abs(nb - b);

      // Sky stops when hitting:
      // 1. Skytree tower (around x: 230-265, dark grey/blue)
      const isSkytree = (nx >= 230 && nx <= 265 && ny >= 120 && (nr < 190 || ng < 180));
      // 2. Fuji mountain peak and slope
      // The mountain slope has distinct purplish-brown rock (r ~ 160-190, g ~ 100-140, b ~ 130-160)
      const isFujiSlope = (ny >= 240 && nx >= 680 && nx <= 1220 && (ng < 145 || nr - ng > 45));
      // 3. Tokyo skyline rooflines (buildings have dark edges or sharp horizontal roofs)
      const isBuilding = (ny >= 400);

      if (!isSkytree && !isFujiSlope && !isBuilding && diff < 42 && ny < 480) {
        visited[n] = 1;
        isSky[n] = 1;
        queue.push(n);
      }
    }
  }

  // Build RGBA output buffer
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const destIdx = i * 4;

    rgba[destIdx] = data[srcIdx];
    rgba[destIdx + 1] = data[srcIdx + 1];
    rgba[destIdx + 2] = data[srcIdx + 2];

    // If sky, make transparent!
    if (isSky[i] === 1) {
      rgba[destIdx + 3] = 0; // Transparent
    } else {
      rgba[destIdx + 3] = 255;
    }
  }

  // Save as high-quality transparent PNG
  await sharp(rgba, {
    raw: { width, height, channels: 4 }
  })
    .png()
    .toFile(outputPath);

  console.log(`✅ Saved transparent background to ${outputPath}`);
}

extractTransparentBackground().catch(console.error);
