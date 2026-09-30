// vite.config.ts
import fs3 from "fs";
import path3 from "path";
import { defineConfig } from "file:///F:/TrainToThe%20Neverland/node_modules/vite/dist/node/index.js";
import react from "file:///F:/TrainToThe%20Neverland/node_modules/@vitejs/plugin-react/dist/index.js";

// scripts/scan_assets.js
import fs from "fs";
import path from "path";
function humanizeName(id) {
  const map = {
    dalat: "\u0110\xE0 L\u1EA1t Ng\xE0n Hoa",
    halong: "V\u1ECBnh H\u1EA1 Long",
    hoian: "Ph\u1ED1 C\u1ED5 H\u1ED9i An",
    nhatrang: "Bi\u1EC3n Nha Trang",
    sapa: "Sa Pa T\xE2y B\u1EAFc",
    tokyo: "Th\xE0nh Ph\u1ED1 Tokyo",
    tokyo_fuji: "Tokyo & N\xFAi Ph\xFA S\u0129",
    kyoto: "C\u1ED1 \u0110\xF4 Kyoto",
    kyoto_autumn: "Kyoto M\xF9a Thu V\xE0ng",
    newyork: "New York Skyline",
    danang: "\u0110\xE0 N\u1EB5ng Bi\u1EC3n \u0110\u1EB9p",
    paris: "Kinh \u0110\xF4 Paris",
    hanoi: "H\xE0 N\u1ED9i 36 Ph\u1ED1 Ph\u01B0\u1EDDng",
    hue: "C\u1ED1 \u0110\xF4 Hu\u1EBF",
    phuquoc: "\u0110\u1EA3o Ng\u1ECDc Ph\xFA Qu\u1ED1c",
    train_red_shinkansen: "T\xE0u Shinkansen \u0110\u1ECF Si\xEAu T\u1ED1c",
    train_orange_bullet: "T\xE0u Cao T\u1ED1c Cam V\xE0ng",
    train_blue_metro: "T\xE0u \u0110i\u1EC7n Ng\u1EA7m Xanh Lam",
    train_yellow_metro: "T\xE0u \u0110i\u1EC7n Ng\u1EA7m V\xE0ng \u0110en (U-Bahn)",
    train_vintage_steam: "T\xE0u H\u01A1i N\u01B0\u1EDBc Than \u0110\xE1 C\u1ED5 \u0110i\u1EC3n",
    train_oil_steam: "T\xE0u H\u01A1i N\u01B0\u1EDBc Th\xF9ng D\u1EA7u",
    train_green_cargo: "T\xE0u H\xE0ng Container Xanh L\xE1",
    train_orange_tram: "T\xE0u \u0110i\u1EC7n M\u1EB7t \u0110\u1EA5t Cam C\u1ED5 \u0110i\u1EC3n",
    train_red_white_commuter: "T\xE0u Li\xEAn T\u1EC9nh \u0110\u1ECF Tr\u1EAFng Nh\u1EADt B\u1EA3n",
    train_monorail: "T\xE0u Monorail Treo T\u01B0\u01A1ng Lai"
  };
  if (map[id]) return map[id];
  return id.replace(/^train_/, "T\xE0u ").split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function scanLandscapes() {
  const landscapesDir = path.resolve("public/assets/landscapes");
  if (!fs.existsSync(landscapesDir)) return [];
  const dirs = fs.readdirSync(landscapesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const scenes = [];
  for (const dir of dirs) {
    const dirPath = path.join(landscapesDir, dir);
    const metaPath = path.join(dirPath, "meta.json");
    let meta = {};
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      } catch (e) {
        console.warn(`\u26A0\uFE0F L\u1ED7i \u0111\u1ECDc ${metaPath}:`, e.message);
      }
    }
    const files = fs.readdirSync(dirPath);
    let bgUrl = "";
    if (files.includes("background.png")) {
      bgUrl = `./assets/landscapes/${dir}/background.png`;
    } else if (files.includes("background.jpg")) {
      bgUrl = `./assets/landscapes/${dir}/background.jpg`;
    } else {
      const anyBg = files.find((f) => f.startsWith("background") || f.startsWith("bg"));
      if (anyBg) bgUrl = `./assets/landscapes/${dir}/${anyBg}`;
    }
    if (!bgUrl) {
      continue;
    }
    let bgLightsUrl = void 0;
    if (files.includes("background_lights.png")) {
      bgLightsUrl = `./assets/landscapes/${dir}/background_lights.png`;
    } else if (files.includes("background_lights.svg")) {
      bgLightsUrl = `./assets/landscapes/${dir}/background_lights.svg`;
    }
    let mgUrl = "";
    if (files.includes("midground_track.png")) {
      mgUrl = `./assets/landscapes/${dir}/midground_track.png`;
    } else if (files.includes("midground_track.svg")) {
      mgUrl = `./assets/landscapes/${dir}/midground_track.svg`;
    } else {
      mgUrl = `./assets/landscapes/dalat/midground_track.svg`;
    }
    let mgLightsUrl = void 0;
    if (files.includes("midground_lights.png")) {
      mgLightsUrl = `./assets/landscapes/${dir}/midground_lights.png`;
    }
    const name = meta.name || humanizeName(dir);
    const subtitle = meta.subtitle || `Chuy\u1EBFn t\xE0u qua ga ${name}`;
    const location = meta.location || "Vi\u1EC7t Nam";
    const bgSpeed = meta.bgSpeed !== void 0 ? meta.bgSpeed : 0.15;
    const mgSpeed = meta.mgSpeed !== void 0 ? meta.mgSpeed : 0.85;
    const bgScaleRatio = meta.bgScaleRatio !== void 0 ? Number(meta.bgScaleRatio) : meta.bgScale !== void 0 ? Number(meta.bgScale) : void 0;
    const bgY = meta.bgY !== void 0 ? meta.bgY : meta.bgOffsetY !== void 0 ? meta.bgOffsetY : void 0;
    const mgScaleRatio = meta.mgScaleRatio !== void 0 ? Number(meta.mgScaleRatio) : meta.mgScale !== void 0 ? Number(meta.mgScale) : meta.scaleRatio !== void 0 ? Number(meta.scaleRatio) : void 0;
    const mgY = meta.mgY !== void 0 ? meta.mgY : meta.mgOffsetY !== void 0 ? meta.mgOffsetY : meta.yAxis !== void 0 ? meta.yAxis : void 0;
    const trainY = meta.trainY !== void 0 ? meta.trainY : meta.trainOffsetY !== void 0 ? meta.trainOffsetY : void 0;
    const trainScaleRatio = meta.trainScaleRatio !== void 0 ? Number(meta.trainScaleRatio) : meta.trainScale !== void 0 ? Number(meta.trainScale) : void 0;
    const skyPresets = meta.skyPresets || {
      dawn: ["#fbc2eb", "#a6c1ee"],
      day: ["#4facfe", "#00f2fe", "#e0f7fa"],
      sunset: ["#fa709a", "#fee140", "#f39c12"],
      night: ["#09203f", "#1b2a4a", "#2c3e50"]
    };
    scenes.push({
      id: dir,
      name,
      subtitle,
      location,
      bgSpeed,
      mgSpeed,
      ...bgScaleRatio !== void 0 ? { bgScaleRatio } : {},
      ...bgY !== void 0 ? { bgY } : {},
      ...mgScaleRatio !== void 0 ? { mgScaleRatio } : {},
      ...mgY !== void 0 ? { mgY } : {},
      ...trainY !== void 0 ? { trainY } : {},
      ...trainScaleRatio !== void 0 ? { trainScaleRatio } : {},
      backgroundUrl: bgUrl,
      ...bgLightsUrl ? { backgroundLightsUrl: bgLightsUrl } : {},
      midgroundUrl: mgUrl,
      ...mgLightsUrl ? { midgroundLightsUrl: mgLightsUrl } : {},
      skyPresets
    });
  }
  return scenes;
}
function scanTrains() {
  const trainsDir = path.resolve("public/assets/trains/templates");
  if (!fs.existsSync(trainsDir)) return [];
  const dirs = fs.readdirSync(trainsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  const trains = [];
  for (const dir of dirs) {
    const dirPath = path.join(trainsDir, dir);
    const metaPath = path.join(dirPath, "meta.json");
    let meta = {};
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      } catch (e) {
        console.warn(`\u26A0\uFE0F L\u1ED7i \u0111\u1ECDc ${metaPath}:`, e.message);
      }
    }
    const files = fs.readdirSync(dirPath);
    let bodyUrl = "";
    let carCount = meta.carCount || 4;
    if (files.includes("train_body_3car.png")) {
      bodyUrl = `./assets/trains/templates/${dir}/train_body_3car.png`;
      carCount = 3;
    } else if (files.includes("train_body.png")) {
      bodyUrl = `./assets/trains/templates/${dir}/train_body.png`;
    }
    if (!bodyUrl) continue;
    let lightsUrl = void 0;
    if (files.includes("train_lights_3car.png")) {
      lightsUrl = `./assets/trains/templates/${dir}/train_lights_3car.png`;
    } else if (files.includes("train_lights.png")) {
      lightsUrl = `./assets/trains/templates/${dir}/train_lights.png`;
    }
    const isSteam = dir.includes("steam");
    const name = meta.name || humanizeName(dir);
    const description = meta.description || `\u0110o\xE0n t\xE0u ${name} v\u1EADn h\xE0nh \xEAm \xE1i tr\xEAn h\xE0nh tr\xECnh`;
    const wheelType = meta.wheelType || (isSteam ? "spoke" : "standard");
    const hasPantograph = meta.hasPantograph !== void 0 ? meta.hasPantograph : false;
    const hasSmoke = meta.hasSmoke !== void 0 ? meta.hasSmoke : isSteam;
    trains.push({
      id: dir,
      name,
      description,
      carCount,
      bodyUrl,
      ...lightsUrl ? { lightsUrl } : {},
      wheelType,
      hasPantograph,
      hasSmoke
    });
  }
  return trains;
}
function generateRegistryFiles() {
  const scenes = scanLandscapes();
  const trains = scanTrains();
  const scenesTs = `// \u{1F916} T\u1EF0 \u0110\u1ED8NG T\u1EA0O SINH T\u1EEA TH\u01AF M\u1EE4C public/assets/landscapes/
// KH\xD4NG CH\u1EC8NH S\u1EECA TH\u1EE6 C\xD4NG FILE N\xC0Y.
// \u0110\u1EC3 th\xEAm ga m\u1EDBi: ch\u1EC9 c\u1EA7n t\u1EA1o folder trong public/assets/landscapes/[t\xEAn_ga]/ k\xE8m theo meta.json (t\xF9y ch\u1ECDn)

import { SceneConfig } from '../types';

export const SCENES: SceneConfig[] = ${JSON.stringify(scenes, null, 2)};
`;
  const trainsTs = `// \u{1F916} T\u1EF0 \u0110\u1ED8NG T\u1EA0O SINH T\u1EEA TH\u01AF M\u1EE4C public/assets/trains/templates/
// KH\xD4NG CH\u1EC8NH S\u1EECA TH\u1EE6 C\xD4NG FILE N\xC0Y.
// \u0110\u1EC3 th\xEAm \u0111o\xE0n t\xE0u m\u1EDBi: ch\u1EC9 c\u1EA7n t\u1EA1o folder trong public/assets/trains/templates/[t\xEAn_t\xE0u]/ k\xE8m theo meta.json (t\xF9y ch\u1ECDn)

import { TrainTheme } from '../types';

export const TRAINS: TrainTheme[] = ${JSON.stringify(trains, null, 2)};
`;
  const outScenes = path.resolve("src/config/auto_scenes.ts");
  const outTrains = path.resolve("src/config/auto_trains.ts");
  fs.writeFileSync(outScenes, scenesTs, "utf-8");
  fs.writeFileSync(outTrains, trainsTs, "utf-8");
  console.log(`\u2705 [Asset Registry Scanner] \u0110\xE3 qu\xE9t th\xE0nh c\xF4ng ${scenes.length} \u0111\u1ECBa \u0111i\u1EC3m (scenes) v\xE0 ${trains.length} \u0111o\xE0n t\xE0u (trains)!`);
}
if (process.argv[1] && process.argv[1].endsWith("scan_assets.js")) {
  generateRegistryFiles();
}

// scripts/process_landscape_theme.js
import sharp from "file:///F:/TrainToThe%20Neverland/node_modules/sharp/dist/index.mjs";
import fs2 from "fs";
import path2 from "path";
function isFullWhitePixel(r, g, b, threshold = 240) {
  if (r < threshold || g < threshold || b < threshold) return false;
  const diff = Math.max(r, g, b) - Math.min(r, g, b);
  return diff <= 8;
}
async function processLandscapeFolder(folderPath) {
  let fullPath = path2.resolve(folderPath);
  if (!fs2.existsSync(fullPath)) {
    const candidate = path2.resolve("public/assets/landscapes", folderPath);
    if (fs2.existsSync(candidate)) {
      fullPath = candidate;
    } else {
      console.error(`\u274C Th\u01B0 m\u1EE5c kh\xF4ng t\u1ED3n t\u1EA1i: ${fullPath} (ho\u1EB7c ${candidate})`);
      return false;
    }
  }
  const files = fs2.readdirSync(fullPath);
  console.log(`
======================================================`);
  console.log(`\u{1F680} \u0110ang qu\xE9t v\xE0 x\u1EED l\xFD th\u01B0 m\u1EE5c: ${path2.basename(fullPath)}`);
  console.log(`======================================================`);
  const bgFile = files.find((f) => /^background\.(jpg|jpeg|webp)$/i.test(f)) || files.find((f) => /^(bg|haucang)\.(jpg|jpeg|webp)$/i.test(f));
  const mgFile = files.find((f) => /^midground\.(jpg|jpeg|webp)$/i.test(f)) || files.find((f) => /^(track|rail|trungcanh)\.(jpg|jpeg|webp)$/i.test(f));
  if (!bgFile && !mgFile) {
    console.log(`\u2139\uFE0F Kh\xF4ng t\xECm th\u1EA5y file JPG/JPEG n\xE0o c\u1EA7n x\u1EED l\xFD trong ${path2.basename(fullPath)}.`);
    return false;
  }
  if (bgFile) {
    const bgInput = path2.join(fullPath, bgFile);
    console.log(`\u{1F3A8} 1. \u0110ang x\u1EED l\xFD Background: ${bgFile}...`);
    const img = sharp(bgInput);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
    const isOutdoorBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0, qTail = 0;
    for (let x = 0; x < w; x++) {
      const idx = (0 * w + x) * info.channels;
      if (isFullWhitePixel(data[idx], data[idx + 1], data[idx + 2])) {
        isOutdoorBg[x] = 1;
        queue[qTail++] = x;
      }
    }
    const seedH = Math.floor(h * 0.65);
    for (let y = 0; y < seedH; y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isFullWhitePixel(data[lIdx], data[lIdx + 1], data[lIdx + 2]) && !isOutdoorBg[y * w + 0]) {
        isOutdoorBg[y * w + 0] = 1;
        queue[qTail++] = y * w + 0;
      }
      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isFullWhitePixel(data[rIdx], data[rIdx + 1], data[rIdx + 2]) && !isOutdoorBg[y * w + (w - 1)]) {
        isOutdoorBg[y * w + (w - 1)] = 1;
        queue[qTail++] = y * w + (w - 1);
      }
    }
    for (let x = 0; x < w; x++) {
      const bIdx = ((h - 1) * w + x) * info.channels;
      if (isFullWhitePixel(data[bIdx], data[bIdx + 1], data[bIdx + 2]) && !isOutdoorBg[(h - 1) * w + x]) {
        isOutdoorBg[(h - 1) * w + x] = 1;
        queue[qTail++] = (h - 1) * w + x;
      }
    }
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
    console.log(`   \u{1F5BC}\uFE0F \u0110ang x\u1EED l\xFD to\xE0n b\u1ED9 h\xECnh \u1EA3nh g\u1ED1c: ${w}px x ${h}px (KH\xD4NG C\u1EAET X\xC9N B\u1EA4T K\u1EF2 PH\u1EA6N N\xC0O)`);
    const bgFullRgba = Buffer.alloc(w * h * 4);
    const bgLightsFullRgba = Buffer.alloc(w * h * 4);
    let protectedWhites = 0;
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
          bgFullRgba[destIdx + 3] = 0;
          bgLightsFullRgba[destIdx + 3] = 0;
        } else {
          if (r >= 240 && g >= 240 && b >= 240) {
            protectedWhites++;
          }
          let isBorderPixel = false;
          if (y > 0 && isOutdoorBg[(y - 1) * w + x]) isBorderPixel = true;
          else if (y < h - 1 && isOutdoorBg[(y + 1) * w + x]) isBorderPixel = true;
          else if (x > 0 && isOutdoorBg[y * w + (x - 1)]) isBorderPixel = true;
          else if (x < w - 1 && isOutdoorBg[y * w + (x + 1)]) isBorderPixel = true;
          if (isBorderPixel && r > 230 && g > 230 && b > 230) {
            bgFullRgba[destIdx + 3] = 0;
            bgLightsFullRgba[destIdx + 3] = 0;
            continue;
          }
          bgFullRgba[destIdx] = Math.min(255, Math.round(r / 4) * 4);
          bgFullRgba[destIdx + 1] = Math.min(255, Math.round(g / 4) * 4);
          bgFullRgba[destIdx + 2] = Math.min(255, Math.round(b / 4) * 4);
          bgFullRgba[destIdx + 3] = 255;
          const isWarmYellow = r > 195 && g > 165 && b < 145;
          const isAmber = r > 200 && g > 125 && b < 85;
          const isCyan = b > 175 && g > 160 && r < 140;
          const isLanternRed = r > 170 && r > g * 1.3 && r > b * 1.3;
          const isBrightWindow = r > 215 && g > 210 && b > 200 && (r - b > 8 || y > h * 0.25);
          if (isWarmYellow || isAmber || isCyan || isLanternRed || isBrightWindow) {
            lightsCount++;
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
    console.log(`   \u{1F6E1}\uFE0F \u0110\xE3 b\u1EA3o v\u1EC7 ${protectedWhites.toLocaleString()} pixel tr\u1EAFng n\u1ED9i c\u1EA3nh kh\xF4ng b\u1ECB c\u1EAFt nh\u1EA7m!`);
    console.log(`   \u2728 \u0110\xE3 tr\xEDch xu\u1EA5t ${lightsCount.toLocaleString()} b\xF3ng \u0111\xE8n \u0111\xEAm cho background_lights.png!`);
    const targetW = 1920;
    const targetH = Math.round(h * (targetW / w));
    console.log(`   \u{1F4D0} \u0110ang scale to\xE0n b\u1ED9 b\u1EE9c tranh v\u1EC1 k\xEDch th\u01B0\u1EDBc: ${targetW}px x ${targetH}px (t\u1EF7 l\u1EC7 g\u1ED1c nguy\xEAn v\u1EB9n)`);
    await sharp(bgFullRgba, { raw: { width: w, height: h, channels: 4 } }).resize(targetW, targetH, { kernel: "nearest" }).png({ compressionLevel: 9 }).toFile(path2.join(fullPath, "background.png"));
    const rawLightsBuffer = await sharp(bgLightsFullRgba, { raw: { width: w, height: h, channels: 4 } }).resize(targetW, targetH, { kernel: "nearest" }).png({ compressionLevel: 9 }).toBuffer();
    await fs2.promises.writeFile(path2.join(fullPath, "background_lights_raw.png"), rawLightsBuffer);
    const wideGlow = await sharp(rawLightsBuffer).blur(14).toBuffer();
    const midGlow = await sharp(rawLightsBuffer).blur(5).toBuffer();
    const tightGlow = await sharp(rawLightsBuffer).blur(2).toBuffer();
    await sharp(wideGlow).composite([
      { input: midGlow, blend: "screen" },
      { input: tightGlow, blend: "screen" },
      { input: rawLightsBuffer, blend: "over" }
    ]).png({ compressionLevel: 9 }).toFile(path2.join(fullPath, "background_lights.png"));
    console.log(`   \u2705 \u0110\xE3 xu\u1EA5t background.png & background_lights.png (v\u1EDBi hi\u1EC7u \u1EE9ng Glow pre-render s\u1EB5n) th\xE0nh c\xF4ng!`);
  }
  if (mgFile) {
    const mgInput = path2.join(fullPath, mgFile);
    console.log(`\u{1F6E4}\uFE0F 2. \u0110ang x\u1EED l\xFD Midground Track: ${mgFile}...`);
    const img = sharp(mgInput);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const w = info.width;
    const h = info.height;
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
    for (let y = 0; y < Math.floor(h * 0.7); y++) {
      const lIdx = (y * w + 0) * info.channels;
      if (isFullWhitePixel(data[lIdx], data[lIdx + 1], data[lIdx + 2]) && !isMgBg[y * w + 0]) {
        isMgBg[y * w + 0] = 1;
        queue[qTail++] = y * w + 0;
      }
      const rIdx = (y * w + (w - 1)) * info.channels;
      if (isFullWhitePixel(data[rIdx], data[rIdx + 1], data[rIdx + 2]) && !isMgBg[y * w + (w - 1)]) {
        isMgBg[y * w + (w - 1)] = 1;
        queue[qTail++] = y * w + (w - 1);
      }
    }
    for (let x = 0; x < w; x++) {
      const bIdx = ((h - 1) * w + x) * info.channels;
      if (isFullWhitePixel(data[bIdx], data[bIdx + 1], data[bIdx + 2]) && !isMgBg[(h - 1) * w + x]) {
        isMgBg[(h - 1) * w + x] = 1;
        queue[qTail++] = (h - 1) * w + x;
      }
    }
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
    console.log(`   \u0110\u01B0\u1EDDng ray nh\u1EADn di\u1EC7n: y=${mgMinY} -> y=${mgMaxY} (cao ${mgContentH}px, r\u1ED9ng nguy\xEAn b\u1EA3n ${w}px - KH\xD4NG C\u1EAET NGANG)`);
    const singleTileRgba = Buffer.alloc(w * mgContentH * 4);
    for (let y = 0; y < mgContentH; y++) {
      const origY = mgMinY + y;
      for (let x = 0; x < w; x++) {
        const srcIdx = (origY * w + x) * info.channels;
        const destIdx = (y * w + x) * 4;
        if (isMgBg[origY * w + x]) {
          singleTileRgba[destIdx + 3] = 0;
        } else {
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
    const targetH = 240;
    const verticalScale = targetH / mgContentH;
    const tileW = Math.round(w * verticalScale);
    console.log(`   \u{1F4D0} \u0110\xE3 scale chi\u1EC1u d\u1ECDc v\u1EC1 chu\u1EA9n ${targetH}px -> Chi\u1EC1u r\u1ED9ng 1 kh\u1ED1i \u0111\u1EA1t ${tileW}px`);
    const singleTileBuffer = await sharp(singleTileRgba, { raw: { width: w, height: mgContentH, channels: 4 } }).resize(tileW, targetH, { kernel: "nearest" }).png().toBuffer();
    const numTiles = Math.max(2, Math.ceil(1920 / tileW));
    const totalW = tileW * numTiles;
    console.log(`   \u{1F501} \u0110ang gh\xE9p n\u1ED1i ngang ${numTiles} kh\u1ED1i li\xEAn ti\u1EBFp -> T\u1ED5ng chi\u1EC1u r\u1ED9ng d\u1EA3i ray: ${totalW}px x ${targetH}px`);
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
    }).composite(composites).png({ compressionLevel: 9 }).toFile(path2.join(fullPath, "midground_track.png"));
    console.log(`   \u2705 \u0110\xE3 xu\u1EA5t d\u1EA3i ray n\u1ED1i ngang midground_track.png th\xE0nh c\xF4ng!`);
  }
  generateRegistryFiles();
  console.log(`\u{1F389} Ho\xE0n t\u1EA5t x\u1EED l\xFD v\xE0 \u0111\u0103ng k\xFD th\u01B0 m\u1EE5c ${path2.basename(fullPath)} v\xE0o \u1EE9ng d\u1EE5ng!
`);
  return true;
}
if (process.argv[1] && process.argv[1].endsWith("process_landscape_theme.js")) {
  const target = process.argv[2];
  if (target) {
    processLandscapeFolder(target).catch(console.error);
  } else {
    const landscapesDir = path2.resolve("public/assets/landscapes");
    const dirs = fs2.readdirSync(landscapesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => path2.join(landscapesDir, d.name));
    (async () => {
      for (const d of dirs) {
        await processLandscapeFolder(d);
      }
    })();
  }
}

// vite.config.ts
function assetRegistryPlugin() {
  return {
    name: "vite-plugin-asset-registry",
    buildStart() {
      generateRegistryFiles();
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/assets/")) {
          const cleanUrl = req.url.split("?")[0];
          const filePath = path3.join(process.cwd(), "public", cleanUrl);
          if (fs3.existsSync(filePath) && fs3.statSync(filePath).isFile()) {
            const ext = path3.extname(filePath).toLowerCase();
            const mimeMap = {
              ".png": "image/png",
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".svg": "image/svg+xml",
              ".webp": "image/webp",
              ".json": "application/json",
              ".mp3": "audio/mpeg",
              ".wav": "audio/wav",
              ".ogg": "audio/ogg"
            };
            if (mimeMap[ext]) {
              res.setHeader("Content-Type", mimeMap[ext]);
            }
            res.setHeader("Cache-Control", "no-cache");
            return fs3.createReadStream(filePath).pipe(res);
          }
        }
        next();
      });
      generateRegistryFiles();
      const watchPaths = ["public/assets/landscapes", "public/assets/trains/templates"];
      server.watcher.add(watchPaths);
      server.watcher.on("add", async (filePath) => {
        const norm = filePath.replace(/\\/g, "/");
        if (/public\/assets\/landscapes\/([^/]+)\/.+\.(jpg|jpeg)$/i.test(norm)) {
          const match = norm.match(/public\/assets\/landscapes\/([^/]+)/i);
          if (match) {
            console.log(`
\u{1F4F8} [Auto-Process] Ph\xE1t hi\u1EC7n \u1EA3nh JPG m\u1EDBi: ${filePath}`);
            try {
              await processLandscapeFolder(match[0]);
            } catch (err) {
              console.error("\u274C L\u1ED7i t\u1EF1 \u0111\u1ED9ng x\u1EED l\xFD \u1EA3nh:", err);
            }
          }
        }
      });
      server.watcher.on("all", (event, filePath) => {
        const norm = filePath.replace(/\\/g, "/");
        if (norm.includes("public/assets/landscapes") || norm.includes("public/assets/trains/templates")) {
          generateRegistryFiles();
          server.ws.send({ type: "full-reload" });
        }
      });
    }
  };
}
var vite_config_default = defineConfig({
  base: "./",
  plugins: [react(), assetRegistryPlugin()]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic2NyaXB0cy9zY2FuX2Fzc2V0cy5qcyIsICJzY3JpcHRzL3Byb2Nlc3NfbGFuZHNjYXBlX3RoZW1lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcVHJhaW5Ub1RoZSBOZXZlcmxhbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXFRyYWluVG9UaGUgTmV2ZXJsYW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9UcmFpblRvVGhlJTIwTmV2ZXJsYW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBnZW5lcmF0ZVJlZ2lzdHJ5RmlsZXMgfSBmcm9tICcuL3NjcmlwdHMvc2Nhbl9hc3NldHMuanMnO1xuaW1wb3J0IHsgcHJvY2Vzc0xhbmRzY2FwZUZvbGRlciB9IGZyb20gJy4vc2NyaXB0cy9wcm9jZXNzX2xhbmRzY2FwZV90aGVtZS5qcyc7XG5cbmZ1bmN0aW9uIGFzc2V0UmVnaXN0cnlQbHVnaW4oKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAndml0ZS1wbHVnaW4tYXNzZXQtcmVnaXN0cnknLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICBnZW5lcmF0ZVJlZ2lzdHJ5RmlsZXMoKTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgIC8vIFx1MDExMFx1MUVBM20gYlx1MUVBM28gbVx1MUVDRGkgYXNzZXQgdHJvbmcgcHVibGljLyBsdVx1MDBGNG4gXHUwMTExXHUwMUIwXHUxRUUzYyBcdTAxMTFcdTFFQ0RjIHRyXHUxRUYxYyB0aVx1MUVCRnAgdFx1MUVFQiBkaXNrLCBraFx1MDBGNG5nIGJcdTFFQ0Iga1x1MUVCOXQgY2FjaGUgU1BBIGZhbGxiYWNrXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBpZiAocmVxLnVybCAmJiByZXEudXJsLnN0YXJ0c1dpdGgoJy9hc3NldHMvJykpIHtcbiAgICAgICAgICBjb25zdCBjbGVhblVybCA9IHJlcS51cmwuc3BsaXQoJz8nKVswXTtcbiAgICAgICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncHVibGljJywgY2xlYW5VcmwpO1xuICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSAmJiBmcy5zdGF0U3luYyhmaWxlUGF0aCkuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dCA9IHBhdGguZXh0bmFtZShmaWxlUGF0aCkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGNvbnN0IG1pbWVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICAgICcucG5nJzogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICAgICcuanBnJzogJ2ltYWdlL2pwZWcnLFxuICAgICAgICAgICAgICAnLmpwZWcnOiAnaW1hZ2UvanBlZycsXG4gICAgICAgICAgICAgICcuc3ZnJzogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICAgICAgICAnLndlYnAnOiAnaW1hZ2Uvd2VicCcsXG4gICAgICAgICAgICAgICcuanNvbic6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgJy5tcDMnOiAnYXVkaW8vbXBlZycsXG4gICAgICAgICAgICAgICcud2F2JzogJ2F1ZGlvL3dhdicsXG4gICAgICAgICAgICAgICcub2dnJzogJ2F1ZGlvL29nZycsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG1pbWVNYXBbZXh0XSkge1xuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBtaW1lTWFwW2V4dF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ2FjaGUtQ29udHJvbCcsICduby1jYWNoZScpO1xuICAgICAgICAgICAgcmV0dXJuIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZVBhdGgpLnBpcGUocmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFF1XHUwMEU5dCB2XHUwMEUwIGNcdTFFQURwIG5oXHUxRUFEdCBkYW5oIHNcdTAwRTFjaCBuZ2F5IGtoaSBraFx1MUVERmkgXHUwMTExXHUxRUQ5bmcgZGV2IHNlcnZlclxuICAgICAgZ2VuZXJhdGVSZWdpc3RyeUZpbGVzKCk7XG5cbiAgICAgIC8vIFRcdTFFRjEgXHUwMTExXHUxRUQ5bmcgdGhlbyBkXHUwMEY1aSBjXHUwMEUxYyB0aFx1MDFCMCBtXHUxRUU1YyBhc3NldFxuICAgICAgY29uc3Qgd2F0Y2hQYXRocyA9IFsncHVibGljL2Fzc2V0cy9sYW5kc2NhcGVzJywgJ3B1YmxpYy9hc3NldHMvdHJhaW5zL3RlbXBsYXRlcyddO1xuICAgICAgc2VydmVyLndhdGNoZXIuYWRkKHdhdGNoUGF0aHMpO1xuXG4gICAgICAvLyBLaGkgbmdcdTAxQjBcdTFFRERpIGRcdTAwRjluZyB0aFx1MUVBMyB0aFx1MDBFQW0gZmlsZSAuanBnLy5qcGVnIG1cdTFFREJpIHZcdTAwRTBvIGJcdTFFQTV0IGtcdTFFRjMgdGhcdTAxQjAgbVx1MUVFNWMgZ2Egblx1MDBFMG8gLT4gVFx1MUVGMSBcdTAxMTFcdTFFRDluZyB4XHUxRUVEIGxcdTAwRkQgdFx1MDBFMWNoIG5cdTFFQzFuIHNhbmcgUE5HIVxuICAgICAgc2VydmVyLndhdGNoZXIub24oJ2FkZCcsIGFzeW5jIChmaWxlUGF0aCkgPT4ge1xuICAgICAgICBjb25zdCBub3JtID0gZmlsZVBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuICAgICAgICBpZiAoL3B1YmxpY1xcL2Fzc2V0c1xcL2xhbmRzY2FwZXNcXC8oW14vXSspXFwvLitcXC4oanBnfGpwZWcpJC9pLnRlc3Qobm9ybSkpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IG5vcm0ubWF0Y2goL3B1YmxpY1xcL2Fzc2V0c1xcL2xhbmRzY2FwZXNcXC8oW14vXSspL2kpO1xuICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFxcblx1RDgzRFx1RENGOCBbQXV0by1Qcm9jZXNzXSBQaFx1MDBFMXQgaGlcdTFFQzduIFx1MUVBM25oIEpQRyBtXHUxRURCaTogJHtmaWxlUGF0aH1gKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGF3YWl0IHByb2Nlc3NMYW5kc2NhcGVGb2xkZXIobWF0Y2hbMF0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1x1Mjc0QyBMXHUxRUQ3aSB0XHUxRUYxIFx1MDExMVx1MUVEOW5nIHhcdTFFRUQgbFx1MDBGRCBcdTFFQTNuaDonLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNlcnZlci53YXRjaGVyLm9uKCdhbGwnLCAoZXZlbnQsIGZpbGVQYXRoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vcm0gPSBmaWxlUGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG4gICAgICAgIGlmIChub3JtLmluY2x1ZGVzKCdwdWJsaWMvYXNzZXRzL2xhbmRzY2FwZXMnKSB8fCBub3JtLmluY2x1ZGVzKCdwdWJsaWMvYXNzZXRzL3RyYWlucy90ZW1wbGF0ZXMnKSkge1xuICAgICAgICAgIGdlbmVyYXRlUmVnaXN0cnlGaWxlcygpO1xuICAgICAgICAgIHNlcnZlci53cy5zZW5kKHsgdHlwZTogJ2Z1bGwtcmVsb2FkJyB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcuLycsXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBhc3NldFJlZ2lzdHJ5UGx1Z2luKCldLFxufSk7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkY6XFxcXFRyYWluVG9UaGUgTmV2ZXJsYW5kXFxcXHNjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXFRyYWluVG9UaGUgTmV2ZXJsYW5kXFxcXHNjcmlwdHNcXFxcc2Nhbl9hc3NldHMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L1RyYWluVG9UaGUlMjBOZXZlcmxhbmQvc2NyaXB0cy9zY2FuX2Fzc2V0cy5qc1wiO2ltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLyoqXG4gKiBUXHUxRUYxIFx1MDExMVx1MUVEOW5nIGNodXlcdTFFQzNuIFx1MDExMVx1MUVENWkgdFx1MDBFQW4gdGhcdTAxQjAgbVx1MUVFNWMgc2FuZyB0XHUwMEVBbiBoaVx1MUVDM24gdGhcdTFFQ0IgVGlcdTFFQkZuZyBWaVx1MUVDN3QgLyBUaFx1MDBFMm4gdGhpXHUxRUM3blxuICovXG5mdW5jdGlvbiBodW1hbml6ZU5hbWUoaWQpIHtcbiAgY29uc3QgbWFwID0ge1xuICAgIGRhbGF0OiAnXHUwMTEwXHUwMEUwIExcdTFFQTF0IE5nXHUwMEUwbiBIb2EnLFxuICAgIGhhbG9uZzogJ1ZcdTFFQ0JuaCBIXHUxRUExIExvbmcnLFxuICAgIGhvaWFuOiAnUGhcdTFFRDEgQ1x1MUVENSBIXHUxRUQ5aSBBbicsXG4gICAgbmhhdHJhbmc6ICdCaVx1MUVDM24gTmhhIFRyYW5nJyxcbiAgICBzYXBhOiAnU2EgUGEgVFx1MDBFMnkgQlx1MUVBRmMnLFxuICAgIHRva3lvOiAnVGhcdTAwRTBuaCBQaFx1MUVEMSBUb2t5bycsXG4gICAgdG9reW9fZnVqaTogJ1Rva3lvICYgTlx1MDBGQWkgUGhcdTAwRkEgU1x1MDEyOScsXG4gICAga3lvdG86ICdDXHUxRUQxIFx1MDExMFx1MDBGNCBLeW90bycsXG4gICAga3lvdG9fYXV0dW1uOiAnS3lvdG8gTVx1MDBGOWEgVGh1IFZcdTAwRTBuZycsXG4gICAgbmV3eW9yazogJ05ldyBZb3JrIFNreWxpbmUnLFxuICAgIGRhbmFuZzogJ1x1MDExMFx1MDBFMCBOXHUxRUI1bmcgQmlcdTFFQzNuIFx1MDExMFx1MUVCOXAnLFxuICAgIHBhcmlzOiAnS2luaCBcdTAxMTBcdTAwRjQgUGFyaXMnLFxuICAgIGhhbm9pOiAnSFx1MDBFMCBOXHUxRUQ5aSAzNiBQaFx1MUVEMSBQaFx1MDFCMFx1MUVERG5nJyxcbiAgICBodWU6ICdDXHUxRUQxIFx1MDExMFx1MDBGNCBIdVx1MUVCRicsXG4gICAgcGh1cXVvYzogJ1x1MDExMFx1MUVBM28gTmdcdTFFQ0RjIFBoXHUwMEZBIFF1XHUxRUQxYycsXG4gICAgdHJhaW5fcmVkX3NoaW5rYW5zZW46ICdUXHUwMEUwdSBTaGlua2Fuc2VuIFx1MDExMFx1MUVDRiBTaVx1MDBFQXUgVFx1MUVEMWMnLFxuICAgIHRyYWluX29yYW5nZV9idWxsZXQ6ICdUXHUwMEUwdSBDYW8gVFx1MUVEMWMgQ2FtIFZcdTAwRTBuZycsXG4gICAgdHJhaW5fYmx1ZV9tZXRybzogJ1RcdTAwRTB1IFx1MDExMGlcdTFFQzduIE5nXHUxRUE3bSBYYW5oIExhbScsXG4gICAgdHJhaW5feWVsbG93X21ldHJvOiAnVFx1MDBFMHUgXHUwMTEwaVx1MUVDN24gTmdcdTFFQTdtIFZcdTAwRTBuZyBcdTAxMTBlbiAoVS1CYWhuKScsXG4gICAgdHJhaW5fdmludGFnZV9zdGVhbTogJ1RcdTAwRTB1IEhcdTAxQTFpIE5cdTAxQjBcdTFFREJjIFRoYW4gXHUwMTEwXHUwMEUxIENcdTFFRDUgXHUwMTEwaVx1MUVDM24nLFxuICAgIHRyYWluX29pbF9zdGVhbTogJ1RcdTAwRTB1IEhcdTAxQTFpIE5cdTAxQjBcdTFFREJjIFRoXHUwMEY5bmcgRFx1MUVBN3UnLFxuICAgIHRyYWluX2dyZWVuX2NhcmdvOiAnVFx1MDBFMHUgSFx1MDBFMG5nIENvbnRhaW5lciBYYW5oIExcdTAwRTEnLFxuICAgIHRyYWluX29yYW5nZV90cmFtOiAnVFx1MDBFMHUgXHUwMTEwaVx1MUVDN24gTVx1MUVCN3QgXHUwMTEwXHUxRUE1dCBDYW0gQ1x1MUVENSBcdTAxMTBpXHUxRUMzbicsXG4gICAgdHJhaW5fcmVkX3doaXRlX2NvbW11dGVyOiAnVFx1MDBFMHUgTGlcdTAwRUFuIFRcdTFFQzluaCBcdTAxMTBcdTFFQ0YgVHJcdTFFQUZuZyBOaFx1MUVBRHQgQlx1MUVBM24nLFxuICAgIHRyYWluX21vbm9yYWlsOiAnVFx1MDBFMHUgTW9ub3JhaWwgVHJlbyBUXHUwMUIwXHUwMUExbmcgTGFpJyxcbiAgfTtcblxuICBpZiAobWFwW2lkXSkgcmV0dXJuIG1hcFtpZF07XG5cbiAgLy8gTlx1MUVCRnUga2hcdTAwRjRuZyBjXHUwMEYzIHRyb25nIG1hcCwgdFx1MUVGMSBmb3JtYXQ6IFwibXlfbmV3X3N0YXRpb25cIiAtPiBcIk15IE5ldyBTdGF0aW9uXCJcbiAgcmV0dXJuIGlkXG4gICAgLnJlcGxhY2UoL150cmFpbl8vLCAnVFx1MDBFMHUgJylcbiAgICAuc3BsaXQoJ18nKVxuICAgIC5tYXAod29yZCA9PiB3b3JkLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKSlcbiAgICAuam9pbignICcpO1xufVxuXG4vKipcbiAqIFF1XHUwMEU5dCB0b1x1MDBFMG4gYlx1MUVEOSB0aFx1MDFCMCBtXHUxRUU1YyBwdWJsaWMvYXNzZXRzL2xhbmRzY2FwZXMgXHUwMTExXHUxRUMzIHNpbmggcmEgU0NFTkVTXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FuTGFuZHNjYXBlcygpIHtcbiAgY29uc3QgbGFuZHNjYXBlc0RpciA9IHBhdGgucmVzb2x2ZSgncHVibGljL2Fzc2V0cy9sYW5kc2NhcGVzJyk7XG4gIGlmICghZnMuZXhpc3RzU3luYyhsYW5kc2NhcGVzRGlyKSkgcmV0dXJuIFtdO1xuXG4gIGNvbnN0IGRpcnMgPSBmcy5yZWFkZGlyU3luYyhsYW5kc2NhcGVzRGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSlcbiAgICAuZmlsdGVyKGQgPT4gZC5pc0RpcmVjdG9yeSgpKVxuICAgIC5tYXAoZCA9PiBkLm5hbWUpO1xuXG4gIGNvbnN0IHNjZW5lcyA9IFtdO1xuXG4gIGZvciAoY29uc3QgZGlyIG9mIGRpcnMpIHtcbiAgICBjb25zdCBkaXJQYXRoID0gcGF0aC5qb2luKGxhbmRzY2FwZXNEaXIsIGRpcik7XG4gICAgY29uc3QgbWV0YVBhdGggPSBwYXRoLmpvaW4oZGlyUGF0aCwgJ21ldGEuanNvbicpO1xuICAgIGxldCBtZXRhID0ge307XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhtZXRhUGF0aCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG1ldGEgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhtZXRhUGF0aCwgJ3V0Zi04JykpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFx1MjZBMFx1RkUwRiBMXHUxRUQ3aSBcdTAxMTFcdTFFQ0RjICR7bWV0YVBhdGh9OmAsIGUubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkaXJQYXRoKTtcblxuICAgIC8vIFRcdTAwRUNtIGZpbGUgYmFja2dyb3VuZFxuICAgIGxldCBiZ1VybCA9ICcnO1xuICAgIGlmIChmaWxlcy5pbmNsdWRlcygnYmFja2dyb3VuZC5wbmcnKSkge1xuICAgICAgYmdVcmwgPSBgLi9hc3NldHMvbGFuZHNjYXBlcy8ke2Rpcn0vYmFja2dyb3VuZC5wbmdgO1xuICAgIH0gZWxzZSBpZiAoZmlsZXMuaW5jbHVkZXMoJ2JhY2tncm91bmQuanBnJykpIHtcbiAgICAgIGJnVXJsID0gYC4vYXNzZXRzL2xhbmRzY2FwZXMvJHtkaXJ9L2JhY2tncm91bmQuanBnYDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYW55QmcgPSBmaWxlcy5maW5kKGYgPT4gZi5zdGFydHNXaXRoKCdiYWNrZ3JvdW5kJykgfHwgZi5zdGFydHNXaXRoKCdiZycpKTtcbiAgICAgIGlmIChhbnlCZykgYmdVcmwgPSBgLi9hc3NldHMvbGFuZHNjYXBlcy8ke2Rpcn0vJHthbnlCZ31gO1xuICAgIH1cblxuICAgIGlmICghYmdVcmwpIHtcbiAgICAgIC8vIEJcdTFFQ0YgcXVhIHRoXHUwMUIwIG1cdTFFRTVjIG5cdTFFQkZ1IGtoXHUwMEY0bmcgY1x1MDBGMyBcdTFFQTNuaCBiYWNrZ3JvdW5kIG5cdTAwRTBvXG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBUXHUwMEVDbSBmaWxlIGJhY2tncm91bmRfbGlnaHRzXG4gICAgbGV0IGJnTGlnaHRzVXJsID0gdW5kZWZpbmVkO1xuICAgIGlmIChmaWxlcy5pbmNsdWRlcygnYmFja2dyb3VuZF9saWdodHMucG5nJykpIHtcbiAgICAgIGJnTGlnaHRzVXJsID0gYC4vYXNzZXRzL2xhbmRzY2FwZXMvJHtkaXJ9L2JhY2tncm91bmRfbGlnaHRzLnBuZ2A7XG4gICAgfSBlbHNlIGlmIChmaWxlcy5pbmNsdWRlcygnYmFja2dyb3VuZF9saWdodHMuc3ZnJykpIHtcbiAgICAgIGJnTGlnaHRzVXJsID0gYC4vYXNzZXRzL2xhbmRzY2FwZXMvJHtkaXJ9L2JhY2tncm91bmRfbGlnaHRzLnN2Z2A7XG4gICAgfVxuXG4gICAgLy8gVFx1MDBFQ20gZmlsZSBtaWRncm91bmRfdHJhY2tcbiAgICBsZXQgbWdVcmwgPSAnJztcbiAgICBpZiAoZmlsZXMuaW5jbHVkZXMoJ21pZGdyb3VuZF90cmFjay5wbmcnKSkge1xuICAgICAgbWdVcmwgPSBgLi9hc3NldHMvbGFuZHNjYXBlcy8ke2Rpcn0vbWlkZ3JvdW5kX3RyYWNrLnBuZ2A7XG4gICAgfSBlbHNlIGlmIChmaWxlcy5pbmNsdWRlcygnbWlkZ3JvdW5kX3RyYWNrLnN2ZycpKSB7XG4gICAgICBtZ1VybCA9IGAuL2Fzc2V0cy9sYW5kc2NhcGVzLyR7ZGlyfS9taWRncm91bmRfdHJhY2suc3ZnYDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmFsbGJhY2sgblx1MUVCRnUgc2NlbmUgY2hcdTAxQjBhIGNcdTAwRjMgcmF5IHJpXHUwMEVBbmc6IGRcdTAwRjluZyByYXkgY2h1XHUxRUE5biBcdTAxMTBcdTAwRTAgTFx1MUVBMXRcbiAgICAgIG1nVXJsID0gYC4vYXNzZXRzL2xhbmRzY2FwZXMvZGFsYXQvbWlkZ3JvdW5kX3RyYWNrLnN2Z2A7XG4gICAgfVxuXG4gICAgLy8gVFx1MDBFQ20gZmlsZSBtaWRncm91bmRfbGlnaHRzXG4gICAgbGV0IG1nTGlnaHRzVXJsID0gdW5kZWZpbmVkO1xuICAgIGlmIChmaWxlcy5pbmNsdWRlcygnbWlkZ3JvdW5kX2xpZ2h0cy5wbmcnKSkge1xuICAgICAgbWdMaWdodHNVcmwgPSBgLi9hc3NldHMvbGFuZHNjYXBlcy8ke2Rpcn0vbWlkZ3JvdW5kX2xpZ2h0cy5wbmdgO1xuICAgIH1cblxuICAgIGNvbnN0IG5hbWUgPSBtZXRhLm5hbWUgfHwgaHVtYW5pemVOYW1lKGRpcik7XG4gICAgY29uc3Qgc3VidGl0bGUgPSBtZXRhLnN1YnRpdGxlIHx8IGBDaHV5XHUxRUJGbiB0XHUwMEUwdSBxdWEgZ2EgJHtuYW1lfWA7XG4gICAgY29uc3QgbG9jYXRpb24gPSBtZXRhLmxvY2F0aW9uIHx8ICdWaVx1MUVDN3QgTmFtJztcbiAgICBjb25zdCBiZ1NwZWVkID0gbWV0YS5iZ1NwZWVkICE9PSB1bmRlZmluZWQgPyBtZXRhLmJnU3BlZWQgOiAwLjE1O1xuICAgIGNvbnN0IG1nU3BlZWQgPSBtZXRhLm1nU3BlZWQgIT09IHVuZGVmaW5lZCA/IG1ldGEubWdTcGVlZCA6IDAuODU7XG5cbiAgICAvLyBUaGFtIHNcdTFFRDEgY1x1MUVBNXUgaFx1MDBFQ25oIHNjYWxlIHJhdGlvICYgdHJcdTFFRTVjIFkgY1x1MUVFN2EgYmFja2dyb3VuZFxuICAgIGNvbnN0IGJnU2NhbGVSYXRpbyA9IG1ldGEuYmdTY2FsZVJhdGlvICE9PSB1bmRlZmluZWRcbiAgICAgID8gTnVtYmVyKG1ldGEuYmdTY2FsZVJhdGlvKVxuICAgICAgOiAobWV0YS5iZ1NjYWxlICE9PSB1bmRlZmluZWQgPyBOdW1iZXIobWV0YS5iZ1NjYWxlKSA6IHVuZGVmaW5lZCk7XG5cbiAgICBjb25zdCBiZ1kgPSBtZXRhLmJnWSAhPT0gdW5kZWZpbmVkXG4gICAgICA/IG1ldGEuYmdZXG4gICAgICA6IChtZXRhLmJnT2Zmc2V0WSAhPT0gdW5kZWZpbmVkID8gbWV0YS5iZ09mZnNldFkgOiB1bmRlZmluZWQpO1xuXG4gICAgLy8gVGhhbSBzXHUxRUQxIGNcdTFFQTV1IGhcdTAwRUNuaCBzY2FsZSByYXRpbyAmIHRyXHUxRUU1YyBZIGNcdTFFRTdhIG1pZGdyb3VuZFxuICAgIGNvbnN0IG1nU2NhbGVSYXRpbyA9IG1ldGEubWdTY2FsZVJhdGlvICE9PSB1bmRlZmluZWRcbiAgICAgID8gTnVtYmVyKG1ldGEubWdTY2FsZVJhdGlvKVxuICAgICAgOiAobWV0YS5tZ1NjYWxlICE9PSB1bmRlZmluZWQgPyBOdW1iZXIobWV0YS5tZ1NjYWxlKSA6IChtZXRhLnNjYWxlUmF0aW8gIT09IHVuZGVmaW5lZCA/IE51bWJlcihtZXRhLnNjYWxlUmF0aW8pIDogdW5kZWZpbmVkKSk7XG5cbiAgICBjb25zdCBtZ1kgPSBtZXRhLm1nWSAhPT0gdW5kZWZpbmVkXG4gICAgICA/IG1ldGEubWdZXG4gICAgICA6IChtZXRhLm1nT2Zmc2V0WSAhPT0gdW5kZWZpbmVkID8gbWV0YS5tZ09mZnNldFkgOiAobWV0YS55QXhpcyAhPT0gdW5kZWZpbmVkID8gbWV0YS55QXhpcyA6IHVuZGVmaW5lZCkpO1xuXG4gICAgLy8gVGhhbSBzXHUxRUQxIGNcdTFFQTV1IGhcdTAwRUNuaCB0clx1MUVFNWMgWSBjXHUxRUU3YSBcdTAxMTFvXHUwMEUwbiB0XHUwMEUwdSAoXHUwMTExXHUxRUQ5YyBsXHUxRUFEcCB2XHUxRURCaSBtaWRncm91bmQpXG4gICAgY29uc3QgdHJhaW5ZID0gbWV0YS50cmFpblkgIT09IHVuZGVmaW5lZFxuICAgICAgPyBtZXRhLnRyYWluWVxuICAgICAgOiAobWV0YS50cmFpbk9mZnNldFkgIT09IHVuZGVmaW5lZCA/IG1ldGEudHJhaW5PZmZzZXRZIDogdW5kZWZpbmVkKTtcblxuICAgIGNvbnN0IHRyYWluU2NhbGVSYXRpbyA9IG1ldGEudHJhaW5TY2FsZVJhdGlvICE9PSB1bmRlZmluZWRcbiAgICAgID8gTnVtYmVyKG1ldGEudHJhaW5TY2FsZVJhdGlvKVxuICAgICAgOiAobWV0YS50cmFpblNjYWxlICE9PSB1bmRlZmluZWQgPyBOdW1iZXIobWV0YS50cmFpblNjYWxlKSA6IHVuZGVmaW5lZCk7XG5cbiAgICBjb25zdCBza3lQcmVzZXRzID0gbWV0YS5za3lQcmVzZXRzIHx8IHtcbiAgICAgIGRhd246IFsnI2ZiYzJlYicsICcjYTZjMWVlJ10sXG4gICAgICBkYXk6IFsnIzRmYWNmZScsICcjMDBmMmZlJywgJyNlMGY3ZmEnXSxcbiAgICAgIHN1bnNldDogWycjZmE3MDlhJywgJyNmZWUxNDAnLCAnI2YzOWMxMiddLFxuICAgICAgbmlnaHQ6IFsnIzA5MjAzZicsICcjMWIyYTRhJywgJyMyYzNlNTAnXSxcbiAgICB9O1xuXG4gICAgc2NlbmVzLnB1c2goe1xuICAgICAgaWQ6IGRpcixcbiAgICAgIG5hbWUsXG4gICAgICBzdWJ0aXRsZSxcbiAgICAgIGxvY2F0aW9uLFxuICAgICAgYmdTcGVlZCxcbiAgICAgIG1nU3BlZWQsXG4gICAgICAuLi4oYmdTY2FsZVJhdGlvICE9PSB1bmRlZmluZWQgPyB7IGJnU2NhbGVSYXRpbyB9IDoge30pLFxuICAgICAgLi4uKGJnWSAhPT0gdW5kZWZpbmVkID8geyBiZ1kgfSA6IHt9KSxcbiAgICAgIC4uLihtZ1NjYWxlUmF0aW8gIT09IHVuZGVmaW5lZCA/IHsgbWdTY2FsZVJhdGlvIH0gOiB7fSksXG4gICAgICAuLi4obWdZICE9PSB1bmRlZmluZWQgPyB7IG1nWSB9IDoge30pLFxuICAgICAgLi4uKHRyYWluWSAhPT0gdW5kZWZpbmVkID8geyB0cmFpblkgfSA6IHt9KSxcbiAgICAgIC4uLih0cmFpblNjYWxlUmF0aW8gIT09IHVuZGVmaW5lZCA/IHsgdHJhaW5TY2FsZVJhdGlvIH0gOiB7fSksXG4gICAgICBiYWNrZ3JvdW5kVXJsOiBiZ1VybCxcbiAgICAgIC4uLihiZ0xpZ2h0c1VybCA/IHsgYmFja2dyb3VuZExpZ2h0c1VybDogYmdMaWdodHNVcmwgfSA6IHt9KSxcbiAgICAgIG1pZGdyb3VuZFVybDogbWdVcmwsXG4gICAgICAuLi4obWdMaWdodHNVcmwgPyB7IG1pZGdyb3VuZExpZ2h0c1VybDogbWdMaWdodHNVcmwgfSA6IHt9KSxcbiAgICAgIHNreVByZXNldHMsXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gc2NlbmVzO1xufVxuXG4vKipcbiAqIFF1XHUwMEU5dCB0b1x1MDBFMG4gYlx1MUVEOSB0aFx1MDFCMCBtXHUxRUU1YyBwdWJsaWMvYXNzZXRzL3RyYWlucy90ZW1wbGF0ZXMgXHUwMTExXHUxRUMzIHNpbmggcmEgVFJBSU5TXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FuVHJhaW5zKCkge1xuICBjb25zdCB0cmFpbnNEaXIgPSBwYXRoLnJlc29sdmUoJ3B1YmxpYy9hc3NldHMvdHJhaW5zL3RlbXBsYXRlcycpO1xuICBpZiAoIWZzLmV4aXN0c1N5bmModHJhaW5zRGlyKSkgcmV0dXJuIFtdO1xuXG4gIGNvbnN0IGRpcnMgPSBmcy5yZWFkZGlyU3luYyh0cmFpbnNEaXIsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KVxuICAgIC5maWx0ZXIoZCA9PiBkLmlzRGlyZWN0b3J5KCkpXG4gICAgLm1hcChkID0+IGQubmFtZSk7XG5cbiAgY29uc3QgdHJhaW5zID0gW107XG5cbiAgZm9yIChjb25zdCBkaXIgb2YgZGlycykge1xuICAgIGNvbnN0IGRpclBhdGggPSBwYXRoLmpvaW4odHJhaW5zRGlyLCBkaXIpO1xuICAgIGNvbnN0IG1ldGFQYXRoID0gcGF0aC5qb2luKGRpclBhdGgsICdtZXRhLmpzb24nKTtcbiAgICBsZXQgbWV0YSA9IHt9O1xuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMobWV0YVBhdGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBtZXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMobWV0YVBhdGgsICd1dGYtOCcpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBcdTI2QTBcdUZFMEYgTFx1MUVEN2kgXHUwMTExXHUxRUNEYyAke21ldGFQYXRofTpgLCBlLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyUGF0aCk7XG5cbiAgICAvLyBcdTAxQUZ1IHRpXHUwMEVBbiBiXHUxRUEzbiAzIHRvYSBjXHUwMEUybiBiXHUxRUIxbmcgdHJhaW5fYm9keV8zY2FyLnBuZywgblx1MUVCRnUga2hcdTAwRjRuZyBjXHUwMEYzIHRoXHUwMEVDIGRcdTAwRjluZyB0cmFpbl9ib2R5LnBuZ1xuICAgIGxldCBib2R5VXJsID0gJyc7XG4gICAgbGV0IGNhckNvdW50ID0gbWV0YS5jYXJDb3VudCB8fCA0O1xuXG4gICAgaWYgKGZpbGVzLmluY2x1ZGVzKCd0cmFpbl9ib2R5XzNjYXIucG5nJykpIHtcbiAgICAgIGJvZHlVcmwgPSBgLi9hc3NldHMvdHJhaW5zL3RlbXBsYXRlcy8ke2Rpcn0vdHJhaW5fYm9keV8zY2FyLnBuZ2A7XG4gICAgICBjYXJDb3VudCA9IDM7XG4gICAgfSBlbHNlIGlmIChmaWxlcy5pbmNsdWRlcygndHJhaW5fYm9keS5wbmcnKSkge1xuICAgICAgYm9keVVybCA9IGAuL2Fzc2V0cy90cmFpbnMvdGVtcGxhdGVzLyR7ZGlyfS90cmFpbl9ib2R5LnBuZ2A7XG4gICAgfVxuXG4gICAgaWYgKCFib2R5VXJsKSBjb250aW51ZTtcblxuICAgIC8vIFRcdTAwRUNtIGZpbGUgXHUwMTExXHUwMEU4biBjXHUxRUVEYSBzXHUxRUQ1XG4gICAgbGV0IGxpZ2h0c1VybCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoZmlsZXMuaW5jbHVkZXMoJ3RyYWluX2xpZ2h0c18zY2FyLnBuZycpKSB7XG4gICAgICBsaWdodHNVcmwgPSBgLi9hc3NldHMvdHJhaW5zL3RlbXBsYXRlcy8ke2Rpcn0vdHJhaW5fbGlnaHRzXzNjYXIucG5nYDtcbiAgICB9IGVsc2UgaWYgKGZpbGVzLmluY2x1ZGVzKCd0cmFpbl9saWdodHMucG5nJykpIHtcbiAgICAgIGxpZ2h0c1VybCA9IGAuL2Fzc2V0cy90cmFpbnMvdGVtcGxhdGVzLyR7ZGlyfS90cmFpbl9saWdodHMucG5nYDtcbiAgICB9XG5cbiAgICBjb25zdCBpc1N0ZWFtID0gZGlyLmluY2x1ZGVzKCdzdGVhbScpO1xuICAgIGNvbnN0IG5hbWUgPSBtZXRhLm5hbWUgfHwgaHVtYW5pemVOYW1lKGRpcik7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBtZXRhLmRlc2NyaXB0aW9uIHx8IGBcdTAxMTBvXHUwMEUwbiB0XHUwMEUwdSAke25hbWV9IHZcdTFFQURuIGhcdTAwRTBuaCBcdTAwRUFtIFx1MDBFMWkgdHJcdTAwRUFuIGhcdTAwRTBuaCB0clx1MDBFQ25oYDtcbiAgICBjb25zdCB3aGVlbFR5cGUgPSBtZXRhLndoZWVsVHlwZSB8fCAoaXNTdGVhbSA/ICdzcG9rZScgOiAnc3RhbmRhcmQnKTtcbiAgICBjb25zdCBoYXNQYW50b2dyYXBoID0gbWV0YS5oYXNQYW50b2dyYXBoICE9PSB1bmRlZmluZWQgPyBtZXRhLmhhc1BhbnRvZ3JhcGggOiBmYWxzZTtcbiAgICBjb25zdCBoYXNTbW9rZSA9IG1ldGEuaGFzU21va2UgIT09IHVuZGVmaW5lZCA/IG1ldGEuaGFzU21va2UgOiBpc1N0ZWFtO1xuXG4gICAgdHJhaW5zLnB1c2goe1xuICAgICAgaWQ6IGRpcixcbiAgICAgIG5hbWUsXG4gICAgICBkZXNjcmlwdGlvbixcbiAgICAgIGNhckNvdW50LFxuICAgICAgYm9keVVybCxcbiAgICAgIC4uLihsaWdodHNVcmwgPyB7IGxpZ2h0c1VybCB9IDoge30pLFxuICAgICAgd2hlZWxUeXBlLFxuICAgICAgaGFzUGFudG9ncmFwaCxcbiAgICAgIGhhc1Ntb2tlLFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHRyYWlucztcbn1cblxuLyoqXG4gKiBHaGkgdFx1MUVGMSBcdTAxMTFcdTFFRDluZyByYSBzcmMvY29uZmlnL2F1dG9fc2NlbmVzLnRzIHZcdTAwRTAgc3JjL2NvbmZpZy9hdXRvX3RyYWlucy50c1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVSZWdpc3RyeUZpbGVzKCkge1xuICBjb25zdCBzY2VuZXMgPSBzY2FuTGFuZHNjYXBlcygpO1xuICBjb25zdCB0cmFpbnMgPSBzY2FuVHJhaW5zKCk7XG5cbiAgY29uc3Qgc2NlbmVzVHMgPSBgLy8gXHVEODNFXHVERDE2IFRcdTFFRjAgXHUwMTEwXHUxRUQ4TkcgVFx1MUVBME8gU0lOSCBUXHUxRUVBIFRIXHUwMUFGIE1cdTFFRTRDIHB1YmxpYy9hc3NldHMvbGFuZHNjYXBlcy9cbi8vIEtIXHUwMEQ0TkcgQ0hcdTFFQzhOSCBTXHUxRUVDQSBUSFx1MUVFNiBDXHUwMEQ0TkcgRklMRSBOXHUwMEMwWS5cbi8vIFx1MDExMFx1MUVDMyB0aFx1MDBFQW0gZ2EgbVx1MUVEQmk6IGNoXHUxRUM5IGNcdTFFQTduIHRcdTFFQTFvIGZvbGRlciB0cm9uZyBwdWJsaWMvYXNzZXRzL2xhbmRzY2FwZXMvW3RcdTAwRUFuX2dhXS8ga1x1MDBFOG0gdGhlbyBtZXRhLmpzb24gKHRcdTAwRjl5IGNoXHUxRUNEbilcblxuaW1wb3J0IHsgU2NlbmVDb25maWcgfSBmcm9tICcuLi90eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBTQ0VORVM6IFNjZW5lQ29uZmlnW10gPSAke0pTT04uc3RyaW5naWZ5KHNjZW5lcywgbnVsbCwgMil9O1xuYDtcblxuICBjb25zdCB0cmFpbnNUcyA9IGAvLyBcdUQ4M0VcdUREMTYgVFx1MUVGMCBcdTAxMTBcdTFFRDhORyBUXHUxRUEwTyBTSU5IIFRcdTFFRUEgVEhcdTAxQUYgTVx1MUVFNEMgcHVibGljL2Fzc2V0cy90cmFpbnMvdGVtcGxhdGVzL1xuLy8gS0hcdTAwRDRORyBDSFx1MUVDOE5IIFNcdTFFRUNBIFRIXHUxRUU2IENcdTAwRDRORyBGSUxFIE5cdTAwQzBZLlxuLy8gXHUwMTEwXHUxRUMzIHRoXHUwMEVBbSBcdTAxMTFvXHUwMEUwbiB0XHUwMEUwdSBtXHUxRURCaTogY2hcdTFFQzkgY1x1MUVBN24gdFx1MUVBMW8gZm9sZGVyIHRyb25nIHB1YmxpYy9hc3NldHMvdHJhaW5zL3RlbXBsYXRlcy9bdFx1MDBFQW5fdFx1MDBFMHVdLyBrXHUwMEU4bSB0aGVvIG1ldGEuanNvbiAodFx1MDBGOXkgY2hcdTFFQ0RuKVxuXG5pbXBvcnQgeyBUcmFpblRoZW1lIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY29uc3QgVFJBSU5TOiBUcmFpblRoZW1lW10gPSAke0pTT04uc3RyaW5naWZ5KHRyYWlucywgbnVsbCwgMil9O1xuYDtcblxuICBjb25zdCBvdXRTY2VuZXMgPSBwYXRoLnJlc29sdmUoJ3NyYy9jb25maWcvYXV0b19zY2VuZXMudHMnKTtcbiAgY29uc3Qgb3V0VHJhaW5zID0gcGF0aC5yZXNvbHZlKCdzcmMvY29uZmlnL2F1dG9fdHJhaW5zLnRzJyk7XG5cbiAgZnMud3JpdGVGaWxlU3luYyhvdXRTY2VuZXMsIHNjZW5lc1RzLCAndXRmLTgnKTtcbiAgZnMud3JpdGVGaWxlU3luYyhvdXRUcmFpbnMsIHRyYWluc1RzLCAndXRmLTgnKTtcblxuICBjb25zb2xlLmxvZyhgXHUyNzA1IFtBc3NldCBSZWdpc3RyeSBTY2FubmVyXSBcdTAxMTBcdTAwRTMgcXVcdTAwRTl0IHRoXHUwMEUwbmggY1x1MDBGNG5nICR7c2NlbmVzLmxlbmd0aH0gXHUwMTExXHUxRUNCYSBcdTAxMTFpXHUxRUMzbSAoc2NlbmVzKSB2XHUwMEUwICR7dHJhaW5zLmxlbmd0aH0gXHUwMTExb1x1MDBFMG4gdFx1MDBFMHUgKHRyYWlucykhYCk7XG59XG5cbi8vIENoXHUxRUExeSB0clx1MUVGMWMgdGlcdTFFQkZwXG5pZiAocHJvY2Vzcy5hcmd2WzFdICYmIHByb2Nlc3MuYXJndlsxXS5lbmRzV2l0aCgnc2Nhbl9hc3NldHMuanMnKSkge1xuICBnZW5lcmF0ZVJlZ2lzdHJ5RmlsZXMoKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcVHJhaW5Ub1RoZSBOZXZlcmxhbmRcXFxcc2NyaXB0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcVHJhaW5Ub1RoZSBOZXZlcmxhbmRcXFxcc2NyaXB0c1xcXFxwcm9jZXNzX2xhbmRzY2FwZV90aGVtZS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovVHJhaW5Ub1RoZSUyME5ldmVybGFuZC9zY3JpcHRzL3Byb2Nlc3NfbGFuZHNjYXBlX3RoZW1lLmpzXCI7aW1wb3J0IHNoYXJwIGZyb20gJ3NoYXJwJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGdlbmVyYXRlUmVnaXN0cnlGaWxlcyB9IGZyb20gJy4vc2Nhbl9hc3NldHMuanMnO1xuXG4vKipcbiAqIFRodVx1MUVBRHQgdG9cdTAwRTFuIHRcdTAwRTFjaCBuXHUxRUMxbiAmIGNodVx1MUVBOW4gaFx1MDBGM2EgQXNzZXQgcGhvbmcgY1x1MUVBM25oOlxuICogMS4gQmFja2dyb3VuZCAoSFx1MUVBRHUgQ1x1MUVBM25oKTpcbiAqICAgIC0gUXV5IHRcdTFFQUZjOiBQaFx1MUVBN24gblx1MUVDMW4gKGJcdTFFQTd1IHRyXHUxRUREaSwgbFx1MUVDMSB0clx1MDBFQW4vZFx1MDFCMFx1MUVEQmkpIGxcdTAwRTAgbVx1MDBFMHUgdHJcdTFFQUZuZyB0aHVcdTFFQTduIGtoaVx1MUVCRnQgKCNGRkZGRkYpLlxuICogICAgLSBTXHUxRUVEIGRcdTFFRTVuZyBCRlMgRmxvb2QgRmlsbCAobG9hbmcgdFx1MUVFQiB2aVx1MUVDMW4gbmdvXHUwMEUwaSk6XG4gKiAgICAgICsgQ2hcdTFFQzkgeFx1MDBGM2EgY1x1MDBFMWMgcGl4ZWwgblx1MUVDMW4gdHJcdTFFQUZuZyBsaVx1MDBFQW4gdGhcdTAwRjRuZyB2XHUxRURCaSB2aVx1MUVDMW4gXHUxRUEzbmguXG4gKiAgICAgICsgQlx1MUVBM28gdlx1MUVDNyAxMDAlIGNcdTAwRTFjIGNoaSB0aVx1MUVCRnQgbVx1MDBFMHUgdHJcdTFFQUZuZyBiXHUwMEVBbiB0cm9uZyB0XHUwMEUxYyBwaFx1MUVBOW0gKG5oXHUwMEUwIGNcdTFFRURhLCBidVx1MUVEM20sIHNcdTAwRjNuZyBiaVx1MUVDM24sIGNcdTFFRURhIHNcdTFFRDUpLlxuICogICAgLSBLaFx1MUVFRCB2aVx1MUVDMW4gdHJcdTFFQUZuZyAoQW50aS1IYWxvIERlZnJpbmdlKSAxcHggXHUxRURGIHJhbmggZ2lcdTFFREJpIG5nb1x1MDBFMGkuXG4gKiAgICAtIFRcdTFFRjEgXHUwMTExXHUxRUQ5bmcgdHJcdTAwRURjaCB4dVx1MUVBNXQgbVx1MUVCN3Qgblx1MUVBMSBcdTAxMTFcdTAwRThuIFx1MDExMVx1MDBFQW0gKGJhY2tncm91bmRfbGlnaHRzLnBuZykuXG4gKlxuICogMi4gTWlkZ3JvdW5kIChUcnVuZyBDXHUxRUEzbmggXHUwMTEwXHUwMUIwXHUxRUREbmcgUmF5KTpcbiAqICAgIC0gUXV5IHRcdTFFQUZjOiBLaFx1MDBGNG5nIGNcdTFFQUZ0IHRoZW8gY2hpXHUxRUMxdSBuZ2FuZywgc2NhbGUgY2hpXHUxRUMxdSBkXHUxRUNEYyBjaG8gY2h1XHUxRUE5biAoMjQwcHgpLCBuXHUxRUQxaSBuZ2FuZyBuaGlcdTFFQzF1IGhcdTAwRUNuaC5cbiAqICAgIC0gVFx1MDBFMWNoIG5cdTFFQzFuIHRyXHUxRUFGbmcgcGhcdTAwRURhIHRyXHUwMEVBbiB0aGFuaCByYXkgYlx1MUVCMW5nIEJGUyB0XHUxRUVCIHZpXHUxRUMxbiB0clx1MDBFQW4uXG4gKiAgICAtIEdpXHUxRUVGIG5ndXlcdTAwRUFuIDEwMCUgY2hpXHUxRUMxdSByXHUxRUQ5bmcgdHJhbmggdlx1MUVCRCBnXHUxRUQxYywgY28gZFx1MDBFM24gdFx1MUVGNyBsXHUxRUM3IHRoZW8gY2hpXHUxRUMxdSBjYW8gY2h1XHUxRUE5biAyNDBweC5cbiAqICAgIC0gVFx1MUVGMSBcdTAxMTFcdTFFRDluZyBsXHUxRUI3cCAodGlsZSkgbmhpXHUxRUMxdSBiXHUxRUEzbiBzYW8gZ2hcdTAwRTlwIG5nYW5nIFx1MDExMVx1MUVDMyB0XHUxRUExbyBkXHUxRUEzaSBcdTAxMTFcdTAxQjBcdTFFRERuZyByYXkgdlx1MDBGNCB0XHUxRUFEbi5cbiAqL1xuXG4vLyBIXHUwMEUwbSBraVx1MUVDM20gdHJhIHBpeGVsIGNcdTAwRjMgcGhcdTFFQTNpIG1cdTAwRTB1IHRyXHUxRUFGbmcgLyBnXHUxRUE3biB0clx1MUVBRm5nIHRodVx1MUVBN24ga2hpXHUxRUJGdCBraFx1MDBGNG5nXG5mdW5jdGlvbiBpc0Z1bGxXaGl0ZVBpeGVsKHIsIGcsIGIsIHRocmVzaG9sZCA9IDI0MCkge1xuICBpZiAociA8IHRocmVzaG9sZCB8fCBnIDwgdGhyZXNob2xkIHx8IGIgPCB0aHJlc2hvbGQpIHJldHVybiBmYWxzZTtcbiAgLy8gS2lcdTFFQzNtIHRyYSBcdTAxMTFcdTFFRDkgY1x1MDBFMm4gYlx1MUVCMW5nIHhcdTAwRTFtICh0clx1MDBFMW5oIG5oXHUxRUE3bSB2XHUxRURCaSBtXHUwMEUwdSB2XHUwMEUwbmcgbmhcdTFFQTF0IGhvXHUxRUI3YyB4YW5oIHBhc3RlbClcbiAgY29uc3QgZGlmZiA9IE1hdGgubWF4KHIsIGcsIGIpIC0gTWF0aC5taW4ociwgZywgYik7XG4gIHJldHVybiBkaWZmIDw9IDg7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzTGFuZHNjYXBlRm9sZGVyKGZvbGRlclBhdGgpIHtcbiAgbGV0IGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGZvbGRlclBhdGgpO1xuICBpZiAoIWZzLmV4aXN0c1N5bmMoZnVsbFBhdGgpKSB7XG4gICAgY29uc3QgY2FuZGlkYXRlID0gcGF0aC5yZXNvbHZlKCdwdWJsaWMvYXNzZXRzL2xhbmRzY2FwZXMnLCBmb2xkZXJQYXRoKTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhjYW5kaWRhdGUpKSB7XG4gICAgICBmdWxsUGF0aCA9IGNhbmRpZGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihgXHUyNzRDIFRoXHUwMUIwIG1cdTFFRTVjIGtoXHUwMEY0bmcgdFx1MUVEM24gdFx1MUVBMWk6ICR7ZnVsbFBhdGh9IChob1x1MUVCN2MgJHtjYW5kaWRhdGV9KWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZnVsbFBhdGgpO1xuICBjb25zb2xlLmxvZyhgXFxuPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09YCk7XG4gIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURFODAgXHUwMTEwYW5nIHF1XHUwMEU5dCB2XHUwMEUwIHhcdTFFRUQgbFx1MDBGRCB0aFx1MDFCMCBtXHUxRUU1YzogJHtwYXRoLmJhc2VuYW1lKGZ1bGxQYXRoKX1gKTtcbiAgY29uc29sZS5sb2coYD09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PWApO1xuXG4gIC8vIFRcdTAwRUNtIGZpbGUgYmFja2dyb3VuZFxuICBjb25zdCBiZ0ZpbGUgPSBmaWxlcy5maW5kKGYgPT4gL15iYWNrZ3JvdW5kXFwuKGpwZ3xqcGVnfHdlYnApJC9pLnRlc3QoZikpIHx8XG4gICAgICAgICAgICAgICAgIGZpbGVzLmZpbmQoZiA9PiAvXihiZ3xoYXVjYW5nKVxcLihqcGd8anBlZ3x3ZWJwKSQvaS50ZXN0KGYpKTtcblxuICAvLyBUXHUwMEVDbSBmaWxlIG1pZGdyb3VuZCB0cmFja1xuICBjb25zdCBtZ0ZpbGUgPSBmaWxlcy5maW5kKGYgPT4gL15taWRncm91bmRcXC4oanBnfGpwZWd8d2VicCkkL2kudGVzdChmKSkgfHxcbiAgICAgICAgICAgICAgICAgZmlsZXMuZmluZChmID0+IC9eKHRyYWNrfHJhaWx8dHJ1bmdjYW5oKVxcLihqcGd8anBlZ3x3ZWJwKSQvaS50ZXN0KGYpKTtcblxuICBpZiAoIWJnRmlsZSAmJiAhbWdGaWxlKSB7XG4gICAgY29uc29sZS5sb2coYFx1MjEzOVx1RkUwRiBLaFx1MDBGNG5nIHRcdTAwRUNtIHRoXHUxRUE1eSBmaWxlIEpQRy9KUEVHIG5cdTAwRTBvIGNcdTFFQTduIHhcdTFFRUQgbFx1MDBGRCB0cm9uZyAke3BhdGguYmFzZW5hbWUoZnVsbFBhdGgpfS5gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIC0tLSAxLiBYXHUxRUVDIExcdTAwREQgQkFDS0dST1VORCAoSFx1MUVBQ1UgQ1x1MUVBMk5IIFBBTk9SQU1BIEZVTEwgVFJcdTFFQUVORykgLS0tXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgaWYgKGJnRmlsZSkge1xuICAgIGNvbnN0IGJnSW5wdXQgPSBwYXRoLmpvaW4oZnVsbFBhdGgsIGJnRmlsZSk7XG4gICAgY29uc29sZS5sb2coYFx1RDgzQ1x1REZBOCAxLiBcdTAxMTBhbmcgeFx1MUVFRCBsXHUwMEZEIEJhY2tncm91bmQ6ICR7YmdGaWxlfS4uLmApO1xuXG4gICAgY29uc3QgaW1nID0gc2hhcnAoYmdJbnB1dCk7XG4gICAgY29uc3QgeyBkYXRhLCBpbmZvIH0gPSBhd2FpdCBpbWcucmF3KCkudG9CdWZmZXIoeyByZXNvbHZlV2l0aE9iamVjdDogdHJ1ZSB9KTtcbiAgICBjb25zdCB3ID0gaW5mby53aWR0aDtcbiAgICBjb25zdCBoID0gaW5mby5oZWlnaHQ7XG5cbiAgICAvLyBNXHUxRUEzbmcgXHUwMTExXHUwMEUxbmggZFx1MUVBNXUgcGl4ZWwgblx1MUVDMW4gbmdvXHUwMEUwaSB0clx1MUVERGkgKDE6IG5cdTFFQzFuIHRyXHUxRUFGbmcgYlx1MDBFQW4gbmdvXHUwMEUwaSwgMDogdFx1MDBFMWMgcGhcdTFFQTltIG5naFx1MUVDNyB0aHVcdTFFQUR0KVxuICAgIGNvbnN0IGlzT3V0ZG9vckJnID0gbmV3IFVpbnQ4QXJyYXkodyAqIGgpO1xuICAgIGNvbnN0IHF1ZXVlID0gbmV3IEludDMyQXJyYXkodyAqIGgpO1xuICAgIGxldCBxSGVhZCA9IDAsIHFUYWlsID0gMDtcblxuICAgIC8vIEhcdTFFQTF0IGdpXHUxRUQxbmcgKFNlZWRzKTogVmlcdTFFQzFuIHRyXHUwMEVBbiBjXHUwMEY5bmcgKHkgPSAwKVxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdzsgeCsrKSB7XG4gICAgICBjb25zdCBpZHggPSAoMCAqIHcgKyB4KSAqIGluZm8uY2hhbm5lbHM7XG4gICAgICBpZiAoaXNGdWxsV2hpdGVQaXhlbChkYXRhW2lkeF0sIGRhdGFbaWR4ICsgMV0sIGRhdGFbaWR4ICsgMl0pKSB7XG4gICAgICAgIGlzT3V0ZG9vckJnW3hdID0gMTtcbiAgICAgICAgcXVldWVbcVRhaWwrK10gPSB4O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhcdTFFQTF0IGdpXHUxRUQxbmc6IFZpXHUxRUMxbiB0clx1MDBFMWkgdlx1MDBFMCBwaFx1MUVBM2kgblx1MUVFRGEgdHJcdTAwRUFuICh5ID0gMCAtPiA2NSUgaClcbiAgICBjb25zdCBzZWVkSCA9IE1hdGguZmxvb3IoaCAqIDAuNjUpO1xuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgc2VlZEg7IHkrKykge1xuICAgICAgY29uc3QgbElkeCA9ICh5ICogdyArIDApICogaW5mby5jaGFubmVscztcbiAgICAgIGlmIChpc0Z1bGxXaGl0ZVBpeGVsKGRhdGFbbElkeF0sIGRhdGFbbElkeCArIDFdLCBkYXRhW2xJZHggKyAyXSkgJiYgIWlzT3V0ZG9vckJnW3kgKiB3ICsgMF0pIHtcbiAgICAgICAgaXNPdXRkb29yQmdbeSAqIHcgKyAwXSA9IDE7XG4gICAgICAgIHF1ZXVlW3FUYWlsKytdID0gKHkgKiB3ICsgMCk7XG4gICAgICB9XG4gICAgICBjb25zdCBySWR4ID0gKHkgKiB3ICsgKHcgLSAxKSkgKiBpbmZvLmNoYW5uZWxzO1xuICAgICAgaWYgKGlzRnVsbFdoaXRlUGl4ZWwoZGF0YVtySWR4XSwgZGF0YVtySWR4ICsgMV0sIGRhdGFbcklkeCArIDJdKSAmJiAhaXNPdXRkb29yQmdbeSAqIHcgKyAodyAtIDEpXSkge1xuICAgICAgICBpc091dGRvb3JCZ1t5ICogdyArICh3IC0gMSldID0gMTtcbiAgICAgICAgcXVldWVbcVRhaWwrK10gPSAoeSAqIHcgKyAodyAtIDEpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIXHUxRUExdCBnaVx1MUVEMW5nOiBWaVx1MUVDMW4gZFx1MDFCMFx1MUVEQmkgXHUwMTExXHUwMEUxeSAoblx1MUVCRnUgXHUxRUEzbmggY2FudmFzIGNcdTAwRjMgZFx1MUVBM2kgdHJcdTFFQUZuZyBkXHUwMUIwIHBoXHUwMEVEYSBkXHUwMUIwXHUxRURCaSBiaVx1MUVDM24vbVx1MUVCN3QgXHUwMTExXHUxRUE1dClcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHc7IHgrKykge1xuICAgICAgY29uc3QgYklkeCA9ICgoaCAtIDEpICogdyArIHgpICogaW5mby5jaGFubmVscztcbiAgICAgIGlmIChpc0Z1bGxXaGl0ZVBpeGVsKGRhdGFbYklkeF0sIGRhdGFbYklkeCArIDFdLCBkYXRhW2JJZHggKyAyXSkgJiYgIWlzT3V0ZG9vckJnWyhoIC0gMSkgKiB3ICsgeF0pIHtcbiAgICAgICAgaXNPdXRkb29yQmdbKGggLSAxKSAqIHcgKyB4XSA9IDE7XG4gICAgICAgIHF1ZXVlW3FUYWlsKytdID0gKChoIC0gMSkgKiB3ICsgeCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQkZTIEZsb29kIEZpbGwgbGFuIHRydXlcdTFFQzFuIHRcdTFFRUIgbmdvXHUwMEUwaSB2XHUwMEUwbyB0cm9uZ1xuICAgIHdoaWxlIChxSGVhZCA8IHFUYWlsKSB7XG4gICAgICBjb25zdCBjdXJyID0gcXVldWVbcUhlYWQrK107XG4gICAgICBjb25zdCBjeCA9IGN1cnIgJSB3O1xuICAgICAgY29uc3QgY3kgPSBNYXRoLmZsb29yKGN1cnIgLyB3KTtcblxuICAgICAgY29uc3QgbmVpZ2hib3JzID0gW1xuICAgICAgICBbY3ggKyAxLCBjeV0sXG4gICAgICAgIFtjeCAtIDEsIGN5XSxcbiAgICAgICAgW2N4LCBjeSArIDFdLFxuICAgICAgICBbY3gsIGN5IC0gMV1cbiAgICAgIF07XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IG54ID0gbmVpZ2hib3JzW2ldWzBdO1xuICAgICAgICBjb25zdCBueSA9IG5laWdoYm9yc1tpXVsxXTtcbiAgICAgICAgaWYgKG54ID49IDAgJiYgbnggPCB3ICYmIG55ID49IDAgJiYgbnkgPCBoKSB7XG4gICAgICAgICAgY29uc3QgbklkeCA9IG55ICogdyArIG54O1xuICAgICAgICAgIGlmICghaXNPdXRkb29yQmdbbklkeF0pIHtcbiAgICAgICAgICAgIGNvbnN0IHNyY0lkeCA9IG5JZHggKiBpbmZvLmNoYW5uZWxzO1xuICAgICAgICAgICAgaWYgKGlzRnVsbFdoaXRlUGl4ZWwoZGF0YVtzcmNJZHhdLCBkYXRhW3NyY0lkeCArIDFdLCBkYXRhW3NyY0lkeCArIDJdKSkge1xuICAgICAgICAgICAgICBpc091dGRvb3JCZ1tuSWR4XSA9IDE7XG4gICAgICAgICAgICAgIHF1ZXVlW3FUYWlsKytdID0gbklkeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMXHUxRUE1eSBUT1x1MDBDME4gQlx1MUVEOCBIXHUwMENDTkggXHUxRUEyTkggKDEwMCUgQ2FudmFzLCBLSFx1MDBENE5HIENcdTFFQUVUIEJcdTFFQTRUIEtcdTFFRjIgUEhcdTFFQTZOIE5cdTAwQzBPKVxuICAgIC8vIFRcdTAwRTFjaCBzXHUxRUExY2ggYlx1MUVBN3UgdHJcdTFFRERpIHRyXHUxRUFGbmcgdlx1MDBFMCBsXHUxRUMxIHRyXHUxRUFGbmcgYlx1MUVCMW5nIEJGUyBGbG9vZCBGaWxsLCBiXHUxRUEzbyB2XHUxRUM3IHRvXHUwMEUwbiBiXHUxRUQ5IGNoaSB0aVx1MUVCRnQgblx1MUVEOWkgY1x1MUVBM25oXG4gICAgY29uc29sZS5sb2coYCAgIFx1RDgzRFx1RERCQ1x1RkUwRiBcdTAxMTBhbmcgeFx1MUVFRCBsXHUwMEZEIHRvXHUwMEUwbiBiXHUxRUQ5IGhcdTAwRUNuaCBcdTFFQTNuaCBnXHUxRUQxYzogJHt3fXB4IHggJHtofXB4IChLSFx1MDBENE5HIENcdTFFQUVUIFhcdTAwQzlOIEJcdTFFQTRUIEtcdTFFRjIgUEhcdTFFQTZOIE5cdTAwQzBPKWApO1xuXG4gICAgY29uc3QgYmdGdWxsUmdiYSA9IEJ1ZmZlci5hbGxvYyh3ICogaCAqIDQpO1xuICAgIGNvbnN0IGJnTGlnaHRzRnVsbFJnYmEgPSBCdWZmZXIuYWxsb2ModyAqIGggKiA0KTtcblxuICAgIGxldCBwcm90ZWN0ZWRXaGl0ZXMgPSAwO1xuICAgIGxldCBsaWdodHNDb3VudCA9IDA7XG5cbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGg7IHkrKykge1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3OyB4KyspIHtcbiAgICAgICAgY29uc3Qgc3JjSWR4ID0gKHkgKiB3ICsgeCkgKiBpbmZvLmNoYW5uZWxzO1xuICAgICAgICBjb25zdCBkZXN0SWR4ID0gKHkgKiB3ICsgeCkgKiA0O1xuICAgICAgICBjb25zdCBpc0JnID0gaXNPdXRkb29yQmdbeSAqIHcgKyB4XTtcblxuICAgICAgICBjb25zdCByID0gZGF0YVtzcmNJZHhdO1xuICAgICAgICBjb25zdCBnID0gZGF0YVtzcmNJZHggKyAxXTtcbiAgICAgICAgY29uc3QgYiA9IGRhdGFbc3JjSWR4ICsgMl07XG5cbiAgICAgICAgaWYgKGlzQmcpIHtcbiAgICAgICAgICAvLyBCXHUxRUE3dSB0clx1MUVERGkgbmdvXHUwMEUwaSB0clx1MUVERGkgJiBsXHUxRUMxIHRyXHUxRUFGbmcgbmdvXHUwMEUwaSAtPiAxMDAlIFRyb25nIHN1XHUxRUQxdFxuICAgICAgICAgIGJnRnVsbFJnYmFbZGVzdElkeCArIDNdID0gMDtcbiAgICAgICAgICBiZ0xpZ2h0c0Z1bGxSZ2JhW2Rlc3RJZHggKyAzXSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHIgPj0gMjQwICYmIGcgPj0gMjQwICYmIGIgPj0gMjQwKSB7XG4gICAgICAgICAgICBwcm90ZWN0ZWRXaGl0ZXMrKztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBLaFx1MUVFRCB2aVx1MUVDMW4gdHJcdTFFQUZuZyAoQW50aS1IYWxvIERlZnJpbmdlKTogTlx1MUVCRnUgcGl4ZWwgdGlcdTFFQkZwIGdpXHUwMEUxcCB2XHUxRURCaSBuXHUxRUMxbiB2XHUwMEUwIGdcdTFFQTduIHRyXHUxRUFGbmcgLT4gbFx1MDBFMG0gZFx1MUVDQnUgYmlcdTAwRUFuXG4gICAgICAgICAgbGV0IGlzQm9yZGVyUGl4ZWwgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoeSA+IDAgJiYgaXNPdXRkb29yQmdbKHkgLSAxKSAqIHcgKyB4XSkgaXNCb3JkZXJQaXhlbCA9IHRydWU7XG4gICAgICAgICAgZWxzZSBpZiAoeSA8IGggLSAxICYmIGlzT3V0ZG9vckJnWyh5ICsgMSkgKiB3ICsgeF0pIGlzQm9yZGVyUGl4ZWwgPSB0cnVlO1xuICAgICAgICAgIGVsc2UgaWYgKHggPiAwICYmIGlzT3V0ZG9vckJnW3kgKiB3ICsgKHggLSAxKV0pIGlzQm9yZGVyUGl4ZWwgPSB0cnVlO1xuICAgICAgICAgIGVsc2UgaWYgKHggPCB3IC0gMSAmJiBpc091dGRvb3JCZ1t5ICogdyArICh4ICsgMSldKSBpc0JvcmRlclBpeGVsID0gdHJ1ZTtcblxuICAgICAgICAgIGlmIChpc0JvcmRlclBpeGVsICYmIHIgPiAyMzAgJiYgZyA+IDIzMCAmJiBiID4gMjMwKSB7XG4gICAgICAgICAgICAvLyBcdTAxMTBpXHUxRUMzbSB0aVx1MUVCRnAgZ2lcdTAwRTFwIHF1XHUwMEUxIHNcdTAwRTFuZyBkbyBuXHUwMEU5biBKUEVHIC0+IGxcdTAwRTBtIHRyb25nIHN1XHUxRUQxdCB2aVx1MUVDMW5cbiAgICAgICAgICAgIGJnRnVsbFJnYmFbZGVzdElkeCArIDNdID0gMDtcbiAgICAgICAgICAgIGJnTGlnaHRzRnVsbFJnYmFbZGVzdElkeCArIDNdID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIExcdTAxQjBcdTFFRTNuZyB0XHUxRUVEIGhcdTAwRjNhIG1cdTAwRTB1IG5oXHUxRUI5IChQaXhlbCBhcnQgY29sb3IgcXVhbnRpemF0aW9uKVxuICAgICAgICAgIGJnRnVsbFJnYmFbZGVzdElkeF0gPSBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQociAvIDQpICogNCk7XG4gICAgICAgICAgYmdGdWxsUmdiYVtkZXN0SWR4ICsgMV0gPSBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQoZyAvIDQpICogNCk7XG4gICAgICAgICAgYmdGdWxsUmdiYVtkZXN0SWR4ICsgMl0gPSBNYXRoLm1pbigyNTUsIE1hdGgucm91bmQoYiAvIDQpICogNCk7XG4gICAgICAgICAgYmdGdWxsUmdiYVtkZXN0SWR4ICsgM10gPSAyNTU7XG5cbiAgICAgICAgICAvLyBUclx1MDBFRGNoIHh1XHUxRUE1dCBcdTAxMTFcdTAwRThuIFx1MDExMVx1MDBFQW0gJiBiXHUxRUEzbyB0XHUxRUQzbiAxMDAlIG1cdTAwRTB1IGdcdTFFRDFjIChraFx1MDBGNG5nIFx1MDBFOXAgbVx1MDBFMHUsIGdpXHUxRUVGIG5ndXlcdTAwRUFuIG1cdTAwRTB1IG5naFx1MUVDNyBzXHUwMTI5IHZcdTFFQkQpOlxuICAgICAgICAgIGNvbnN0IGlzV2FybVllbGxvdyA9IChyID4gMTk1ICYmIGcgPiAxNjUgJiYgYiA8IDE0NSk7XG4gICAgICAgICAgY29uc3QgaXNBbWJlciA9IChyID4gMjAwICYmIGcgPiAxMjUgJiYgYiA8IDg1KTtcbiAgICAgICAgICBjb25zdCBpc0N5YW4gPSAoYiA+IDE3NSAmJiBnID4gMTYwICYmIHIgPCAxNDApO1xuICAgICAgICAgIGNvbnN0IGlzTGFudGVyblJlZCA9IChyID4gMTcwICYmIHIgPiBnICogMS4zICYmIHIgPiBiICogMS4zKTtcbiAgICAgICAgICBjb25zdCBpc0JyaWdodFdpbmRvdyA9IChyID4gMjE1ICYmIGcgPiAyMTAgJiYgYiA+IDIwMCAmJiAociAtIGIgPiA4IHx8IHkgPiBoICogMC4yNSkpO1xuXG4gICAgICAgICAgaWYgKGlzV2FybVllbGxvdyB8fCBpc0FtYmVyIHx8IGlzQ3lhbiB8fCBpc0xhbnRlcm5SZWQgfHwgaXNCcmlnaHRXaW5kb3cpIHtcbiAgICAgICAgICAgIGxpZ2h0c0NvdW50Kys7XG4gICAgICAgICAgICAvLyBHaVx1MUVFRiBuZ3V5XHUwMEVBbiAxMDAlIG1cdTAwRTB1IGdcdTFFRDFjIGNcdTFFRTdhIGJcdTFFRTljIHRyYW5oXG4gICAgICAgICAgICBiZ0xpZ2h0c0Z1bGxSZ2JhW2Rlc3RJZHhdID0gcjtcbiAgICAgICAgICAgIGJnTGlnaHRzRnVsbFJnYmFbZGVzdElkeCArIDFdID0gZztcbiAgICAgICAgICAgIGJnTGlnaHRzRnVsbFJnYmFbZGVzdElkeCArIDJdID0gYjtcbiAgICAgICAgICAgIGJnTGlnaHRzRnVsbFJnYmFbZGVzdElkeCArIDNdID0gMjU1O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBiZ0xpZ2h0c0Z1bGxSZ2JhW2Rlc3RJZHggKyAzXSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coYCAgIFx1RDgzRFx1REVFMVx1RkUwRiBcdTAxMTBcdTAwRTMgYlx1MUVBM28gdlx1MUVDNyAke3Byb3RlY3RlZFdoaXRlcy50b0xvY2FsZVN0cmluZygpfSBwaXhlbCB0clx1MUVBRm5nIG5cdTFFRDlpIGNcdTFFQTNuaCBraFx1MDBGNG5nIGJcdTFFQ0IgY1x1MUVBRnQgbmhcdTFFQTdtIWApO1xuICAgIGNvbnNvbGUubG9nKGAgICBcdTI3MjggXHUwMTEwXHUwMEUzIHRyXHUwMEVEY2ggeHVcdTFFQTV0ICR7bGlnaHRzQ291bnQudG9Mb2NhbGVTdHJpbmcoKX0gYlx1MDBGM25nIFx1MDExMVx1MDBFOG4gXHUwMTExXHUwMEVBbSBjaG8gYmFja2dyb3VuZF9saWdodHMucG5nIWApO1xuXG4gICAgLy8gU2NhbGUgVE9cdTAwQzBOIEJcdTFFRDggYlx1MUVFOWMgdHJhbmggdGhlbyB0XHUxRUM5IGxcdTFFQzcgY2h1XHUxRUE5biBjaGlcdTFFQzF1IG5nYW5nIDE5MjBweCAoZ2lcdTFFRUYgMTAwJSB0XHUxRUM5IGxcdTFFQzcgZ1x1MUVEMWMsIGtoXHUwMEY0bmcgbVx1MDBFOW8gaFx1MDBFQ25oLCBraFx1MDBGNG5nIGNcdTFFQUZ0IHhcdTAwRTluKVxuICAgIGNvbnN0IHRhcmdldFcgPSAxOTIwO1xuICAgIGNvbnN0IHRhcmdldEggPSBNYXRoLnJvdW5kKGggKiAodGFyZ2V0VyAvIHcpKTtcblxuICAgIGNvbnNvbGUubG9nKGAgICBcdUQ4M0RcdURDRDAgXHUwMTEwYW5nIHNjYWxlIHRvXHUwMEUwbiBiXHUxRUQ5IGJcdTFFRTljIHRyYW5oIHZcdTFFQzEga1x1MDBFRGNoIHRoXHUwMUIwXHUxRURCYzogJHt0YXJnZXRXfXB4IHggJHt0YXJnZXRIfXB4ICh0XHUxRUY3IGxcdTFFQzcgZ1x1MUVEMWMgbmd1eVx1MDBFQW4gdlx1MUVCOW4pYCk7XG5cbiAgICAvLyBMXHUwMUIwdSBiYWNrZ3JvdW5kLnBuZ1xuICAgIGF3YWl0IHNoYXJwKGJnRnVsbFJnYmEsIHsgcmF3OiB7IHdpZHRoOiB3LCBoZWlnaHQ6IGgsIGNoYW5uZWxzOiA0IH0gfSlcbiAgICAgIC5yZXNpemUodGFyZ2V0VywgdGFyZ2V0SCwgeyBrZXJuZWw6ICduZWFyZXN0JyB9KVxuICAgICAgLnBuZyh7IGNvbXByZXNzaW9uTGV2ZWw6IDkgfSlcbiAgICAgIC50b0ZpbGUocGF0aC5qb2luKGZ1bGxQYXRoLCAnYmFja2dyb3VuZC5wbmcnKSk7XG5cbiAgICAvLyBMXHUwMUIwdSBiYWNrZ3JvdW5kX2xpZ2h0c19yYXcucG5nIChiXHUxRUEzbiBzYW8gXHUwMTExXHUwMEU4biBzXHUxRUFGYyBuXHUwMEU5dCBnXHUxRUQxYylcbiAgICBjb25zdCByYXdMaWdodHNCdWZmZXIgPSBhd2FpdCBzaGFycChiZ0xpZ2h0c0Z1bGxSZ2JhLCB7IHJhdzogeyB3aWR0aDogdywgaGVpZ2h0OiBoLCBjaGFubmVsczogNCB9IH0pXG4gICAgICAucmVzaXplKHRhcmdldFcsIHRhcmdldEgsIHsga2VybmVsOiAnbmVhcmVzdCcgfSlcbiAgICAgIC5wbmcoeyBjb21wcmVzc2lvbkxldmVsOiA5IH0pXG4gICAgICAudG9CdWZmZXIoKTtcbiAgICBhd2FpdCBmcy5wcm9taXNlcy53cml0ZUZpbGUocGF0aC5qb2luKGZ1bGxQYXRoLCAnYmFja2dyb3VuZF9saWdodHNfcmF3LnBuZycpLCByYXdMaWdodHNCdWZmZXIpO1xuXG4gICAgLy8gUHJlLWJha2UgbXVsdGktdGllciBnbG93IHZcdTAwRTBvIGJhY2tncm91bmRfbGlnaHRzLnBuZyBcdTAxMTFcdTFFQzMgdFx1MUVEMWkgXHUwMUIwdSA2MCBGUFMgKGtoXHUwMEY0bmcgY1x1MUVBN24gQ1NTIGZpbHRlcjogZHJvcC1zaGFkb3cpXG4gICAgY29uc3Qgd2lkZUdsb3cgPSBhd2FpdCBzaGFycChyYXdMaWdodHNCdWZmZXIpLmJsdXIoMTQpLnRvQnVmZmVyKCk7XG4gICAgY29uc3QgbWlkR2xvdyA9IGF3YWl0IHNoYXJwKHJhd0xpZ2h0c0J1ZmZlcikuYmx1cig1KS50b0J1ZmZlcigpO1xuICAgIGNvbnN0IHRpZ2h0R2xvdyA9IGF3YWl0IHNoYXJwKHJhd0xpZ2h0c0J1ZmZlcikuYmx1cigyKS50b0J1ZmZlcigpO1xuXG4gICAgYXdhaXQgc2hhcnAod2lkZUdsb3cpXG4gICAgICAuY29tcG9zaXRlKFtcbiAgICAgICAgeyBpbnB1dDogbWlkR2xvdywgYmxlbmQ6ICdzY3JlZW4nIH0sXG4gICAgICAgIHsgaW5wdXQ6IHRpZ2h0R2xvdywgYmxlbmQ6ICdzY3JlZW4nIH0sXG4gICAgICAgIHsgaW5wdXQ6IHJhd0xpZ2h0c0J1ZmZlciwgYmxlbmQ6ICdvdmVyJyB9LFxuICAgICAgXSlcbiAgICAgIC5wbmcoeyBjb21wcmVzc2lvbkxldmVsOiA5IH0pXG4gICAgICAudG9GaWxlKHBhdGguam9pbihmdWxsUGF0aCwgJ2JhY2tncm91bmRfbGlnaHRzLnBuZycpKTtcblxuICAgIGNvbnNvbGUubG9nKGAgICBcdTI3MDUgXHUwMTEwXHUwMEUzIHh1XHUxRUE1dCBiYWNrZ3JvdW5kLnBuZyAmIGJhY2tncm91bmRfbGlnaHRzLnBuZyAodlx1MUVEQmkgaGlcdTFFQzd1IFx1MUVFOW5nIEdsb3cgcHJlLXJlbmRlciBzXHUxRUI1bikgdGhcdTAwRTBuaCBjXHUwMEY0bmchYCk7XG4gIH1cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyAtLS0gMi4gWFx1MUVFQyBMXHUwMEREIE1JREdST1VORCAoS0hcdTAwRDRORyBDXHUxRUFFVCBOR0FORywgU0NBTEUgRFx1MUVDQ0MsIE5cdTFFRDBJIE5HQU5HIE5ISVx1MUVDMFUgSFx1MDBDQ05IKSAtLS1cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgaWYgKG1nRmlsZSkge1xuICAgIGNvbnN0IG1nSW5wdXQgPSBwYXRoLmpvaW4oZnVsbFBhdGgsIG1nRmlsZSk7XG4gICAgY29uc29sZS5sb2coYFx1RDgzRFx1REVFNFx1RkUwRiAyLiBcdTAxMTBhbmcgeFx1MUVFRCBsXHUwMEZEIE1pZGdyb3VuZCBUcmFjazogJHttZ0ZpbGV9Li4uYCk7XG5cbiAgICBjb25zdCBpbWcgPSBzaGFycChtZ0lucHV0KTtcbiAgICBjb25zdCB7IGRhdGEsIGluZm8gfSA9IGF3YWl0IGltZy5yYXcoKS50b0J1ZmZlcih7IHJlc29sdmVXaXRoT2JqZWN0OiB0cnVlIH0pO1xuICAgIGNvbnN0IHcgPSBpbmZvLndpZHRoO1xuICAgIGNvbnN0IGggPSBpbmZvLmhlaWdodDtcblxuICAgIC8vIEZsb29kIGZpbGwgdFx1MDBFMWNoIG5cdTFFQzFuIHRyXHUxRUFGbmcgcGhcdTAwRURhIHRyXHUwMEVBbiB0aGFuaCByYXkgdFx1MUVFQiB2aVx1MUVDMW4gdHJcdTAwRUFuIGNcdTAwRjluZyAoeSA9IDApXG4gICAgY29uc3QgaXNNZ0JnID0gbmV3IFVpbnQ4QXJyYXkodyAqIGgpO1xuICAgIGNvbnN0IHF1ZXVlID0gbmV3IEludDMyQXJyYXkodyAqIGgpO1xuICAgIGxldCBxSGVhZCA9IDAsIHFUYWlsID0gMDtcblxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdzsgeCsrKSB7XG4gICAgICBjb25zdCBpZHggPSAoMCAqIHcgKyB4KSAqIGluZm8uY2hhbm5lbHM7XG4gICAgICBpZiAoaXNGdWxsV2hpdGVQaXhlbChkYXRhW2lkeF0sIGRhdGFbaWR4ICsgMV0sIGRhdGFbaWR4ICsgMl0pKSB7XG4gICAgICAgIGlzTWdCZ1t4XSA9IDE7XG4gICAgICAgIHF1ZXVlW3FUYWlsKytdID0geDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWaVx1MUVDMW4gdHJcdTAwRTFpICYgcGhcdTFFQTNpIHRyXHUwMEVBbiByYXlcbiAgICBmb3IgKGxldCB5ID0gMDsgeSA8IE1hdGguZmxvb3IoaCAqIDAuNyk7IHkrKykge1xuICAgICAgY29uc3QgbElkeCA9ICh5ICogdyArIDApICogaW5mby5jaGFubmVscztcbiAgICAgIGlmIChpc0Z1bGxXaGl0ZVBpeGVsKGRhdGFbbElkeF0sIGRhdGFbbElkeCArIDFdLCBkYXRhW2xJZHggKyAyXSkgJiYgIWlzTWdCZ1t5ICogdyArIDBdKSB7XG4gICAgICAgIGlzTWdCZ1t5ICogdyArIDBdID0gMTtcbiAgICAgICAgcXVldWVbcVRhaWwrK10gPSAoeSAqIHcgKyAwKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJJZHggPSAoeSAqIHcgKyAodyAtIDEpKSAqIGluZm8uY2hhbm5lbHM7XG4gICAgICBpZiAoaXNGdWxsV2hpdGVQaXhlbChkYXRhW3JJZHhdLCBkYXRhW3JJZHggKyAxXSwgZGF0YVtySWR4ICsgMl0pICYmICFpc01nQmdbeSAqIHcgKyAodyAtIDEpXSkge1xuICAgICAgICBpc01nQmdbeSAqIHcgKyAodyAtIDEpXSA9IDE7XG4gICAgICAgIHF1ZXVlW3FUYWlsKytdID0gKHkgKiB3ICsgKHcgLSAxKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSFx1MUVBMXQgZ2lcdTFFRDFuZzogVmlcdTFFQzFuIGRcdTAxQjBcdTFFREJpIFx1MDExMVx1MDBFMXkgKG5cdTFFQkZ1IFx1MUVBM25oIGNhbnZhcyBjXHUwMEYzIGRcdTFFQTNpIHRyXHUxRUFGbmcgZFx1MDFCMCBwaFx1MDBFRGEgZFx1MDFCMFx1MUVEQmkgbVx1MUVCN3QgXHUwMTExXHUxRUE1dC9cdTAxMTFcdTAxQjBcdTFFRERuZyByYXkpXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB3OyB4KyspIHtcbiAgICAgIGNvbnN0IGJJZHggPSAoKGggLSAxKSAqIHcgKyB4KSAqIGluZm8uY2hhbm5lbHM7XG4gICAgICBpZiAoaXNGdWxsV2hpdGVQaXhlbChkYXRhW2JJZHhdLCBkYXRhW2JJZHggKyAxXSwgZGF0YVtiSWR4ICsgMl0pICYmICFpc01nQmdbKGggLSAxKSAqIHcgKyB4XSkge1xuICAgICAgICBpc01nQmdbKGggLSAxKSAqIHcgKyB4XSA9IDE7XG4gICAgICAgIHF1ZXVlW3FUYWlsKytdID0gKChoIC0gMSkgKiB3ICsgeCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQkZTIGxvYW5nIG5cdTFFQzFuIHRyXHUxRUFGbmdcbiAgICB3aGlsZSAocUhlYWQgPCBxVGFpbCkge1xuICAgICAgY29uc3QgY3VyciA9IHF1ZXVlW3FIZWFkKytdO1xuICAgICAgY29uc3QgY3ggPSBjdXJyICUgdztcbiAgICAgIGNvbnN0IGN5ID0gTWF0aC5mbG9vcihjdXJyIC8gdyk7XG5cbiAgICAgIGNvbnN0IG5laWdoYm9ycyA9IFtcbiAgICAgICAgW2N4ICsgMSwgY3ldLFxuICAgICAgICBbY3ggLSAxLCBjeV0sXG4gICAgICAgIFtjeCwgY3kgKyAxXSxcbiAgICAgICAgW2N4LCBjeSAtIDFdXG4gICAgICBdO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBjb25zdCBueCA9IG5laWdoYm9yc1tpXVswXTtcbiAgICAgICAgY29uc3QgbnkgPSBuZWlnaGJvcnNbaV1bMV07XG4gICAgICAgIGlmIChueCA+PSAwICYmIG54IDwgdyAmJiBueSA+PSAwICYmIG55IDwgaCkge1xuICAgICAgICAgIGNvbnN0IG5JZHggPSBueSAqIHcgKyBueDtcbiAgICAgICAgICBpZiAoIWlzTWdCZ1tuSWR4XSkge1xuICAgICAgICAgICAgY29uc3Qgc3JjSWR4ID0gbklkeCAqIGluZm8uY2hhbm5lbHM7XG4gICAgICAgICAgICBpZiAoaXNGdWxsV2hpdGVQaXhlbChkYXRhW3NyY0lkeF0sIGRhdGFbc3JjSWR4ICsgMV0sIGRhdGFbc3JjSWR4ICsgMl0pKSB7XG4gICAgICAgICAgICAgIGlzTWdCZ1tuSWR4XSA9IDE7XG4gICAgICAgICAgICAgIHF1ZXVlW3FUYWlsKytdID0gbklkeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUXHUwMEVDbSByYW5oIGdpXHUxRURCaSBjaGlcdTFFQzF1IGRcdTFFQ0RjIGNcdTFFRTdhIGNcdTAwRjRuZyB0clx1MDBFQ25oIFx1MDExMVx1MDFCMFx1MUVERG5nIHJheSAoS0hcdTAwRDRORyBDXHUxRUFFVCBDSElcdTFFQzBVIE5HQU5HKVxuICAgIGxldCBtZ01pblkgPSAtMTtcbiAgICBsZXQgbWdNYXhZID0gLTE7XG4gICAgZm9yIChsZXQgeSA9IDA7IHkgPCBoOyB5KyspIHtcbiAgICAgIGxldCBjb250ZW50Q291bnQgPSAwO1xuICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB3OyB4KyspIHtcbiAgICAgICAgaWYgKCFpc01nQmdbeSAqIHcgKyB4XSkgY29udGVudENvdW50Kys7XG4gICAgICB9XG4gICAgICBpZiAoY29udGVudENvdW50ID4gdyAqIDAuMDIgJiYgbWdNaW5ZID09PSAtMSkgbWdNaW5ZID0geTtcbiAgICAgIGlmIChjb250ZW50Q291bnQgPiB3ICogMC4wMikgbWdNYXhZID0geTtcbiAgICB9XG5cbiAgICBjb25zdCBtZ0NvbnRlbnRIID0gTWF0aC5tYXgoMTAwLCBtZ01heFkgLSBtZ01pblkgKyAxKTtcbiAgICBjb25zb2xlLmxvZyhgICAgXHUwMTEwXHUwMUIwXHUxRUREbmcgcmF5IG5oXHUxRUFEbiBkaVx1MUVDN246IHk9JHttZ01pbll9IC0+IHk9JHttZ01heFl9IChjYW8gJHttZ0NvbnRlbnRIfXB4LCByXHUxRUQ5bmcgbmd1eVx1MDBFQW4gYlx1MUVBM24gJHt3fXB4IC0gS0hcdTAwRDRORyBDXHUxRUFFVCBOR0FORylgKTtcblxuICAgIC8vIFRcdTFFQTFvIGJ1ZmZlciBjaG8gMSBcdTAxMTFcdTAxQTFuIHZcdTFFQ0IgXHUwMTExXHUwMUIwXHUxRUREbmcgcmF5IG5ndXlcdTAwRUFuIHZcdTFFQjluICgxIHVuaXQpXG4gICAgY29uc3Qgc2luZ2xlVGlsZVJnYmEgPSBCdWZmZXIuYWxsb2ModyAqIG1nQ29udGVudEggKiA0KTtcblxuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgbWdDb250ZW50SDsgeSsrKSB7XG4gICAgICBjb25zdCBvcmlnWSA9IG1nTWluWSArIHk7XG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHc7IHgrKykge1xuICAgICAgICBjb25zdCBzcmNJZHggPSAob3JpZ1kgKiB3ICsgeCkgKiBpbmZvLmNoYW5uZWxzO1xuICAgICAgICBjb25zdCBkZXN0SWR4ID0gKHkgKiB3ICsgeCkgKiA0O1xuXG4gICAgICAgIGlmIChpc01nQmdbb3JpZ1kgKiB3ICsgeF0pIHtcbiAgICAgICAgICBzaW5nbGVUaWxlUmdiYVtkZXN0SWR4ICsgM10gPSAwOyAvLyBUcm9uZyBzdVx1MUVEMXQgYlx1MUVBN3UgdHJcdTFFRERpIHRyXHUwMEVBbiByYXlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBLaFx1MUVFRCB2aVx1MUVDMW4gdHJcdTFFQUZuZyAoQW50aS1IYWxvIERlZnJpbmdlKTogTlx1MUVCRnUgcGl4ZWwgdGlcdTFFQkZwIGdpXHUwMEUxcCB2XHUxRURCaSBuXHUxRUMxbiB0clx1MUVBRm5nIHZcdTAwRTAgZ1x1MUVBN24gdHJcdTFFQUZuZyAtPiBsXHUwMEUwbSBkXHUxRUNCdSBiaVx1MDBFQW5cbiAgICAgICAgICBsZXQgaXNCb3JkZXJQaXhlbCA9IGZhbHNlO1xuICAgICAgICAgIGlmIChvcmlnWSA+IDAgJiYgaXNNZ0JnWyhvcmlnWSAtIDEpICogdyArIHhdKSBpc0JvcmRlclBpeGVsID0gdHJ1ZTtcbiAgICAgICAgICBlbHNlIGlmIChvcmlnWSA8IGggLSAxICYmIGlzTWdCZ1sob3JpZ1kgKyAxKSAqIHcgKyB4XSkgaXNCb3JkZXJQaXhlbCA9IHRydWU7XG4gICAgICAgICAgZWxzZSBpZiAoeCA+IDAgJiYgaXNNZ0JnW29yaWdZICogdyArICh4IC0gMSldKSBpc0JvcmRlclBpeGVsID0gdHJ1ZTtcbiAgICAgICAgICBlbHNlIGlmICh4IDwgdyAtIDEgJiYgaXNNZ0JnW29yaWdZICogdyArICh4ICsgMSldKSBpc0JvcmRlclBpeGVsID0gdHJ1ZTtcblxuICAgICAgICAgIGNvbnN0IHIgPSBkYXRhW3NyY0lkeF07XG4gICAgICAgICAgY29uc3QgZyA9IGRhdGFbc3JjSWR4ICsgMV07XG4gICAgICAgICAgY29uc3QgYiA9IGRhdGFbc3JjSWR4ICsgMl07XG5cbiAgICAgICAgICBpZiAoaXNCb3JkZXJQaXhlbCAmJiByID4gMjMwICYmIGcgPiAyMzAgJiYgYiA+IDIzMCkge1xuICAgICAgICAgICAgc2luZ2xlVGlsZVJnYmFbZGVzdElkeCArIDNdID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNpbmdsZVRpbGVSZ2JhW2Rlc3RJZHhdID0gTWF0aC5yb3VuZChyIC8gNCkgKiA0O1xuICAgICAgICAgIHNpbmdsZVRpbGVSZ2JhW2Rlc3RJZHggKyAxXSA9IE1hdGgucm91bmQoZyAvIDQpICogNDtcbiAgICAgICAgICBzaW5nbGVUaWxlUmdiYVtkZXN0SWR4ICsgMl0gPSBNYXRoLnJvdW5kKGIgLyA0KSAqIDQ7XG4gICAgICAgICAgc2luZ2xlVGlsZVJnYmFbZGVzdElkeCArIDNdID0gMjU1O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2NhbGUgY2hpXHUxRUMxdSBkXHUxRUNEYyBjaG8gcGhcdTAwRjkgaFx1MUVFM3Agdlx1MUVEQmkgY2hpXHUxRUMxdSBjYW8gdGlcdTAwRUF1IGNodVx1MUVBOW4gMjQwcHhcbiAgICBjb25zdCB0YXJnZXRIID0gMjQwO1xuICAgIGNvbnN0IHZlcnRpY2FsU2NhbGUgPSB0YXJnZXRIIC8gbWdDb250ZW50SDtcbiAgICBjb25zdCB0aWxlVyA9IE1hdGgucm91bmQodyAqIHZlcnRpY2FsU2NhbGUpO1xuXG4gICAgY29uc29sZS5sb2coYCAgIFx1RDgzRFx1RENEMCBcdTAxMTBcdTAwRTMgc2NhbGUgY2hpXHUxRUMxdSBkXHUxRUNEYyB2XHUxRUMxIGNodVx1MUVBOW4gJHt0YXJnZXRIfXB4IC0+IENoaVx1MUVDMXUgclx1MUVEOW5nIDEga2hcdTFFRDFpIFx1MDExMVx1MUVBMXQgJHt0aWxlV31weGApO1xuXG4gICAgY29uc3Qgc2luZ2xlVGlsZUJ1ZmZlciA9IGF3YWl0IHNoYXJwKHNpbmdsZVRpbGVSZ2JhLCB7IHJhdzogeyB3aWR0aDogdywgaGVpZ2h0OiBtZ0NvbnRlbnRILCBjaGFubmVsczogNCB9IH0pXG4gICAgICAucmVzaXplKHRpbGVXLCB0YXJnZXRILCB7IGtlcm5lbDogJ25lYXJlc3QnIH0pXG4gICAgICAucG5nKClcbiAgICAgIC50b0J1ZmZlcigpO1xuXG4gICAgLy8gTlx1MUVEMWkgbmdhbmcgbmhpXHUxRUMxdSBoXHUwMEVDbmggKFRpbGluZyBob3Jpem9udGFsbHkpOiBcdTAxMTBcdTFFQTNtIGJcdTFFQTNvIHRcdTFFRDVuZyBjaGlcdTFFQzF1IHJcdTFFRDluZyA+PSAxOTIwcHggXHUwMTExXHUxRUMzIGJhbyBwaFx1MUVFNyB0b1x1MDBFMG4gYlx1MUVEOSBtXHUwMEUwbiBoXHUwMEVDbmhcbiAgICBjb25zdCBudW1UaWxlcyA9IE1hdGgubWF4KDIsIE1hdGguY2VpbCgxOTIwIC8gdGlsZVcpKTtcbiAgICBjb25zdCB0b3RhbFcgPSB0aWxlVyAqIG51bVRpbGVzO1xuXG4gICAgY29uc29sZS5sb2coYCAgIFx1RDgzRFx1REQwMSBcdTAxMTBhbmcgZ2hcdTAwRTlwIG5cdTFFRDFpIG5nYW5nICR7bnVtVGlsZXN9IGtoXHUxRUQxaSBsaVx1MDBFQW4gdGlcdTFFQkZwIC0+IFRcdTFFRDVuZyBjaGlcdTFFQzF1IHJcdTFFRDluZyBkXHUxRUEzaSByYXk6ICR7dG90YWxXfXB4IHggJHt0YXJnZXRIfXB4YCk7XG5cbiAgICBjb25zdCBjb21wb3NpdGVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1UaWxlczsgaSsrKSB7XG4gICAgICBjb21wb3NpdGVzLnB1c2goe1xuICAgICAgICBpbnB1dDogc2luZ2xlVGlsZUJ1ZmZlcixcbiAgICAgICAgbGVmdDogaSAqIHRpbGVXLFxuICAgICAgICB0b3A6IDBcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGF3YWl0IHNoYXJwKHtcbiAgICAgIGNyZWF0ZToge1xuICAgICAgICB3aWR0aDogdG90YWxXLFxuICAgICAgICBoZWlnaHQ6IHRhcmdldEgsXG4gICAgICAgIGNoYW5uZWxzOiA0LFxuICAgICAgICBiYWNrZ3JvdW5kOiB7IHI6IDAsIGc6IDAsIGI6IDAsIGFscGhhOiAwIH1cbiAgICAgIH1cbiAgICB9KVxuICAgICAgLmNvbXBvc2l0ZShjb21wb3NpdGVzKVxuICAgICAgLnBuZyh7IGNvbXByZXNzaW9uTGV2ZWw6IDkgfSlcbiAgICAgIC50b0ZpbGUocGF0aC5qb2luKGZ1bGxQYXRoLCAnbWlkZ3JvdW5kX3RyYWNrLnBuZycpKTtcblxuICAgIGNvbnNvbGUubG9nKGAgICBcdTI3MDUgXHUwMTEwXHUwMEUzIHh1XHUxRUE1dCBkXHUxRUEzaSByYXkgblx1MUVEMWkgbmdhbmcgbWlkZ3JvdW5kX3RyYWNrLnBuZyB0aFx1MDBFMG5oIGNcdTAwRjRuZyFgKTtcbiAgfVxuXG4gIC8vIENcdTFFQURwIG5oXHUxRUFEdCBsXHUxRUExaSBoXHUxRUM3IHRoXHUxRUQxbmcgYXNzZXQgcmVnaXN0cnlcbiAgZ2VuZXJhdGVSZWdpc3RyeUZpbGVzKCk7XG5cbiAgY29uc29sZS5sb2coYFx1RDgzQ1x1REY4OSBIb1x1MDBFMG4gdFx1MUVBNXQgeFx1MUVFRCBsXHUwMEZEIHZcdTAwRTAgXHUwMTExXHUwMTAzbmcga1x1MDBGRCB0aFx1MDFCMCBtXHUxRUU1YyAke3BhdGguYmFzZW5hbWUoZnVsbFBhdGgpfSB2XHUwMEUwbyBcdTFFRTluZyBkXHUxRUU1bmchXFxuYCk7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBOXHUxRUJGdSBjaFx1MUVBMXkgdHJcdTFFRjFjIHRpXHUxRUJGcCB0XHUxRUVCIGRcdTAwRjJuZyBsXHUxRUM3bmg6IG5vZGUgc2NyaXB0cy9wcm9jZXNzX2xhbmRzY2FwZV90aGVtZS5qcyBbZm9sZGVyXVxuaWYgKHByb2Nlc3MuYXJndlsxXSAmJiBwcm9jZXNzLmFyZ3ZbMV0uZW5kc1dpdGgoJ3Byb2Nlc3NfbGFuZHNjYXBlX3RoZW1lLmpzJykpIHtcbiAgY29uc3QgdGFyZ2V0ID0gcHJvY2Vzcy5hcmd2WzJdO1xuICBpZiAodGFyZ2V0KSB7XG4gICAgcHJvY2Vzc0xhbmRzY2FwZUZvbGRlcih0YXJnZXQpLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGxhbmRzY2FwZXNEaXIgPSBwYXRoLnJlc29sdmUoJ3B1YmxpYy9hc3NldHMvbGFuZHNjYXBlcycpO1xuICAgIGNvbnN0IGRpcnMgPSBmcy5yZWFkZGlyU3luYyhsYW5kc2NhcGVzRGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSlcbiAgICAgIC5maWx0ZXIoZCA9PiBkLmlzRGlyZWN0b3J5KCkpXG4gICAgICAubWFwKGQgPT4gcGF0aC5qb2luKGxhbmRzY2FwZXNEaXIsIGQubmFtZSkpO1xuXG4gICAgKGFzeW5jICgpID0+IHtcbiAgICAgIGZvciAoY29uc3QgZCBvZiBkaXJzKSB7XG4gICAgICAgIGF3YWl0IHByb2Nlc3NMYW5kc2NhcGVGb2xkZXIoZCk7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2UCxPQUFPQSxTQUFRO0FBQzVRLE9BQU9DLFdBQVU7QUFDakIsU0FBUyxvQkFBNEI7QUFDckMsT0FBTyxXQUFXOzs7QUNIcVEsT0FBTyxRQUFRO0FBQ3RTLE9BQU8sVUFBVTtBQUtqQixTQUFTLGFBQWEsSUFBSTtBQUN4QixRQUFNLE1BQU07QUFBQSxJQUNWLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQSxJQUNQLGNBQWM7QUFBQSxJQUNkLFNBQVM7QUFBQSxJQUNULFFBQVE7QUFBQSxJQUNSLE9B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QUNULG9CQUFRLElBQUk7QUFBQSxvRUFBOEMsUUFBUSxFQUFFO0FBQ3BFLGdCQUFJO0FBQ0Ysb0JBQU0sdUJBQXVCLE1BQU0sQ0FBQyxDQUFDO0FBQUEsWUFDdkMsU0FBUyxLQUFLO0FBQ1osc0JBQVEsTUFBTSxrRUFBNEIsR0FBRztBQUFBLFlBQy9DO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFFRCxhQUFPLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxhQUFhO0FBQzVDLGNBQU0sT0FBTyxTQUFTLFFBQVEsT0FBTyxHQUFHO0FBQ3hDLFlBQUksS0FBSyxTQUFTLDBCQUEwQixLQUFLLEtBQUssU0FBUyxnQ0FBZ0MsR0FBRztBQUNoRyxnQ0FBc0I7QUFDdEIsaUJBQU8sR0FBRyxLQUFLLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFBQSxRQUN4QztBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTLENBQUMsTUFBTSxHQUFHLG9CQUFvQixDQUFDO0FBQzFDLENBQUM7IiwKICAibmFtZXMiOiBbImZzIiwgInBhdGgiLCAiZnMiLCAicGF0aCIsICJwYXRoIiwgImZzIiwgInBhdGgiLCAiZnMiXQp9Cg==
