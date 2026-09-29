import sharp from 'sharp';

async function detectRows() {
  const image = sharp('public/assets/trains/11716.jpg');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Compute row non-white pixel count
  const rowNonWhite = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // White background threshold
      if (r < 245 || g < 245 || b < 245) {
        rowNonWhite[y]++;
      }
    }
  }

  // Find intervals where rowNonWhite > 50
  const rows = [];
  let inRow = false;
  let startY = 0;

  for (let y = 0; y < height; y++) {
    if (rowNonWhite[y] > 50) {
      if (!inRow) {
        inRow = true;
        startY = y;
      }
    } else {
      if (inRow) {
        inRow = false;
        if (y - startY > 40) {
          rows.push({ top: startY, bottom: y, height: y - startY });
        }
      }
    }
  }

  console.log(`Detected ${rows.length} train rows:`);
  rows.forEach((r, idx) => console.log(`Row ${idx + 1}: top=${r.top}, bottom=${r.bottom}, height=${r.height}`));
}

detectRows();
