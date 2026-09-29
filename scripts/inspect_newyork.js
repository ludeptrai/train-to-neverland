import sharp from 'sharp';

async function inspectImages() {
  const bg = sharp('public/assets/landscapes/newyork/a9c67827-09c2-405d-91e1-bf61460b906c-0.jpg');
  const mg = sharp('public/assets/landscapes/newyork/ed09bcaa-4641-4f1d-8453-4d60e709ccf1-0.jpg');

  const { data: dBg, info: iBg } = await bg.raw().toBuffer({ resolveWithObject: true });
  const { data: dMg, info: iMg } = await mg.raw().toBuffer({ resolveWithObject: true });

  console.log(`BG size: ${iBg.width}x${iBg.height}`);
  console.log(`MG size: ${iMg.width}x${iMg.height}`);

  // Find vertical bounds of content in BG
  let topBg = iBg.height, bottomBg = 0;
  for (let y = 0; y < iBg.height; y++) {
    for (let x = 0; x < iBg.width; x++) {
      const idx = (y * iBg.width + x) * 3;
      if (dBg[idx] < 240 || dBg[idx + 1] < 240 || dBg[idx + 2] < 240) {
        if (y < topBg) topBg = y;
        if (y > bottomBg) bottomBg = y;
      }
    }
  }

  // Find vertical bounds of content in MG
  let topMg = iMg.height, bottomMg = 0;
  for (let y = 0; y < iMg.height; y++) {
    for (let x = 0; x < iMg.width; x++) {
      const idx = (y * iMg.width + x) * 3;
      if (dMg[idx] < 240 || dMg[idx + 1] < 240 || dMg[idx + 2] < 240) {
        if (y < topMg) topMg = y;
        if (y > bottomMg) bottomMg = y;
      }
    }
  }

  console.log(`BG content vertical bounds: top=${topBg}, bottom=${bottomBg} (height=${bottomBg - topBg})`);
  console.log(`MG content vertical bounds: top=${topMg}, bottom=${bottomMg} (height=${bottomMg - topMg})`);

  // Check top-left pixel color of both
  console.log(`BG (0,0) color: rgb(${dBg[0]}, ${dBg[1]}, ${dBg[2]})`);
  console.log(`MG (0,0) color: rgb(${dMg[0]}, ${dMg[1]}, ${dMg[2]})`);
}

inspectImages().catch(console.error);
