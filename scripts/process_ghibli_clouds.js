import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const CLOUDS_DIR = path.resolve('public/assets/sky/clouds');

function isBlack(r, g, b, threshold = 28) {
  return r <= threshold && g <= threshold && b <= threshold;
}

export async function processGhibliClouds() {
  const files = fs.readdirSync(CLOUDS_DIR)
    .filter(f => f.toLowerCase().startsWith('2d side view') && (f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')));

  console.log(`\n======================================================`);
  console.log(`☁️ ĐANG XỬ LÝ ${files.length} ASSET CLOUD MỚI`);
  console.log(`======================================================\n`);

  const results = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(CLOUDS_DIR, filename);
    const buf = fs.readFileSync(filePath);
    const img = sharp(buf);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h, channels: ch } = info;

    console.log(`[${i + 1}/${files.length}] Xử lý: ${filename.substring(0, 35)}... (${w}x${h})`);

    // 1. BFS Flood-Fill từ 4 cạnh ngoài cùng
    const isOutdoorBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;

    // Cạnh trên và cạnh dưới
    for (let x = 0; x < w; x++) {
      const topIdx = 0 * w + x;
      const tCh = topIdx * ch;
      if (isBlack(data[tCh], data[tCh + 1], data[tCh + 2])) {
        isOutdoorBg[topIdx] = 1;
        queue[qTail++] = topIdx;
      }

      const botIdx = (h - 1) * w + x;
      const bCh = botIdx * ch;
      if (isBlack(data[bCh], data[bCh + 1], data[bCh + 2]) && !isOutdoorBg[botIdx]) {
        isOutdoorBg[botIdx] = 1;
        queue[qTail++] = botIdx;
      }
    }

    // Cạnh trái và cạnh phải
    for (let y = 0; y < h; y++) {
      const leftIdx = y * w + 0;
      const lCh = leftIdx * ch;
      if (isBlack(data[lCh], data[lCh + 1], data[lCh + 2]) && !isOutdoorBg[leftIdx]) {
        isOutdoorBg[leftIdx] = 1;
        queue[qTail++] = leftIdx;
      }

      const rightIdx = y * w + (w - 1);
      const rCh = rightIdx * ch;
      if (isBlack(data[rCh], data[rCh + 1], data[rCh + 2]) && !isOutdoorBg[rightIdx]) {
        isOutdoorBg[rightIdx] = 1;
        queue[qTail++] = rightIdx;
      }
    }

    // BFS
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
        if (n !== -1 && !isOutdoorBg[n]) {
          const nCh = n * ch;
          if (isBlack(data[nCh], data[nCh + 1], data[nCh + 2])) {
            isOutdoorBg[n] = 1;
            queue[qTail++] = n;
          }
        }
      }
    }

    // 2. Tìm Bounding Box của đám mây và tạo buffer RGBA
    let minX = w, maxX = 0, minY = h, maxY = 0;
    const rgba = Buffer.alloc(w * h * 4);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const dIdx = idx * 4;
        const sIdx = idx * ch;

        if (isOutdoorBg[idx]) {
          rgba[dIdx + 3] = 0;
          continue;
        }

        const r = data[sIdx];
        const g = data[sIdx + 1];
        const b = data[sIdx + 2];

        // Khử viền đen (Defringe) nếu pixel tiếp giáp trực tiếp với nền ngoài trời
        let isNearBg = false;
        if (y > 0 && isOutdoorBg[(y - 1) * w + x]) isNearBg = true;
        else if (y < h - 1 && isOutdoorBg[(y + 1) * w + x]) isNearBg = true;
        else if (x > 0 && isOutdoorBg[y * w + (x - 1)]) isNearBg = true;
        else if (x < w - 1 && isOutdoorBg[y * w + (x + 1)]) isNearBg = true;

        if (isNearBg && r < 45 && g < 45 && b < 45) {
          rgba[dIdx + 3] = 0;
          continue;
        }

        // Nếu pixel mép có độ sáng thấp (do JPEG compression hòa trộn với nền đen),
        // khử viền đen bằng cách tính alpha mềm mại
        const maxVal = Math.max(r, g, b);
        let alpha = 255;
        if (isNearBg && maxVal < 90) {
          alpha = Math.round(Math.max(0, (maxVal - 35) / 55) * 255);
          if (alpha === 0) continue;
        }

        rgba[dIdx] = r;
        rgba[dIdx + 1] = g;
        rgba[dIdx + 2] = b;
        rgba[dIdx + 3] = alpha;

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    // 3. Thêm lề padding 2px an toàn và crop sát biên
    const pad = 2;
    minX = Math.max(0, minX - pad);
    maxX = Math.min(w - 1, maxX + pad);
    minY = Math.max(0, minY - pad);
    maxY = Math.min(h - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    console.log(`   ✂️ Bounding box: ${cropW}x${cropH} (từ ${minX},${minY})`);

    const croppedRgba = Buffer.alloc(cropW * cropH * 4);
    for (let cy = 0; cy < cropH; cy++) {
      const srcY = minY + cy;
      const srcRowStart = (srcY * w + minX) * 4;
      const destRowStart = cy * cropW * 4;
      rgba.copy(croppedRgba, destRowStart, srcRowStart, srcRowStart + cropW * 4);
    }

    // 4. Lưu thành file PNG trong suốt
    const num = String(i + 1).padStart(2, '0');
    const outFilename = `ghibli_cloud_${num}.png`;
    const outPath = path.join(CLOUDS_DIR, outFilename);

    await sharp(croppedRgba, { raw: { width: cropW, height: cropH, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    console.log(`   ✅ Đã tạo: ${outFilename} (${cropW}x${cropH}px)`);
    results.push({
      id: `ghibli_cloud_${num}`,
      filename: outFilename,
      path: `./assets/sky/clouds/${outFilename}`,
      width: cropW,
      height: cropH,
    });
  }

  console.log(`\n🎉 HOÀN THÀNH XỬ LÝ TOÀN BỘ ${results.length} CLOUD ASSETS!\n`);
  return results;
}

if (process.argv[1] && process.argv[1].endsWith('process_ghibli_clouds.js')) {
  processGhibliClouds().catch(console.error);
}
