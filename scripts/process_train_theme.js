import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { generateRegistryFiles } from './scan_assets.js';
import { bakeGlowToImage } from './pre_render_lights_glow.js';

/**
 * Thuật toán tách nền & chuẩn hóa Asset đoàn tàu:
 * 1. Nhận diện nền: Kiểm tra 4 góc và viền để phân biệt nền Đen (#000000) hay Trắng (#FFFFFF).
 * 2. BFS Flood Fill từ 4 viền:
 *    - Chỉ xóa nền ngoài liên thông với viền.
 *    - Bảo vệ 100% các chi tiết đen/trắng bên trong tàu (bánh xe, khớp nối, khung cửa kính, gầm tàu).
 * 3. Khử viền (Anti-Halo Defringe) 1px ở ranh giới ngoài.
 * 4. Tự động Crop Bounding Box và scale chuẩn chiều cao 108px (chiều dài co giãn theo tỉ lệ nguyên bản).
 * 5. Tự động trích xuất đèn cửa sổ & đèn pha -> bake hiệu ứng glow ban đêm (train_lights_4car.png / 3car.png).
 * 6. Tự động tạo ảnh preview (train_preview.png) và file meta.json.
 * 7. Tự động chạy generateRegistryFiles() để đăng ký ngay vào app.
 */

function isFullBlackPixel(r, g, b, threshold = 28) {
  if (r > threshold || g > threshold || b > threshold) return false;
  const diff = Math.max(r, g, b) - Math.min(r, g, b);
  return diff <= 16;
}

function isFullWhitePixel(r, g, b, threshold = 235) {
  if (r < threshold || g < threshold || b < threshold) return false;
  const diff = Math.max(r, g, b) - Math.min(r, g, b);
  return diff <= 14;
}

function humanizeName(id) {
  return id
    .replace(/^train_/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function processTrainFolder(folderPath) {
  let fullPath = path.resolve(folderPath);
  if (!fs.existsSync(fullPath)) {
    const candidate = path.resolve('public/assets/trains/templates', folderPath);
    if (fs.existsSync(candidate)) {
      fullPath = candidate;
    } else {
      console.error(`❌ Thư mục không tồn tại: ${fullPath} (hoặc ${candidate})`);
      return false;
    }
  }

  const folderName = path.basename(fullPath);
  const files = fs.readdirSync(fullPath);

  console.log(`\n======================================================`);
  console.log(`🚄 Đang quét và xử lý template tàu: ${folderName}`);
  console.log(`======================================================`);

  // Tìm file ảnh nguồn: ưu tiên JPG, JPEG, WEBP hoặc file PNG chưa qua xử lý
  const rawFile = files.find(f => /\.(jpg|jpeg|webp)$/i.test(f)) ||
                  files.find(f => /raw.*\.(png)$/i.test(f));

  if (!rawFile) {
    console.log(`ℹ️ Không tìm thấy file JPG/JPEG/WEBP nào cần xử lý trong ${folderName}.`);
    return false;
  }

  console.log(`📸 Tìm thấy ảnh nguồn: ${rawFile}`);
  const rawFilePath = path.join(fullPath, rawFile);
  const imgBuffer = fs.readFileSync(rawFilePath);

  const img = sharp(imgBuffer);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // 1. Phân tích nền: kiểm tra viền ngoài (top, bottom, left, right)
  let blackCount = 0;
  let whiteCount = 0;

  for (let x = 0; x < w; x++) {
    // Top border
    let idx = (0 * w + x) * ch;
    if (isFullBlackPixel(data[idx], data[idx + 1], data[idx + 2])) blackCount++;
    if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) whiteCount++;
    // Bottom border
    idx = ((h - 1) * w + x) * ch;
    if (isFullBlackPixel(data[idx], data[idx + 1], data[idx + 2])) blackCount++;
    if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) whiteCount++;
  }

  for (let y = 0; y < h; y++) {
    let idx = (y * w + 0) * ch;
    if (isFullBlackPixel(data[idx], data[idx + 1], data[idx + 2])) blackCount++;
    if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) whiteCount++;

    idx = (y * w + (w - 1)) * ch;
    if (isFullBlackPixel(data[idx], data[idx + 1], data[idx + 2])) blackCount++;
    if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) whiteCount++;
  }

  const bgMode = blackCount >= whiteCount ? 'black' : 'white';
  console.log(`   🎨 Nhận diện nền ảnh: ${bgMode === 'black' ? 'MÀU ĐEN (#000000)' : 'MÀU TRẮNG (#FFFFFF)'}`);

  const isBgPixel = bgMode === 'black'
    ? (r, g, b) => isFullBlackPixel(r, g, b, 28)
    : (r, g, b) => isFullWhitePixel(r, g, b, 235);

  // 2. BFS Flood Fill từ 4 cạnh ngoài
  const isOutdoorBg = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let qHead = 0;
  let qTail = 0;

  // Add viền ngoài vào queue nếu là pixel nền
  for (let x = 0; x < w; x++) {
    const topIdx = (0 * w + x) * ch;
    if (isBgPixel(data[topIdx], data[topIdx + 1], data[topIdx + 2])) {
      isOutdoorBg[0 * w + x] = 1;
      queue[qTail++] = 0 * w + x;
    }
    const botIdx = ((h - 1) * w + x) * ch;
    if (isBgPixel(data[botIdx], data[botIdx + 1], data[botIdx + 2])) {
      isOutdoorBg[(h - 1) * w + x] = 1;
      queue[qTail++] = (h - 1) * w + x;
    }
  }

  for (let y = 0; y < h; y++) {
    const leftIdx = (y * w + 0) * ch;
    if (!isOutdoorBg[y * w + 0] && isBgPixel(data[leftIdx], data[leftIdx + 1], data[leftIdx + 2])) {
      isOutdoorBg[y * w + 0] = 1;
      queue[qTail++] = y * w + 0;
    }
    const rightIdx = (y * w + (w - 1)) * ch;
    if (!isOutdoorBg[y * w + (w - 1)] && isBgPixel(data[rightIdx], data[rightIdx + 1], data[rightIdx + 2])) {
      isOutdoorBg[y * w + (w - 1)] = 1;
      queue[qTail++] = y * w + (w - 1);
    }
  }

  // BFS lan tỏa nền ngoài
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % w;
    const cy = Math.floor(curr / w);

    const neighbors = [
      cy > 0 ? (cy - 1) * w + cx : -1,
      cy < h - 1 ? (cy + 1) * w + cx : -1,
      cx > 0 ? cy * w + (cx - 1) : -1,
      cx < w - 1 ? cy * w + (cx + 1) : -1,
    ];

    for (const n of neighbors) {
      if (n === -1 || isOutdoorBg[n] === 1) continue;
      const nx = n % w;
      const ny = Math.floor(n / w);
      const nIdx = (ny * w + nx) * ch;

      if (isBgPixel(data[nIdx], data[nIdx + 1], data[nIdx + 2])) {
        isOutdoorBg[n] = 1;
        queue[qTail++] = n;
      }
    }
  }

  // 3. Tách nền và tìm Bounding Box của thân tàu
  const transparentRgba = Buffer.alloc(w * h * 4);
  const lightsRgba = Buffer.alloc(w * h * 4);

  let minX = w, maxX = 0, minY = h, maxY = 0;
  let spritePixels = 0;
  let lightsPixels = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pIdx = y * w + x;
      const srcIdx = pIdx * ch;
      const destIdx = pIdx * 4;

      if (isOutdoorBg[pIdx] === 1) {
        // Nền ngoài -> Trong suốt
        transparentRgba[destIdx + 3] = 0;
        lightsRgba[destIdx + 3] = 0;
      } else {
        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        // Khử viền 1px (Anti-halo defringing)
        let isBorder = false;
        if (y > 0 && isOutdoorBg[(y - 1) * w + x]) isBorder = true;
        else if (y < h - 1 && isOutdoorBg[(y + 1) * w + x]) isBorder = true;
        else if (x > 0 && isOutdoorBg[y * w + (x - 1)]) isBorder = true;
        else if (x < w - 1 && isOutdoorBg[y * w + (x + 1)]) isBorder = true;

        if (isBorder) {
          if (bgMode === 'black' && r < 40 && g < 40 && b < 40) {
            transparentRgba[destIdx + 3] = 0;
            lightsRgba[destIdx + 3] = 0;
            continue;
          }
          if (bgMode === 'white' && r > 225 && g > 225 && b > 225) {
            transparentRgba[destIdx + 3] = 0;
            lightsRgba[destIdx + 3] = 0;
            continue;
          }
        }

        // Pixel thân tàu hợp lệ
        transparentRgba[destIdx] = r;
        transparentRgba[destIdx + 1] = g;
        transparentRgba[destIdx + 2] = b;
        transparentRgba[destIdx + 3] = 255;

        spritePixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        // Trích xuất đèn phát sáng (Cửa sổ & Đèn pha)
        const isWarmLight = (r > 190 && g > 150 && b < 145);
        const isAmberLight = (r > 200 && g > 120 && b < 95);
        const isCyanLight = (b > 175 && g > 160 && r < 150);
        const isBrightCore = (r > 220 && g > 220 && b > 205);

        if (isWarmLight || isAmberLight || isCyanLight || isBrightCore) {
          lightsPixels++;
          lightsRgba[destIdx] = r;
          lightsRgba[destIdx + 1] = g;
          lightsRgba[destIdx + 2] = b;
          lightsRgba[destIdx + 3] = 255;
        } else {
          lightsRgba[destIdx + 3] = 0;
        }
      }
    }
  }

  if (spritePixels === 0) {
    console.error(`❌ Không tìm thấy pixel thân tàu nào sau khi tách nền.`);
    return false;
  }

  console.log(`   🛡️ Đã tách nền thành công! Số pixel thân tàu: ${spritePixels.toLocaleString()}`);
  console.log(`   ✨ Đã trích xuất ${lightsPixels.toLocaleString()} pixel đèn cửa sổ/đèn pha.`);

  // 4. Crop chính xác Bounding Box
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log(`   ✂️ Bounding Box: ${cropW}px x ${cropH}px (x: ${minX}->${maxX}, y: ${minY}->${maxY})`);

  // 5. Chuẩn hóa chiều cao về 108px (chuẩn tiêu chuẩn game)
  const targetH = 108;
  const scale = targetH / cropH;
  const targetW = Math.round(cropW * scale);

  console.log(`   📐 Scale về chuẩn chiều cao ${targetH}px -> Chiều dài thân tàu đạt: ${targetW}px`);

  // Crop & Resize thân tàu
  const croppedBodyBuffer = await sharp(transparentRgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize(targetW, targetH, { kernel: 'nearest' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Crop & Resize đèn tàu
  const croppedLightsBuffer = await sharp(lightsRgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .resize(targetW, targetH, { kernel: 'nearest' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // 6. Nhận diện số toa: Kiểm tra tên file, thư mục hoặc tỷ lệ
  let carCount = 4;
  if (/3[-_]?car|3toa/i.test(rawFile) || /3[-_]?car|3toa/i.test(folderName)) {
    carCount = 3;
  } else if (/4[-_]?car|4toa/i.test(rawFile) || /4[-_]?car|4toa/i.test(folderName) || targetW / targetH > 9.5) {
    carCount = 4;
  }

  console.log(`   🚂 Nhận diện số toa: ${carCount} toa`);

  // Lưu file thân tàu
  const bodyFilename = carCount === 4 ? 'train_body_4car.png' : 'train_body_3car.png';
  fs.writeFileSync(path.join(fullPath, bodyFilename), croppedBodyBuffer);
  // Cũng lưu train_body.png làm fallback
  fs.writeFileSync(path.join(fullPath, 'train_body.png'), croppedBodyBuffer);
  console.log(`   ✅ Đã xuất: ${bodyFilename} & train_body.png`);

  // Bake hiệu ứng glow cho đèn
  const glowLightsBuffer = await bakeGlowToImage(croppedLightsBuffer, {
    wideBlur: 5,
    midBlur: 2.5,
    tightBlur: 1.2,
  });

  const lightsFilename = carCount === 4 ? 'train_lights_4car.png' : 'train_lights_3car.png';
  fs.writeFileSync(path.join(fullPath, lightsFilename), glowLightsBuffer);
  fs.writeFileSync(path.join(fullPath, 'train_lights.png'), glowLightsBuffer);
  console.log(`   ✅ Đã xuất: ${lightsFilename} & train_lights.png (với hiệu ứng Glow tích hợp sẵn)`);

  // 7. Tạo ảnh preview (train_preview.png)
  const previewW = 200;
  const previewH = Math.round(targetH * (previewW / targetW));
  await sharp(croppedBodyBuffer)
    .resize(previewW, previewH, { kernel: 'nearest' })
    .png()
    .toFile(path.join(fullPath, 'train_preview.png'));
  console.log(`   ✅ Đã xuất thumbnail: train_preview.png`);

  // 8. Tạo hoặc cập nhật meta.json
  const metaPath = path.join(fullPath, 'meta.json');
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch {
      meta = {};
    }
  }

  const isSteam = folderName.includes('steam');
  const isHighSpeed = folderName.includes('shinkansen') || folderName.includes('bullet') || folderName.includes('high_speed');

  meta.id = meta.id || folderName;
  meta.name = meta.name || humanizeName(folderName);
  meta.description = meta.description || `Đoàn tàu ${meta.name} thế hệ mới vận hành êm ái trên hành trình`;
  meta.carCount = carCount;
  meta.wheelType = meta.wheelType || (isSteam ? 'spoke' : 'standard');
  meta.hasSmoke = meta.hasSmoke !== undefined ? meta.hasSmoke : isSteam;
  meta.hasPantograph = meta.hasPantograph !== undefined ? meta.hasPantograph : isHighSpeed;

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  console.log(`   ✅ Đã cập nhật: meta.json`);

  // 9. Cập nhật Registry
  generateRegistryFiles();
  console.log(`🎉 Hoàn tất xử lý và đăng ký đoàn tàu ${folderName} vào ứng dụng!\n`);
  return true;
}

// Nếu chạy trực tiếp từ dòng lệnh: node scripts/process_train_theme.js [folder]
if (process.argv[1] && process.argv[1].endsWith('process_train_theme.js')) {
  const target = process.argv[2];
  if (target) {
    processTrainFolder(target).catch(console.error);
  } else {
    const trainsDir = path.resolve('public/assets/trains/templates');
    const dirs = fs.readdirSync(trainsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => path.join(trainsDir, d.name));

    (async () => {
      for (const d of dirs) {
        await processTrainFolder(d);
      }
    })();
  }
}
