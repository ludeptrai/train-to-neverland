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

    // Tham số cấu hình scale ratio & trục Y của midground
    const mgScaleRatio = meta.mgScaleRatio !== undefined
      ? Number(meta.mgScaleRatio)
      : (meta.mgScale !== undefined ? Number(meta.mgScale) : (meta.scaleRatio !== undefined ? Number(meta.scaleRatio) : undefined));

    const mgY = meta.mgY !== undefined
      ? meta.mgY
      : (meta.mgOffsetY !== undefined ? meta.mgOffsetY : (meta.yAxis !== undefined ? meta.yAxis : undefined));

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
      ...(mgScaleRatio !== undefined ? { mgScaleRatio } : {}),
      ...(mgY !== undefined ? { mgY } : {}),
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
 * Ghi tự động ra src/config/auto_scenes.ts và src/config/auto_trains.ts
 */
export function generateRegistryFiles() {
  const scenes = scanLandscapes();
  const trains = scanTrains();

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

  const outScenes = path.resolve('src/config/auto_scenes.ts');
  const outTrains = path.resolve('src/config/auto_trains.ts');

  fs.writeFileSync(outScenes, scenesTs, 'utf-8');
  fs.writeFileSync(outTrains, trainsTs, 'utf-8');

  console.log(`✅ [Asset Registry Scanner] Đã quét thành công ${scenes.length} địa điểm (scenes) và ${trains.length} đoàn tàu (trains)!`);
}

// Chạy trực tiếp
if (process.argv[1] && process.argv[1].endsWith('scan_assets.js')) {
  generateRegistryFiles();
}
