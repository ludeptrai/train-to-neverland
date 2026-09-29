import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TRAIN_METADATA = [
  {
    id: 'train_orange_bullet',
    name: 'Tàu Cao Tốc Cam Vàng',
    description: 'Đoàn tàu cao tốc thon dài với sọc đỏ năng động',
    wheelType: 'standard',
    hasPantograph: false,
    hasSmoke: false,
  },
  {
    id: 'train_blue_metro',
    name: 'Tàu Điện Ngầm Xanh Lam',
    description: 'Đoàn tàu đô thị hiện đại 6 toa màu xanh dương đậm',
    wheelType: 'standard',
    hasPantograph: false,
    hasSmoke: false,
  },
  {
    id: 'train_monorail',
    name: 'Tàu Monorail Treo',
    description: 'Hệ thống tàu cáp treo trên cao độc đáo phong cách tương lai',
    wheelType: 'standard',
    hasPantograph: false,
    hasSmoke: false,
  },
  {
    id: 'train_green_cargo',
    name: 'Tàu Hàng Chở Ô Tô & Toa Kín',
    description: 'Đoàn tàu vận tải công nghiệp với đầu máy diesel xanh lá',
    wheelType: 'standard',
    hasPantograph: false,
    hasSmoke: false,
  },
  {
    id: 'train_vintage_steam',
    name: 'Tàu Hơi Nước Than Đá Cổ Điển',
    description: 'Đoàn tàu hơi nước đầu thế kỷ với các toa chở than viền vàng',
    wheelType: 'spoke',
    hasPantograph: false,
    hasSmoke: true,
  },
  {
    id: 'train_oil_steam',
    name: 'Tàu Chở Dầu & Đầu Kéo Đen',
    description: 'Đoàn tàu bồn dầu màu vàng cam với đầu kéo hơi nước đen tuyền',
    wheelType: 'spoke',
    hasPantograph: false,
    hasSmoke: true,
  },
  {
    id: 'train_red_shinkansen',
    name: 'Tàu Shinkansen Đỏ Siêu Tốc',
    description: 'Tàu viên đạn màu đỏ rực khí động học đạt vận tốc 350 km/h',
    wheelType: 'standard',
    hasPantograph: false,
    hasSmoke: false,
  },
  {
    id: 'train_orange_tram',
    name: 'Tàu Điện Mặt Đất Cổ (Tramway)',
    description: 'Đoàn tàu điện phố cổ màu cam có cần tiếp điện trên nóc',
    wheelType: 'standard',
    hasPantograph: true,
    hasSmoke: false,
  },
  {
    id: 'train_yellow_metro',
    name: 'Tàu Điện Ngầm Vàng Đen (U-Bahn)',
    description: 'Đoàn tàu điện ngầm màu vàng rực kinh điển của Berlin',
    wheelType: 'standard',
    hasPantograph: false,
    hasSmoke: false,
  },
  {
    id: 'train_red_white_commuter',
    name: 'Tàu Ngoại Ô Trắng Đỏ Hai Tầng',
    description: 'Tàu chở khách liên tỉnh màu bạc sọc đỏ hiện đại',
    wheelType: 'standard',
    hasPantograph: false,
    hasSmoke: false,
  },
];

async function processAllTrains() {
  const imagePath = 'public/assets/trains/11716.jpg';
  const img = sharp(imagePath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // 1. Detect Y intervals
  const rowNonWhite = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      if (data[idx] < 245 || data[idx + 1] < 245 || data[idx + 2] < 245) {
        rowNonWhite[y]++;
      }
    }
  }

  const rawRows = [];
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
          rawRows.push({ top: startY, bottom: y });
        }
      }
    }
  }

  console.log(`Processing ${rawRows.length} train rows into pixel art templates...`);

  const outputTemplatesDir = 'public/assets/trains/templates';
  if (!fs.existsSync(outputTemplatesDir)) {
    fs.mkdirSync(outputTemplatesDir, { recursive: true });
  }

  for (let i = 0; i < rawRows.length; i++) {
    const meta = TRAIN_METADATA[i] || {
      id: `train_template_${i + 1}`,
      name: `Đoàn Tàu ${i + 1}`,
      description: 'Chủ đề đoàn tàu du hành',
      wheelType: 'standard',
      hasPantograph: false,
      hasSmoke: false,
    };

    const row = rawRows[i];
    // Add small 4px padding
    const top = Math.max(0, row.top - 4);
    const bottom = Math.min(height, row.bottom + 4);
    const rowHeight = bottom - top;

    // Find tight left & right bounds for this row
    let minX = width;
    let maxX = 0;
    for (let y = top; y < bottom; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        if (data[idx] < 240 || data[idx + 1] < 240 || data[idx + 2] < 240) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }

    const cropLeft = Math.max(0, minX - 6);
    const cropWidth = Math.min(width - cropLeft, (maxX - minX) + 12);

    // Crop the raw region
    const croppedBuffer = await sharp(imagePath)
      .extract({ left: cropLeft, top: top, width: cropWidth, height: rowHeight })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const cData = croppedBuffer.data;
    const cWidth = croppedBuffer.info.width;
    const cHeight = croppedBuffer.info.height;

    // Convert to RGBA & make white transparent
    const rgba = Buffer.alloc(cWidth * cHeight * 4);
    const lightsRgba = Buffer.alloc(cWidth * cHeight * 4);

    for (let p = 0; p < cWidth * cHeight; p++) {
      const srcIdx = p * 3;
      const destIdx = p * 4;
      const r = cData[srcIdx];
      const g = cData[srcIdx + 1];
      const b = cData[srcIdx + 2];

      // Check if near-white background
      const isWhite = r > 240 && g > 240 && b > 240;

      if (isWhite) {
        rgba[destIdx + 3] = 0; // Transparent
        lightsRgba[destIdx + 3] = 0;
      } else {
        // Color quantization to 16-bit pixel cluster (snap to steps of 12)
        const pr = Math.round(r / 12) * 12;
        const pg = Math.round(g / 12) * 12;
        const pb = Math.round(b / 12) * 12;

        rgba[destIdx] = Math.min(255, pr);
        rgba[destIdx + 1] = Math.min(255, pg);
        rgba[destIdx + 2] = Math.min(255, pb);
        rgba[destIdx + 3] = 255;

        // Check if window/light pixel (cyan, light blue, bright yellow, amber)
        const isCyan = (b > 150 && g > 130 && r < 120);
        const isYellow = (r > 200 && g > 180 && b < 140);
        const isBrightGlass = (r > 160 && g > 200 && b > 220);

        if (isCyan || isYellow || isBrightGlass) {
          lightsRgba[destIdx] = 255;
          lightsRgba[destIdx + 1] = isCyan ? 230 : 210;
          lightsRgba[destIdx + 2] = isCyan ? 150 : 80;
          lightsRgba[destIdx + 3] = 255;
        } else {
          lightsRgba[destIdx + 3] = 0;
        }
      }
    }

    const trainDir = path.join(outputTemplatesDir, meta.id);
    if (!fs.existsSync(trainDir)) {
      fs.mkdirSync(trainDir, { recursive: true });
    }

    // Step A: Downscale to retro pixel resolution (height = 36px)
    const targetPixelHeight = 36;
    const targetPixelWidth = Math.round((cWidth / cHeight) * targetPixelHeight);

    const downscaledBody = await sharp(rgba, {
      raw: { width: cWidth, height: cHeight, channels: 4 }
    })
      .resize(targetPixelWidth, targetPixelHeight, { kernel: 'lanczos3' })
      .png()
      .toBuffer();

    // Step B: Upscale 3x with Nearest Neighbor for sharp authentic pixel block rendering
    const pixelArtBodyBuffer = await sharp(downscaledBody)
      .resize(targetPixelWidth * 3, targetPixelHeight * 3, { kernel: 'nearest' })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(trainDir, 'train_body.png'), pixelArtBodyBuffer);

    // Step C: Process Lights Mask
    const downscaledLights = await sharp(lightsRgba, {
      raw: { width: cWidth, height: cHeight, channels: 4 }
    })
      .resize(targetPixelWidth, targetPixelHeight, { kernel: 'nearest' })
      .png()
      .toBuffer();

    const pixelArtLightsBuffer = await sharp(downscaledLights)
      .resize(targetPixelWidth * 3, targetPixelHeight * 3, { kernel: 'nearest' })
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(trainDir, 'train_lights.png'), pixelArtLightsBuffer);

    console.log(`✅ [${i + 1}/10] Created Pixel Art Template: ${meta.id} (${targetPixelWidth * 3}x${targetPixelHeight * 3}px)`);
  }

  console.log('\n🎉 Successfully converted all 10 train sets into pixel art PNG templates!');
}

processAllTrains().catch(console.error);
