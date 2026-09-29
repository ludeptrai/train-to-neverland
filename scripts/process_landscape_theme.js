import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { generateRegistryFiles } from './scan_assets.js';

/**
 * Thuật toán tách nền thông minh bằng Breadth-First Search (BFS) Flood Fill:
 * - Chỉ xóa các vùng màu nền (trắng/xám nhạt) LIÊN THÔNG BẮT ĐẦU TỪ VIỀN ẢNH (Top / Borders).
 * - BẢO VỆ 100% các chi tiết màu trắng bên trong (nhà cửa, cửa sổ, cánh buồm, sóng biển, thuyền bè, v.v.).
 * - Tự động tạo mặt nạ đèn đêm (background_lights.png) phát sáng rực rỡ vào ban đêm.
 */
export async function processLandscapeFolder(folderPath) {
  const fullPath = path.resolve(folderPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Thư mục không tồn tại: ${fullPath}`);
    return false;
  }

  const files = fs.readdirSync(fullPath);
  console.log(`\n======================================================`);
  console.log(`🚀 Đang quét và xử lý thư mục: ${path.basename(fullPath)}`);
  console.log(`======================================================`);

  // Tìm file background (chọn .jpg/.jpeg trước nếu chưa có .png hoặc muốn làm lại từ ảnh gốc)
  const bgFile = files.find(f => /^background\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /^(bg|haucang)\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => f.toLowerCase().includes('background') && /\.(jpg|jpeg|webp)$/i.test(f));

  // Tìm file midground track
  const mgFile = files.find(f => /^midground\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /^(track|rail|trungcanh)\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => f.toLowerCase().includes('midground') && /\.(jpg|jpeg|webp)$/i.test(f));

  if (!bgFile && !mgFile) {
    console.log(`ℹ️ Không tìm thấy file JPG/JPEG nào cần xử lý trong ${path.basename(fullPath)}.`);
    return false;
  }

  // --- 1. XỬ LÝ BACKGROUND (HẬU CẢNH PANORAMA) ---
  if (bgFile) {
    const bgInput = path.join(fullPath, bgFile);
    console.log(`🎨 1. Đang xử lý Background: ${bgFile}...`);

    const img = sharp(bgInput);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Lấy mẫu màu viền trên cùng để tính màu nền chuẩn
    let avgR = 0, avgG = 0, avgB = 0, sampleCount = 0;
    for (let x = 0; x < w; x += 10) {
      const idx = (0 * w + x) * info.channels;
      avgR += data[idx];
      avgG += data[idx + 1];
      avgB += data[idx + 2];
      sampleCount++;
    }
    avgR /= sampleCount;
    avgG /= sampleCount;
    avgB /= sampleCount;

    console.log(`   Màu nền viền trên đo được: RGB(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`);

    // Hàm kiểm tra xem pixel có thuộc dải màu nền hay không (Euclidean distance threshold)
    function isBgColor(x, y) {
      const idx = (y * w + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Nếu gần trắng hoặc rất gần với màu viền mẫu
      const isNearWhite = (r >= 234 && g >= 234 && b >= 234);
      const dist = Math.sqrt((r - avgR) ** 2 + (g - avgG) ** 2 + (b - avgB) ** 2);
      return isNearWhite || dist < 30;
    }

    // Mảng đánh dấu pixel nền ngoài trời: Uint8Array w * h (1: nền ngoài trời, 0: tiền cảnh)
    const isOutdoorBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0;
    let qTail = 0;

    // Hạt giống (Seeds): Viền trên cùng (y = 0)
    for (let x = 0; x < w; x++) {
      if (isBgColor(x, 0)) {
        isOutdoorBg[x] = 1;
        queue[qTail++] = x;
      }
    }

    // Hạt giống: Viền trái và phải nửa trên (y = 0 -> 65% h)
    const seedH = Math.floor(h * 0.65);
    for (let y = 0; y < seedH; y++) {
      if (isBgColor(0, y) && !isOutdoorBg[y * w + 0]) {
        isOutdoorBg[y * w + 0] = 1;
        queue[qTail++] = (y * w + 0);
      }
      if (isBgColor(w - 1, y) && !isOutdoorBg[y * w + (w - 1)]) {
        isOutdoorBg[y * w + (w - 1)] = 1;
        queue[qTail++] = (y * w + (w - 1));
      }
    }

    // BFS Flood Fill lan truyền từ ngoài vào trong
    while (qHead < qTail) {
      const curr = queue[qHead++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);

      // 4 hướng láng giềng
      const nx1 = cx + 1, ny1 = cy;
      const nx2 = cx - 1, ny2 = cy;
      const nx3 = cx, ny3 = cy + 1;
      const nx4 = cx, ny4 = cy - 1;

      const neighbors = [
        [nx1, ny1],
        [nx2, ny2],
        [nx3, ny3],
        [nx4, ny4]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nIdx = ny * w + nx;
          if (!isOutdoorBg[nIdx] && isBgColor(nx, ny)) {
            isOutdoorBg[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }
    }

    // Tìm bounding box dọc của nội dung thực tế (bỏ khoảng trắng trên và khoảng lề dưới nếu có)
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

    const cropTop = Math.max(0, firstContentY - 20);
    // Nếu đáy ảnh có khoảng trắng thừa (ví dụ biển kết thúc ở 806px)
    const cropBottom = Math.min(h, lastContentY + 5);
    const cropHeight = cropBottom - cropTop;

    console.log(`   Khung chứa phong cảnh nhận diện: y=${cropTop} -> y=${cropBottom} (cao ${cropHeight}px)`);

    // Tạo Buffer RGBA cho Background và Background Lights
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
          // Bầu trời ngoài trời -> 100% Transparent
          bgRgba[destIdx + 3] = 0;
          bgLightsRgba[destIdx + 3] = 0;
        } else {
          // Pixel thuộc tác phẩm! Giữ nguyên vẹn!
          if (r >= 234 && g >= 234 && b >= 234) {
            protectedWhites++;
          }

          // Lượng tử hóa màu nhẹ (Color quantization) giữ chất pixel art sắc sảo
          const pr = Math.round(r / 4) * 4;
          const pg = Math.round(g / 4) * 4;
          const pb = Math.round(b / 4) * 4;

          bgRgba[destIdx] = Math.min(255, pr);
          bgRgba[destIdx + 1] = Math.min(255, pg);
          bgRgba[destIdx + 2] = Math.min(255, pb);
          bgRgba[destIdx + 3] = 255;

          // Nhận diện cửa sổ & đèn phố:
          // Vàng ấm: R cao, G khá cao, B thấp
          // Hổ phách: R cao, G trung bình, B thấp
          // Cyan/Neon: B cao, G cao, R thấp
          // Đèn trắng sáng rực: R, G, B đều > 215
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

    // Lưu file background.png chuẩn kích thước 1920x520
    await sharp(bgRgba, { raw: { width: w, height: cropHeight, channels: 4 } })
      .resize(1920, 520, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'background.png'));

    // Lưu file background_lights.png
    await sharp(bgLightsRgba, { raw: { width: w, height: cropHeight, channels: 4 } })
      .resize(1920, 520, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'background_lights.png'));

    console.log(`   ✅ Đã xuất background.png & background_lights.png thành công!`);
  }

  // --- 2. XỬ LÝ MIDGROUND TRACK (ĐƯỜNG RAY TRUNG CẢNH) ---
  if (mgFile) {
    const mgInput = path.join(fullPath, mgFile);
    console.log(`🛤️ 2. Đang xử lý Midground Track: ${mgFile}...`);

    const img = sharp(mgInput);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Flood fill cho midground từ viền trên (y = 0) và viền đáy ngoài chân cầu
    const isMgBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0;
    let qTail = 0;

    function isWhiteOrNear(x, y) {
      const idx = (y * w + x) * info.channels;
      return (data[idx] >= 236 && data[idx + 1] >= 236 && data[idx + 2] >= 236);
    }

    // Seed top row
    for (let x = 0; x < w; x++) {
      if (isWhiteOrNear(x, 0)) {
        isMgBg[x] = 1;
        queue[qTail++] = x;
      }
    }

    // Seed bottom row (vùng trắng bên dưới chân cầu)
    for (let x = 0; x < w; x++) {
      if (isWhiteOrNear(x, h - 1) && !isMgBg[(h - 1) * w + x]) {
        isMgBg[(h - 1) * w + x] = 1;
        queue[qTail++] = (h - 1) * w + x;
      }
    }

    // BFS
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
          if (!isMgBg[nIdx] && isWhiteOrNear(nx, ny)) {
            isMgBg[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }
    }

    // Tìm bounding box của đường ray & chân cầu
    let mgFirstY = -1;
    let mgLastY = -1;
    for (let y = 0; y < h; y++) {
      let contentPixels = 0;
      for (let x = 0; x < w; x++) {
        if (!isMgBg[y * w + x]) contentPixels++;
      }
      if (contentPixels > w * 0.05 && mgFirstY === -1) mgFirstY = y;
      if (contentPixels > w * 0.05) mgLastY = y;
    }

    // Crop vừa vặn phần đường ray
    const cropTop = Math.max(0, mgFirstY - 40);
    const cropBottom = Math.min(h, mgLastY + 5);
    const cropHeight = cropBottom - cropTop;

    const mgRgba = Buffer.alloc(w * cropHeight * 4);

    for (let y = 0; y < cropHeight; y++) {
      const origY = cropTop + y;
      for (let x = 0; x < w; x++) {
        const srcIdx = (origY * w + x) * info.channels;
        const destIdx = (y * w + x) * 4;
        const isBg = isMgBg[origY * w + x];

        if (isBg) {
          mgRgba[destIdx + 3] = 0;
        } else {
          const r = data[srcIdx];
          const g = data[srcIdx + 1];
          const b = data[srcIdx + 2];

          mgRgba[destIdx] = Math.round(r / 4) * 4;
          mgRgba[destIdx + 1] = Math.round(g / 4) * 4;
          mgRgba[destIdx + 2] = Math.round(b / 4) * 4;
          mgRgba[destIdx + 3] = 255;
        }
      }
    }

    // Lưu midground_track.png chuẩn 1680x240 px
    await sharp(mgRgba, { raw: { width: w, height: cropHeight, channels: 4 } })
      .resize(1680, 240, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'midground_track.png'));

    console.log(`   ✅ Đã xuất midground_track.png thành công!`);
  }

  // Tự động quét lại toàn bộ assets để cập nhật danh sách Scenes & Trains vào hệ thống
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
    // Quét toàn bộ các thư mục trong public/assets/landscapes
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
