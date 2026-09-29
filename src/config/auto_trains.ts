// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/trains/templates/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm đoàn tàu mới: chỉ cần tạo folder trong public/assets/trains/templates/[tên_tàu]/ kèm theo meta.json (tùy chọn)

import { TrainTheme } from '../types';

export const TRAINS: TrainTheme[] = [
  {
    "id": "train_blue_metro",
    "name": "Tàu Điện Ngầm Xanh Lam",
    "description": "Đoàn tàu Tàu Điện Ngầm Xanh Lam vận hành êm ái trên hành trình",
    "carCount": 3,
    "bodyUrl": "./assets/trains/templates/train_blue_metro/train_body_3car.png",
    "lightsUrl": "./assets/trains/templates/train_blue_metro/train_lights_3car.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_green_cargo",
    "name": "Tàu Hàng Container Xanh Lá",
    "description": "Đoàn tàu Tàu Hàng Container Xanh Lá vận hành êm ái trên hành trình",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_green_cargo/train_body.png",
    "lightsUrl": "./assets/trains/templates/train_green_cargo/train_lights.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_monorail",
    "name": "Tàu Monorail Treo Tương Lai",
    "description": "Đoàn tàu Tàu Monorail Treo Tương Lai vận hành êm ái trên hành trình",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_monorail/train_body.png",
    "lightsUrl": "./assets/trains/templates/train_monorail/train_lights.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_oil_steam",
    "name": "Tàu Hơi Nước Thùng Dầu",
    "description": "Đoàn tàu Tàu Hơi Nước Thùng Dầu vận hành êm ái trên hành trình",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_oil_steam/train_body.png",
    "lightsUrl": "./assets/trains/templates/train_oil_steam/train_lights.png",
    "wheelType": "spoke",
    "hasPantograph": false,
    "hasSmoke": true
  },
  {
    "id": "train_orange_bullet",
    "name": "Tàu Cao Tốc Cam Vàng",
    "description": "Đoàn tàu Tàu Cao Tốc Cam Vàng vận hành êm ái trên hành trình",
    "carCount": 3,
    "bodyUrl": "./assets/trains/templates/train_orange_bullet/train_body_3car.png",
    "lightsUrl": "./assets/trains/templates/train_orange_bullet/train_lights_3car.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_orange_tram",
    "name": "Tàu Điện Mặt Đất Cam Cổ Điển",
    "description": "Đoàn tàu Tàu Điện Mặt Đất Cam Cổ Điển vận hành êm ái trên hành trình",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_orange_tram/train_body.png",
    "lightsUrl": "./assets/trains/templates/train_orange_tram/train_lights.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_red_shinkansen",
    "name": "Tàu Shinkansen Đỏ Siêu Tốc",
    "description": "Đoàn tàu Tàu Shinkansen Đỏ Siêu Tốc vận hành êm ái trên hành trình",
    "carCount": 3,
    "bodyUrl": "./assets/trains/templates/train_red_shinkansen/train_body_3car.png",
    "lightsUrl": "./assets/trains/templates/train_red_shinkansen/train_lights_3car.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_red_white_commuter",
    "name": "Tàu Liên Tỉnh Đỏ Trắng Nhật Bản",
    "description": "Đoàn tàu Tàu Liên Tỉnh Đỏ Trắng Nhật Bản vận hành êm ái trên hành trình",
    "carCount": 3,
    "bodyUrl": "./assets/trains/templates/train_red_white_commuter/train_body_3car.png",
    "lightsUrl": "./assets/trains/templates/train_red_white_commuter/train_lights_3car.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_vintage_steam",
    "name": "Tàu Hơi Nước Than Đá Cổ Điển",
    "description": "Đoàn tàu Tàu Hơi Nước Than Đá Cổ Điển vận hành êm ái trên hành trình",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_vintage_steam/train_body.png",
    "lightsUrl": "./assets/trains/templates/train_vintage_steam/train_lights.png",
    "wheelType": "spoke",
    "hasPantograph": false,
    "hasSmoke": true
  },
  {
    "id": "train_yellow_metro",
    "name": "Tàu Điện Ngầm Vàng Đen (U-Bahn)",
    "description": "Đoàn tàu Tàu Điện Ngầm Vàng Đen (U-Bahn) vận hành êm ái trên hành trình",
    "carCount": 3,
    "bodyUrl": "./assets/trains/templates/train_yellow_metro/train_body_3car.png",
    "lightsUrl": "./assets/trains/templates/train_yellow_metro/train_lights_3car.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  }
];
