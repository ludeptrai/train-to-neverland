// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/landscapes/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm ga mới: chỉ cần tạo folder trong public/assets/landscapes/[tên_ga]/ kèm theo meta.json (tùy chọn)

import { SceneConfig } from '../types';

export const SCENES: SceneConfig[] = [
  {
    "id": "dalat",
    "name": "Đà Lạt Ngàn Hoa",
    "subtitle": "Đồi thông sương mờ & Ga xe lửa cổ kính",
    "location": "Lâm Đồng, Việt Nam",
    "bgSpeed": 0.15,
    "mgSpeed": 0.85,
    "backgroundUrl": "./assets/landscapes/dalat/background.png",
    "midgroundUrl": "./assets/landscapes/dalat/midground_track.svg",
    "skyPresets": {
      "dawn": [
        "#ff9a9e",
        "#fecfef"
      ],
      "day": [
        "#a1c4fd",
        "#c2e9fb"
      ],
      "sunset": [
        "#fa709a",
        "#fee140"
      ],
      "night": [
        "#1e3c72",
        "#2a5298"
      ]
    }
  },
  {
    "id": "halong",
    "name": "Vịnh Hạ Long",
    "subtitle": "Kỳ quan đảo ngọc & Biển xanh huyền ảo",
    "location": "Quảng Ninh, Việt Nam",
    "bgSpeed": 0.14,
    "mgSpeed": 0.85,
    "backgroundUrl": "./assets/landscapes/halong/background.png",
    "midgroundUrl": "./assets/landscapes/dalat/midground_track.svg",
    "skyPresets": {
      "dawn": [
        "#a8edea",
        "#fed6e3"
      ],
      "day": [
        "#4facfe",
        "#00f2fe"
      ],
      "sunset": [
        "#ff758c",
        "#ff7eb3"
      ],
      "night": [
        "#13547a",
        "#80d0c7"
      ]
    }
  },
  {
    "id": "hoian",
    "name": "Phố Cổ Hội An",
    "subtitle": "Đèn lồng lung linh bên bờ sông Hoài",
    "location": "Quảng Nam, Việt Nam",
    "bgSpeed": 0.16,
    "mgSpeed": 0.85,
    "backgroundUrl": "./assets/landscapes/hoian/background.png",
    "midgroundUrl": "./assets/landscapes/dalat/midground_track.svg",
    "skyPresets": {
      "dawn": [
        "#fbc2eb",
        "#a6c1ee"
      ],
      "day": [
        "#fddb92",
        "#d1fdff"
      ],
      "sunset": [
        "#ff5858",
        "#f09819"
      ],
      "night": [
        "#0f2027",
        "#203a43",
        "#2c5364"
      ]
    }
  },
  {
    "id": "nhatrang",
    "name": "Biển Nha Trang",
    "subtitle": "Bờ cát trắng & Tuyến đường sắt ven biển ngọc",
    "location": "Khánh Hòa, Việt Nam",
    "bgSpeed": 0.15,
    "mgSpeed": 0.85,
    "backgroundUrl": "./assets/landscapes/nhatrang/background.png",
    "backgroundLightsUrl": "./assets/landscapes/nhatrang/background_lights.png",
    "midgroundUrl": "./assets/landscapes/nhatrang/midground_track.png",
    "skyPresets": {
      "dawn": [
        "#ff9a9e",
        "#fecfef",
        "#a1c4fd"
      ],
      "day": [
        "#4facfe",
        "#00f2fe",
        "#e0f7fa"
      ],
      "sunset": [
        "#fa709a",
        "#fee140",
        "#f39c12"
      ],
      "night": [
        "#09203f",
        "#1b2a4a",
        "#2c3e50"
      ]
    }
  },
  {
    "id": "sapa",
    "name": "Sa Pa Tây Bắc",
    "subtitle": "Ruộng bậc thang & Mây ngàn đỉnh Fansipan",
    "location": "Lào Cai, Việt Nam",
    "bgSpeed": 0.14,
    "mgSpeed": 0.85,
    "backgroundUrl": "./assets/landscapes/sapa/background.png",
    "midgroundUrl": "./assets/landscapes/dalat/midground_track.svg",
    "skyPresets": {
      "dawn": [
        "#f6d365",
        "#fda085"
      ],
      "day": [
        "#89f7fe",
        "#66a6ff"
      ],
      "sunset": [
        "#f093fb",
        "#f5576c"
      ],
      "night": [
        "#09203f",
        "#537895"
      ]
    }
  }
];
