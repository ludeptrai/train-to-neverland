import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = path.resolve('public/assets/sky/clouds');
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().startsWith('2d side view'));

console.log('Found', files.length, 'cloud files:');

async function run() {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const p = path.join(dir, f);
    // Use long path prefix or buffer
    const buf = fs.readFileSync(p);
    const meta = await sharp(buf).metadata();
    const { data } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
    console.log(`[${i + 1}] size: ${meta.width}x${meta.height}, format: ${meta.format}, top-left RGB: (${data[0]},${data[1]},${data[2]})`);
  }
}

run().catch(console.error);
