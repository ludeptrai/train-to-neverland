import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = path.resolve('public/assets/sky/clouds');
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().startsWith('2d side view'));

async function testAll() {
  for (let i = 0; i < files.length; i++) {
    const buf = fs.readFileSync(path.join(dir, files[i]));
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    const { width: w, channels: ch } = info;
    let maxR = 0, maxG = 0, maxB = 0;
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * ch;
        maxR = Math.max(maxR, data[idx]);
        maxG = Math.max(maxG, data[idx + 1]);
        maxB = Math.max(maxB, data[idx + 2]);
      }
    }
    console.log(`[Cloud ${i + 1}] top 30 rows max RGB: (${maxR}, ${maxG}, ${maxB})`);
  }
}

testAll().catch(console.error);
