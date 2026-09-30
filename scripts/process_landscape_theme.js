import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { generateRegistryFiles } from './scan_assets.js';

/**
 * Thuật toán tách nền & chuẩn hóa Asset phong cảnh:
 * 1. Background (Hậu Cảnh):
 *    - Quy tắc: Phần nền (bầu trời, lề trên/dưới) là màu trắng thuần khiết (#FFFFFF).
 *    - Sử dụng BFS Flood Fill (loang từ viền ngoài):
 *      + Chỉ xóa các pixel nền trắng liên thông với viền ảnh.
 *      + Bảo vệ 100% các chi tiết màu trắng bên trong tác phẩm (nhà cửa, buồm, sóng biển, cửa sổ).
 *    - Khử viền trắng (Anti-Halo Defringe) 1px ở ranh giới ngoài.
 *    - Tự động trích xuất mặt nạ đèn đêm (background_lights.png).
 *
 * 2. Midground (Trung Cảnh Đường Ray):
 *    - Quy tắc: Không cắt theo chiều ngang, scale chiều dọc cho chuẩn (240px), nối ngang nhiều hình.
 *    - Tách nền trắng phía trên thanh ray bằng BFS từ viền trên.
 *    - Giữ nguyên 100% chiều rộng tranh vẽ gốc, co dãn tỷ lệ theo chiều cao chuẩn 240px.
 *    - Tự động lặp (tile) nhiều bản sao ghép ngang để tạo dải đường ray vô tận.
 */

// Hàm kiểm tra pixel có phải màu trắng / gần trắng thuần khiết không
function isFullWhitePixel(r, g, b, threshold = 240) {
  if (r < threshold || g < threshold || b < threshold) return false;
  // Kiểm tra độ cân bằng xám (tránh nhầm với màu vàng nhạt hoặc xanh pastel)
  const diff = Math.max(r, g, b) - Math.min(r, g, b);
  return diff <= 8;
}

export async function processLandscapeFolder(folderPath) {
  let fullPath = path.resolve(folderPath);
  if (!fs.existsSync(fullPath)) {
    const candidate = path.resolve('public/assets/landscapes', folderPath);
    if (fs.existsSync(candidate)) {
      fullPath = candidate;
    } else {
      console.error(`❌ Thư mục không tồn tại: ${fullPath} (hoặc ${candidate})`);
      return false;
    }
  }

  const files = fs.readdirSync(fullPath);
  console.log(`\n======================================================`);
  console.log(`🚀 Đang quét và xử lý thư mục: ${path.basename(fullPath)}`);
  console.log(`======================================================`);

  // Tìm file background
  const bgFile = files.find(f => /^background\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /^(bg|haucang)\.(jpg|jpeg|webp)$/i.test(f));

  // Tìm file midground track
  const mgFile = files.find(f => /^midground\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /^(track|rail|trungcanh)\.(jpg|jpeg|webp)$/i.test(f));

  if (!bgFile && !mgFile) {
    console.log(`ℹ️ Không tìm thấy file JPG/JPEG nào cần xử lý trong ${path.basename(fullPath)}.`);
    return false;
  }

  // ==========================================================
  // --- 1. XỬ LÝ BACKGROUND (HẬU CẢNH PANORAMA FULL TRẮNG) ---
  // ==========================================================
  if (bgFile) {
    const bgInput = path.join(fullPath, bgFile);
    console.log(`🎨 1. Đang xử lý Background: ${bgFile}...`);

    const img = sharp(bgInput);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Mảng đánh dấu pixel nền ngoài trời (1: nền trắng bên ngoài, 0: tác phẩm nghệ thuật)
    const isOutdoorBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;

    // Hạt giống (Seeds): Viền trên cùng (y = 0)
    for (let x = 0; x < w; x++) {
      const idx = (0 * w + x) * info.channels;
      if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) {
        isOutdoorBg[x] = 1;
        queue[qTail++] = x;
      }
    }

    // Hạt giống: Viền trái và phải nửa trên (y = 0 -> 65% h)
    const seedH = Math.floor(h * 0.65);
    for (let y = 0; y < seedH; y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isFullWhitePixel(data[lIdx], data[lIdx + 1], data[lIdx + 2]) && !isOutdoorBg[y * w + 0]) {
        isOutdoorBg[y * w + 0] = 1;
        queue[qTail++] = (y * w + 0);
      }
      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isFullWhitePixel(data[rIdx], data[rIdx + 1], data[rIdx + 2]) && !isOutdoorBg[y * w + (w - 1)]) {
        isOutdoorBg[y * w + (w - 1)] = 1;
        queue[qTail++] = (y * w + (w - 1));
      }
    }

    // Hạt giống: Viền dưới đáy (nếu ảnh canvas có dải trắng dư phía dưới biển/mặt đất)
    for (let x = 0; x < w; x++) {
      const bIdx = ((h - 1) * w + x) * info.channels;
      if (isFullWhitePixel(data[bIdx], data[bIdx + 1], data[bIdx + 2]) && !isOutdoorBg[(h - 1) * w + x]) {
        isOutdoorBg[(h - 1) * w + x] = 1;
        queue[qTail++] = ((h - 1) * w + x);
      }
    }

    // BFS Flood Fill lan truyền từ ngoài vào trong
    while (qHead < qTail) {
      const curr = queue[qHead++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!isOutdoorBg[nIdx]) {
            const srcIdx = nIdx * info.channels;
            if (isFullWhitePixel(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2])) {
              isOutdoorBg[nIdx] = 1;
              queue[qTail++] = nIdx;
            }
          }
        }
      }
    }

    // Tìm bounding box dọc của nội dung thực tế (loại bỏ dải trắng trống trên trời và dưới đáy)
    let firstContentY = -1;
    let lastContentY = -1;
    for (let y = 0; y < h; y++) {
      let contentPixels = 0;
      for (let x = 0; x < w; x++) {
        if (!isOutdoorBg[y * w + x]) contentPixels++;
      }
      if (contentPixels > w * 0.02 && firstContentY === -1) firstContentY = y;
      if (contentPixels > w * 0.02) lastContentY = y;
    }

    const cropTop = Math.max(0, firstContentY - 10);
    const cropBottom = Math.min(h, lastContentY + 2);
    const cropHeight = Math.max(100, cropBottom - cropTop);

    console.log(`   Khung chứa tranh phong cảnh nhận diện: y=${cropTop} -> y=${cropBottom} (cao ${cropHeight}px)`);

    const bgRgba = Buffer.alloc(w * cropHeight * 4);
    const bgLightsRgba = Buffer.alloc(w * cropHeight * 4);

    let protectedWhites = 0;
    let lightsCount = 0;

    for (let y = 0; y < cropHeight; y++) {
      const origY = cropTop + y;
      for (let x = 0; x < w; x++) {
        const srcIdx = (origY * w + x) * info.channels;
        const destIdx = (y * w + x) * 4;
        const isBg = isOutdoorBg[origY * w + x];

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        if (isBg) {
          // Bầu trời ngoài trời -> 100% Trong suốt
          bgRgba[destIdx + 3] = 0;
          bgLightsRgba[destIdx + 3] = 0;
        } else {
          if (r >= 240 && g >= 240 && b >= 240) {
            protectedWhites++;
          }

          // Khử viền trắng (Anti-Halo Defringe): Nếu pixel tiếp giáp với nền và gần trắng -> làm dịu biên
          let isBorderPixel = false;
          if (origY > 0 && isOutdoorBg[(origY - 1) * w + x]) isBorderPixel = true;
          else if (origY < h - 1 && isOutdoorBg[(origY + 1) * w + x]) isBorderPixel = true;
          else if (x > 0 && isOutdoorBg[origY * w + (x - 1)]) isBorderPixel = true;
          else if (x < w - 1 && isOutdoorBg[origY * w + (x + 1)]) isBorderPixel = true;

          if (isBorderPixel && r > 230 && g > 230 && b > 230) {
            // Điểm tiếp giáp quá sáng do nén JPEG -> làm trong suốt viền
            bgRgba[destIdx + 3] = 0;
            bgLightsRgba[destIdx + 3] = 0;
            continue;
          }

          // Lượng tử hóa màu nhẹ (Pixel art color quantization)
          bgRgba[destIdx] = Math.min(255, Math.round(r / 4) * 4);
          bgRgba[destIdx + 1] = Math.min(255, Math.round(g / 4) * 4);
          bgRgba[destIdx + 2] = Math.min(255, Math.round(b / 4) * 4);
          bgRgba[destIdx + 3] = 255;

          // Trích xuất đèn đêm:
          const isWarmYellow = (r > 195 && g > 165 && b < 145);
          const isAmber = (r > 200 && g > 125 && b < 85);
          const isCyan = (b > 175 && g > 160 && r < 140);
          const isBrightWindow = (r > 220 && g > 215 && b > 205 && (r - b > 10 || origY > cropTop + cropHeight * 0.3));

          if (isWarmYellow || isAmber || isCyan || isBrightWindow) {
            lightsCount++;
            bgLightsRgba[destIdx] = 255;
            bgLightsRgba[destIdx + 1] = isWarmYellow ? 230 : isAmber ? 165 : isCyan ? 245 : 240;
            bgLightsRgba[destIdx + 2] = isWarmYellow ? 110 : isAmber ? 65 : isCyan ? 255 : 180;
            bgLightsRgba[destIdx + 3] = 255;
          } else {
            bgLightsRgba[destIdx + 3] = 0;
          }
        }
      }
    }

    console.log(`   🛡️ Đã bảo vệ ${protectedWhites.toLocaleString()} pixel trắng nội cảnh không bị cắt nhầm!`);
    console.log(`   ✨ Đã trích xuất ${lightsCount.toLocaleString()} bóng đèn đêm cho background_lights.png!`);

    // Lưu background.png chuẩn 1920x520 px
    await sharp(bgRgba, { raw: { width: w, height: cropHeight, channels: 4 } })
      .resize(1920, 520, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'background.png'));

    // Lưu background_lights.png
    await sharp(bgLightsRgba, { raw: { width: w, height: cropHeight, channels: 4 } })
      .resize(1920, 520, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'background_lights.png'));

    console.log(`   ✅ Đã xuất background.png & background_lights.png thành công!`);
  }

  // =======================================================================
  // --- 2. XỬ LÝ MIDGROUND (KHÔNG CẮT NGANG, SCALE DỌC, NỐI NGANG NHIỀU HÌNH) ---
  // =======================================================================
  if (mgFile) {
    const mgInput = path.join(fullPath, mgFile);
    console.log(`🛤️ 2. Đang xử lý Midground Track: ${mgFile}...`);

    const img = sharp(mgInput);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Flood fill tách nền trắng phía trên thanh ray từ viền trên cùng (y = 0)
    const isMgBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;

    for (let x = 0; x < w; x++) {
      const idx = (0 * w + x) * info.channels;
      if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) {
        isMgBg[x] = 1;
        queue[qTail++] = x;
      }
    }

    // Viền trái & phải trên ray
    for (let y = 0; y < Math.floor(h * 0.7); y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isFullWhitePixel(data[lIdx], data[lIdx + 1], data[lIdx + 2]) && !isMgBg[y * w + 0]) {
        isMgBg[y * w + 0] = 1;
        queue[qTail++] = (y * w + 0);
      }
      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isFullWhitePixel(data[rIdx], data[rIdx + 1], data[rIdx + 2]) && !isMgBg[y * w + (w - 1)]) {
        isMgBg[y * w + (w - 1)] = 1;
        queue[qTail++] = (y * w + (w - 1));
      }
    }

    // Hạt giống: Viền dưới đáy (nếu ảnh canvas có dải trắng dư phía dưới mặt đất/đường ray)
    for (let x = 0; x < w; x++) {
      const bIdx = ((h - 1) * w + x) * info.channels;
      if (isFullWhitePixel(data[bIdx], data[bIdx + 1], data[bIdx + 2]) && !isMgBg[(h - 1) * w + x]) {
        isMgBg[(h - 1) * w + x] = 1;
        queue[qTail++] = ((h - 1) * w + x);
      }
    }

    // BFS loang nền trắng
    while (qHead < qTail) {
      const curr = queue[qHead++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);

      const neighbors = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!isMgBg[nIdx]) {
            const srcIdx = nIdx * info.channels;
            if (isFullWhitePixel(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2])) {
              isMgBg[nIdx] = 1;
              queue[qTail++] = nIdx;
            }
          }
        }
      }
    }

    // Tìm ranh giới chiều dọc của công trình đường ray (KHÔNG CẮT CHIỀU NGANG)
    let mgMinY = -1;
    let mgMaxY = -1;
    for (let y = 0; y < h; y++) {
      let contentCount = 0;
      for (let x = 0; x < w; x++) {
        if (!isMgBg[y * w + x]) contentCount++;
      }
      if (contentCount > w * 0.02 && mgMinY === -1) mgMinY = y;
      if (contentCount > w * 0.02) mgMaxY = y;
    }

    const mgContentH = Math.max(100, mgMaxY - mgMinY + 1);
    console.log(`   Đường ray nhận diện: y=${mgMinY} -> y=${mgMaxY} (cao ${mgContentH}px, rộng nguyên bản ${w}px - KHÔNG CẮT NGANG)`);

    // Tạo buffer cho 1 đơn vị đường ray nguyên vẹn (1 unit)
    const singleTileRgba = Buffer.alloc(w * mgContentH * 4);

    for (let y = 0; y < mgContentH; y++) {
      const origY = mgMinY + y;
      for (let x = 0; x < w; x++) {
        const srcIdx = (origY * w + x) * info.channels;
        const destIdx = (y * w + x) * 4;

        if (isMgBg[origY * w + x]) {
          singleTileRgba[destIdx + 3] = 0; // Trong suốt bầu trời trên ray
        } else {
          // Khử viền trắng (Anti-Halo Defringe): Nếu pixel tiếp giáp với nền trắng và gần trắng -> làm dịu biên
          let isBorderPixel = false;
          if (origY > 0 && isMgBg[(origY - 1) * w + x]) isBorderPixel = true;
          else if (origY < h - 1 && isMgBg[(origY + 1) * w + x]) isBorderPixel = true;
          else if (x > 0 && isMgBg[origY * w + (x - 1)]) isBorderPixel = true;
          else if (x < w - 1 && isMgBg[origY * w + (x + 1)]) isBorderPixel = true;

          const r = data[srcIdx];
          const g = data[srcIdx + 1];
          const b = data[srcIdx + 2];

          if (isBorderPixel && r > 230 && g > 230 && b > 230) {
            singleTileRgba[destIdx + 3] = 0;
            continue;
          }

          singleTileRgba[destIdx] = Math.round(r / 4) * 4;
          singleTileRgba[destIdx + 1] = Math.round(g / 4) * 4;
          singleTileRgba[destIdx + 2] = Math.round(b / 4) * 4;
          singleTileRgba[destIdx + 3] = 255;
        }
      }
    }

    // Scale chiều dọc cho phù hợp với chiều cao tiêu chuẩn 240px
    const targetH = 240;
    const verticalScale = targetH / mgContentH;
    const tileW = Math.round(w * verticalScale);

    console.log(`   📐 Đã scale chiều dọc về chuẩn ${targetH}px -> Chiều rộng 1 khối đạt ${tileW}px`);

    const singleTileBuffer = await sharp(singleTileRgba, { raw: { width: w, height: mgContentH, channels: 4 } })
      .resize(tileW, targetH, { kernel: 'nearest' })
      .png()
      .toBuffer();

    // Nối ngang nhiều hình (Tiling horizontally): Đảm bảo tổng chiều rộng >= 1920px để bao phủ toàn bộ màn hình
    const numTiles = Math.max(2, Math.ceil(1920 / tileW));
    const totalW = tileW * numTiles;

    console.log(`   🔁 Đang ghép nối ngang ${numTiles} khối liên tiếp -> Tổng chiều rộng dải ray: ${totalW}px x ${targetH}px`);

    const composites = [];
    for (let i = 0; i < numTiles; i++) {
      composites.push({
        input: singleTileBuffer,
        left: i * tileW,
        top: 0
      });
    }

    await sharp({
      create: {
        width: totalW,
        height: targetH,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite(composites)
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'midground_track.png'));

    console.log(`   ✅ Đã xuất dải ray nối ngang midground_track.png thành công!`);
  }

  // Cập nhật lại hệ thống asset registry
  generateRegistryFiles();

  console.log(`🎉 Hoàn tất xử lý và đăng ký thư mục ${path.basename(fullPath)} vào ứng dụng!\n`);
  return true;
}

// Nếu chạy trực tiếp từ dòng lệnh: node scripts/process_landscape_theme.js [folder]
if (process.argv[1] && process.argv[1].endsWith('process_landscape_theme.js')) {
  const target = process.argv[2];
  if (target) {
    processLandscapeFolder(target).catch(console.error);
  } else {
    const landscapesDir = path.resolve('public/assets/landscapes');
    const dirs = fs.readdirSync(landscapesDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => path.join(landscapesDir, d.name));

    (async () => {
      for (const d of dirs) {
        await processLandscapeFolder(d);
      }
    })();
  }
}
