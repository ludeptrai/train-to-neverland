import sharp from 'sharp';

async function testSkyline() {
  const img = sharp('public/assets/landscapes/tokyo_fuji/background.png');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Check top-left corner color at (10, 10)
  const r0 = data[0], g0 = data[1], b0 = data[2];
  console.log(`Top-left sky color: rgb(${r0}, ${g0}, ${b0})`);

  // Flood fill / BFS from (0, 0) to find all sky pixels that connect to top
  // In sky, colors are smooth gradients of pink/peach/purple (r > 160, g > 110, b > 120)
  // Buildings and mountain slopes have distinctly darker or contrasty colors
  const isSky = new Uint8Array(width * height);
  const queue = [0]; // index of (0,0)
  isSky[0] = 1;

  // We can also check color distance or top-down scan
  let skyPixelCount = 0;
  // Let's do a top-down flood fill with neighbor similarity
  const visited = new Uint8Array(width * height);
  visited[0] = 1;

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    skyPixelCount++;
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
      // boundary check
      if (Math.abs(nx - x) > 1) continue;

      const nIdx = n * channels;
      const nr = data[nIdx];
      const ng = data[nIdx + 1];
      const nb = data[nIdx + 2];

      // Sky condition: sky pixels are pastel (relatively high brightness, warm/violet hue)
      // Mountains snow is very white (nr>230, ng>230, nb>230), but mountain ridge has dark contrast
      // Skytree is grey/blue
      const diff = Math.abs(nr - r) + Math.abs(ng - g) + Math.abs(nb - b);

      // Stop if hitting dark mountain slope, trees, or skytree steel
      const isDarkEdge = (nr < 130 && ng < 110 && nb < 110);
      const isSkytree = (ny > 80 && nx > 220 && nx < 280 && nr < 180);
      const isFujiPeak = (ny > 230 && nx > 700 && nx < 1200);

      if (!isDarkEdge && !isSkytree && diff < 38 && ny < 450) {
        visited[n] = 1;
        isSky[n] = 1;
        queue.push(n);
      }
    }
  }

  console.log(`Detected sky pixels: ${skyPixelCount} out of ${width * height}`);
}

testSkyline().catch(console.error);
