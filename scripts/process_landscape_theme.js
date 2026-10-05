import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { generateRegistryFiles, createDefaultLandscapeMeta } from './scan_assets.js';

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
  return diff <= 12;
}

// Hàm kiểm tra pixel có phải màu đen / gần đen thuần khiết không
function isFullBlackPixel(r, g, b, threshold = 24) {
  if (r > threshold || g > threshold || b > threshold) return false;
  const diff = Math.max(r, g, b) - Math.min(r, g, b);
  return diff <= 14;
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

  // Tìm file foreground (tiền cảnh)
  const fgFile = files.find(f => /^foreground\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /^(fg|tiencanh|prop|props)\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /(foreground|tiencanh)/i.test(f) && /\.(jpg|jpeg|webp)$/i.test(f));

  // Tìm file midground track
  const mgFile = files.find(f => /^midground\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /^(track|rail|trungcanh)\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /(midground|track|rail|trungcanh)/i.test(f) && /\.(jpg|jpeg|webp)$/i.test(f));

  // Tìm file background
  const bgFile = files.find(f => /^background\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /^(bg|haucang)\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /(skyline|panorama|background)/i.test(f) && /\.(jpg|jpeg|webp)$/i.test(f)) ||
                 files.find(f => /\.(jpg|jpeg|webp)$/i.test(f) && !/(midground|track|rail|trungcanh|foreground|tiencanh|prop)/i.test(f));

  if (!bgFile && !mgFile && !fgFile) {
    console.log(`ℹ️ Không tìm thấy file JPG/JPEG nào cần xử lý trong ${path.basename(fullPath)}.`);
    return false;
  }

  // ==========================================================
  // --- 1. XỬ LÝ BACKGROUND (HẬU CẢNH PANORAMA BẦU TRỜI TRẮNG HOẶC ĐEN) ---
  // ==========================================================
  if (bgFile) {
    const bgInput = path.join(fullPath, bgFile);
    console.log(`🎨 1. Đang xử lý Background: ${bgFile}...`);

    const img = sharp(fs.readFileSync(bgInput));
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Tự động phân tích màu nền bầu trời: kiểm tra viền trên cùng (y = 0)
    let whiteSeedCount = 0;
    let blackSeedCount = 0;
    for (let x = 0; x < w; x++) {
      const idx = (0 * w + x) * info.channels;
      if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) whiteSeedCount++;
      if (isFullBlackPixel(data[idx], data[idx + 1], data[idx + 2])) blackSeedCount++;
    }

    const skyMode = blackSeedCount > whiteSeedCount ? 'black' : 'white';
    console.log(`   🌌 Chế độ nhận diện bầu trời: ${skyMode === 'black' ? 'MÀU ĐEN (#000000)' : 'MÀU TRẮNG (#FFFFFF)'} (Hạt giống Trắng: ${whiteSeedCount}, Đen: ${blackSeedCount})`);

    const isBgPixel = skyMode === 'black'
      ? (r, g, b) => isFullBlackPixel(r, g, b, 24)
      : (r, g, b) => isFullWhitePixel(r, g, b, 240);

    // Mảng đánh dấu pixel nền ngoài trời (1: nền bầu trời bên ngoài, 0: tác phẩm nghệ thuật)
    const isOutdoorBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;

    // Hạt giống (Seeds): Viền trên cùng (y = 0)
    for (let x = 0; x < w; x++) {
      const idx = (0 * w + x) * info.channels;
      if (isBgPixel(data[idx], data[idx + 1], data[idx + 2])) {
        isOutdoorBg[x] = 1;
        queue[qTail++] = x;
      }
    }

    // Hạt giống: Viền trái và phải nửa trên (y = 0 -> 65% h)
    const seedH = Math.floor(h * 0.65);
    for (let y = 0; y < seedH; y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isBgPixel(data[lIdx], data[lIdx + 1], data[lIdx + 2]) && !isOutdoorBg[y * w + 0]) {
        isOutdoorBg[y * w + 0] = 1;
        queue[qTail++] = (y * w + 0);
      }
      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isBgPixel(data[rIdx], data[rIdx + 1], data[rIdx + 2]) && !isOutdoorBg[y * w + (w - 1)]) {
        isOutdoorBg[y * w + (w - 1)] = 1;
        queue[qTail++] = (y * w + (w - 1));
      }
    }

    // Hạt giống: Viền dưới đáy (chỉ áp dụng nếu nền là màu trắng và đáy có khoảng trắng dư thừa)
    if (skyMode === 'white') {
      for (let x = 0; x < w; x++) {
        const bIdx = ((h - 1) * w + x) * info.channels;
        if (isFullWhitePixel(data[bIdx], data[bIdx + 1], data[bIdx + 2]) && !isOutdoorBg[(h - 1) * w + x]) {
          isOutdoorBg[(h - 1) * w + x] = 1;
          queue[qTail++] = ((h - 1) * w + x);
        }
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
            if (isBgPixel(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2])) {
              isOutdoorBg[nIdx] = 1;
              queue[qTail++] = nIdx;
            }
          }
        }
      }
    }

    // Lấy TOÀN BỘ HÌNH ẢNH (100% Canvas, KHÔNG CẮT BẤT KỲ PHẦN NÀO)
    // Tách sạch bầu trời bằng BFS Flood Fill, bảo vệ toàn bộ chi tiết nội cảnh
    console.log(`   🖼️ Đang xử lý toàn bộ hình ảnh gốc: ${w}px x ${h}px (KHÔNG CẮT XÉN BẤT KỲ PHẦN NÀO)`);

    const bgFullRgba = Buffer.alloc(w * h * 4);
    const bgLightsFullRgba = Buffer.alloc(w * h * 4);

    let protectedDetails = 0;
    let lightsCount = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const srcIdx = (y * w + x) * info.channels;
        const destIdx = (y * w + x) * 4;
        const isBg = isOutdoorBg[y * w + x];

        const r = data[srcIdx];
        const g = data[srcIdx + 1];
        const b = data[srcIdx + 2];

        if (isBg) {
          // Bầu trời ngoài trời -> 100% Trong suốt
          bgFullRgba[destIdx + 3] = 0;
          bgLightsFullRgba[destIdx + 3] = 0;
        } else {
          if (skyMode === 'white' && r >= 240 && g >= 240 && b >= 240) {
            protectedDetails++;
          } else if (skyMode === 'black' && r <= 25 && g <= 25 && b <= 25) {
            protectedDetails++;
          }

          // Khử viền (Anti-Halo Defringe): Nếu pixel tiếp giáp với nền và gần màu nền bị loang do nén JPEG
          let isBorderPixel = false;
          if (y > 0 && isOutdoorBg[(y - 1) * w + x]) isBorderPixel = true;
          else if (y < h - 1 && isOutdoorBg[(y + 1) * w + x]) isBorderPixel = true;
          else if (x > 0 && isOutdoorBg[y * w + (x - 1)]) isBorderPixel = true;
          else if (x < w - 1 && isOutdoorBg[y * w + (x + 1)]) isBorderPixel = true;

          if (isBorderPixel) {
            if (skyMode === 'white' && r > 230 && g > 230 && b > 230) {
              bgFullRgba[destIdx + 3] = 0;
              bgLightsFullRgba[destIdx + 3] = 0;
              continue;
            }
            if (skyMode === 'black' && r < 30 && g < 30 && b < 30) {
              bgFullRgba[destIdx + 3] = 0;
              bgLightsFullRgba[destIdx + 3] = 0;
              continue;
            }
          }

          // Lượng tử hóa màu nhẹ (Pixel art color quantization)
          bgFullRgba[destIdx] = Math.min(255, Math.round(r / 4) * 4);
          bgFullRgba[destIdx + 1] = Math.min(255, Math.round(g / 4) * 4);
          bgFullRgba[destIdx + 2] = Math.min(255, Math.round(b / 4) * 4);
          bgFullRgba[destIdx + 3] = 255;

          // Trích xuất đèn đêm & bảo tồn 100% màu gốc (không ép màu, giữ nguyên màu nghệ sĩ vẽ):
          const isWarmYellow = (r > 195 && g > 165 && b < 145);
          const isAmber = (r > 200 && g > 125 && b < 85);
          const isCyan = (b > 175 && g > 160 && r < 140);
          const isLanternRed = (r > 170 && r > g * 1.3 && r > b * 1.3);
          const isBrightWindow = (r > 215 && g > 210 && b > 200 && (r - b > 8 || y > h * 0.25));

          if (isWarmYellow || isAmber || isCyan || isLanternRed || isBrightWindow) {
            lightsCount++;
            // Giữ nguyên 100% màu gốc của bức tranh
            bgLightsFullRgba[destIdx] = r;
            bgLightsFullRgba[destIdx + 1] = g;
            bgLightsFullRgba[destIdx + 2] = b;
            bgLightsFullRgba[destIdx + 3] = 255;
          } else {
            bgLightsFullRgba[destIdx + 3] = 0;
          }
        }
      }
    }

    console.log(`   🛡️ Đã bảo vệ ${protectedDetails.toLocaleString()} pixel chi tiết nội cảnh không bị cắt nhầm!`);
    console.log(`   ✨ Đã trích xuất ${lightsCount.toLocaleString()} bóng đèn đêm cho background_lights.png!`);

    // Scale TOÀN BỘ bức tranh theo tỉ lệ chuẩn chiều ngang 1920px (giữ 100% tỉ lệ gốc, không méo hình, không cắt xén)
    const targetW = 1920;
    const targetH = Math.round(h * (targetW / w));

    console.log(`   📐 Đang scale toàn bộ bức tranh về kích thước: ${targetW}px x ${targetH}px (tỷ lệ gốc nguyên vẹn)`);

    // Lưu background.png
    await sharp(bgFullRgba, { raw: { width: w, height: h, channels: 4 } })
      .resize(targetW, targetH, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'background.png'));

    // Lưu background_lights_raw.png (bản sao đèn sắc nét gốc)
    const rawLightsBuffer = await sharp(bgLightsFullRgba, { raw: { width: w, height: h, channels: 4 } })
      .resize(targetW, targetH, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await fs.promises.writeFile(path.join(fullPath, 'background_lights_raw.png'), rawLightsBuffer);

    // Pre-bake multi-tier glow vào background_lights.png để tối ưu 60 FPS (không cần CSS filter: drop-shadow)
    const wideGlow = await sharp(rawLightsBuffer).blur(14).toBuffer();
    const midGlow = await sharp(rawLightsBuffer).blur(5).toBuffer();
    const tightGlow = await sharp(rawLightsBuffer).blur(2).toBuffer();

    await sharp(wideGlow)
      .composite([
        { input: midGlow, blend: 'screen' },
        { input: tightGlow, blend: 'screen' },
        { input: rawLightsBuffer, blend: 'over' },
      ])
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'background_lights.png'));

    console.log(`   ✅ Đã xuất background.png & background_lights.png (với hiệu ứng Glow pre-render sẵn) thành công!`);
  }

  // =======================================================================
  // --- 2. XỬ LÝ MIDGROUND (KHÔNG CẮT NGANG, SCALE DỌC, NỐI NGANG NHIỀU HÌNH) ---
  // =======================================================================
  if (mgFile) {
    const mgInput = path.join(fullPath, mgFile);
    console.log(`🛤️ 2. Đang xử lý Midground Track: ${mgFile}...`);

    const img = sharp(fs.readFileSync(mgInput));
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Tự động phân tích màu nền của Midground (trên thanh ray)
    let mgWhiteSeed = 0;
    let mgBlackSeed = 0;
    for (let x = 0; x < w; x++) {
      const idx = (0 * w + x) * info.channels;
      if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) mgWhiteSeed++;
      if (isFullBlackPixel(data[idx], data[idx + 1], data[idx + 2])) mgBlackSeed++;
    }
    const mgSkyMode = mgBlackSeed > mgWhiteSeed ? 'black' : 'white';
    const isMgBgPixel = mgSkyMode === 'black'
      ? (r, g, b) => isFullBlackPixel(r, g, b, 24)
      : (r, g, b) => isFullWhitePixel(r, g, b, 240);

    // Flood fill tách nền phía trên thanh ray từ viền trên cùng (y = 0)
    const isMgBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;

    for (let x = 0; x < w; x++) {
      const idx = (0 * w + x) * info.channels;
      if (isMgBgPixel(data[idx], data[idx + 1], data[idx + 2])) {
        isMgBg[x] = 1;
        queue[qTail++] = x;
      }
    }

    // Viền trái & phải trên ray
    for (let y = 0; y < Math.floor(h * 0.7); y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isMgBgPixel(data[lIdx], data[lIdx + 1], data[lIdx + 2]) && !isMgBg[y * w + 0]) {
        isMgBg[y * w + 0] = 1;
        queue[qTail++] = (y * w + 0);
      }
      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isMgBgPixel(data[rIdx], data[rIdx + 1], data[rIdx + 2]) && !isMgBg[y * w + (w - 1)]) {
        isMgBg[y * w + (w - 1)] = 1;
        queue[qTail++] = (y * w + (w - 1));
      }
    }

    // Hạt giống: Viền dưới đáy (nếu nền là trắng và ảnh có dải trắng dư phía dưới ray)
    if (mgSkyMode === 'white') {
      for (let x = 0; x < w; x++) {
        const bIdx = ((h - 1) * w + x) * info.channels;
        if (isFullWhitePixel(data[bIdx], data[bIdx + 1], data[bIdx + 2]) && !isMgBg[(h - 1) * w + x]) {
          isMgBg[(h - 1) * w + x] = 1;
          queue[qTail++] = ((h - 1) * w + x);
        }
      }
    }

    // BFS loang nền
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
            if (isMgBgPixel(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2])) {
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

  // =======================================================================
  // --- 3. XỬ LÝ FOREGROUND (TIỀN CẢNH: CỘT ĐIỆN, DÂY ĐIỆN, BIỂN BÁO, PROPS) ---
  // =======================================================================
  if (fgFile) {
    const fgInput = path.join(fullPath, fgFile);
    console.log(`⚡ 3. Đang xử lý Foreground: ${fgFile}...`);

    const img = sharp(fs.readFileSync(fgInput));
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;

    // Phân tích màu nền: Kiểm tra 4 viền xung quanh (trên, dưới, trái, phải)
    let whiteSeedCount = 0;
    let blackSeedCount = 0;

    for (let x = 0; x < w; x++) {
      const topIdx = (0 * w + x) * info.channels;
      if (isFullWhitePixel(data[topIdx], data[topIdx + 1], data[topIdx + 2])) whiteSeedCount++;
      if (isFullBlackPixel(data[topIdx], data[topIdx + 1], data[topIdx + 2])) blackSeedCount++;

      const botIdx = ((h - 1) * w + x) * info.channels;
      if (isFullWhitePixel(data[botIdx], data[botIdx + 1], data[botIdx + 2])) whiteSeedCount++;
      if (isFullBlackPixel(data[botIdx], data[botIdx + 1], data[botIdx + 2])) blackSeedCount++;
    }

    for (let y = 0; y < h; y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isFullWhitePixel(data[lIdx], data[lIdx + 1], data[lIdx + 2])) whiteSeedCount++;
      if (isFullBlackPixel(data[lIdx], data[lIdx + 1], data[lIdx + 2])) blackSeedCount++;

      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isFullWhitePixel(data[rIdx], data[rIdx + 1], data[rIdx + 2])) whiteSeedCount++;
      if (isFullBlackPixel(data[rIdx], data[rIdx + 1], data[rIdx + 2])) blackSeedCount++;
    }

    const fgBgMode = blackSeedCount >= whiteSeedCount ? 'black' : 'white';
    console.log(`   🔍 Nhận diện màu nền Foreground: ${fgBgMode === 'black' ? 'MÀU ĐEN (#000000)' : 'MÀU TRẮNG (#FFFFFF)'} (Hạt giống Đen: ${blackSeedCount}, Trắng: ${whiteSeedCount})`);

    const isFgBgPixel = fgBgMode === 'black'
      ? (r, g, b) => isFullBlackPixel(r, g, b, 24)
      : (r, g, b) => isFullWhitePixel(r, g, b, 240);

    // BFS Flood Fill từ 4 viền để loại bỏ nền ngoài trời, bảo vệ toàn bộ chi tiết nội cảnh
    const isFgBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;

    // Hạt giống: Viền trên & dưới
    for (let x = 0; x < w; x++) {
      const topIdx = (0 * w + x) * info.channels;
      if (isFgBgPixel(data[topIdx], data[topIdx + 1], data[topIdx + 2])) {
        isFgBg[x] = 1;
        queue[qTail++] = x;
      }
      const botIdx = ((h - 1) * w + x) * info.channels;
      if (isFgBgPixel(data[botIdx], data[botIdx + 1], data[botIdx + 2]) && !isFgBg[(h - 1) * w + x]) {
        isFgBg[(h - 1) * w + x] = 1;
        queue[qTail++] = (h - 1) * w + x;
      }
    }

    // Hạt giống: Viền trái & phải
    for (let y = 0; y < h; y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isFgBgPixel(data[lIdx], data[lIdx + 1], data[lIdx + 2]) && !isFgBg[y * w + 0]) {
        isFgBg[y * w + 0] = 1;
        queue[qTail++] = y * w + 0;
      }
      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isFgBgPixel(data[rIdx], data[rIdx + 1], data[rIdx + 2]) && !isFgBg[y * w + (w - 1)]) {
        isFgBg[y * w + (w - 1)] = 1;
        queue[qTail++] = y * w + (w - 1);
      }
    }

    // BFS lan truyền
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
          if (!isFgBg[nIdx]) {
            const srcIdx = nIdx * info.channels;
            if (isFgBgPixel(data[srcIdx], data[srcIdx + 1], data[srcIdx + 2])) {
              isFgBg[nIdx] = 1;
              queue[qTail++] = nIdx;
            }
          }
        }
      }
    }

    const fgRgba = Buffer.alloc(w * h * 4);
    const fgLightsRgba = Buffer.alloc(w * h * 4);
    let keptPixels = 0;
    let fgLightsCount = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const srcIdx = (y * w + x) * info.channels;
        const destIdx = (y * w + x) * 4;

        if (isFgBg[y * w + x]) {
          fgRgba[destIdx + 3] = 0;
          fgLightsRgba[destIdx + 3] = 0;
        } else {
          const r = data[srcIdx];
          const g = data[srcIdx + 1];
          const b = data[srcIdx + 2];

          // Khử viền 1px (Anti-Halo Defringe)
          let isBorder = false;
          if (y > 0 && isFgBg[(y - 1) * w + x]) isBorder = true;
          else if (y < h - 1 && isFgBg[(y + 1) * w + x]) isBorder = true;
          else if (x > 0 && isFgBg[y * w + (x - 1)]) isBorder = true;
          else if (x < w - 1 && isFgBg[y * w + (x + 1)]) isBorder = true;

          if (isBorder) {
            if (fgBgMode === 'black' && r < 30 && g < 30 && b < 30) {
              fgRgba[destIdx + 3] = 0;
              fgLightsRgba[destIdx + 3] = 0;
              continue;
            }
            if (fgBgMode === 'white' && r > 230 && g > 230 && b > 230) {
              fgRgba[destIdx + 3] = 0;
              fgLightsRgba[destIdx + 3] = 0;
              continue;
            }
          }

          // Lượng tử hóa màu pixel art
          fgRgba[destIdx] = Math.min(255, Math.round(r / 4) * 4);
          fgRgba[destIdx + 1] = Math.min(255, Math.round(g / 4) * 4);
          fgRgba[destIdx + 2] = Math.min(255, Math.round(b / 4) * 4);
          fgRgba[destIdx + 3] = 255;
          keptPixels++;

          // Tách ánh sáng đèn đêm (đèn đường, lồng đèn, đèn tín hiệu)
          const isWarmLight = (r > 200 && g > 160 && b < 140);
          const isLanternRed = (r > 180 && r > g * 1.3 && r > b * 1.3);
          const isSignalGreen = (g > 180 && g > r * 1.2 && g > b * 1.2);
          const isBrightWindow = (r > 220 && g > 215 && b > 190);

          if (isWarmLight || isLanternRed || isSignalGreen || isBrightWindow) {
            fgLightsCount++;
            fgLightsRgba[destIdx] = r;
            fgLightsRgba[destIdx + 1] = g;
            fgLightsRgba[destIdx + 2] = b;
            fgLightsRgba[destIdx + 3] = 255;
          } else {
            fgLightsRgba[destIdx + 3] = 0;
          }
        }
      }
    }

    console.log(`   🛡️ Đã giữ lại ${keptPixels.toLocaleString()} pixel chi tiết tiền cảnh sắc nét!`);

    // Chuẩn hóa kích thước
    // Nếu ảnh rộng (>= 1200px hoặc tỷ lệ ngang >= 1.5): scale chuẩn 1920px
    const targetW = w >= 1200 || (w / h) >= 1.5 ? 1920 : w;
    const targetH = w >= 1200 || (w / h) >= 1.5 ? Math.round(h * (targetW / w)) : h;

    console.log(`   📐 Đang lưu foreground.png kích thước: ${targetW}px x ${targetH}px`);

    await sharp(fgRgba, { raw: { width: w, height: h, channels: 4 } })
      .resize(targetW, targetH, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(path.join(fullPath, 'foreground.png'));

    // Nếu có đèn đêm trên tiền cảnh, tạo foreground_lights.png với glow nhẹ
    if (fgLightsCount > 50) {
      console.log(`   ✨ Phát hiện ${fgLightsCount.toLocaleString()} pixel đèn tiền cảnh -> Đang tạo foreground_lights.png...`);
      const rawFgLights = await sharp(fgLightsRgba, { raw: { width: w, height: h, channels: 4 } })
        .resize(targetW, targetH, { kernel: 'nearest' })
        .png({ compressionLevel: 9 })
        .toBuffer();

      const fgGlow = await sharp(rawFgLights).blur(6).toBuffer();
      await sharp(fgGlow)
        .composite([{ input: rawFgLights, blend: 'over' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(fullPath, 'foreground_lights.png'));
    }

    console.log(`   ✅ Đã xuất foreground.png thành công!`);
  }

  // Tự động tạo meta.json nếu địa điểm mới chưa có
  const metaPath = path.join(fullPath, 'meta.json');
  if (!fs.existsSync(metaPath)) {
    const dirName = path.basename(fullPath);
    const defaultMeta = createDefaultLandscapeMeta(dirName);
    try {
      fs.writeFileSync(metaPath, JSON.stringify(defaultMeta, null, 2), 'utf-8');
      console.log(`✨ [Auto Meta Generator] Đã tự động tạo file meta.json mặc định cho: ${dirName}`);
    } catch (err) {
      console.warn(`⚠️ Không thể tạo meta.json:`, err.message);
    }
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
