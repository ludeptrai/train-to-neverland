import fs from 'fs';
import path from 'path';

/**
 * Tự động chuyển đổi tên thư mục sang tên hiển thị Tiếng Việt / Thân thiện
 */
function humanizeName(id) {
  const map = {
    dalat: 'Đà Lạt Ngàn Hoa',
    halong: 'Vịnh Hạ Long',
    hoian: 'Phố Cổ Hội An',
    nhatrang: 'Biển Nha Trang',
    sapa: 'Sa Pa Tây Bắc',
    tokyo: 'Thành Phố Tokyo',
    tokyo_fuji: 'Tokyo & Núi Phú Sĩ',
    kyoto: 'Cố Đô Kyoto',
    kyoto_autumn: 'Kyoto Mùa Thu Vàng',
    newyork: 'New York Skyline',
    danang: 'Đà Nẵng Biển Đẹp',
    paris: 'Kinh Đô Paris',
    hanoi: 'Hà Nội 36 Phố Phường',
    hue: 'Cố Đô Huế',
    phuquoc: 'Đảo Ngọc Phú Quốc',
    hochiminhcity: 'TP. Hồ Chí Minh',
    train_red_shinkansen: 'Tàu Shinkansen Đỏ Siêu Tốc',
    train_orange_bullet: 'Tàu Cao Tốc Cam Vàng',
    train_blue_metro: 'Tàu Điện Ngầm Xanh Lam',
    train_yellow_metro: 'Tàu Điện Ngầm Vàng Đen (U-Bahn)',
    train_vintage_steam: 'Tàu Hơi Nước Than Đá Cổ Điển',
    train_oil_steam: 'Tàu Hơi Nước Thùng Dầu',
    train_green_cargo: 'Tàu Hàng Container Xanh Lá',
    train_orange_tram: 'Tàu Điện Mặt Đất Cam Cổ Điển',
    train_red_white_commuter: 'Tàu Liên Tỉnh Đỏ Trắng Nhật Bản',
    train_monorail: 'Tàu Monorail Treo Tương Lai',
    futuristic_train: 'Tàu Cao Tốc Tương Lai (Futuristic Maglev)',
  };

  if (map[id]) return map[id];

  // Nếu không có trong map, tự format: "my_new_station" -> "My New Station"
  return id
    .replace(/^train_/, 'Tàu ')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

    const name = meta.name || humanizeName(dir);
    const subtitle = meta.subtitle || `Chuyến tàu qua ga ${name}`;
    const location = meta.location || 'Việt Nam';
    const bgSpeed = meta.bgSpeed !== undefined ? meta.bgSpeed : 0.15;
    const mgSpeed = meta.mgSpeed !== undefined ? meta.mgSpeed : 0.85;

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
      ...(bgScaleRatio !== undefined ? { bgScaleRatio } : {}),
      ...(bgY !== undefined ? { bgY } : {}),
      ...(mgScaleRatio !== undefined ? { mgScaleRatio } : {}),
      ...(mgY !== undefined ? { mgY } : {}),
      ...(trainY !== undefined ? { trainY } : {}),
      ...(trainScaleRatio !== undefined ? { trainScaleRatio } : {}),
      backgroundUrl: bgUrl,
      ...(bgLightsUrl ? { backgroundLightsUrl: bgLightsUrl } : {}),
      midgroundUrl: mgUrl,
      ...(mgLightsUrl ? { midgroundLightsUrl: mgLightsUrl } : {}),
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

  const dirs = fs.readdirSync(trainsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const trains = [];

  for (const dir of dirs) {
    const dirPath = path.join(trainsDir, dir);
    const metaPath = path.join(dirPath, 'meta.json');
    let meta = {};

    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch (e) {
        console.warn(`⚠️ Lỗi đọc ${metaPath}:`, e.message);
      }
    }

    const files = fs.readdirSync(dirPath);

    // Ưu tiên bản 3 toa cân bằng train_body_3car.png, nếu không có thì dùng train_body.png
    let bodyUrl = '';
    let carCount = meta.carCount || 4;

    if (files.includes('train_body_3car.png')) {
      bodyUrl = `./assets/trains/templates/${dir}/train_body_3car.png`;
      carCount = 3;
    } else if (files.includes('train_body.png')) {
      bodyUrl = `./assets/trains/templates/${dir}/train_body.png`;
    }

    if (!bodyUrl) continue;

    // Tìm file đèn cửa sổ
    let lightsUrl = undefined;
    if (files.includes('train_lights_3car.png')) {
      lightsUrl = `./assets/trains/templates/${dir}/train_lights_3car.png`;
    } else if (files.includes('train_lights.png')) {
      lightsUrl = `./assets/trains/templates/${dir}/train_lights.png`;
    }

    const isSteam = dir.includes('steam');
    const name = meta.name || humanizeName(dir);
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

  const metaPath = path.join(musicDir, 'meta.json');
  let metaMap = {};
  if (fs.existsSync(metaPath)) {
    try {
      metaMap = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch (e) {
      console.warn(`⚠️ Lỗi đọc ${metaPath}:`, e.message);
    }
  }

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

    // Kiểm tra cấu hình trong meta.json (tìm theo tên file đầy đủ, tên file tương đối hoặc id)
    const fileMeta = metaMap[file.name] || metaMap[file.relPath] || metaMap[id] || metaMap[baseName] || {};

    let title = fileMeta.title;
    let artist = fileMeta.artist;

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

  // Luôn kèm một kênh Procedural Synthesizer tạo hợp âm Lo-Fi thời gian thực
  tracks.push({
    id: 'synth_tokyo_sunset',
    title: 'Tokyo Sunset Ambient Chords',
    artist: 'Neverland Lo-Fi Synthesizer',
    url: 'procedural',
  });

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

