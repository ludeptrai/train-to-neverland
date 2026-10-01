import React, { useEffect, useRef } from 'react';

export type PixelCelestialType = 'dawn' | 'day' | 'sunset' | 'night';

interface PixelSunProps {
  time: PixelCelestialType;
  className?: string;
  style?: React.CSSProperties;
}

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export const PixelSun: React.FC<PixelSunProps> = ({ time, className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    let width = 160;
    let height = 135;

    if (time === 'day') {
      width = 96;
      height = 96;
    } else if (time === 'night') {
      width = 64;
      height = 64;
    }

    canvas.width = width;
    canvas.height = height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const setPixel = (x: number, y: number, r: number, g: number, b: number, a = 255) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = (y * width + x) * 4;
      if (a < 255) {
        const bgA = data[idx + 3] / 255;
        const alpha = a / 255;
        const outA = alpha + bgA * (1 - alpha);
        if (outA > 0) {
          data[idx] = Math.round((r * alpha + data[idx] * bgA * (1 - alpha)) / outA);
          data[idx + 1] = Math.round((g * alpha + data[idx + 1] * bgA * (1 - alpha)) / outA);
          data[idx + 2] = Math.round((b * alpha + data[idx + 2] * bgA * (1 - alpha)) / outA);
          data[idx + 3] = Math.round(outA * 255);
        }
      } else {
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    };

    if (time === 'sunset') {
      // =====================================================================
      // 1. HOÀNG HÔN (SUNSET) - GIANT WARM SUNSET SUN WITH CONCENTRIC DITHERED
      // HALO AND HORIZONTAL PIXEL CLOUD STRATA (REFERENCE ARTWORK REPLICA)
      // =====================================================================
      const cx = width / 2;
      const cy = 96;
      const r = 40;

      // Concentric Halo Bands & Bayer Dithering
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist > r && dist <= r + 40) {
            const t = (dist - r) / 40;
            const bVal = (BAYER_4X4[Math.abs(y) % 4][Math.abs(x) % 4] + 0.5) / 16;
            if (dist <= r + 16) {
              // Inner warm coral-peach halo
              if (dist >= r + 14.5 && dist <= r + 16) {
                setPixel(x, y, 255, 150, 115, 220);
              } else {
                setPixel(x, y, 255, 145, 115, Math.round(180 * (1 - t * 0.4)));
              }
            } else if (dist <= r + 28) {
              // Mid rose halo with dithering
              if (bVal > (t - 0.4) * 1.4) {
                setPixel(x, y, 245, 95, 130, Math.round(150 * (1 - t * 0.7)));
              }
            } else {
              // Outer magenta-pink stippled aura
              if (bVal > (t - 0.5) * 1.8) {
                setPixel(x, y, 230, 70, 125, Math.round(100 * (1 - t)));
              }
            }
          }
        }
      }

      // Sun Disc with Pixel-stepped Rim
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist <= r) {
            if (dist >= r - 1.5) {
              // Stepped cream rim highlight
              setPixel(x, y, 255, 252, 235, 255);
            } else {
              // Golden yellow to warm apricot-coral gradient
              const normY = (y - (cy - r)) / (r * 2);
              const red = 255;
              const green = Math.round(220 - normY * 70);
              const blue = Math.round(125 - normY * 60);
              setPixel(x, y, red, green, blue, 255);
            }
          }
        }
      }

      // Layered Pixel Cloud Strata
      const cBody = [225, 65, 112];
      const cHi = [255, 160, 185];
      const cShadow = [175, 40, 90];

      const drawPuffyCloud = (
        baseY: number,
        h: number,
        x0: number,
        x1: number,
        bumps: Array<[number, number, number]> = []
      ) => {
        for (let x = x0; x <= x1; x++) {
          let extra = 0;
          for (const [bx, bw, bh] of bumps) {
            if (x >= x0 + bx && x < x0 + bx + bw) {
              extra = Math.max(extra, bh);
            }
          }
          const topY = baseY - extra;
          const botY = baseY + h;
          for (let y = topY; y <= botY; y++) {
            if (y === topY) {
              setPixel(x, y, cHi[0], cHi[1], cHi[2], 255);
            } else if (y >= botY - 1 && extra > 0) {
              setPixel(x, y, cShadow[0], cShadow[1], cShadow[2], 255);
            } else {
              setPixel(x, y, cBody[0], cBody[1], cBody[2], 255);
            }
          }
        }
      };

      // 1. Slender high streak across upper-mid sun
      drawPuffyCloud(cy + 6, 2, cx - 12, cx + 54, [[10, 18, 1], [34, 12, 1]]);
      // 2. Mid streak across center-lower sun
      drawPuffyCloud(cy + 17, 3, cx - 62, cx + 38, [[14, 16, 2], [35, 22, 3], [65, 18, 2]]);
      // 3. Lower billowing cloud terrace
      drawPuffyCloud(cy + 27, 5, cx - 76, cx + 72, [[8, 20, 3], [32, 28, 5], [64, 30, 4], [98, 22, 2]]);
      // 4. Horizon thick cloud bank
      drawPuffyCloud(cy + 36, 12, 0, width - 1, [[15, 25, 3], [45, 35, 5], [85, 40, 4], [130, 25, 3]]);

    } else if (time === 'dawn') {
      // =====================================================================
      // 2. BÌNH MINH (DAWN) - LUMINOUS MORNING SUN WITH GENTLE PEACH-ROSE
      // HALO AND MISTY HORIZON CLOUDS
      // =====================================================================
      const cx = width / 2;
      const cy = 96;
      const r = 38;

      // Soft Morning Twilight Halos
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist > r && dist <= r + 38) {
            const t = (dist - r) / 38;
            const bVal = (BAYER_4X4[Math.abs(y) % 4][Math.abs(x) % 4] + 0.5) / 16;
            if (dist <= r + 15) {
              if (dist >= r + 13.5 && dist <= r + 15) {
                setPixel(x, y, 255, 195, 175, 220);
              } else {
                setPixel(x, y, 255, 190, 170, Math.round(180 * (1 - t * 0.4)));
              }
            } else if (dist <= r + 26) {
              if (bVal > (t - 0.4) * 1.4) {
                setPixel(x, y, 215, 130, 175, Math.round(140 * (1 - t * 0.7)));
              }
            } else {
              if (bVal > (t - 0.5) * 1.8) {
                setPixel(x, y, 175, 100, 155, Math.round(95 * (1 - t)));
              }
            }
          }
        }
      }

      // Morning Sun Disc
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist <= r) {
            if (dist >= r - 1.5) {
              setPixel(x, y, 255, 255, 245, 255);
            } else {
              const normY = (y - (cy - r)) / (r * 2);
              const red = 255;
              const green = Math.round(244 - normY * 46);
              const blue = Math.round(215 - normY * 75);
              setPixel(x, y, red, green, blue, 255);
            }
          }
        }
      }

      // Morning Mist Cloud Streaks
      const cBody = [148, 85, 132];
      const cHi = [248, 185, 215];
      const cShadow = [110, 60, 102];

      const drawPuffyCloud = (
        baseY: number,
        h: number,
        x0: number,
        x1: number,
        bumps: Array<[number, number, number]> = []
      ) => {
        for (let x = x0; x <= x1; x++) {
          let extra = 0;
          for (const [bx, bw, bh] of bumps) {
            if (x >= x0 + bx && x < x0 + bx + bw) {
              extra = Math.max(extra, bh);
            }
          }
          const topY = baseY - extra;
          const botY = baseY + h;
          for (let y = topY; y <= botY; y++) {
            if (y === topY) {
              setPixel(x, y, cHi[0], cHi[1], cHi[2], 255);
            } else if (y >= botY - 1 && extra > 0) {
              setPixel(x, y, cShadow[0], cShadow[1], cShadow[2], 255);
            } else {
              setPixel(x, y, cBody[0], cBody[1], cBody[2], 255);
            }
          }
        }
      };

      drawPuffyCloud(cy + 8, 2, cx - 48, cx + 28, [[12, 15, 1], [32, 14, 2]]);
      drawPuffyCloud(cy + 18, 3, cx - 26, cx + 58, [[15, 18, 2], [38, 20, 2]]);
      drawPuffyCloud(cy + 28, 5, cx - 72, cx + 68, [[10, 22, 3], [36, 26, 4], [70, 24, 3]]);
      drawPuffyCloud(cy + 36, 12, 0, width - 1, [[18, 24, 3], [50, 32, 4], [90, 38, 4], [132, 22, 3]]);

    } else if (time === 'day') {
      // =====================================================================
      // 3. BAN NGÀY (DAY / NOON) - RADIANT HIGH MIDDAY RETRO SOLAR CORONA
      // =====================================================================
      const cx = width / 2;
      const cy = height / 2;
      const r = 16;

      // Radiant Cardinal & Diagonal Retro Pixel Rays
      const rayLength = 18;
      const subRayLength = 12;

      for (let angleDeg = 0; angleDeg < 360; angleDeg += 22.5) {
        const rad = (angleDeg * Math.PI) / 180;
        const isCardinal = angleDeg % 90 === 0;
        const isDiagonal = angleDeg % 45 === 0 && !isCardinal;
        const len = isCardinal ? rayLength : isDiagonal ? subRayLength : 8;

        for (let d = r + 1; d <= r + len; d++) {
          const rx = Math.round(cx + Math.cos(rad) * d);
          const ry = Math.round(cy + Math.sin(rad) * d);
          const t = (d - r) / len;
          const alpha = Math.round(255 * (1 - t * 0.45));
          setPixel(rx, ry, 255, Math.round(245 - t * 40), 90, alpha);
          if (d <= r + 4) {
            setPixel(rx + 1, ry, 255, 235, 120, 200);
            setPixel(rx, ry + 1, 255, 235, 120, 200);
          }
        }
      }

      // Outer Corona Dithering
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist > r && dist <= r + 24) {
            const t = (dist - r) / 24;
            const bVal = (BAYER_4X4[Math.abs(y) % 4][Math.abs(x) % 4] + 0.5) / 16;
            if (bVal > t * 1.2) {
              setPixel(x, y, 255, 240, 140, Math.round(90 * (1 - t)));
            }
          }
        }
      }

      // Midday Sun Disc
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist <= r) {
            if (dist >= r - 1.2) {
              setPixel(x, y, 255, 215, 60, 255);
            } else {
              const norm = dist / r;
              const red = 255;
              const green = Math.round(255 - norm * 25);
              const blue = Math.round(255 - norm * 150);
              setPixel(x, y, red, green, blue, 255);
            }
          }
        }
      }

    } else if (time === 'night') {
      // =====================================================================
      // 4. BAN ĐÊM (NIGHT) - RETRO CRESCENT MOON
      // =====================================================================
      const cx = width / 2;
      const cy = height / 2;
      const r = 18;

      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          const distMain = Math.hypot(x - cx, y - cy);
          const distCut = Math.hypot(x - (cx + 8), y - (cy - 6));
          if (distMain <= r && distCut > 15) {
            if (distMain >= r - 1.2 || distCut <= 16.2) {
              setPixel(x, y, 245, 250, 255, 255);
            } else {
              setPixel(x, y, 215, 228, 245, 255);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [time]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
};
