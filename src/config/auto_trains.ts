// 🤖 TỰ ĐỘNG TẠO SINH TỪ THƯ MỤC public/assets/trains/templates/
// KHÔNG CHỈNH SỬA THỦ CÔNG FILE NÀY.
// Để thêm đoàn tàu mới: chỉ cần tạo folder trong public/assets/trains/templates/[tên_tàu]/ kèm theo meta.json (tùy chọn)

import { TrainTheme } from '../types';

export const TRAINS: TrainTheme[] = [
  {
    "id": "futuristic_train",
    "name": "Tàu Cao Tốc Tương Lai",
    "description": "Đoàn tàu công nghệ cao lướt êm ái trên đệm từ trường tương lai với hệ thống đèn LED cyan neon",
    "carCount": 3,
    "bodyUrl": "./assets/trains/templates/futuristic_train/train_body_3car.png",
    "lightsUrl": "./assets/trains/templates/futuristic_train/train_lights_3car.png",
    "wheelType": "maglev_glow",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "metro",
    "name": "Metro",
    "description": "Đoàn tàu Metro thế hệ mới vận hành êm ái trên hành trình",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/metro/train_body_4car.png",
    "lightsUrl": "./assets/trains/templates/metro/train_lights_4car.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_blue_metro",
    "name": "Tàu Điện Ngầm Xanh Lam",
    "description": "Đoàn tàu điện ngầm xanh lam thanh lịch vận hành êm ái trong lòng thành phố",
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
    "description": "Đoàn tàu chở hàng container xanh lá mạnh mẽ vượt qua những cung đường dài",
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
    "description": "Đoàn tàu một ray Monorail trên cao uốn lượn nhịp nhàng giữa đô thị hiện đại",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_monorail/train_body.png",
    "lightsUrl": "./assets/trains/templates/train_monorail/train_lights.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_orange_bullet",
    "name": "Tàu Cao Tốc Cam Vàng",
    "description": "Đoàn tàu cao tốc dáng khí động học màu cam vàng rực rỡ xé gió băng qua đồng cỏ",
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
    "description": "Đoàn tàu điện mặt đất (tramway) màu cam cổ điển mang phong cách châu Âu",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_orange_tram/train_body.png",
    "lightsUrl": "./assets/trains/templates/train_orange_tram/train_lights.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  },
  {
    "id": "train_shinkansen_high_speed",
    "name": "Shinkansen High Speed",
    "description": "Đoàn tàu Shinkansen High Speed thế hệ mới vận hành êm ái trên hành trình",
    "carCount": 4,
    "bodyUrl": "./assets/trains/templates/train_shinkansen_high_speed/train_body_4car.png",
    "lightsUrl": "./assets/trains/templates/train_shinkansen_high_speed/train_lights_4car.png",
    "wheelType": "standard",
    "hasPantograph": true,
    "hasSmoke": false
  },
  {
    "id": "train_vintage_steam",
    "name": "Tàu Hơi Nước Than Đá Cổ Điển",
    "description": "Đoàn tàu hơi nước đốt than đá cổ kính thế kỷ 19 tỏa khói trắng bồng bềnh",
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
    "description": "Đoàn tàu điện ngầm vàng đen phong cách U-Bahn năng động và hiện đại",
    "carCount": 3,
    "bodyUrl": "./assets/trains/templates/train_yellow_metro/train_body_3car.png",
    "lightsUrl": "./assets/trains/templates/train_yellow_metro/train_lights_3car.png",
    "wheelType": "standard",
    "hasPantograph": false,
    "hasSmoke": false
  }
];
