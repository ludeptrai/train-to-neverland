// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/landscapes/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm ga mới: chỉ cần tạo folder trong public/assets/landscapes/[tên_ga]/ kèm theo meta.json (tùy chọn)

import { SceneConfig } from '../types';

export const SCENES: SceneConfig[] = [
  {
    "id": "dalat",
    "name": "Đà Lạt",
    "subtitle": "Xứ sở ngàn hoa",
    "location": "Lâm Đồng, Việt Nam",
    "bgSpeed": 0.16,
    "mgSpeed": 0.85,
    "bgMirror": true,
    "mgScaleRatio": 0.5,
    "mgY": 15,
    "sun": {
      "dawn": {
        "y": "25%",
        "size": 130
      },
      "day": {
        "y": "12%",
        "size": 58
      },
      "sunset": {
        "y": "14%",
        "size": 140
      },
      "night": {}
    },
    "backgroundUrl": "./assets/landscapes/dalat/background.png",
    "backgroundLightsUrl": "./assets/landscapes/dalat/background_lights.png",
    "midgroundUrl": "./assets/landscapes/dalat/midground_track.png",
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
    "id": "hagiang",
    "name": "Hà Giang",
    "subtitle": "Núi non hùng vĩ, nơi đá cũng nở hoa",
    "location": "Hà Giang, Việt Nam",
    "bgSpeed": 0.14,
    "mgSpeed": 0.85,
    "bgMirror": true,
    "mgScaleRatio": 0.5,
    "mgY": 10,
    "sun": {
      "dawn": {
        "y": "35%",
        "size": 130
      },
      "day": {
        "y": "10%",
        "size": 60
      },
      "sunset": {
        "y": "28%",
        "size": 140
      },
      "night": {}
    },
    "backgroundUrl": "./assets/landscapes/hagiang/background.png",
    "backgroundLightsUrl": "./assets/landscapes/hagiang/background_lights.png",
    "midgroundUrl": "./assets/landscapes/hagiang/midground_track.png",
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
    "id": "halong",
    "name": "Vịnh Hạ Long",
    "subtitle": "Kỳ quan đảo ngọc & Biển xanh huyền ảo",
    "location": "Quảng Ninh, Việt Nam",
    "bgSpeed": 0.14,
    "mgSpeed": 0.85,
    "bgMirror": true,
    "mgScaleRatio": 0.5,
    "mgY": 10,
    "sun": {
      "dawn": {
        "y": "46%",
        "size": 130
      },
      "day": {
        "y": "12%",
        "size": 58
      },
      "sunset": {
        "y": "44%",
        "size": 140
      },
      "night": {}
    },
    "backgroundUrl": "./assets/landscapes/halong/background.png",
    "backgroundLightsUrl": "./assets/landscapes/halong/background_lights.png",
    "midgroundUrl": "./assets/landscapes/halong/midground_track.png",
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
    "id": "hochiminhcity",
    "name": "TP. Hồ Chí Minh",
    "subtitle": "Hòn Ngọc Viễn Đông & Nhịp Sống Đô Thị Hoa Lệ",
    "location": "Sài Gòn, Việt Nam",
    "bgSpeed": 0.15,
    "mgSpeed": 0.85,
    "bgMirror": true,
    "mgScaleRatio": 0.65,
    "mgY": 0,
    "sun": {
      "dawn": {
        "y": "58%",
        "size": 130
      },
      "day": {
        "y": "12%",
        "size": 58
      },
      "sunset": {
        "y": "42%",
        "size": 140
      },
      "night": {}
    },
    "backgroundUrl": "./assets/landscapes/hochiminhcity/background.png",
    "backgroundLightsUrl": "./assets/landscapes/hochiminhcity/background_lights.png",
    "midgroundUrl": "./assets/landscapes/hochiminhcity/midground_track.png",
    "skyPresets": {
      "dawn": [
        "#fbc2eb",
        "#a6c1ee",
        "#fed6e3"
      ],
      "day": [
        "#3a7bd5",
        "#00d2ff",
        "#e0f7fa"
      ],
      "sunset": [
        "#e14fad",
        "#f76b1c",
        "#fad961"
      ],
      "night": [
        "#0b0e14",
        "#1a1c2e",
        "#2c2d4a"
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
    "bgMirror": true,
    "mgScaleRatio": 0.5,
    "mgY": -60,
    "sun": {
      "dawn": {
        "y": "19%",
        "size": 130
      },
      "day": {
        "y": "5%",
        "size": 108
      },
      "sunset": {
        "y": "14%",
        "size": 140
      },
      "night": {}
    },
    "backgroundUrl": "./assets/landscapes/hoian/background.png",
    "backgroundLightsUrl": "./assets/landscapes/hoian/background_lights.png",
    "midgroundUrl": "./assets/landscapes/hoian/midground_track.png",
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
    "bgMirror": true,
    "mgScaleRatio": 0.8,
    "mgY": -80,
    "sun": {
      "dawn": {
        "y": "48%",
        "size": 130
      },
      "day": {
        "y": "12%",
        "size": 58
      },
      "sunset": {
        "y": "46%",
        "size": 140
      },
      "night": {}
    },
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
  }
];
