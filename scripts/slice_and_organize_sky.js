import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SKY_DIR = path.resolve('public/assets/sky');
const CELESTIAL_DIR = path.join(SKY_DIR, 'celestial');
const CLOUDS_DIR = path.join(SKY_DIR, 'clouds');
const FLYING_DIR = path.join(SKY_DIR, 'flying');

[CELESTIAL_DIR, CLOUDS_DIR, FLYING_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function isWhite(r, g, b, threshold = 238) {
  if (r < threshold || g < threshold || b < threshold) return false;
  return Math.abs(r - g) <= 10 && Math.abs(r - b) <= 10 && Math.abs(g - b) <= 10;
}

/**
 * Trích xuất 1 bounding box, xóa nền trắng bằng BFS từ viền ngoài, bảo vệ 100% chi tiết bên trong
 */
async function extractSprite(sheetData, sheetWidth, sheetHeight, channels, box, outPath, padding = 4) {
  const minX = Math.max(0, box.minX - padding);
  const maxX = Math.min(sheetWidth - 1, box.maxX + padding);
  const minY = Math.max(0, box.minY - padding);
  const maxY = Math.min(sheetHeight - 1, box.maxY + padding);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // Lấy dữ liệu vùng crop
  const cropRgba = Buffer.alloc(cropW * cropH * 4);
  const isBg = new Uint8Array(cropW * cropH);
  const queue = new Int32Array(cropW * cropH);
  let qHead = 0, qTail = 0;

  // Điền dữ liệu màu ban đầu
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((minY + y) * sheetWidth + (minX + x)) * channels;
      const destIdx = (y * cropW + x) * 4;

      const r = sheetData[srcIdx];
      const g = sheetData[srcIdx + 1];
      const b = sheetData[srcIdx + 2];

      cropRgba[destIdx] = r;
      cropRgba[destIdx + 1] = g;
      cropRgba[destIdx + 2] = b;
      cropRgba[destIdx + 3] = 255;
    }
  }

  // Hạt giống BFS: 4 đường viền bao ngoài vùng crop
  for (let x = 0; x < cropW; x++) {
    // Viền trên
    const topIdx = 0 * cropW + x;
    const rT = cropRgba[topIdx * 4], gT = cropRgba[topIdx * 4 + 1], bT = cropRgba[topIdx * 4 + 2];
    if (isWhite(rT, gT, bT)) {
      isBg[topIdx] = 1;
      queue[qTail++] = topIdx;
    }
    // Viền dưới
    const botIdx = (cropH - 1) * cropW + x;
    const rB = cropRgba[botIdx * 4], gB = cropRgba[botIdx * 4 + 1], bB = cropRgba[botIdx * 4 + 2];
    if (isWhite(rB, gB, bB) && !isBg[botIdx]) {
      isBg[botIdx] = 1;
      queue[qTail++] = botIdx;
    }
  }

  for (let y = 0; y < cropH; y++) {
    // Viền trái
    const leftIdx = y * cropW + 0;
    const rL = cropRgba[leftIdx * 4], gL = cropRgba[leftIdx * 4 + 1], bL = cropRgba[leftIdx * 4 + 2];
    if (isWhite(rL, gL, bL) && !isBg[leftIdx]) {
      isBg[leftIdx] = 1;
      queue[qTail++] = leftIdx;
    }
    // Viền phải
    const rightIdx = y * cropW + (cropW - 1);
    const rR = cropRgba[rightIdx * 4], gR = cropRgba[rightIdx * 4 + 1], bR = cropRgba[rightIdx * 4 + 2];
    if (isWhite(rR, gR, bR) && !isBg[rightIdx]) {
      isBg[rightIdx] = 1;
      queue[qTail++] = rightIdx;
    }
  }

  // BFS loang nền trắng
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % cropW;
    const cy = Math.floor(curr / cropW);

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < cropW && ny >= 0 && ny < cropH) {
        const nIdx = ny * cropW + nx;
        if (!isBg[nIdx]) {
          const r = cropRgba[nIdx * 4];
          const g = cropRgba[nIdx * 4 + 1];
          const b = cropRgba[nIdx * 4 + 2];
          if (isWhite(r, g, b, 232)) {
            isBg[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }
    }
  }

  // Gán alpha và khử viền trắng tiếp giáp
  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const idx = y * cropW + x;
      const destIdx = idx * 4;

      if (isBg[idx]) {
        cropRgba[destIdx + 3] = 0; // Trong suốt nền ngoài
      } else {
        // Kiểm tra xem có tiếp giáp với nền không
        let isBorder = false;
        if (x > 0 && isBg[idx - 1]) isBorder = true;
        else if (x < cropW - 1 && isBg[idx + 1]) isBorder = true;
        else if (y > 0 && isBg[idx - cropW]) isBorder = true;
        else if (y < cropH - 1 && isBg[idx + cropW]) isBorder = true;

        const r = cropRgba[destIdx];
        const g = cropRgba[destIdx + 1];
        const b = cropRgba[destIdx + 2];

        // Khử viền trắng (anti-halo)
        if (isBorder && r > 225 && g > 225 && b > 225) {
          cropRgba[destIdx + 3] = 0;
        }
      }
    }
  }

  await sharp(cropRgba, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`   ✨ Đã cắt & bóc nền: ${path.basename(outPath)} (${cropW}x${cropH}px)`);
}

async function processAll() {
  console.log('🚀 Bắt đầu bóc tách Sprite Sheets và sắp xếp vào các thư mục sky...');

  // =========================================================================
  // 1. XỬ LÝ MASTER SHEET (12 đối tượng: Mặt trời, Mặt trăng, Mây, Máy bay, Khinh khí cầu, Chim)
  // =========================================================================
  const masterFile = path.join(SKY_DIR, 'master_sheet.jpg');
  if (fs.existsSync(masterFile)) {
    console.log('\n🌟 Đang xử lý master_sheet.jpg (4x3 layout)...');
    const { data, info } = await sharp(masterFile).raw().toBuffer({ resolveWithObject: true });

    // Định nghĩa tọa độ chính xác từng ô item dựa trên phân tích kết quả quét:
    const masterItems = [
      // Hàng 1: Thiên thể (Celestial)
      { name: 'sun_dawn.png', dir: CELESTIAL_DIR, box: { minX: 38, maxX: 323, minY: 102, maxY: 253 } },
      { name: 'sun_noon.png', dir: CELESTIAL_DIR, box: { minX: 432, maxX: 650, minY: 76, maxY: 286 } },
      { name: 'sun_sunset.png', dir: CELESTIAL_DIR, box: { minX: 764, maxX: 1079, minY: 95, maxY: 262 } },
      { name: 'moon_full.png', dir: CELESTIAL_DIR, box: { minX: 1159, maxX: 1337, minY: 88, maxY: 256 } },
      { name: 'moon_crescent.png', dir: CELESTIAL_DIR, box: { minX: 1481, maxX: 1615, minY: 80, maxY: 263 } },

      // Hàng 2: Mây (Clouds)
      { name: 'cloud_cumulus_small.png', dir: CLOUDS_DIR, box: { minX: 42, maxX: 277, minY: 396, maxY: 559 } },
      { name: 'cloud_stratus_wide.png', dir: CLOUDS_DIR, box: { minX: 332, maxX: 815, minY: 416, maxY: 551 } },
      { name: 'cloud_cumulonimbus_huge.png', dir: CLOUDS_DIR, box: { minX: 828, maxX: 1255, minY: 328, maxY: 587 } },
      { name: 'cloud_sunset_golden.png', dir: CLOUDS_DIR, box: { minX: 1304, maxX: 1658, minY: 383, maxY: 567 } },

      // Hàng 3: Vật thể bay (Flying Objects)
      { name: 'hot_air_balloon.png', dir: FLYING_DIR, box: { minX: 81, maxX: 238, minY: 644, maxY: 874 } },
      { name: 'airplane_jet.png', dir: FLYING_DIR, box: { minX: 352, maxX: 839, minY: 752, maxY: 831 } },
      { name: 'birds_flock.png', dir: FLYING_DIR, box: { minX: 900, maxX: 1240, minY: 700, maxY: 898 } },
      { name: 'airplane_biplane.png', dir: FLYING_DIR, box: { minX: 1347, maxX: 1607, minY: 742, maxY: 873 } },
    ];

    for (const item of masterItems) {
      await extractSprite(data, info.width, info.height, info.channels, item.box, path.join(item.dir, item.name));
    }
  }

  // =========================================================================
  // 2. XỬ LÝ CLOUDS SHEET (6 hình thái mây đa dạng: nhỏ, dải ngang, cuộn lớn, hoàng hôn, chập tối, đêm)
  // =========================================================================
  const cloudsFile = path.join(SKY_DIR, 'clouds_sheet.jpg');
  if (fs.existsSync(cloudsFile)) {
    console.log('\n☁️ Đang xử lý clouds_sheet.jpg (2x3 layout)...');
    const { data, info } = await sharp(cloudsFile).raw().toBuffer({ resolveWithObject: true });

    const cloudItems = [
      // Hàng 1
      { name: 'cloud_cumulus_alt1.png', dir: CLOUDS_DIR, box: { minX: 81, maxX: 402, minY: 176, maxY: 367 } },
      { name: 'cloud_stratus_alt1.png', dir: CLOUDS_DIR, box: { minX: 470, maxX: 1039, minY: 198, maxY: 369 } },
      { name: 'cloud_puffy_alt1.png', dir: CLOUDS_DIR, box: { minX: 1024, maxX: 1644, minY: 63, maxY: 446 } },

      // Hàng 2
      { name: 'cloud_sunset_rose.png', dir: CLOUDS_DIR, box: { minX: 19, maxX: 560, minY: 527, maxY: 847 } },
      { name: 'cloud_sunset_amber.png', dir: CLOUDS_DIR, box: { minX: 584, maxX: 1081, minY: 550, maxY: 847 } },
      { name: 'cloud_night_slate.png', dir: CLOUDS_DIR, box: { minX: 1110, maxX: 1655, minY: 560, maxY: 845 } },
    ];

    for (const item of cloudItems) {
      await extractSprite(data, info.width, info.height, info.channels, item.box, path.join(item.dir, item.name));
    }
  }

  // =========================================================================
  // 3. ĐỒNG BỘ THƯ MỤC GỐC public/assets/sky/ ĐỂ CÁC COMPONENT GỌI NGAY ĐƯỢC
  // =========================================================================
  console.log('\n🔄 Đang tạo bản sao đồng bộ vào thư mục gốc public/assets/sky/ để tương thích 100%...');
  const keyMappings = [
    { src: path.join(CELESTIAL_DIR, 'sun_noon.png'), dest: path.join(SKY_DIR, 'sun.png') },
    { src: path.join(CELESTIAL_DIR, 'moon_crescent.png'), dest: path.join(SKY_DIR, 'moon.png') },
    { src: path.join(CLOUDS_DIR, 'cloud_cumulus_small.png'), dest: path.join(SKY_DIR, 'cloud_1.png') },
    { src: path.join(CLOUDS_DIR, 'cloud_stratus_wide.png'), dest: path.join(SKY_DIR, 'cloud_2.png') },
    { src: path.join(CLOUDS_DIR, 'cloud_cumulonimbus_huge.png'), dest: path.join(SKY_DIR, 'cloud_3.png') },
    { src: path.join(FLYING_DIR, 'hot_air_balloon.png'), dest: path.join(SKY_DIR, 'hot_air_balloon.png') },
    { src: path.join(FLYING_DIR, 'airplane_jet.png'), dest: path.join(SKY_DIR, 'airplane.png') },
    { src: path.join(FLYING_DIR, 'birds_flock.png'), dest: path.join(SKY_DIR, 'birds_flock.png') },
  ];

  for (const m of keyMappings) {
    if (fs.existsSync(m.src)) {
      fs.copyFileSync(m.src, m.dest);
    }
  }

  console.log('🎉 Hoàn tất cắt và phân loại toàn bộ 19 asset bầu trời vào các thư mục chuyên biệt!');
}

processAll().catch(console.error);
