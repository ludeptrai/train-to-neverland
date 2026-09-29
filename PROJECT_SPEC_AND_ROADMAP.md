# 🚂 CHUYẾN TÀU KHÔNG VỘI (Train to the Neverland)
## Tài Liệu Thiết Kế Kỹ Thuật, Danh Mục Chuẩn Bị & Kế Hoạch Phát Triển

---

## 1. TỔNG QUAN DỰ ÁN (Project Overview)
- **Tên dự án:** Chuyến Tàu Không Vội / Train to the Neverland
- **Mục tiêu:** Xây dựng một Web App phong cách Pixel Art thư giãn & tập trung (Chill & Focus Web Station) mang lại cảm giác bình yên, ấm cúng. Người dùng có thể vừa nghe nhạc Lo-fi và âm thanh thiên nhiên, vừa ngắm nhìn đoàn tàu vô tận lướt qua các danh lam thắng cảnh nổi tiếng thế giới.
- **Đối tượng người dùng:** Học sinh, sinh viên, lập trình viên, designer, người làm việc từ xa cần không gian tập trung làm việc, thư giãn hoặc hỗ trợ giấc ngủ.
- **Nền tảng triển khai:** Web Single Page Application (SPA), chạy 100% Client-side, không tốn chi phí máy chủ, tương thích hoàn hảo từ laptop, màn hình rời Ultrawide đến máy tính bảng.

---

## 2. NHẬT KÝ QUYẾT ĐỊNH (Decision Log)

| Lĩnh vực | Quyết định cuối cùng | Các phương án đã cân nhắc | Lý do lựa chọn |
| :--- | :--- | :--- | :--- |
| **Mục tiêu cốt lõi** | Web App Thư giãn & Tập trung (Chill & Focus) theo mô hình Lofi.co, có mở rộng Art Showcase và Gamification nhẹ | Game mini phức tạp hoặc chỉ là thư viện ảnh tĩnh | Tối đa hóa giá trị sử dụng hằng ngày, tạo trải nghiệm êm dịu không áp lực. |
| **Công nghệ đồ họa** | **Modular Component Engine:** CSS Transform Parallax + Canvas 2D Particle Overlay | PixiJS WebGL toàn phần, Phaser 3 Game Engine, Pure CSS | Đạt 60 FPS mượt mà trên card GPU, tải trang cực nhanh (<1s), dễ dàng tùy biến giao diện bằng React. |
| **Cấu trúc Layer** | **Kiến trúc Tối Giản 3 Tầng (3-Layer Standard):** Bầu trời CSS (không cần vẽ) + Hậu cảnh Landmark + Mặt đất & Đường ray | Tách 6-7 tầng chi tiết | Giảm tải 70% khối lượng vẽ. Muốn thêm địa danh mới chỉ cần chuẩn bị đúng **2 file ảnh**. |
| **Cơ chế chuyển động** | **Chuyến tàu vô tận (Infinite Seamless Parallax):** Tàu cố định nhún nhịp nhàng, cảnh cuộn từ phải sang trái, đổi cảnh bằng hiệu ứng hầm tàu (Tunnel/Crossfade) | Tàu chạy qua màn hình rồi dừng, hoặc từng cảnh tĩnh | Cảm giác du hành miên man, liên tục không đứt đoạn. |
| **Xử lý Ngày / Đêm** | **Hybrid Lighting:** 1 Asset ban ngày + 1 Lớp đèn đêm (Emissive Mask) + CSS Color Grading | Vẽ thủ công 3-4 bộ ảnh riêng cho từng giờ, hoặc phủ filter mờ toàn màn hình | Tiết kiệm công vẽ pixel, đèn cửa sổ toa tàu và đèn thành phố phát sáng rực rỡ tự nhiên vào ban đêm. |
| **Hệ thống âm thanh** | **Audio Mixer đa kênh:** Nhạc Lo-fi nền + Các thanh trượt âm thanh môi trường độc lập (tiếng ray, mưa, gió, chim) | Một file nhạc nén chung, hoặc chỉ nhúng iframe Spotify | Người dùng có toàn quyền tinh chỉnh không gian âm thanh theo sở thích. |
| **Lưu trữ & Triển khai** | **Client-side SPA (Vite + React + TS):** Lưu cấu hình trên `localStorage` | Fullstack backend + Database user | Không tốn chi phí hosting (Deploy miễn phí trên Vercel/GitHub Pages), bảo mật riêng tư 100%. |

---

## 3. KIẾN TRÚC HỆ THỐNG & PHÂN TÁCH LỚP ĐỒ HỌA

### 3.1. Cấu Trúc Các Tầng Hiển Thị (Layer Hierarchy)
Toàn bộ khung nhìn được xếp chồng theo trục Z-index từ xa đến gần (`image-rendering: pixelated`):

```
+-------------------------------------------------------------------------+
| [Layer 1: Sky CSS] - Gradient màu động (Bình minh, Trưa, Chiều, Tối)     |
+-------------------------------------------------------------------------+
| [Layer 2: Ambient Objects] - Khinh khí cầu, đàn chim, máy bay trôi chậm |
+-------------------------------------------------------------------------+
| [Layer 3: Landmark Background (background.png)] - Tốc độ cuộn: 15% - 20%|
|           + [Night Lights Mask (background_lights.png)]                 |
+-------------------------------------------------------------------------+
| [Layer 4: Ground & Track (midground_track.png)] - Tốc độ cuộn: 100%     |
|           + [Night Lights Mask (midground_lights.png)]                  |
+-------------------------------------------------------------------------+
| [Layer 5: Đoàn tàu (Train Theme Sprites)] - Cố định X, nhún Y 1-2px     |
|           + Bánh xe quay liên tục (Wheel animation)                     |
|           + [Train Lights Mask (train_lights.png)]                      |
+-------------------------------------------------------------------------+
| [Layer 6: Weather Particle Canvas] - Mưa rơi chéo, tuyết, hoa anh đào  |
+-------------------------------------------------------------------------+
| [Layer 7: Minimalist Pixel HUD] - Bộ điều khiển thời gian, mixer, timer  |
+-------------------------------------------------------------------------+
```

### 3.2. Cơ Chế Ánh Sáng Hòa Sắc & Ban Đêm (Lighting & Emissive Engine)
- **4 mốc thời gian:**
  1. *Bình minh (Dawn - 05:00 - 07:00):* Bầu trời màu cam đào / hồng phấn; ambient ấm nhẹ.
  2. *Ban ngày (Day - 07:00 - 17:00):* Bầu trời xanh biếc trong trẻo; ambient tươi sáng.
  3. *Hoàng hôn (Sunset - 17:00 - 19:00):* Bầu trời chuyển dần từ tím sang cam rực; ambient phủ ánh vàng hoài niệm.
  4. *Ban đêm (Night - 19:00 - 05:00):* Bầu trời xanh tím than đậm + trăng sao lấp lánh; ambient tối huyền bí.
- **Đèn phát sáng (Emissive Mask):** Khi chuyển sang ban đêm, lớp mặt nạ trong suốt chứa cửa sổ và đèn pha sẽ tăng `opacity: 1` kèm `filter: drop-shadow(0 0 6px rgba(255, 220, 120, 0.9))`, làm sáng bừng toa tàu giữa màn đêm.

### 3.3. Bộ Trộn Âm Thanh Đa Kênh (Multi-channel Audio Mixer)
- Thư viện quản lý: `Howler.js` (hoặc Web Audio API thuần).
- Kênh 1: **Nhạc Lo-fi / Piano Chill** (Playlist MP3 lặp lại mượt mà, hỗ trợ Pause / Play / Next).
- Kênh 2: **Âm thanh ray tàu (Train Clatter)** - Tiếng lách cách xình xịch theo chu kỳ nhịp bánh sắt.
- Kênh 3: **Tiếng Mưa (Rainfall)** - Tiếng mưa rào hoặc mưa rỉ rả gõ lên mái tôn/nóc tàu.
- Kênh 4: **Tiếng Gió (Breeze / Wind)** - Tiếng gió thổi vi vu lãng đãng.
- Kênh 5: **Tiếng Chim / Dế đêm (Nature Birds & Crickets)** - Tự động đổi chim hót ban ngày sang tiếng dế ban đêm.
- Mỗi kênh có thanh trượt điều chỉnh âm lượng riêng từ `0%` đến `100%`, tự động lưu vào `localStorage`.

---

## 4. DANH MỤC TÀI NGUYÊN BẠN CẦN CHUẨN BỊ (Asset Preparation Checklist)

Để website hoạt động đẹp mắt và dễ dàng mở rộng, bạn chỉ cần chuẩn bị các tài nguyên sau theo đúng thông số chuẩn hóa:

### 4.1. Chuẩn Hóa Thông Số Pixel Art
- **Định dạng file:** Ảnh `.png` nền trong suốt (Transparent 32-bit PNG).
- **Kích thước độ phân giải chuẩn (Canvas Native Resolution):** Khuyến nghị chiều cao chuẩn **360px** hoặc **540px** (tỷ lệ 16:9 tương ứng `640x360px` hoặc `960x540px`). Web sẽ tự động phóng to (upscale) 2x, 3x, 4x bằng CSS `image-rendering: pixelated` để đảm bảo hạt pixel luôn sắc nét không tì vết trên mọi màn hình máy tính.

### 4.2. Danh Sách Asset Cho Mỗi Phong Cảnh (Landscape Pack)
Với mỗi địa danh mới (ví dụ: Tokyo Phú Sĩ, Singapore Marina, Rừng Lá Phong Nhật...), bạn chỉ cần chuẩn bị **2 cặp ảnh**:

1. **Layer Hậu Cảnh (Landmark Background):**
   - File 1: `background.png` (Chứa núi, tháp, các tòa nhà chọc trời xa). Chiều rộng lặp vô tận (Seamless tileable hoặc ảnh panorama rộng tối thiểu `1280px`).
   - File 2: `background_lights.png` (Chỉ vẽ các chấm vàng/trắng của đèn cửa sổ thành phố trên nền trong suốt. Ban ngày sẽ ẩn đi, ban đêm sẽ sáng lên).
2. **Layer Mặt Đất & Đường Ray (Midground Track):**
   - File 1: `midground_track.png` (Chứa hàng cây, dãy nhà nhỏ ven đường, cột rào và thanh ray sắt. Hai mép trái - phải phải nối khớp hoàn hảo để cuộn vô tận).
   - File 2 (Tùy chọn): `midground_lights.png` (Đèn lồng, đèn đường ven đường).

### 4.3. Danh Sách Asset Cho Các Chủ Đề Đoàn Tàu (Train Themes)
Mỗi chủ đề đoàn tàu (Tàu điện Nhật, Tàu hơi nước cổ, Tàu viễn tưởng) chuẩn bị:
1. `train_body.png`: Thân toa đầu máy + 1-2 toa hành khách nối tiếp.
2. `train_wheels.png`: Sprite sheet bánh xe quay (2 đến 4 frame lặp lại).
3. `train_lights.png`: Lớp trong suốt vẽ riêng ánh sáng vàng từ các ô cửa sổ toa tàu và chùm sáng đèn pha đầu tàu.
4. *(Dành riêng cho tàu hơi nước):* `steam_smoke.png` (Cụm khói pixel nhỏ để bốc lên từ ống khói).

### 4.4. Asset Vật Thể Bay Ngẫu Nhiên (Ambient Sprites)
- `birds.png`: Sprite chim bay (2-3 frame cánh đập).
- `hot_air_balloon.png`: Khinh khí cầu nhỏ (1 ảnh tĩnh).
- `airplane.png`: Máy bay nhỏ chân trời (1 ảnh tĩnh).

### 4.5. Tài Nguyên Âm Thanh (Audio Assets - MP3 / OGG)
- **Nhạc nền Lo-fi:** 3 - 5 bài nhạc không lời Lo-fi Hip-hop / Ambient Piano nhẹ nhàng (sử dụng nhạc bản quyền Creative Commons 0 hoặc Royalty-free, ví dụ từ Lofi Girl, Chosic, Pixabay Audio).
- **Âm thanh môi trường (Sound FX Loops - độ dài 10s - 30s lặp seamless):**
  - `train_loop.mp3` (Tiếng ray tàu chạy đều đều)
  - `rain_loop.mp3` (Tiếng mưa rơi)
  - `wind_loop.mp3` (Tiếng gió thổi)
  - `birds_loop.mp3` (Tiếng chim ríu rít ban ngày)
  - `crickets_loop.mp3` (Tiếng dế mèn đêm thanh vắng)

---

## 5. KẾ HOẠCH PHÁT TRIỂN CHI TIẾT (Development Roadmap)

### 📌 Giai Đoạn 1: Khởi Tạo Dự Án & Bộ Khung Parallax Vô Tận (Sprint 1)
- [ ] Khởi tạo dự án bằng **Vite + React + TypeScript**.
- [ ] Cấu hình CSS viewport Ultrawide/Letterbox responsive, thiết lập `image-rendering: pixelated`.
- [ ] Xây dựng **Parallax Engine** với vòng lặp `requestAnimationFrame`:
  - Đồng bộ tốc độ cuộn vô tận (Seamless Loop) của 2 layer ảnh: Hậu cảnh (Landmark) và Tiền cảnh ray tàu (Midground Track).
  - Đặt đoàn tàu lên ray, tạo hiệu ứng nhấp nhô (bobbing/sine wave) và hoạt họa quay bánh xe.
- [ ] Tích hợp hiệu ứng chuyển cảnh bằng màn đen/hầm tàu (Tunnel Transition) khi chuyển đổi sang phong cảnh khác.

### 📌 Giai Đoạn 2: Chu Kỳ Ngày Đêm & Hệ Thống Thời Tiết Canvas (Sprint 2)
- [ ] Xây dựng module **Sky Generator**: Gradient bầu trời CSS đổi màu theo 4 mốc (Bình minh, Ngày, Hoàng hôn, Đêm).
- [ ] Xây dựng hệ thống **Hybrid Lighting**:
  - Áp dụng bộ lọc màu CSS/SVG lên các layer phong cảnh.
  - Bật/tắt lớp mặt nạ phát sáng `emissive mask` cho cửa sổ tàu và đèn thành phố khi trời tối.
- [ ] Xây dựng **Weather Canvas Engine**:
  - Module hạt mưa (hạt pixel rơi xiên + hiệu ứng nước bắn nhẹ).
  - Module tuyết rơi (chao đảo nhẹ theo gió).
  - Module hạt nắng (god rays / bụi nắng lơ lửng).
- [ ] Xây dựng **Ambient Spawner**: Sinh đàn chim, khinh khí cầu và máy bay trôi ngẫu nhiên trên bầu trời.

### 📌 Giai Đoạn 3: Hệ Thống Âm Thanh & Mixer Đa Kênh (Sprint 3)
- [ ] Tích hợp `Howler.js` quản lý âm thanh.
- [ ] Xây dựng bộ phát nhạc Lo-fi (Play, Pause, Next bài, thanh tiến trình âm lượng).
- [ ] Xây dựng hệ thống sound effect môi trường với 4 thanh trượt âm lượng độc lập (Tàu, Mưa, Gió, Chim muông).
- [ ] Lưu trữ trạng thái âm lượng và cài đặt người dùng vào `localStorage`.

### 📌 Giai Đoạn 4: Giao Diện Người Dùng (HUD UI) & Công Cụ Tập Trung (Sprint 4)
- [ ] Thiết kế thanh điều khiển phong cách Pixel Art tối giản:
  - Menu chuyển đổi nhanh: Địa danh, Theme tàu, Thời tiết, Thời gian.
- [ ] Xây dựng widget **Pomodoro Timer** (25 phút học/làm việc, 5 phút giải lao) có chuông báo pixel êm ái.
- [ ] Chế độ **Toàn màn hình & Zen Mode**: 1 click ẩn toàn bộ giao diện để người dùng ngắm cảnh thuần túy.

### 📌 Giai Đoạn 5: Kiểm Thử, Tối Ưu Hóa & Đóng Gói (Sprint 5)
- [ ] Tối ưu hóa hiệu năng GPU, đảm bảo đạt chuẩn 60 FPS ổn định ngay cả trên laptop tiết kiệm pin.
- [ ] Kiểm tra responsive trên các kích thước màn hình phổ biến (1366x768, 1920x1080, 2560x1440, Mobile/Tablet).
- [ ] Hướng dẫn triển khai (Deploy) 1-click lên **Vercel** hoặc **GitHub Pages**.

---

## 6. ĐÁNH GIÁ RỦI RO & GIẢI PHÁP (Risk Management)
1. **Rủi ro vết ghép ảnh cuộn bị giật (Seam jitter):**
   - *Giải pháp:* Tọa độ X cuộn bằng số thực `subpixel` kết hợp làm tròn `Math.floor` hoặc CSS `transform: translate3d` với `will-change: transform` để GPU nội suy êm ái.
2. **Rủi ro chính sách Autoplay âm thanh của trình duyệt:**
   - *Giải pháp:* Trình duyệt hiện đại chặn phát nhạc tự động khi vừa mở trang web. Thiết kế nút "Bắt đầu chuyến tàu" (Start Journey) hoặc nút Play rõ ràng để kích hoạt AudioContext sau tương tác đầu tiên của người dùng.
3. **Rủi ro dung lượng tài nguyên ảnh/nhạc:**
   - *Giải pháp:* Tối ưu nén ảnh PNG bằng công cụ lossless (như TinyPNG/Pngquant); nhạc nén ở định dạng MP3 128kbps/192kbps hoặc OGG để tải trang nhanh như chớp.
