import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Tạo hiệu ứng ánh sáng tỏa sáng (Glow / Bloom) nhiều tầng cho ảnh đèn PNG:
 * - Tầng 1: Hào quang xa (Wide ambient aura) - bán kính ~14px
 * - Tầng 2: Vùng sáng tỏa vừa (Medium bloom) - bán kính ~5px
 * - Tầng 3: Quầng sáng gần (Tight glow) - bán kính ~2px
 * - Tầng 4: Lõi đèn gốc sắc nét (Crisp core lights)
 *
 * Kết quả: Một ảnh PNG duy nhất đã hòa trộn sẵn hiệu ứng phát sáng mượt mà,
 * trình duyệt chỉ cần render bằng `mix-blend-mode: screen` và điều chỉnh `opacity`
 * mà KHÔNG cần dùng CSS filter: drop-shadow đa tầng làm giảm FPS!
 */
export async function bakeGlowToImage(inputBuffer, options = {}) {
  const {
    wideBlur = 14,
    midBlur = 5,
    tightBlur = 2,
  } = options;

  // 1. Tầng hào quang xa (Wide aura)
  const wide = await sharp(inputBuffer)
    .blur(wideBlur)
    .toBuffer();

  // 2. Tầng tỏa sáng vừa (Medium bloom)
  const mid = await sharp(inputBuffer)
    .blur(midBlur)
    .toBuffer();

  // 3. Tầng quầng sáng gần (Tight glow)
  const tight = await sharp(inputBuffer)
    .blur(tightBlur)
    .toBuffer();

  // 4. Hòa trộn các tầng ánh sáng với nhau (Screen + Over)
  return await sharp(wide)
    .composite([
      { input: mid, blend: 'screen' },
      { input: tight, blend: 'screen' },
      { input: inputBuffer, blend: 'over' },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Xử lý tất cả các file đèn trong public/assets/landscapes
 */
async function processLandscapes() {
  const landscapesDir = path.resolve('public/assets/landscapes');
  if (!fs.existsSync(landscapesDir)) return;

  const dirs = fs.readdirSync(landscapesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`\n======================================================`);
  console.log(`✨ BẮT ĐẦU PRE-RENDER HIỆU ỨNG GLOW CHO PHONG CẢNH`);
  console.log(`======================================================`);

  for (const dir of dirs) {
    const dirPath = path.join(landscapesDir, dir);
    const lightsFile = path.join(dirPath, 'background_lights.png');
    const rawBackupFile = path.join(dirPath, 'background_lights_raw.png');

    if (!fs.existsSync(lightsFile)) continue;

    console.log(`\n🏙️ Đang xử lý đèn cho phong cảnh: ${dir}...`);

    // Lưu backup file gốc nếu chưa có
    if (!fs.existsSync(rawBackupFile)) {
      fs.copyFileSync(lightsFile, rawBackupFile);
      console.log(`   💾 Đã lưu bản sao nguyên gốc: background_lights_raw.png`);
    }

    const sourceFile = fs.existsSync(rawBackupFile) ? rawBackupFile : lightsFile;
    const rawBuffer = fs.readFileSync(sourceFile);

    const glowBuffer = await bakeGlowToImage(rawBuffer, {
      wideBlur: 14,
      midBlur: 5,
      tightBlur: 2,
    });

    fs.writeFileSync(lightsFile, glowBuffer);
    console.log(`   ✅ Đã bake thành công hiệu ứng glow rực rỡ vào: background_lights.png`);
  }
}

/**
 * Xử lý tất cả các file đèn tàu trong public/assets/trains/templates
 */
async function processTrains() {
  const trainsDir = path.resolve('public/assets/trains/templates');
  if (!fs.existsSync(trainsDir)) return;

  const dirs = fs.readdirSync(trainsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`\n======================================================`);
  console.log(`🚂 BẮT ĐẦU PRE-RENDER HIỆU ỨNG GLOW CHO ĐOÀN TÀU`);
  console.log(`======================================================`);

  for (const dir of dirs) {
    const dirPath = path.join(trainsDir, dir);
    const candidateFiles = ['train_lights_4car.png', 'train_lights_3car.png', 'train_lights.png'];
    const activeFileName = candidateFiles.find(f => fs.existsSync(path.join(dirPath, f)));
    if (!activeFileName) continue;

    const lightsFile = path.join(dirPath, activeFileName);
    const rawBackupFile = path.join(dirPath, activeFileName.replace('.png', '_raw.png'));

    console.log(`\n🚆 Đang xử lý đèn cho tàu: ${dir}...`);

    if (!fs.existsSync(rawBackupFile)) {
      fs.copyFileSync(lightsFile, rawBackupFile);
      console.log(`   💾 Đã lưu bản sao nguyên gốc: ${path.basename(rawBackupFile)}`);
    }

    const sourceFile = fs.existsSync(rawBackupFile) ? rawBackupFile : lightsFile;
    const rawBuffer = fs.readFileSync(sourceFile);

    // Đoàn tàu có kích thước pixel nhỏ hơn nên dùng blur tỉ lệ phù hợp (4px, 2px, 1px)
    const glowBuffer = await bakeGlowToImage(rawBuffer, {
      wideBlur: 5,
      midBlur: 2.5,
      tightBlur: 1.2,
    });

    fs.writeFileSync(lightsFile, glowBuffer);
    console.log(`   ✅ Đã bake thành công hiệu ứng glow ấm áp vào: train_lights_3car.png`);
  }
}

/**
 * Tạo chùm sáng đèn pha tròn & mềm (Round & Soft Headlight Beam PNG):
 * - Kích thước: 640px x 220px (Tỷ lệ hoàn hảo cho tiền cảnh đoàn tàu)
 * - Tọa độ tâm chóa đèn pha: (x0 = 36px, y0 = 110px)
 * - Đầu chùm sáng bo tròn hình vòm mềm mại, không có góc cạnh sắc nhọn
 */
export async function generateHeadlightBeam() {
  const width = 640;
  const height = 220;
  const x0 = 36;
  const y0 = 110;
  const maxRange = 560;

  const buffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - x0;
      const dy = y - y0;
      const distFromSource = Math.sqrt(dx * dx + dy * dy);

      // 1. Vầng sáng tròn ngay tại chóa đèn pha (Circular Bulb Flare)
      const bulbRadius = 38;
      let bulbIntensity = 0;
      if (distFromSource < bulbRadius) {
        const t = distFromSource / bulbRadius;
        bulbIntensity = Math.pow(1 - t, 1.6) * 0.98;
      }

      // 2. Chùm tia hình nón vòm tròn (Forward Parabolic Beam with Round Dome Cap)
      let beamIntensity = 0;
      let coreIntensity = 0;
      let auraIntensity = 0;

      if (dx >= -10) {
        const forwardD = Math.max(0, dx);
        const normD = forwardD / maxRange;

        if (normD <= 1.0) {
          let halfH = 16 + 82 * Math.pow(Math.min(1.0, normD / 0.72), 0.75);

          // Đầu chùm sáng bo tròn hình vòm mềm (Round dome front cap)
          if (normD > 0.72) {
            const capT = (normD - 0.72) / 0.28;
            const roundFactor = Math.sqrt(Math.max(0, 1 - capT * capT));
            halfH *= roundFactor;
          }

          const tiltY = normD * 6;
          const distY = Math.abs(dy - tiltY);

          // Tầng sáng chính
          if (distY <= halfH) {
            const yRatio = distY / halfH;
            const yFalloff = Math.cos((yRatio * Math.PI) / 2);
            const xFalloff = Math.pow(1 - normD, 0.82);
            beamIntensity = Math.pow(yFalloff, 1.45) * xFalloff * 0.78;
          }

          // Tầng lõi sáng rực trắng ngà
          let coreHalfH = 9 + 36 * Math.pow(Math.min(1.0, normD / 0.62), 0.65);
          if (normD > 0.62) {
            const capCoreT = (normD - 0.62) / 0.38;
            coreHalfH *= Math.sqrt(Math.max(0, 1 - capCoreT * capCoreT));
          }
          if (distY <= coreHalfH && normD <= 0.82) {
            const coreYRatio = distY / coreHalfH;
            const coreYFalloff = Math.cos((coreYRatio * Math.PI) / 2);
            const coreXFalloff = Math.pow(1 - normD / 0.82, 0.88);
            coreIntensity = Math.pow(coreYFalloff, 1.8) * coreXFalloff * 0.95;
          }

          // Tầng hào quang xa khuếch tán
          const auraHalfH = halfH * 1.38;
          if (distY <= auraHalfH) {
            const auraYRatio = distY / auraHalfH;
            const auraYFalloff = Math.cos((auraYRatio * Math.PI) / 2);
            const auraXFalloff = Math.pow(1 - normD, 0.55);
            auraIntensity = Math.pow(auraYFalloff, 2.0) * auraXFalloff * 0.38;
          }
        }
      }

      const totalIntensity = Math.min(1.0, bulbIntensity + beamIntensity + coreIntensity * 0.88 + auraIntensity);

      if (totalIntensity > 0.008) {
        const whiteMix = Math.min(1.0, (coreIntensity * 0.92 + bulbIntensity * 0.85));
        const r = 255;
        const g = Math.round(230 + 25 * whiteMix);
        const b = Math.round(130 + 115 * whiteMix);
        const a = Math.round(Math.min(255, totalIntensity * 255));

        buffer[idx] = r;
        buffer[idx + 1] = g;
        buffer[idx + 2] = b;
        buffer[idx + 3] = a;
      } else {
        buffer[idx + 3] = 0;
      }
    }
  }

  const finalPng = await sharp(buffer, { raw: { width, height, channels: 4 } })
    .blur(1.8)
    .png({ compressionLevel: 9 })
    .toBuffer();

  const outPath = path.resolve('public/assets/trains/headlight_beam.png');
  await fs.promises.writeFile(outPath, finalPng);
  console.log(`   ✨ Đã xuất chùm sáng đèn pha tròn & mềm: ${outPath} (${width}x${height})`);
}

async function run() {
  await processLandscapes();
  await processTrains();
  console.log(`\n💡 Đang tạo chùm sáng đèn pha tròn & mềm...`);
  await generateHeadlightBeam();
  console.log(`\n🎉 HOÀN TẤT PRE-RENDER TOÀN BỘ ÁNH SÁNG GLOW VÀO PNG!`);
}

run().catch(console.error);

