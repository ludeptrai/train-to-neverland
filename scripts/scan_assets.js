import fs from 'fs';
import path from 'path';

/**
 * Đọc từ điển tên hiển thị tập trung từ src/config/names.json
 */
let cachedNames = null;
let lastMtime = 0;

export function loadNamesDictionary() {
  const possiblePaths = [
    path.resolve('src/config/names.json'),
    path.resolve(process.cwd(), 'src/config/names.json'),
  ];
  const namesFile = possiblePaths.find(p => fs.existsSync(p));
  if (!namesFile) return { landscapes: {}, trains: {} };

  try {
    const stats = fs.statSync(namesFile);
    if (cachedNames && stats.mtimeMs === lastMtime) {
      return cachedNames;
    }
    const content = fs.readFileSync(namesFile, 'utf-8');
    cachedNames = JSON.parse(content);
    lastMtime = stats.mtimeMs;
    return cachedNames;
  } catch (e) {
    console.warn(`⚠️ [Names Dictionary] Không thể đọc ${namesFile}:`, e.message);
    return cachedNames || { landscapes: {}, trains: {} };
  }
}

/**
 * Tự động chuyển đổi mã ID sang tên hiển thị Tiếng Việt / Thân thiện
 * Tra cứu tập trung từ src/config/names.json
 */
export function humanizeName(id, category = null) {
  if (!id) return '';
  const dict = loadNamesDictionary();

  // 1. Tìm chính xác theo category được chỉ định (landscapes / trains / music)
  if (category && dict[category] && dict[category][id]) {
    const val = dict[category][id];
    return typeof val === 'object' && val !== null ? (val.title || val.name || id) : val;
  }

  // 2. Tìm trong tất cả các nhóm (landscapes, trains, music, ...)
  for (const group of Object.keys(dict)) {
    if (typeof dict[group] === 'object' && dict[group] !== null && dict[group][id]) {
      const val = dict[group][id];
      return typeof val === 'object' && val !== null ? (val.title || val.name || id) : val;
    }
  }

  // 3. Tìm nếu dict là flat map id -> name
  if (typeof dict[id] === 'string') {
    return dict[id];
  }

  // 4. Fallback tự động format chữ cái đầu: "train_orange_bullet" -> "Tàu Orange Bullet"
  return id
    .replace(/^train_/, 'Tàu ')
    .split('_')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Tạo nội dung meta.json chuẩn với các giá trị mặc định cho địa điểm mới
 */
export function createDefaultLandscapeMeta(id) {
  const name = humanizeName(id, 'landscapes');
  return {
    name,
    subtitle: `Hành trình qua ga ${name}`,
    location: "Việt Nam",
    bgSpeed: 0.15,
    mgSpeed: 0.85,
    fgSpeed: 1.35,
    fgScaleRatio: 1.0,
    fgY: 0,
    mgScaleRatio: 0.5,
    mgY: 0,
    bgMirror: true,
    sun: {
      dawn: {
        y: "46%",
        size: 130
      },
      day: {
        y: "12%",
        size: 58
      },
      sunset: {
        y: "44%",
        size: 140
      }
    },
    skyPresets: {
      dawn: [
        "#fbc2eb",
        "#a6c1ee"
      ],
      day: [
        "#4facfe",
        "#00f2fe",
        "#e0f7fa"
      ],
      sunset: [
        "#fa709a",
        "#fee140",
        "#f39c12"
      ],
      night: [
        "#09203f",
        "#1b2a4a",
        "#2c3e50"
      ]
    }
  };
}

/**
 * Quét toàn bộ thư mục public/assets/landscapes để sinh ra SCENES
 */
export function scanLandscapes() {
  const landscapesDir = path.resolve('public/assets/landscapes');
  if (!fs.existsSync(landscapesDir)) return [];

  const dirs = fs.readdirSync(landscapesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const scenes = [];

  for (const dir of dirs) {
    const dirPath = path.join(landscapesDir, dir);
    const metaPath = path.join(dirPath, 'meta.json');
    let meta = {};

    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (e) {
        console.warn(`⚠️ Lỗi đọc ${metaPath}:`, e.message);
      }
    } else {
      meta = createDefaultLandscapeMeta(dir);
      try {
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
        console.log(`✨ [Auto Meta Generator] Đã tự động tạo file meta.json mặc định cho địa điểm: ${dir}`);
      } catch (err) {
        console.warn(`⚠️ Không thể tạo file ${metaPath}:`, err.message);
      }
    }

    const files = fs.readdirSync(dirPath);

    // Tìm file background
    let bgUrl = '';
    if (files.includes('background.png')) {
      bgUrl = `./assets/landscapes/${dir}/background.png`;
    } else if (files.includes('background.jpg')) {
      bgUrl = `./assets/landscapes/${dir}/background.jpg`;
    } else {
      const anyBg = files.find(f => f.startsWith('background') || f.startsWith('bg'));
      if (anyBg) bgUrl = `./assets/landscapes/${dir}/${anyBg}`;
    }

    if (!bgUrl) {
      // Bỏ qua thư mục nếu không có ảnh background nào
      continue;
    }

    // Tìm file background_lights
    let bgLightsUrl = undefined;
    if (files.includes('background_lights.png')) {
      bgLightsUrl = `./assets/landscapes/${dir}/background_lights.png`;
    } else if (files.includes('background_lights.svg')) {
      bgLightsUrl = `./assets/landscapes/${dir}/background_lights.svg`;
    }

    // Tìm file midground_track
    let mgUrl = '';
    if (files.includes('midground_track.png')) {
      mgUrl = `./assets/landscapes/${dir}/midground_track.png`;
    } else if (files.includes('midground_track.svg')) {
      mgUrl = `./assets/landscapes/${dir}/midground_track.svg`;
    } else {
      // Fallback nếu scene chưa có ray riêng: dùng ray chuẩn Đà Lạt
      mgUrl = `./assets/landscapes/dalat/midground_track.svg`;
    }

    // Tìm file midground_lights
    let mgLightsUrl = undefined;
    if (files.includes('midground_lights.png')) {
      mgLightsUrl = `./assets/landscapes/${dir}/midground_lights.png`;
    }

    // Tìm file foreground (tiền cảnh: optional, nếu không có thì lấy hình default)
    let fgUrl = './assets/landscapes/default_foreground.png';
    let fgLightsUrl = undefined;

    if (files.includes('foreground.png')) {
      fgUrl = `./assets/landscapes/${dir}/foreground.png`;
    } else if (files.includes('foreground.svg')) {
      fgUrl = `./assets/landscapes/${dir}/foreground.svg`;
    } else if (meta.foregroundUrl) {
      fgUrl = meta.foregroundUrl;
    }

    if (files.includes('foreground_lights.png')) {
      fgLightsUrl = `./assets/landscapes/${dir}/foreground_lights.png`;
    } else if (meta.foregroundLightsUrl) {
      fgLightsUrl = meta.foregroundLightsUrl;
    }

    const name = meta.name || humanizeName(dir, 'landscapes');
    const subtitle = meta.subtitle || `Chuyến tàu qua ga ${name}`;
    const location = meta.location || 'Việt Nam';
    const bgSpeed = meta.bgSpeed !== undefined ? meta.bgSpeed : 0.15;
    const mgSpeed = meta.mgSpeed !== undefined ? meta.mgSpeed : 0.85;

    // Tham số cấu hình tiền cảnh (foreground)
    const fgSpeed = meta.fgSpeed !== undefined ? Number(meta.fgSpeed) : 1.35;
    const fgScaleRatio = meta.fgScaleRatio !== undefined
      ? Number(meta.fgScaleRatio)
      : (meta.fgRatio !== undefined
          ? Number(meta.fgRatio)
          : (meta.fgScale !== undefined
              ? Number(meta.fgScale)
              : (meta.foregroundRatio !== undefined ? Number(meta.foregroundRatio) : undefined)));
    const fgY = meta.fgY !== undefined
      ? meta.fgY
      : (meta.fgOffsetY !== undefined
          ? meta.fgOffsetY
          : (meta.foregroundY !== undefined ? meta.foregroundY : undefined));
    const fgOpacity = meta.fgOpacity !== undefined ? Number(meta.fgOpacity) : undefined;

    // Tham số cấu hình scale ratio & trục Y của background
    const bgScaleRatio = meta.bgScaleRatio !== undefined
      ? Number(meta.bgScaleRatio)
      : (meta.bgScale !== undefined ? Number(meta.bgScale) : undefined);

    const bgY = meta.bgY !== undefined
      ? meta.bgY
      : (meta.bgOffsetY !== undefined ? meta.bgOffsetY : undefined);

    // Tham số cấu hình scale ratio & trục Y của midground
    const mgScaleRatio = meta.mgScaleRatio !== undefined
      ? Number(meta.mgScaleRatio)
      : (meta.mgScale !== undefined ? Number(meta.mgScale) : (meta.scaleRatio !== undefined ? Number(meta.scaleRatio) : undefined));

    const mgY = meta.mgY !== undefined
      ? meta.mgY
      : (meta.mgOffsetY !== undefined ? meta.mgOffsetY : (meta.yAxis !== undefined ? meta.yAxis : undefined));

    // Tham số cấu hình trục Y của đoàn tàu (độc lập với midground)
    const trainY = meta.trainY !== undefined
      ? meta.trainY
      : (meta.trainOffsetY !== undefined ? meta.trainOffsetY : undefined);

    const trainScaleRatio = meta.trainScaleRatio !== undefined
      ? Number(meta.trainScaleRatio)
      : (meta.trainScale !== undefined ? Number(meta.trainScale) : undefined);

    // Tham số bật/tắt lật gương background để kéo dài (default: true)
    const bgMirror = meta.bgMirror !== undefined
      ? Boolean(meta.bgMirror)
      : (meta.mirrorBackground !== undefined ? Boolean(meta.mirrorBackground) : true);

    // Tham số điều chỉnh độ cao/vị trí & kích thước mặt trời (dawn, day, sunset, night)
    const rawSun = meta.sun || meta.celestial || {};
    const hasSunConfig = Boolean(meta.sun || meta.celestial ||
      meta.sunDawnY !== undefined || meta.sunDawnSize !== undefined ||
      meta.sunDayY !== undefined || meta.sunDaySize !== undefined ||
      meta.sunSunsetY !== undefined || meta.sunSunsetSize !== undefined ||
      meta.sunNightY !== undefined || meta.sunNightSize !== undefined);

    let sun = undefined;
    if (hasSunConfig) {
      sun = {
        dawn: {
          ...(rawSun.dawn || {}),
          ...(meta.sunDawnY !== undefined ? { y: meta.sunDawnY } : {}),
          ...(meta.sunDawnSize !== undefined ? { size: Number(meta.sunDawnSize) } : {}),
        },
        day: {
          ...(rawSun.day || {}),
          ...(meta.sunDayY !== undefined ? { y: meta.sunDayY } : {}),
          ...(meta.sunDaySize !== undefined ? { size: Number(meta.sunDaySize) } : {}),
        },
        sunset: {
          ...(rawSun.sunset || {}),
          ...(meta.sunSunsetY !== undefined ? { y: meta.sunSunsetY } : {}),
          ...(meta.sunSunsetSize !== undefined ? { size: Number(meta.sunSunsetSize) } : {}),
        },
        night: {
          ...(rawSun.night || {}),
          ...(meta.sunNightY !== undefined ? { y: meta.sunNightY } : {}),
          ...(meta.sunNightSize !== undefined ? { size: Number(meta.sunNightSize) } : {}),
        },
      };
    }

    const skyPresets = meta.skyPresets || {
      dawn: ['#fbc2eb', '#a6c1ee'],
      day: ['#4facfe', '#00f2fe', '#e0f7fa'],
      sunset: ['#fa709a', '#fee140', '#f39c12'],
      night: ['#09203f', '#1b2a4a', '#2c3e50'],
    };

    scenes.push({
      id: dir,
      name,
      subtitle,
      location,
      bgSpeed,
      mgSpeed,
      bgMirror,
      ...(bgScaleRatio !== undefined ? { bgScaleRatio } : {}),
      ...(bgY !== undefined ? { bgY } : {}),
      ...(mgScaleRatio !== undefined ? { mgScaleRatio } : {}),
      ...(mgY !== undefined ? { mgY } : {}),
      ...(trainY !== undefined ? { trainY } : {}),
      ...(trainScaleRatio !== undefined ? { trainScaleRatio } : {}),
      ...(sun ? { sun } : {}),
      backgroundUrl: bgUrl,
      ...(bgLightsUrl ? { backgroundLightsUrl: bgLightsUrl } : {}),
      midgroundUrl: mgUrl,
      ...(mgLightsUrl ? { midgroundLightsUrl: mgLightsUrl } : {}),
      foregroundUrl: fgUrl,
      ...(fgLightsUrl ? { foregroundLightsUrl: fgLightsUrl } : {}),
      fgSpeed,
      ...(fgScaleRatio !== undefined ? { fgScaleRatio } : {}),
      ...(fgY !== undefined ? { fgY } : {}),
      ...(fgOpacity !== undefined ? { fgOpacity } : {}),
      skyPresets,
    });
  }

  return scenes;
}

/**
 * Quét toàn bộ thư mục public/assets/trains/templates để sinh ra TRAINS
 */
export function scanTrains() {
  const trainsDir = path.resolve('public/assets/trains/templates');
  if (!fs.existsSync(trainsDir)) return [];

  // Đọc file meta.json chung quản lý tất cả các loại train trong public/assets/trains/meta.json
  const globalMetaPath = path.resolve('public/assets/trains/meta.json');
  let globalTrainsMeta = {};
  if (fs.existsSync(globalMetaPath)) {
    try {
      globalTrainsMeta = JSON.parse(fs.readFileSync(globalMetaPath, 'utf-8'));
    } catch (e) {
      console.warn(`⚠️ Lỗi đọc ${globalMetaPath}:`, e.message);
    }
  }

  const dirs = fs.readdirSync(trainsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const trains = [];

  for (const dir of dirs) {
    const dirPath = path.join(trainsDir, dir);
    const metaPath = path.join(dirPath, 'meta.json');
    let localMeta = {};

    if (fs.existsSync(metaPath)) {
      try {
        localMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (e) {
        console.warn(`⚠️ Lỗi đọc ${metaPath}:`, e.message);
      }
    }

    // Kết hợp cấu hình: global public/assets/trains/meta.json -> local meta.json của folder
    const meta = {
      ...(globalTrainsMeta[dir] || {}),
      ...localMeta,
    };

    const files = fs.readdirSync(dirPath);

    // Ưu tiên bản 4 toa cân bằng train_body_4car.png, sau đó train_body_3car.png, nếu không có thì dùng train_body.png
    let bodyUrl = '';
    let carCount = meta.carCount || 4;

    if (files.includes('train_body_4car.png')) {
      bodyUrl = `./assets/trains/templates/${dir}/train_body_4car.png`;
      carCount = 4;
    } else if (files.includes('train_body_3car.png')) {
      bodyUrl = `./assets/trains/templates/${dir}/train_body_3car.png`;
      carCount = 3;
    } else if (files.includes('train_body.png')) {
      bodyUrl = `./assets/trains/templates/${dir}/train_body.png`;
    }

    if (!bodyUrl) continue;

    // Tìm file đèn cửa sổ
    let lightsUrl = undefined;
    if (files.includes('train_lights_4car.png')) {
      lightsUrl = `./assets/trains/templates/${dir}/train_lights_4car.png`;
    } else if (files.includes('train_lights_3car.png')) {
      lightsUrl = `./assets/trains/templates/${dir}/train_lights_3car.png`;
    } else if (files.includes('train_lights.png')) {
      lightsUrl = `./assets/trains/templates/${dir}/train_lights.png`;
    }

    const isSteam = dir.includes('steam');
    const name = meta.name || humanizeName(dir, 'trains');
    const description = meta.description || `Đoàn tàu ${name} vận hành êm ái trên hành trình`;
    const wheelType = meta.wheelType || (isSteam ? 'spoke' : 'standard');
    const hasPantograph = meta.hasPantograph !== undefined ? meta.hasPantograph : false;
    const hasSmoke = meta.hasSmoke !== undefined ? meta.hasSmoke : isSteam;

    trains.push({
      id: dir,
      name,
      description,
      carCount,
      bodyUrl,
      ...(lightsUrl ? { lightsUrl } : {}),
      wheelType,
      hasPantograph,
      hasSmoke,
    });
  }

  return trains;
}

/**
 * Quét toàn bộ thư mục public/assets/music để sinh ra MUSIC_TRACKS
 */
export function scanMusic() {
  const musicDir = path.resolve('public/assets/music');
  if (!fs.existsSync(musicDir)) return [];

  // Đọc cấu hình từ names.json (src/config/names.json)
  const dict = loadNamesDictionary();
  const namesMusicMap = dict.music || {};

  const metaPath = path.join(musicDir, 'meta.json');
  let metaMap = {};
  if (fs.existsSync(metaPath)) {
    try {
      metaMap = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch (e) {
      console.warn(`⚠️ Lỗi đọc ${metaPath}:`, e.message);
    }
  }

  // Gộp thông tin meta: names.json có quyền ưu tiên cao nhất, sau đó đến meta.json
  const combinedMetaMap = { ...metaMap, ...namesMusicMap };

  const supportedExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.webm'];

  function getAudioFiles(dir, relativePrefix = '') {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.name === 'meta.json') continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        results = results.concat(getAudioFiles(fullPath, relPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (supportedExts.includes(ext)) {
          results.push({ name: entry.name, relPath });
        }
      }
    }
    return results;
  }

  const audioFiles = getAudioFiles(musicDir);
  const tracks = [];

  for (const file of audioFiles) {
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext).trim();
    // Tạo ID thân thiện: hỗ trợ unicode (tiếng Việt, CJK, Nhật), thay khoảng trắng và ký tự đặc biệt bằng _
    const id = baseName
      .toLowerCase()
      .replace(/[^\p{L}\p{N}_-]/gu, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || `track_${tracks.length + 1}`;

    // Kiểm tra cấu hình trong names.json & meta.json (tìm theo tên file đầy đủ, tên file tương đối hoặc id)
    const fileMeta = combinedMetaMap[file.name] || combinedMetaMap[file.relPath] || combinedMetaMap[id] || combinedMetaMap[baseName] || {};

    let title = typeof fileMeta === 'string' ? fileMeta : fileMeta.title;
    let artist = typeof fileMeta === 'object' ? fileMeta.artist : undefined;

    if (!title || !artist) {
      // Tự động phân tách Artist - Title nếu có dạng "Nghệ sĩ - Tên bài"
      if (baseName.includes(' - ')) {
        const parts = baseName.split(' - ');
        if (!artist) artist = parts[0].trim();
        if (!title) title = parts.slice(1).join(' - ').trim();
      } else if (baseName.includes(' – ')) {
        const parts = baseName.split(' – ');
        if (!artist) artist = parts[0].trim();
        if (!title) title = parts.slice(1).join(' – ').trim();
      } else if (baseName.includes('-')) {
        const parts = baseName.split('-');
        if (!artist) artist = parts[0].trim();
        if (!title) title = parts.slice(1).join('-').trim();
      } else {
        if (!title) title = baseName.replace(/_/g, ' ');
        if (!artist) artist = 'Bản Nhạc Thư Giãn';
      }
    }

    tracks.push({
      id: id || `track_${tracks.length + 1}`,
      title,
      artist,
      url: `./assets/music/${file.relPath.replace(/\\/g, '/')}`,
    });
  }

  return tracks;
}

  /**
   * Ghi tự động ra src/config/auto_scenes.ts, src/config/auto_trains.ts và src/config/auto_music.ts
   */
  export function generateRegistryFiles() {
    const scenes = scanLandscapes();
    const trains = scanTrains();
    const musicTracks = scanMusic();

    const scenesTs = `// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/landscapes/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm ga mới: chỉ cần tạo folder trong public/assets/landscapes/[tên_ga]/ kèm theo meta.json (tùy chọn)

import { SceneConfig } from '../types';

export const SCENES: SceneConfig[] = ${JSON.stringify(scenes, null, 2)};
`;

    const trainsTs = `// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/trains/templates/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm đoàn tàu mới: chỉ cần tạo folder trong public/assets/trains/templates/[tên_tàu]/ kèm theo meta.json (tùy chọn)

import { TrainTheme } from '../types';

export const TRAINS: TrainTheme[] = ${JSON.stringify(trains, null, 2)};
`;

    const musicTs = `// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/music/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm nhạc mới: chỉ cần thả file audio (.mp3, .wav, .ogg, .flac) vào public/assets/music/
// Tùy chọn: chỉnh sửa public/assets/music/meta.json để đặt tiêu đề và tên nghệ sĩ mong muốn

import { AudioTrack } from '../types';

export const MUSIC_TRACKS: AudioTrack[] = ${JSON.stringify(musicTracks, null, 2)};
`;

    const outScenes = path.resolve('src/config/auto_scenes.ts');
    const outTrains = path.resolve('src/config/auto_trains.ts');
    const outMusic = path.resolve('src/config/auto_music.ts');

    fs.writeFileSync(outScenes, scenesTs, 'utf-8');
    fs.writeFileSync(outTrains, trainsTs, 'utf-8');
    fs.writeFileSync(outMusic, musicTs, 'utf-8');

    console.log(`✅ [Asset Registry Scanner] Đã quét thành công ${scenes.length} địa điểm (scenes), ${trains.length} đoàn tàu (trains) và ${musicTracks.length} bản nhạc (music)!`);
  }

  // Chạy trực tiếp
  if (process.argv[1] && process.argv[1].endsWith('scan_assets.js')) {
    generateRegistryFiles();
  }

