import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Công cụ tự động bóc tách Spritesheet / Template nhiều mẫu trên nền đen (hoặc trắng):
 * - Hỗ trợ tách hàng loạt mẫu vật thể (mây, chim, cây, xe, v.v.) nằm rải rác trên cùng 1 ảnh.
 * - Tự động nhận diện ranh giới từng cụm (Connected Component + Proximity Merging).
 * - Tách nền đen thành trong suốt (Transparent PNG), khử sạch viền đen (Defringe).
 * - Lưu từng mẫu thành file riêng biệt đã được crop sát biên (Tight Bounding Box).
 */

// Hàm kiểm tra pixel nền đen
function isBlackBg(r, g, b, threshold = 28) {
  return r <= threshold && g <= threshold && b <= threshold;
}

export async function sliceSpritesheet(inputImagePath, outputDir, options = {}) {
  const {
    prefix = 'sprite',
    blackThreshold = 28,
    minArea = 400, // Bỏ qua các đốm nhiễu nhỏ hơn 400 px
    proximityGap = 20, // Gộp các phần tử cách nhau dưới N pixel thành 1 mẫu hoàn chỉnh
    defringe = true,
  } = options;

  const fullInputPath = path.resolve(inputImagePath);
  const fullOutputDir = path.resolve(outputDir);

  if (!fs.existsSync(fullInputPath)) {
    console.error(`❌ File ảnh không tồn tại: ${fullInputPath}`);
    return [];
  }

  if (!fs.existsSync(fullOutputDir)) {
    fs.mkdirSync(fullOutputDir, { recursive: true });
  }

  console.log(`\n======================================================`);
  console.log(`🖼️ Đang bóc tách Spritesheet: ${path.basename(fullInputPath)}`);
  console.log(`📂 Thư mục xuất: ${fullOutputDir}`);
  console.log(`======================================================`);

  const img = sharp(fs.readFileSync(fullInputPath));
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  console.log(`📏 Kích thước ảnh gốc: ${w}x${h} (${ch} channels)`);

  // 1. Phân loại pixel: 1 là sprite, 0 là nền đen
  const isSprite = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * ch];
    const g = data[i * ch + 1];
    const b = data[i * ch + 2];
    if (!isBlackBg(r, g, b, blackThreshold)) {
      isSprite[i] = 1;
    }
  }

  // 2. Co dãn lưới (Grid Downsample) để nhóm cụm nhanh và chính xác
  // Dùng ô lưới gridCell x gridCell (ví dụ 8x8)
  const cell = 8;
  const gw = Math.ceil(w / cell);
  const gh = Math.ceil(h / cell);
  const grid = new Uint8Array(gw * gh);

  for (let y = 0; y < h; y++) {
    const gy = Math.floor(y / cell);
    for (let x = 0; x < w; x++) {
      if (isSprite[y * w + x]) {
        const gx = Math.floor(x / cell);
        grid[gy * gw + gx] = 1;
      }
    }
  }

  // Dilation nhẹ trên grid để nối các đốm mây vụn gần nhau (trong bán kính proximityGap)
  const dilateRadius = Math.max(1, Math.round(proximityGap / cell));
  const dilatedGrid = new Uint8Array(gw * gh);

  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      if (grid[gy * gw + gx]) {
        for (let dy = -dilateRadius; dy <= dilateRadius; dy++) {
          const ny = gy + dy;
          if (ny < 0 || ny >= gh) continue;
          for (let dx = -dilateRadius; dx <= dilateRadius; dx++) {
            const nx = gx + dx;
            if (nx < 0 || nx >= gw) continue;
            dilatedGrid[ny * gw + nx] = 1;
          }
        }
      }
    }
  }

  // 3. Connected Component Labeling trên dilatedGrid
  const visited = new Uint8Array(gw * gh);
  const rawClusters = [];

  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      const idx = gy * gw + gx;
      if (dilatedGrid[idx] && !visited[idx]) {
        let minGx = gx, maxGx = gx, minGy = gy, maxGy = gy;
        let cellCount = 0;
        const queue = [idx];
        visited[idx] = 1;

        while (queue.length > 0) {
          const curr = queue.pop();
          const cx = curr % gw;
          const cy = Math.floor(curr / gw);
          cellCount++;

          if (cx < minGx) minGx = cx;
          if (cx > maxGx) maxGx = cx;
          if (cy < minGy) minGy = cy;
          if (cy > maxGy) maxGy = cy;

          const neighbors = [
            cy > 0 ? (cy - 1) * gw + cx : -1,
            cy < gh - 1 ? (cy + 1) * gw + cx : -1,
            cx > 0 ? cy * gw + (cx - 1) : -1,
            cx < gw - 1 ? cy * gw + (cx + 1) : -1,
          ];

          for (const n of neighbors) {
            if (n !== -1 && dilatedGrid[n] && !visited[n]) {
              visited[n] = 1;
              queue.push(n);
            }
          }
        }

        // Đổi tọa độ grid sang tọa độ pixel gốc
        const minX = Math.max(0, minGx * cell);
        const maxX = Math.min(w - 1, (maxGx + 1) * cell - 1);
        const minY = Math.max(0, minGy * cell);
        const maxY = Math.min(h - 1, (maxGy + 1) * cell - 1);

        rawClusters.push({ minX, maxX, minY, maxY, cellCount });
      }
    }
  }

  console.log(`🔍 Tìm thấy ${rawClusters.length} vùng khả nghi.`);

  // 4. Tinh chỉnh Bounding Box thật bằng pixel gốc bên trong mỗi vùng
  const validSprites = [];

  for (const c of rawClusters) {
    let realMinX = w, realMaxX = 0, realMinY = h, realMaxY = 0;
    let pixelCount = 0;

    for (let y = c.minY; y <= c.maxY; y++) {
      for (let x = c.minX; x <= c.maxX; x++) {
        if (isSprite[y * w + x]) {
          pixelCount++;
          if (x < realMinX) realMinX = x;
          if (x > realMaxX) realMaxX = x;
          if (y < realMinY) realMinY = y;
          if (y > realMaxY) realMaxY = y;
        }
      }
    }

    if (pixelCount >= minArea && realMinX <= realMaxX && realMinY <= realMaxY) {
      const sw = realMaxX - realMinX + 1;
      const sh = realMaxY - realMinY + 1;
      // Bỏ qua các vệt quá nhỏ hoặc quá hẹp không phải mây
      if (sw >= 20 && sh >= 12) {
        validSprites.push({
          minX: realMinX,
          maxX: realMaxX,
          minY: realMinY,
          maxY: realMaxY,
          width: sw,
          height: sh,
          pixelCount,
        });
      }
    }
  }

  // Sắp xếp các mẫu từ trên xuống dưới, từ trái sang phải
  validSprites.sort((a, b) => {
    // Nếu chênh lệch Y lớn hơn 80px thì xếp theo Y
    if (Math.abs(a.minY - b.minY) > 80) {
      return a.minY - b.minY;
    }
    return a.minX - b.minX;
  });

  console.log(`✨ Đã lọc được ${validSprites.length} mẫu mây hợp lệ sau khi loại bỏ nhiễu!`);

  // 5. Cắt từng mẫu, tách nền đen thành trong suốt và lưu ra PNG
  const savedFiles = [];

  for (let i = 0; i < validSprites.length; i++) {
    const s = validSprites[i];
    const sw = s.width;
    const sh = s.height;

    // Buffer RGBA cho sprite đơn lẻ
    const spriteRgba = Buffer.alloc(sw * sh * 4);

    // BFS từ các cạnh của sprite box để chỉ xóa nền đen nối ra ngoài (ngoại cảnh)
    // Bảo vệ các chi tiết đen bên trong (nếu có)
    const isLocalOutdoor = new Uint8Array(sw * sh);
    const localQueue = new Int32Array(sw * sh);
    let qHead = 0, qTail = 0;

    for (let lx = 0; lx < sw; lx++) {
      // Top
      const gxTop = s.minX + lx;
      const gyTop = s.minY;
      const gIdxTop = (gyTop * w + gxTop) * ch;
      if (isBlackBg(data[gIdxTop], data[gIdxTop + 1], data[gIdxTop + 2], blackThreshold)) {
        isLocalOutdoor[0 * sw + lx] = 1;
        localQueue[qTail++] = 0 * sw + lx;
      }
      // Bottom
      const gyBot = s.maxY;
      const gIdxBot = (gyBot * w + gxTop) * ch;
      if (isBlackBg(data[gIdxBot], data[gIdxBot + 1], data[gIdxBot + 2], blackThreshold)) {
        isLocalOutdoor[(sh - 1) * sw + lx] = 1;
        localQueue[qTail++] = (sh - 1) * sw + lx;
      }
    }

    for (let ly = 0; ly < sh; ly++) {
      // Left
      const gxLeft = s.minX;
      const gyLeft = s.minY + ly;
      const gIdxLeft = (gyLeft * w + gxLeft) * ch;
      if (!isLocalOutdoor[ly * sw + 0] && isBlackBg(data[gIdxLeft], data[gIdxLeft + 1], data[gIdxLeft + 2], blackThreshold)) {
        isLocalOutdoor[ly * sw + 0] = 1;
        localQueue[qTail++] = ly * sw + 0;
      }
      // Right
      const gxRight = s.maxX;
      const gIdxRight = (gyLeft * w + gxRight) * ch;
      if (!isLocalOutdoor[ly * sw + (sw - 1)] && isBlackBg(data[gIdxRight], data[gIdxRight + 1], data[gIdxRight + 2], blackThreshold)) {
        isLocalOutdoor[ly * sw + (sw - 1)] = 1;
        localQueue[qTail++] = ly * sw + (sw - 1);
      }
    }

    while (qHead < qTail) {
      const curr = localQueue[qHead++];
      const cx = curr % sw;
      const cy = Math.floor(curr / sw);

      const neighbors = [
        cy > 0 ? (cy - 1) * sw + cx : -1,
        cy < sh - 1 ? (cy + 1) * sw + cx : -1,
        cx > 0 ? cy * sw + (cx - 1) : -1,
        cx < sw - 1 ? cy * sw + (cx + 1) : -1,
      ];

      for (const n of neighbors) {
        if (n === -1 || isLocalOutdoor[n]) continue;
        const nx = n % sw;
        const ny = Math.floor(n / sw);
        const gIdx = ((s.minY + ny) * w + (s.minX + nx)) * ch;
        if (isBlackBg(data[gIdx], data[gIdx + 1], data[gIdx + 2], blackThreshold)) {
          isLocalOutdoor[n] = 1;
          localQueue[qTail++] = n;
        }
      }
    }

    // Sao chép pixel và khử viền
    for (let ly = 0; ly < sh; ly++) {
      for (let lx = 0; lx < sw; lx++) {
        const lIdx = ly * sw + lx;
        const destIdx = lIdx * 4;
        const gx = s.minX + lx;
        const gy = s.minY + ly;
        const srcIdx = (gy * w + gx) * ch;

        if (isLocalOutdoor[lIdx]) {
          spriteRgba[destIdx + 3] = 0; // Trong suốt hoàn toàn
        } else {
          const r = data[srcIdx];
          const g = data[srcIdx + 1];
          const b = data[srcIdx + 2];

          // Defringe viền đen 1px
          if (defringe) {
            let isNearOutdoor = false;
            if (ly > 0 && isLocalOutdoor[(ly - 1) * sw + lx]) isNearOutdoor = true;
            else if (ly < sh - 1 && isLocalOutdoor[(ly + 1) * sw + lx]) isNearOutdoor = true;
            else if (lx > 0 && isLocalOutdoor[ly * sw + (lx - 1)]) isNearOutdoor = true;
            else if (lx < sw - 1 && isLocalOutdoor[ly * sw + (lx + 1)]) isNearOutdoor = true;

            if (isNearOutdoor && r < 45 && g < 45 && b < 45) {
              spriteRgba[destIdx + 3] = 0;
              continue;
            }
          }

          spriteRgba[destIdx] = r;
          spriteRgba[destIdx + 1] = g;
          spriteRgba[destIdx + 2] = b;
          spriteRgba[destIdx + 3] = 255;
        }
      }
    }

    // Đặt tên file theo thứ tự hoặc phân loại theo kích thước
    const num = String(i + 1).padStart(2, '0');
    let typeName = 'medium';
    if (sw >= 600 || sh >= 300) typeName = 'huge';
    else if (sw >= 350) typeName = 'large';
    else if (sw <= 150 && sh <= 80) typeName = 'tiny';
    else if (sw <= 250) typeName = 'small';

    const outFilename = `${prefix}_${num}_${typeName}.png`;
    const outPath = path.join(fullOutputDir, outFilename);

    await sharp(spriteRgba, { raw: { width: sw, height: sh, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    console.log(`   ☁️ [${num}/${validSprites.length}] ${outFilename} (${sw}x${sh}px, ${s.pixelCount.toLocaleString()} pixels)`);
    savedFiles.push(outPath);
  }

  console.log(`\n🎉 HOÀN TẤT BÓNG TÁCH ${savedFiles.length} MẪU SPRITE RA THƯ MỤC ${path.basename(fullOutputDir)}!\n`);
  return savedFiles;
}

// Chạy trực tiếp từ dòng lệnh
if (process.argv[1] && process.argv[1].endsWith('slice_black_bg_spritesheet.js')) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
=============================================================================
🛠️  SPRITESHEET AUTO-SLICER & BACKGROUND REMOVER (NỀN ĐEN / TRONG SUỐT)
=============================================================================
Công cụ tự động cắt hàng loạt mẫu sprite từ 1 bức ảnh tổng hợp nền đen:
- Tự động gom cụm các sprite rời rạc (Connected Component + Dilation).
- Tách nền đen thành trong suốt (Transparent PNG), khử viền đen (Defringe).
- Cắt sát biên viền (Tight Bounding Box), phân loại kích thước (huge/large/medium/small/tiny).

Cách sử dụng:
  node scripts/slice_black_bg_spritesheet.js [đường_dẫn_ảnh] [thư_mục_xuất] [tiền_tố_tên] [tùy_chọn]

Ví dụ:
  # Cắt ảnh mây template mặc định:
  npm run slice:clouds
  hoặc:
  node scripts/slice_black_bg_spritesheet.js "public/assets/sky/clouds/AaD1_zu2_4ZjPTvL17YG4Q-AaD1_zu214hL0QXKfRohHw.jpg" "public/assets/sky/clouds" cloud

  # Cắt template bất kỳ (chim chóc, cây cối, xe cộ,...):
  node scripts/slice_black_bg_spritesheet.js "public/assets/sky/flying/birds_sheet.jpg" "public/assets/sky/flying" bird

Tùy chọn:
  --threshold=N   Ngưỡng đen (mặc định 28)
  --minArea=N     Diện tích pixel tối thiểu để tránh hạt nhiễu (mặc định 400)
  --gap=N         Khoảng cách nối cụm sprite (mặc định 20)
=============================================================================
`);
    process.exit(0);
  }

  // Parse positional & flag args
  let input = 'public/assets/sky/clouds/AaD1_zu2_4ZjPTvL17YG4Q-AaD1_zu214hL0QXKfRohHw.jpg';
  let outDir = 'public/assets/sky/clouds';
  let prefix = 'cloud';
  const options = {};

  const positionals = [];
  for (const arg of args) {
    if (arg.startsWith('--threshold=')) {
      options.blackThreshold = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--minArea=')) {
      options.minArea = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--gap=')) {
      options.proximityGap = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--prefix=')) {
      prefix = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      positionals.push(arg);
    }
  }

  if (positionals[0]) input = positionals[0];
  if (positionals[1]) outDir = positionals[1];
  if (positionals[2]) prefix = positionals[2];

  options.prefix = prefix;
  sliceSpritesheet(input, outDir, options).catch(console.error);
}
