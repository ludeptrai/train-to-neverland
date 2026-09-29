import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Generate 3-car versions for the 5 long trains:
// train_red_shinkansen (1767px -> 3 cars)
// train_orange_bullet (1722px -> 3 cars)
// train_blue_metro (1557px -> 3 cars)
// train_yellow_metro (1524px -> 3 cars)
// train_red_white_commuter (1515px -> 3 cars)

async function make3Car(trainId, c1Width, c2Width, c3Start) {
  const baseDir = path.join(process.cwd(), 'public', 'assets', 'trains', 'templates', trainId);
  const bodyPath = path.join(baseDir, 'train_body.png');
  const lightsPath = path.join(baseDir, 'train_lights.png');

  if (!fs.existsSync(bodyPath)) return;

  const meta = await sharp(bodyPath).metadata();
  const height = meta.height;
  const c3Width = meta.width - c3Start;
  const totalWidth = c1Width + c2Width + c3Width;

  console.log(`Processing ${trainId}: ${meta.width} -> ${totalWidth}`);

  // Body
  const car1 = await sharp(bodyPath).extract({ left: 0, top: 0, width: c1Width, height }).toBuffer();
  const car2 = await sharp(bodyPath).extract({ left: c1Width, top: 0, width: c2Width, height }).toBuffer();
  const car3 = await sharp(bodyPath).extract({ left: c3Start, top: 0, width: c3Width, height }).toBuffer();

  await sharp({
    create: {
      width: totalWidth,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: car1, left: 0, top: 0 },
    { input: car2, left: c1Width, top: 0 },
    { input: car3, left: c1Width + c2Width, top: 0 }
  ])
  .png()
  .toFile(path.join(baseDir, 'train_body_3car.png'));

  // Lights if exists
  if (fs.existsSync(lightsPath)) {
    const lcar1 = await sharp(lightsPath).extract({ left: 0, top: 0, width: c1Width, height }).toBuffer();
    const lcar2 = await sharp(lightsPath).extract({ left: c1Width, top: 0, width: c2Width, height }).toBuffer();
    const lcar3 = await sharp(lightsPath).extract({ left: c3Start, top: 0, width: c3Width, height }).toBuffer();

    await sharp({
      create: {
        width: totalWidth,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      { input: lcar1, left: 0, top: 0 },
      { input: lcar2, left: c1Width, top: 0 },
      { input: lcar3, left: c1Width + c2Width, top: 0 }
    ])
    .png()
    .toFile(path.join(baseDir, 'train_lights_3car.png'));
  }

  console.log(`Finished ${trainId}`);
}

async function run() {
  await make3Car('train_red_shinkansen', 480, 405, 1285);
  await make3Car('train_orange_bullet', 470, 390, 1250);
  await make3Car('train_blue_metro', 420, 360, 1140);
  await make3Car('train_yellow_metro', 410, 350, 1110);
  await make3Car('train_red_white_commuter', 410, 350, 1100);
}

run();
