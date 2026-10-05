import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = path.resolve('public/assets/sky/clouds');
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().startsWith('2d side view'));

async function inspect() {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const p = path.join(dir, f);
    const buf = fs.readFileSync(p);
    const img = sharp(buf);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = info;

    let minX = w, maxX = 0, minY = h, maxY = 0, count = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * ch;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (r > 30 || g > 30 || b > 30) {
          count++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    console.log(`[Cloud ${i + 1}] bbox: (${minX},${minY}) -> (${maxX},${maxY}), size: ${maxX - minX + 1}x${maxY - minY + 1}, spritePixels: ${count}`);
  }
}

inspect().catch(console.error);
