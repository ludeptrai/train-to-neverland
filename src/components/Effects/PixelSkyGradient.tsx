import React, { useEffect, useRef, useState } from 'react';
import { TimeOfDay } from '../../types';
import { resolveTimeOfDay } from '../../engines/LightingManager';

interface PixelSkyGradientProps {
  timeOfDay: TimeOfDay;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const SKY_PALETTES: Record<'dawn' | 'day' | 'sunset' | 'night', RGB[]> = {
  sunset: [
    { r: 150, g: 40, b: 92 },   // #96285c - Deep magenta top
    { r: 189, g: 54, b: 106 },  // #bd366a - Berry rose
    { r: 222, g: 74, b: 120 },  // #de4a78 - Reference image vibrant pink
    { r: 240, g: 101, b: 132 }, // #f06584 - Coral rose
    { r: 248, g: 134, b: 115 }, // #f88673 - Warm coral
    { r: 250, g: 167, b: 108 }, // #faa76c - Golden coral
    { r: 254, g: 199, b: 130 }, // #fec782 - Sunset horizon glow
  ],
  dawn: [
    { r: 69, g: 44, b: 92 },    // #452c5c - Twilight indigo top
    { r: 103, g: 62, b: 114 },  // #673e72 - Twilight violet
    { r: 147, g: 83, b: 134 },  // #935386 - Mauve lavender
    { r: 190, g: 110, b: 149 }, // #be6e95 - Morning rose
    { r: 221, g: 140, b: 148 }, // #dd8c94 - Soft blush
    { r: 242, g: 171, b: 149 }, // #f2ab95 - Delicate peach
    { r: 254, g: 205, b: 163 }, // #fecda3 - Golden horizon first light
  ],
  day: [
    { r: 59, g: 135, b: 200 },  // #3b87c8 - Azure top
    { r: 92, g: 164, b: 229 },  // #5ca4e5 - Clear sky blue
    { r: 130, g: 189, b: 242 }, // #82bdf2 - Soft cerulean
    { r: 174, g: 213, b: 250 }, // #aed5fa - Sky cyan
    { r: 220, g: 240, b: 253 }, // #dcf0fd - Horizon haze
    { r: 249, g: 252, b: 254 }, // #f9fcfe - Bright midday horizon
  ],
  night: [
    { r: 4, g: 8, b: 19 },      // #040813 - Deep space black
    { r: 10, g: 21, b: 38 },    // #0a1526 - Midnight navy
    { r: 18, g: 34, b: 59 },    // #12223b - Deep cobalt
    { r: 27, g: 48, b: 79 },    // #1b304f - Midnight blue
    { r: 40, g: 67, b: 102 },   // #284366 - Horizon twilight
  ],
};

function renderSkyToCanvas(canvas: HTMLCanvasElement, time: 'dawn' | 'day' | 'sunset' | 'night') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Độ phân giải 640x360 kết hợp ma trận Bayer 8x8 (64 mức độ chuyển tông):
  // Hạt pixel nhỏ gọn mịn màng hơn nhưng vẫn giữ chất pixel retro arcade đặc trưng
  const width = 640;
  const height = 360;

  canvas.width = width;
  canvas.height = height;
  ctx.imageSmoothingEnabled = false;

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const palette = SKY_PALETTES[time];
  const numIntervals = palette.length - 1;

  for (let y = 0; y < height; y++) {
    const normY = y / (height - 1);
    const scaled = normY * numIntervals;
    const bandIdx = Math.min(Math.floor(scaled), numIntervals - 1);
    const frac = scaled - bandIdx;

    const cA = palette[bandIdx];
    const cB = palette[bandIdx + 1];

    for (let x = 0; x < width; x++) {
      const threshold = (BAYER_8X8[y % 8][x % 8] + 0.5) / 64;
      const color = frac > threshold ? cB : cA;
      const idx = (y * width + x) * 4;
      data[idx] = color.r;
      data[idx + 1] = color.g;
      data[idx + 2] = color.b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

export const PixelSkyGradient: React.FC<PixelSkyGradientProps> = ({ timeOfDay }) => {
  const resolvedTime = resolveTimeOfDay(timeOfDay);

  const canvasA = useRef<HTMLCanvasElement | null>(null);
  const canvasB = useRef<HTMLCanvasElement | null>(null);

  // Active layer toggle: true = Layer A is active, false = Layer B is active
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const prevTimeRef = useRef(resolvedTime);

  // Initial render for Layer A
  useEffect(() => {
    if (canvasA.current) {
      renderSkyToCanvas(canvasA.current, resolvedTime);
    }
  }, []);

  // Smooth Crossfade when time changes
  useEffect(() => {
    if (prevTimeRef.current === resolvedTime) return;
    prevTimeRef.current = resolvedTime;

    if (activeLayer === 'A') {
      if (canvasB.current) renderSkyToCanvas(canvasB.current, resolvedTime);
      setActiveLayer('B');
    } else {
      if (canvasA.current) renderSkyToCanvas(canvasA.current, resolvedTime);
      setActiveLayer('A');
    }
  }, [resolvedTime, activeLayer]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasA}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          imageRendering: 'pixelated',
          opacity: activeLayer === 'A' ? 1 : 0,
          transition: 'opacity 1.5s ease',
          display: 'block',
        }}
      />
      <canvas
        ref={canvasB}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          imageRendering: 'pixelated',
          opacity: activeLayer === 'B' ? 1 : 0,
          transition: 'opacity 1.5s ease',
          display: 'block',
        }}
      />
    </div>
  );
};
