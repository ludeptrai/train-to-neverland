# 🚂 Chuyến Tàu Không Vội — Train to the Neverland

> **Trạm không gian Pixel Art thư giãn & tập trung (Chill & Focus Lo-Fi Web Station)**  
> *Một chuyến tàu vô tận lướt êm đềm qua các miền đất thơ mộng, hòa quyện cùng âm thanh Lo-Fi và thanh âm thiên nhiên.*

---

## 🌟 Giới Thiệu Về Trang Web

**Chuyến Tàu Không Vội (Train to the Neverland)** là một ứng dụng Web Single Page Application (SPA) phong cách **Pixel Art hoài niệm**, được thiết kế để trở thành người bạn đồng hành lý tưởng cho học sinh, sinh viên, lập trình viên, designer hay bất kỳ ai đang cần một không gian bình yên để **tập trung làm việc, học tập, thư giãn hoặc đi vào giấc ngủ**.

Người dùng sẽ được trải nghiệm một chuyến hành trình không hồi kết trên con tàu qua khung cửa sổ, ngắm nhìn những danh lam thắng cảnh biểu tượng của Việt Nam và thế giới thay đổi diện mạo theo chu kỳ ngày đêm, đồng thời tự tay hòa âm không gian âm thanh của riêng mình.

---

## ✨ Tính Năng Nổi Bật

### 1. 🖼️ Đồ Họa Parallax Vô Tận & Hiệu Ứng Ánh Sáng Thời Gian Thực
- **Kiến trúc cuộn vô tận (Infinite Seamless Parallax):** Khung cảnh chuyển động mượt mà ở tốc độ 60 FPS, áp dụng thuật toán lật gương `scaleX(-1)` giúp nền cuộn liên tục không để lại vết ghép nối.
- **Hơn 10+ Phong cảnh biểu tượng:** Trải dài từ vẻ đẹp Việt Nam (Sài Gòn - TP.HCM hiện đại, Phố cổ Hội An, Đà Lạt ngập trong sương, Hà Nội nghìn năm văn hiến, Kỳ quan Vịnh Hạ Long) đến các kỳ quan thế giới (Tokyo hoa lệ, Kyoto cổ kính, Paris mộng mơ, Venice sông nước, London cổ kính...).
- **Chu kỳ 4 Mốc Thời Gian:** Bình minh (*Dawn*), Ban ngày (*Day*), Hoàng hôn (*Sunset*) và Màn đêm (*Night*). Hỗ trợ chuyển đổi thủ công hoặc đồng bộ tự động theo đồng hồ thực tế của thiết bị.
- **Mặt nạ phát sáng ban đêm (Emissive Mask):** Khi trời tối, ánh sáng vàng ấm áp từ ô cửa sổ toa tàu và đèn nhà thành phố tự động bừng sáng qua lớp mask phát quang chuyên biệt.
- **Hệ thống thời tiết hạt Canvas 2D:** Mưa rơi chéo, tuyết rơi nhè nhẹ, cánh hoa anh đào bay lượn ngẫu nhiên trong gió.

### 2. 🎧 Trình Phát Nhạc Lo-Fi & Bộ Trộn Âm Thanh 5 Kênh (Audio Mixer)
- **Tự động phát nhạc (Auto-Play):** Nhạc Lo-Fi / Synthwave êm dịu tự động phát ngay khi truy cập trang web ở mức âm lượng dễ chịu (30%).
- **5 Kênh Âm Thanh Độc Lập:**
  - 🎵 **Lo-Fi / Synth Music:** Các giai điệu piano và synthwave chậm rãi, ấm áp.
  - 🚆 **Tiếng ray tàu (Train Clatter):** Âm thanh bánh sắt xình xịch nhịp nhàng theo chu kỳ di chuyển.
  - 🌧️ **Tiếng mưa rơi (Rainfall):** Mưa rơi tí tách êm dịu ngoài cửa sổ.
  - 🍃 **Tiếng gió thổi (Breeze):** Gió thoảng vi vu qua các tán cây và sườn núi.
  - 🐦 **Thanh âm thiên nhiên (Nature):** Tự động chuyển đổi giữa tiếng chim hót ban ngày và tiếng dế đêm rỉ rả khi màn đêm buông xuống.
- **Nút Mute Tổng & Phím Tắt:** Nút Master Mute nổi trên giao diện cùng phím tắt `M` cho phép tắt hoặc bật lại toàn bộ âm thanh của trang web ngay lập tức.
- Tự động ghi nhớ mức âm lượng của từng kênh vào `localStorage`.

### 3. 🎯 Bộ Tiện Ích Hỗ Trợ Tập Trung (Focus Suite)
- ⏱️ **Đồng hồ Pomodoro:** Chế độ bấm giờ 25 phút tập trung sâu / 5 phút nghỉ ngơi với âm báo chuông pixel nhẹ nhàng.
- 🧘 **Chế độ Zen Mode:** Ẩn toàn bộ thanh điều khiển và giao diện người dùng chỉ bằng một nút bấm (`phím Z`), biến màn hình máy tính của bạn thành một bức tranh nghệ thuật pixel động tuyệt đẹp.
- ⏸️ **Tạm dừng / Tiếp tục linh hoạt:** Phím tắt `Space` giúp dừng đoàn tàu để ngắm nhìn một khung cảnh yêu thích.

### 4. 🧩 Hệ Thống Quản Trị Tập Trung & Mở Rộng Không Cần Code (Zero-Code)
- **Quản lý tên tập trung:** File [`src/config/names.json`](file:///d:/JOB/train-to-neverland/src/config/names.json) quản lý đồng bộ toàn bộ tên hiển thị tiếng Việt và phụ đề cho Phong cảnh, Đoàn tàu và Âm nhạc.
- **Metadata Đoàn tàu đa dạng:** File [`public/assets/trains/meta.json`](file:///d:/JOB/train-to-neverland/public/assets/trains/meta.json) định nghĩa chi tiết 10 chủ đề đoàn tàu (Tàu hơi nước cổ điển, Tàu điện Shinkansen, Tàu điện ngầm Cyberpunk, Tàu gỗ miền núi...).
- **Tự động quét tài nguyên:** Chỉ cần thêm thư mục phong cảnh hoặc file nhạc vào `public/assets/`, Vite Plugin Asset Scanner sẽ tự động nhận diện và cập nhật vào trang web mà không cần sửa code.

---

## ⌨️ Bảng Phím Tắt Tiện Dụng

| Phím tắt | Thao tác | Mô tả |
| :---: | :---: | :--- |
| **`Space`** | **Tạm dừng / Tiếp tục** | Dừng hoặc cho phong cảnh tiếp tục cuộn |
| **`M`** | **Master Mute** | Bật / Tắt toàn bộ âm thanh trên trang web tức thời |
| **`Z`** | **Zen Mode** | Ẩn / Hiện toàn bộ thanh điều khiển giao diện (HUD) |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Giao diện & Logic:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool & Bundler:** [Vite](https://vitejs.dev/) (Tích hợp Custom Asset Scanner Plugin)
* **Xử lý Âm thanh:** [Howler.js](https://howlerjs.com/) & Web Audio API (Master Gain DSP node)
* **Đồ họa & Hiệu ứng:** CSS Transform Parallax GPU-accelerated + Canvas 2D Particle Engine
* **Kiểu dáng & Thẩm mỹ:** Modern Pixel-Art Glassmorphism, Google Fonts (`Outfit`, `Press Start 2P`)
* **Triển khai:** 100% Client-side Static SPA (Deploy miễn phí trên Vercel / GitHub Pages / Netlify)

---

## 📂 Cấu Trúc Dự Án (Directory Structure)

```text
train-to-neverland/
├── framework/                 # 📘 Thư viện chuẩn hóa Prompt AI & Hướng dẫn kỹ thuật
│   ├── README.md              # Giới thiệu framework & quy trình 4 bước tạo theme
│   ├── PROMPT_TEMPLATES.md    # Bộ Prompt mẫu Midjourney/DALL-E cho cảnh & tàu
│   ├── SLOW_RAIL_FRAMEWORK.md # Đặc tả hệ trục tọa độ 8 lớp Z-index, kích thước logic
│   └── PIXEL_ART_ASSET_STANDARD.md # Quy chuẩn kỹ thuật xử lý ảnh & mask đèn đêm
├── public/assets/             # 🎨 Thư viện tài nguyên đa phương tiện
│   ├── landscapes/            # Các gói phong cảnh (background.png, midground, lights)
│   ├── trains/                # 10 chủ đề đoàn tàu + meta.json quản lý tập trung
│   ├── sky/                   # Mặt trời, mặt trăng, mây trời và vật thể bay
│   ├── weather/               # Hạt mưa, tuyết, hoa anh đào
│   └── music/                 # Danh sách nhạc Lo-fi MP3 và cấu hình
├── scripts/                   # ⚙️ Bộ công cụ Node.js quét tài nguyên & xử lý ảnh
│   ├── scan_assets.js         # Tự động quét và sinh auto_landscapes, auto_music, auto_trains
│   ├── process_train_theme.js # Chuẩn hóa và đóng gói chủ đề đoàn tàu
│   └── slice_and_organize_sky.js # Bóc tách sprite sheet bầu trời
├── src/
│   ├── components/            # Giao diện HUD (Mixer, ScenePicker, TrainPicker, Pomodoro)
│   ├── config/                # Cấu hình tập trung (names.json)
│   ├── engines/               # AudioManager (DSP Master Mute), WeatherEngine, Parallax
│   ├── types/                 # TypeScript interfaces chuẩn hóa
│   └── App.tsx                # Ứng dụng chính kết nối khung nhìn và phím tắt
└── vite.config.ts             # Cấu hình Vite & plugin tự động theo dõi asset
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Cục Bộ

### Yêu cầu tiên quyết
- [Node.js](https://nodejs.org/) phiên bản 18 trở lên
- Trình quản lý gói `npm` (đi kèm Node.js)

### Các bước cài đặt:

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/ludeptrai/train-to-neverland.git
   cd train-to-neverland
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Development Server):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập `http://localhost:5173` để bắt đầu chuyến hành trình.

4. **Đóng gói phiên bản Production:**
   ```bash
   npm run build
   ```
   Thư mục `dist/` xuất ra sẵn sàng để đưa lên bất kỳ dịch vụ lưu trữ web tĩnh nào.

---

## 📚 Tài Liệu Hướng Dẫn Mở Rộng

Nếu bạn muốn tạo thêm các phong cảnh mới bằng AI hoặc thêm đoàn tàu mới vào trang web:
- Xem hướng dẫn chi tiết tại [**Thư Viện Framework & Prompt Mẫu (framework/README.md)**](file:///d:/JOB/train-to-neverland/framework/README.md).
- Tham khảo các mẫu câu lệnh AI tại [**Bộ Prompt Chuẩn Hóa (framework/PROMPT_TEMPLATES.md)**](file:///d:/JOB/train-to-neverland/framework/PROMPT_TEMPLATES.md).
- Tra cứu chỉ số đồ họa tại [**Bảng Tra Cứu Kỹ Thuật (framework/QUICK_REFERENCE.md)**](file:///d:/JOB/train-to-neverland/framework/QUICK_REFERENCE.md).

---

## 📄 Bản Quyền & Giấy Phép

Dự án được phân phối dưới giấy phép **MIT License**. Bạn có thể tự do học tập, tùy chỉnh và phát triển thêm các chủ đề mới cho chuyến tàu của riêng mình. Chúc bạn có những phút giây làm việc thật hiệu quả và thư thái cùng **Chuyến Tàu Không Vội**! 🚂✨
