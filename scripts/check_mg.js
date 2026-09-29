import sharp from 'sharp';

async function checkMGDetails() {
  const mg = sharp('public/assets/landscapes/newyork/ed09bcaa-4641-4f1d-8453-4d60e709ccf1-0.jpg');
  const { data, info } = await mg.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Let's sample colors near bottom at y=720, 700, 680, 650
  for (const y of [600, 650, 680, 700, 720, 730]) {
    const idx = (y * width + Math.floor(width / 2)) * 3;
    console.log(`y=${y}: rgb(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }
}

checkMGDetails().catch(console.error);
