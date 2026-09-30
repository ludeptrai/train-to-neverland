import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Tinh chỉnh chùm sáng đèn pha tròn & mềm (Refined Round & Soft Headlight Beam):
 * - Kích thước: 640px x 220px (Tỷ lệ hoàn hảo cho tiền cảnh đoàn tàu)
 * - Tọa độ tâm đèn pha: (x0 = 32px, y0 = 110px)
 * - Chiều dài tia chiếu: 560px
 * - Độ mở góc chùm sáng: mở rộng tự nhiên, đầu chùm sáng bo vòm tròn mềm mại
 * - Đáy chùm sáng: thoải nhẹ quét xuống mặt thanh ray
 * - Chuyển sắc: Lõi sáng trắng ấm -> Quầng sáng vàng ngà -> Vùng hào quang khuếch tán êm dịu
 */
export async function createRefinedHeadlightBeam() {
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
          // Chiều cao chùm sáng: nở dần từ 16px lên 95px
          // Cho phép mở rộng êm ái theo lũy thừa 0.75
          let halfH = 16 + 82 * Math.pow(Math.min(1.0, normD / 0.72), 0.75);

          // Đầu chùm sáng bo tròn hình vòm mềm (Round dome front cap)
          if (normD > 0.72) {
            const capT = (normD - 0.72) / 0.28; // 0 -> 1
            const roundFactor = Math.sqrt(Math.max(0, 1 - capT * capT));
            halfH *= roundFactor;
          }

          // Độ lệch trục: hơi chúc nhẹ xuống mặt ray 4px khi đi xa
          const tiltY = normD * 6;
          const distY = Math.abs(dy - tiltY);

          // Tầng sáng chính (Main soft beam)
          if (distY <= halfH) {
            const yRatio = distY / halfH;
            const yFalloff = Math.cos((yRatio * Math.PI) / 2); // Cosine bell mượt mà
            const xFalloff = Math.pow(1 - normD, 0.82);
            beamIntensity = Math.pow(yFalloff, 1.45) * xFalloff * 0.78;
          }

          // Tầng lõi sáng rực trắng ngà (Warm Core Beam)
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

          // Tầng hào quang xa khuếch tán (Wide Ambient Aura)
          const auraHalfH = halfH * 1.38;
          if (distY <= auraHalfH) {
            const auraYRatio = distY / auraHalfH;
            const auraYFalloff = Math.cos((auraYRatio * Math.PI) / 2);
            const auraXFalloff = Math.pow(1 - normD, 0.55);
            auraIntensity = Math.pow(auraYFalloff, 2.0) * auraXFalloff * 0.38;
          }
        }
      }

      // Tổng hợp độ sáng
      const totalIntensity = Math.min(1.0, bulbIntensity + beamIntensity + coreIntensity * 0.88 + auraIntensity);

      if (totalIntensity > 0.008) {
        // Tỷ lệ trắng ngà tại lõi vs vàng mật ong ở viền
        const whiteMix = Math.min(1.0, (coreIntensity * 0.92 + bulbIntensity * 0.85));

        // Màu vàng ngà ấm: R=255, G=232, B=130
        // Màu trắng tinh khôi: R=255, G=255, B=245
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

  // Khử răng cưa & làm mịn biên bằng Gaussian Blur 1.8px
  const finalPng = await sharp(buffer, { raw: { width, height, channels: 4 } })
    .blur(1.8)
    .png({ compressionLevel: 9 })
    .toBuffer();

  const outPath = path.resolve('public/assets/trains/headlight_beam.png');
  await fs.promises.writeFile(outPath, finalPng);
  console.log(`✨ Đã tạo chùm sáng đèn pha tinh chỉnh: ${outPath} (${width}x${height})`);

  // Tạo thêm ảnh demo kiểm tra trên nền đêm tối
  const darkCanvas = await sharp({
    create: {
      width: 700,
      height: 280,
      channels: 4,
      background: { r: 12, g: 18, b: 32, alpha: 1 }
    }
  })
  .composite([
    { input: finalPng, top: 30, left: 30 }
  ])
  .png()
  .toBuffer();

  await fs.promises.writeFile('scratch/preview_headlight_night.png', darkCanvas);
  console.log(`🖼️ Đã lưu ảnh xem trước trên nền đêm: scratch/preview_headlight_night.png`);
}

createRefinedHeadlightBeam();
