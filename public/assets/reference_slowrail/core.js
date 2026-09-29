/**
 * Slow Rail - Core Configuration & Utilities
 * Provides city data and sprite atlas geometry.
 */
'use strict';

/**
 * 30 Curated World Destinations
 * Format: [NameVi, CountryVi, AtlasIndex, SpriteIndex, NameEn, CountryEn]
 */
const CITY_DATA = [
  ['Tokyo', 'Nhật Bản', 0, 0, 'Tokyo', 'Japan'],
  ['New York', 'Hoa Kỳ', 0, 1, 'New York', 'USA'],
  ['Paris', 'Pháp', 0, 2, 'Paris', 'France'],
  ['Hà Nội', 'Việt Nam', 1, 0, 'Hanoi', 'Vietnam'],
  ['TP. Hồ Chí Minh', 'Việt Nam', 1, 1, 'Ho Chi Minh City', 'Vietnam'],
  ['Kyoto', 'Nhật Bản', 1, 2, 'Kyoto', 'Japan'],
  ['Osaka', 'Nhật Bản', 1, 3, 'Osaka', 'Japan'],
  ['Seoul', 'Hàn Quốc', 1, 4, 'Seoul', 'South Korea'],
  ['Taipei', 'Đài Loan', 1, 5, 'Taipei', 'Taiwan'],
  ['Hong Kong', 'Trung Quốc', 1, 6, 'Hong Kong', 'China'],
  ['Shanghai', 'Trung Quốc', 1, 7, 'Shanghai', 'China'],
  ['Singapore', 'Singapore', 1, 8, 'Singapore', 'Singapore'],
  ['Bangkok', 'Thái Lan', 2, 0, 'Bangkok', 'Thailand'],
  ['London', 'Anh', 2, 1, 'London', 'United Kingdom'],
  ['Amsterdam', 'Hà Lan', 2, 2, 'Amsterdam', 'Netherlands'],
  ['Rome', 'Ý', 2, 3, 'Rome', 'Italy'],
  ['Venice', 'Ý', 2, 4, 'Venice', 'Italy'],
  ['Barcelona', 'Tây Ban Nha', 2, 5, 'Barcelona', 'Spain'],
  ['Lisbon', 'Bồ Đào Nha', 2, 6, 'Lisbon', 'Portugal'],
  ['Prague', 'Séc', 2, 7, 'Prague', 'Czech Republic'],
  ['Istanbul', 'Thổ Nhĩ Kỳ', 2, 8, 'Istanbul', 'Turkey'],
  ['Dubai', 'UAE', 3, 0, 'Dubai', 'UAE'],
  ['Cairo', 'Ai Cập', 3, 1, 'Cairo', 'Egypt'],
  ['Cape Town', 'Nam Phi', 3, 2, 'Cape Town', 'South Africa'],
  ['Sydney', 'Úc', 3, 3, 'Sydney', 'Australia'],
  ['Melbourne', 'Úc', 3, 4, 'Melbourne', 'Australia'],
  ['San Francisco', 'Hoa Kỳ', 3, 5, 'San Francisco', 'USA'],
  ['Vancouver', 'Canada', 3, 6, 'Vancouver', 'Canada'],
  ['Rio de Janeiro', 'Brazil', 3, 7, 'Rio de Janeiro', 'Brazil'],
  ['Buenos Aires', 'Argentina', 3, 8, 'Buenos Aires', 'Argentina'],
  // 10 new scenes from anh-1.png
  ['Berlin', 'Đức', 4, 0, 'Berlin', 'Germany'],
  ['Vienna', 'Áo', 4, 1, 'Vienna', 'Austria'],
  ['Budapest', 'Hungary', 4, 2, 'Budapest', 'Hungary'],
  ['Stockholm', 'Thụy Điển', 4, 3, 'Stockholm', 'Sweden'],
  ['Copenhagen', 'Đan Mạch', 4, 4, 'Copenhagen', 'Denmark'],
  ['Zurich', 'Thụy Sĩ', 4, 5, 'Zurich', 'Switzerland'],
  ['Edinburgh', 'Scotland', 4, 6, 'Edinburgh', 'Scotland'],
  ['Athens', 'Hy Lạp', 4, 7, 'Athens', 'Greece'],
  ['Dải Ngân Hà', 'Vũ trụ', 4, 8, 'Milky Way', 'Cosmos'],
  ['Bãi biển', 'Nhiệt đới', 4, 9, 'Tropical Beach', 'Coast'],
  // 10 new scenes from anh-2.png
  ['Madrid', 'Tây Ban Nha', 5, 0, 'Madrid', 'Spain'],
  ['Porto', 'Bồ Đào Nha', 5, 1, 'Porto', 'Portugal'],
  ['Florence', 'Ý', 5, 2, 'Florence', 'Italy'],
  ['Moscow', 'Nga', 5, 3, 'Moscow', 'Russia'],
  ['Mumbai', 'Ấn Độ', 5, 4, 'Mumbai', 'India'],
  ['Kathmandu', 'Nepal', 5, 5, 'Kathmandu', 'Nepal'],
  ['Mexico City', 'Mexico', 5, 6, 'Mexico City', 'Mexico'],
  ['Đáy biển san hô', 'Đại dương', 5, 7, 'Coral Reef', 'Deep Ocean'],
  ['Cánh đồng hoa', 'Thảo nguyên', 5, 8, 'Flower Field', 'Meadow'],
  ['Cực quang', 'Bắc cực', 5, 9, 'Aurora Borealis', 'Arctic'],
  // 10 new scenes from anh-3.png (South America & Africa)
  ['Lima', 'Peru', 6, 0, 'Lima', 'Peru'],
  ['Santiago', 'Chile', 6, 1, 'Santiago', 'Chile'],
  ['Bogotá', 'Colombia', 6, 2, 'Bogotá', 'Colombia'],
  ['Cusco', 'Peru', 6, 3, 'Cusco', 'Peru'],
  ['Salar de Uyuni', 'Bolivia', 6, 4, 'Salar de Uyuni', 'Bolivia'],
  ['Marrakech', 'Maroc', 6, 5, 'Marrakech', 'Morocco'],
  ['Serengeti', 'Tanzania', 6, 6, 'Serengeti', 'Tanzania'],
  ['Zanzibar', 'Tanzania', 6, 7, 'Zanzibar', 'Tanzania'],
  ['Thác Victoria', 'Zambia / Zimbabwe', 6, 8, 'Victoria Falls', 'Zambia / Zimbabwe'],
  ['Kim tự tháp Giza', 'Ai Cập', 6, 9, 'Pyramids of Giza', 'Egypt'],
  // 10 new scenes from anh-4.png (Asia & Polar regions)
  ['Bali', 'Indonesia', 7, 0, 'Bali', 'Indonesia'],
  ['Luang Prabang', 'Lào', 7, 1, 'Luang Prabang', 'Laos'],
  ['Angkor Wat', 'Campuchia', 7, 2, 'Angkor Wat', 'Cambodia'],
  ['Vạn Lý Trường Thành', 'Trung Quốc', 7, 3, 'Great Wall', 'China'],
  ['Samarkand', 'Uzbekistan', 7, 4, 'Samarkand', 'Uzbekistan'],
  ['Petra', 'Jordan', 7, 5, 'Petra', 'Jordan'],
  ['Đảo Jeju', 'Hàn Quốc', 7, 6, 'Jeju Island', 'South Korea'],
  ['Bắc Cực', 'Vùng cực bắc', 7, 7, 'The Arctic', 'North Pole'],
  ['Nam Cực', 'Châu Nam Cực', 7, 8, 'Antarctica', 'South Pole'],
  ['Trạm Cực', 'Nam Cực', 7, 9, 'Polar Station', 'Antarctica'],
  // 10 new Vietnam scenes from anh-5.png (Northern & Central Vietnam)
  ['Sa Pa', 'Việt Nam', 8, 0, 'Sa Pa', 'Vietnam'],
  ['Hà Giang', 'Việt Nam', 8, 1, 'Ha Giang', 'Vietnam'],
  ['Cao Bằng', 'Việt Nam', 8, 2, 'Cao Bang', 'Vietnam'],
  ['Hạ Long', 'Việt Nam', 8, 3, 'Ha Long Bay', 'Vietnam'],
  ['Ninh Bình', 'Việt Nam', 8, 4, 'Ninh Binh', 'Vietnam'],
  ['Hải Phòng', 'Việt Nam', 8, 5, 'Hai Phong', 'Vietnam'],
  ['Mai Châu', 'Việt Nam', 8, 6, 'Mai Chau', 'Vietnam'],
  ['Phong Nha', 'Việt Nam', 8, 7, 'Phong Nha', 'Vietnam'],
  ['Huế', 'Việt Nam', 8, 8, 'Hue', 'Vietnam'],
  ['Đà Nẵng', 'Việt Nam', 8, 9, 'Da Nang', 'Vietnam'],
  // 10 new Vietnam scenes from anh-6.png (Central Coast & Southern Vietnam)
  ['Hội An', 'Việt Nam', 9, 0, 'Hoi An', 'Vietnam'],
  ['Quy Nhơn', 'Việt Nam', 9, 1, 'Quy Nhon', 'Vietnam'],
  ['Phú Yên', 'Việt Nam', 9, 2, 'Phu Yen', 'Vietnam'],
  ['Nha Trang', 'Việt Nam', 9, 3, 'Nha Trang', 'Vietnam'],
  ['Đà Lạt', 'Việt Nam', 9, 4, 'Da Lat', 'Vietnam'],
  ['Mũi Né', 'Việt Nam', 9, 5, 'Mui Ne', 'Vietnam'],
  ['Vũng Tàu', 'Việt Nam', 9, 6, 'Vung Tau', 'Vietnam'],
  ['Cần Thơ', 'Việt Nam', 9, 7, 'Can Tho', 'Vietnam'],
  ['Rừng tràm Trà Sư', 'Việt Nam', 9, 8, 'Tra Su Forest', 'Vietnam'],
  ['Phú Quốc', 'Việt Nam', 9, 9, 'Phu Quoc', 'Vietnam'],
  // 10 new Japan scenes from anh-7.png
  ['Kanazawa', 'Nhật Bản', 10, 0, 'Kanazawa', 'Japan'],
  ['Nara', 'Nhật Bản', 10, 1, 'Nara', 'Japan'],
  ['Miyajima', 'Nhật Bản', 10, 2, 'Miyajima', 'Japan'],
  ['Himeji', 'Nhật Bản', 10, 3, 'Himeji', 'Japan'],
  ['Shirakawa-go', 'Nhật Bản', 10, 4, 'Shirakawa-go', 'Japan'],
  ['Sapporo', 'Nhật Bản', 10, 5, 'Sapporo', 'Japan'],
  ['Hakodate', 'Nhật Bản', 10, 6, 'Hakodate', 'Japan'],
  ['Yokohama', 'Nhật Bản', 10, 7, 'Yokohama', 'Japan'],
  ['Okinawa', 'Nhật Bản', 10, 8, 'Okinawa', 'Japan'],
  ['Beppu', 'Nhật Bản', 10, 9, 'Beppu', 'Japan'],
  // 10 new China scenes from anh-8.png
  ['Bắc Kinh', 'Trung Quốc', 11, 0, 'Beijing', 'China'],
  ['Tây An', 'Trung Quốc', 11, 1, "Xi'an", 'China'],
  ['Thành Đô', 'Trung Quốc', 11, 2, 'Chengdu', 'China'],
  ['Trùng Khánh', 'Trung Quốc', 11, 3, 'Chongqing', 'China'],
  ['Quế Lâm', 'Trung Quốc', 11, 4, 'Guilin', 'China'],
  ['Trương Gia Giới', 'Trung Quốc', 11, 5, 'Zhangjiajie', 'China'],
  ['Hoàng Sơn', 'Trung Quốc', 11, 6, 'Huangshan', 'China'],
  ['Hàng Châu', 'Trung Quốc', 11, 7, 'Hangzhou', 'China'],
  ['Tô Châu', 'Trung Quốc', 11, 8, 'Suzhou', 'China'],
  ['Đôn Hoàng', 'Trung Quốc', 11, 9, 'Dunhuang', 'China']
];

/**
 * Vertical slice coordinates within the 12 atlas sprite files
 */
const CITY_BOUNDS = [
  [0, 418, 836, 1254],
  [0, 222, 458, 694, 927, 1163, 1424, 1683, 1934, 2172],
  [0, 219, 446, 671, 894, 1132, 1398, 1649, 1915, 2172],
  [0, 261, 478, 699, 945, 1224, 1462, 1700, 1936, 2172],
  [0, 209, 431, 649, 875, 1087, 1305, 1523, 1739, 1959, 2170], // anh-1.png (10 scenes)
  [0, 199, 409, 620, 829, 1038, 1249, 1457, 1667, 1911, 2170], // anh-2.png (10 scenes)
  [0, 217, 434, 651, 868, 1086, 1302, 1520, 1737, 1954, 2172], // anh-3.png (10 scenes)
  [0, 223, 434, 646, 868, 1090, 1307, 1521, 1734, 1947, 2167], // anh-4.png (10 scenes)
  [0, 217, 433, 648, 865, 1085, 1300, 1518, 1736, 1952, 2170], // anh-5.png (10 Vietnam scenes)
  [
    [0, 208],     // Hội An
    [210, 433],   // Quy Nhơn
    [435, 646],   // Phú Yên
    [648, 867],   // Nha Trang
    [869, 1085],  // Đà Lạt
    [1087, 1285], // Mũi Né
    [1287, 1502], // Vũng Tàu
    [1504, 1712], // Cần Thơ
    [1715, 1917], // Rừng tràm Trà Sư
    [1919, 2172]  // Phú Quốc
  ], // anh-6.png (10 Vietnam scenes)
  [0, 209, 413, 619, 830, 1039, 1245, 1449, 1687, 1904, 2161], // anh-7.png (10 Japan scenes)
  [0, 199, 387, 591, 834, 1061, 1276, 1500, 1723, 1939, 2172]  // anh-8.png (10 China scenes)
];

/**
 * Returns localized city information
 */
function getCityInfo(index, lang = 'vi') {
  const d = CITY_DATA[index] || CITY_DATA[0];
  const isEn = lang === 'en';
  return {
    name: isEn ? (d[4] || d[0]) : d[0],
    country: isEn ? (d[5] || d[1]) : d[1],
    sheet: d[2],
    sprite: d[3]
  };
}

/**
 * Resolves sprite file path and vertical bounds for a city
 */
function cityAsset(index) {
  const d = CITY_DATA[index] || CITY_DATA[0];
  let file;
  if (d[2] === 0) {
    file = 'landscapes.png';
  } else if (d[2] === 4) {
    file = 'anh-1.png';
  } else if (d[2] === 5) {
    file = 'anh-2.png';
  } else if (d[2] === 6) {
    file = 'anh-3.png';
  } else if (d[2] === 7) {
    file = 'anh-4.png';
  } else if (d[2] === 8) {
    file = 'anh-5.png';
  } else if (d[2] === 9) {
    file = 'anh-6.png';
  } else if (d[2] === 10) {
    file = 'anh-7.png';
  } else if (d[2] === 11) {
    file = 'anh-8.png';
  } else {
    file = `cities-${d[2]}.png`;
  }
  const bounds = CITY_BOUNDS[d[2]];
  const isPair = Array.isArray(bounds[0]);
  return {
    file,
    top: isPair ? bounds[d[3]][0] : bounds[d[3]],
    bottom: isPair ? bounds[d[3]][1] : bounds[d[3] + 1]
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    CITY_DATA,
    CITY_BOUNDS,
    getCityInfo,
    cityAsset
  };
}
