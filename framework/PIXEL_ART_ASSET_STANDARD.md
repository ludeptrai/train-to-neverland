# 📐 BỘ TIÊU CHUẨN THIẾT KẾ & THAM SỐ ASSET PIXEL ART
## Dành cho dự án: Chuyến Tàu Không Vội (Train to the Neverland)

Tài liệu này cung cấp đầy đủ các thông số kích thước, tỷ lệ, vị trí tiếp xúc và quy chuẩn kỹ thuật để bạn hoặc bất kỳ họa sĩ / công cụ AI nào (Midjourney, DALL-E, Aseprite) có thể tạo ra các phong cảnh và đoàn tàu mới tương thích 100% với hệ thống.

---

## 1. HỆ TỌA ĐỘ VÀ TỶ LỆ KHUNG NHÌN CHUẨN (Viewport Standard)

- **Tỷ lệ điện ảnh cố định (Fixed Aspect Ratio):** **`21:9`** (Ultrawide Cinema).
- **Độ phân giải ảo chuẩn (Virtual Canvas Resolution):** **`960 x 440 px`** (Logic Canvas gốc) hoặc **`1680 x 720 px`** (High-DPI Virtual Stage).
- **Cơ chế Responsive:** Hệ thống tự động tính toán scale và áp dụng tỉ lệ `aspect-ratio: 21 / 9` căn giữa màn hình với dải đen cinema letterbox.
  - Trên màn hình 4K: Tự động phóng to sắc nét nhờ `image-rendering: pixelated`.
  - Trên màn hình Full HD (1080p): Tự động hiển thị vừa vặn.
  - Trên laptop 1366x768: Tự động co dãn với hai dải đen cinema trên dưới.
  - Trên điện thoại/tablet: Tự động thu nhỏ vừa chiều rộng, đoàn tàu và đường ray **không bao giờ bị xê dịch hay văng ra ngoài màn hình**!

---

## 2. QUY CHUẨN LAYER 1: BẦU TRỜI (Sky Layer)
- **Định dạng:** Mã màu CSS Gradient khai báo trong `src/config/scenes.ts` (KHÔNG DÙNG FILE ẢNH).
- **Mã màu mẫu:**
  ```typescript
  skyPresets: {
    dawn:   ['#6a4c93', '#b5838d', '#ffb4a2'], // Bình minh tím hồng
    day:    ['#90caf9', '#bbdefb', '#fff3e0'], // Ban ngày trong vắt
    sunset: ['#53354a', '#e84545', '#fecea8'], // Hoàng hôn cam cháy
    night:  ['#050b14', '#0d1b2a', '#1b263b'], // Đêm trăng huyền bí
  }
  ```

---

## 3. QUY CHUẨN LAYER 2: HẬU CẢNH DANH LAM (Landmark Background)

> [!IMPORTANT]
> **YÊU CẦU BẮT BUỘC: BẦU TRỜI TRONG SUỐT (PHÍA TRÊN) & ĐÁY ẢNH PHẢI LẤP ĐẦY ĐẤT / NƯỚC (PHÍA DƯỚI)**
> - **Phía trên (Bầu trời)**: Bắt buộc là nền trong suốt (PNG) hoặc nền trắng `#FFFFFF` (khi vẽ AI để tách nền) để bầu trời CSS và các ngôi sao ban đêm hiển thị tự nhiên.
> - **Phía dưới (Chân trời & Đáy ảnh - 25% - 35% khung hình)**: **BẮT BUỘC FILL KÍN ĐẤT / NƯỚC**. Tuyệt đối không để trống hoặc để nền trắng ở đáy! Phải vẽ phủ kín bằng mặt đất, mặt cỏ, thung lũng, mặt biển, mặt sông hồ hoặc mái nhà thấp tầng kéo dài chạm sát mép đáy ảnh để tạo chiều sâu vững chãi và tránh bị hở khoảng trống dưới đường ray.

### Thông số kỹ thuật:
- **Tên file:** `background.png`
- **Kích thước khuyến nghị:**
  - **Chiều rộng (Width):** `725 px` (chuẩn atlas Slow Rail) hoặc `1920 px` (High-DPI panorama).
  - **Chiều cao (Height):** `217 px` (chuẩn atlas Slow Rail) hoặc `560 - 650 px` (ở tỷ lệ 1680x720).
  - **Tỉ lệ lát cắt (Slice Ratio):** `3.34 : 1`.
- **Quy tắc lặp (Seamless Loop):** Sử dụng cơ chế lật gương ngang `scaleX(-1)` trên Panel 2, cho phép bất kỳ ảnh phong cảnh nào cũng nối liền vô tận 100% không để lại gờ cắt.
- **File đèn đêm (Emissive Mask):** `background_lights.png` (cùng kích thước với `background.png`, nền 100% trong suốt, chỉ vẽ các chấm vàng/xanh của bóng đèn cửa sổ các tòa nhà).

### Prompt mẫu tạo Hậu cảnh bằng AI (Midjourney / DALL-E / Flux):
> *"16-bit retro pixel art horizontal panoramic skyline of [Tên địa danh: Paris Eiffel Tower / Swiss Alps / Da Lat pine hills], clear bright neutral daylight lighting, natural original base colors, normal balanced exposure, clean daytime atmosphere. Crisp pixels, side-scroller game background asset. Only mountains and city buildings with lower 30% of canvas completely filled with solid terrain/ground/water (calm sea water, grassy hillside, pavement, low rooftops) extending all the way down to the bottom canvas edge, UPPER SKY ON PURE SOLID PITCH BLACK BACKGROUND #000000, empty black void sky, NO blank space at bottom, NO floating buildings, flat horizon line at the bottom 75%, hard crisp silhouette borders, no drop shadow, zero ambient glow, authentic pixel art style --ar 3:1 --style raw --v 6.0 --no night, nighttime, dark, twilight, sunset tint, gloomy, underexposed, white background, floating islands"*

---

## 4. QUY CHUẨN LAYER 3: MẶT ĐẤT & ĐƯỜNG RAY (Midground Track)

### Thông số kỹ thuật:
- **Tên file:** `midground_track.png` (hoặc `.svg`)
- **Kích thước chuẩn:**
  - **Chiều rộng (Width):** `1200 px` - `1920 px` (hai mép trái - phải **bắt buộc nối khớp mí 100%** để cuộn vô tận liên tục).
  - **Chiều cao (Height):** `240 px`.
- **TỌA ĐỘ TIẾP XÚC ĐƯỜNG RAY (CỰC KỲ QUAN TRỌNG):**
  - Mặt trên của thanh ray thép **phải nằm cách đáy ảnh đúng `40 px`** (tương ứng `y = 200 px` tính từ đỉnh ảnh).
  - Quy chuẩn này đảm bảo bất kỳ con tàu nào trong hệ thống khi đặt lên ray cũng sẽ tiếp xúc bánh xe hoàn hảo, không bị bay lơ lửng hay chìm vào đá dăm!
- **Nội dung vẽ:** Lớp đá dăm ba-lát xám, tà-vẹt gỗ/bê tông, ray thép đôi, rào chắn ven đường, hàng cây nhỏ hoặc bờ kè chắn sóng.
- **Ánh sáng & Màu sắc:** Chiếu sáng ban ngày tự nhiên, phơi sáng bình thường (`clear neutral daylight, normal exposure`).
- **Hạn chế bóng đổ & Hào quang viền:** Nền đen phía trên phải thuần khiết `#000000`, không có bóng đổ mờ hay vệt hào quang (no drop shadow, no edge glow/bloom) để thuật toán tự động tách nền đạt độ chính xác tuyệt đối.

### Prompt mẫu tạo Trung cảnh & Đường ray bằng AI (Midjourney / DALL-E):
> *"Pixel art horizontal seamless side-scrolling tile of a [loại ray: modern urban concrete viaduct / rustic countryside railway with wildflowers / coastal seawall embankment]. Clear neutral daylight lighting, natural concrete and steel colors, 16-bit retro arcade aesthetic, flat 2D side elevation profile, twin steel rails on gravel ballast, upper 65% IS PURE SOLID PITCH BLACK BACKGROUND #000000 with NO sky, NO scenery, horizontal rail line aligned 40px from bottom edge, perfectly seamless repeating left and right borders, sharp hard borders, no drop shadow, no border glow, crisp pixel art, no trains, isolated sprite asset --ar 5:1 --style raw --v 6.0 --no night, dark, white background, sky"*
>
> *(Xem thêm 4 Prompt mẫu chính thức và thư viện preset chi tiết tại [PROMPT_TEMPLATES.md](./PROMPT_TEMPLATES.md))*

---

## 5. QUY CHUẨN LAYER 4: TEMPLATE ĐOÀN TÀU (Train Theme)

### Thông số kỹ thuật:
- **Tên file:** `train_body_3car.png` (chuẩn 3 toa) hoặc `train_body.png`
- **Nền ảnh:** 100% Trong suốt (Transparent PNG).
- **Góc nhìn:** Chiều ngang nhìn nghiêng 2D (Side elevation view), đầu tàu hướng về phía bên phải màn hình (hướng tàu chạy).
- **Chiều dài & Tỉ lệ chiếm chỗ (Occupancy Ratio):**
  - Chiều dài đoàn tàu chiếm đúng **`50% - 53%` chiều rộng khung hình** (chuẩn vàng 52.8%).
  - Trên màn hình 960px: Tàu dài ~`507 px`.
  - Trên CSS responsive: Giới hạn `maxWidth: 52%`, căn giữa `left: 50%`, `transform: translateX(-50%)`, đảm bảo chừa đều 24% lề ngắm cảnh bên trái và phải.
- **Chiều cao tiêu chuẩn:**
  - Thân tàu cao: **`36 - 51 px`** (tương ứng `14.3%` chiều cao canvas).
  - Phóng to hiển thị responsive: `clamp(36px, 11vh, 58px)`.
- **Cấu trúc đoàn tàu:**
  - Chuẩn 3 toa: `[Đầu máy] + [Toa khách giữa] + [Đuôi tàu cabin]`.
  - Biên độ nhún giảm chấn (Suspension micro-bounce): `0.6 px` (`Math.sin(animTime * 6) * 0.6`).
- **Quy tắc bánh xe (Wheel Grounding):** Đáy các bánh xe phải chạm sát mép dưới cùng của ảnh PNG (cách viền đáy 1 - 2 px).
- **File đèn đêm (Emissive Mask):** `train_lights_3car.png` (cùng kích thước với `train_body_3car.png`, nền trong suốt, chỉ chứa các ô kính cửa sổ toa tàu màu vàng hoặc cyan phát sáng).

---

## 6. DANH MỤC THƯ MỤC LƯU TRỮ CHUẨN

Khi bạn chuẩn bị xong một bộ ảnh mới, chỉ cần thả vào thư mục tương ứng theo cấu trúc:

```
public/assets/
├── landscapes/
│   └── [id_phong_canh]/
│       ├── background.png           # (Bắt buộc) Hậu cảnh núi/thành phố, bầu trời trong suốt
│       ├── background_lights.png    # (Tùy chọn) Đèn thành phố ban đêm
│       ├── midground_track.png      # (Bắt buộc) Mặt đất & ray tàu khớp mí
│       └── midground_lights.png     # (Tùy chọn) Đèn đường ven ray
└── trains/
    └── templates/
        └── [id_doan_tau]/
            ├── train_body_3car.png  # (Bắt buộc) Thân tàu 3 toa nền trong suốt
            ├── train_lights_3car.png# (Bắt buộc) Lớp đèn cửa sổ phát sáng ban đêm
            └── train_preview.png    # (Tùy chọn) Ảnh thu nhỏ hiển thị trong menu HUD
```

> [!TIP]
> **TỰ ĐỘNG HÓA 100% (ZERO HARDCODE):**
> Bạn **KHÔNG CẦN sửa code** trong `scenes.ts` hay `trains.ts`! Hệ thống Vite Plugin & Asset Scanner sẽ tự động phát hiện thư mục mới, tạo ra option lựa chọn ga/tàu trên website ngay tức thì.
> Bạn có thể tùy chọn đặt thêm file `meta.json` trong thư mục để đặt tên tiếng Việt, tinh chỉnh tỷ lệ/vị trí đường ray và màu bầu trời tùy thích:
> ```json
> {
>   "name": "Biển Nha Trang",
>   "subtitle": "Bờ cát trắng & Tuyến đường sắt ven biển ngọc",
>   "location": "Khánh Hòa, Việt Nam",
>   "bgSpeed": 0.15,
>   "mgSpeed": 0.85,
>   "mgScaleRatio": 1.0,
>   "mgY": 0,
>   "skyPresets": {
>     "dawn": ["#ff9a9e", "#fecfef", "#a1c4fd"],
>     "day": ["#4facfe", "#00f2fe", "#e0f7fa"],
>     "sunset": ["#fa709a", "#fee140", "#f39c12"],
>     "night": ["#09203f", "#1b2a4a", "#2c3e50"]
>   }
> }
> ```
> * **`mgScaleRatio`** *(tùy chọn, mặc định `1.0`)*: Hệ số co dãn chiều cao của layer đường ray midground (ví dụ: `1.15` để tăng kích thước ray thêm 15%, hoặc `0.85` để thu nhỏ). Đoàn tàu sẽ tự động tính toán nâng/hạ để bánh xe luôn tiếp xúc chuẩn xác trên mặt ray thép.
> * **`mgY`** *(tùy chọn, mặc định `0`)*: Độ lệch trục dọc Y của đường ray midground (nhập số pixel như `10`, `-15`, hoặc chuỗi CSS như `"10px"`, `"-2%"`). Khi đường ray nâng lên hoặc hạ xuống, thân tàu cũng sẽ dịch chuyển tương ứng theo trục Y để giữ độ bám khớp hoàn hảo.

---

## 7. LỆNH TỰ ĐỘNG TÁCH NỀN BẰNG BFS FLOOD FILL (Edge-Seeded Flood Fill)

Hệ thống đã tích hợp sẵn thuật toán thông minh **BFS Flood Fill** tại [`scripts/process_landscape_theme.js`](file:///f:/TrainToThe%20Neverland/scripts/process_landscape_theme.js):
- **Cơ chế**: Bắt đầu lan truyền từ các cạnh ngoài cùng của ảnh (Top và viền trái/phải), chỉ xóa các pixel nền liên thông bên ngoài bầu trời.
- **Bảo vệ tuyệt đối**: Bất kỳ pixel màu trắng nào nằm bên trong công trình, cửa sổ, tường nhà, thuyền buồm, sóng biển đều **được giữ nguyên vẹn 100%**, không bao giờ bị cắt lủng lỗ.
- **Tự động sinh đèn đêm**: Trích xuất ngay `background_lights.png` với hiệu ứng glow vàng/hổ phách rực rỡ vào ban đêm.

### Cách sử dụng:
1. Thả ảnh JPG vừa tải từ Canva / Midjourney vào thư mục:  
   `public/assets/landscapes/[tên_thư_mục]/background.jpg`  
   `public/assets/landscapes/[tên_thư_mục]/midground.jpg`
2. Chạy lệnh:
   ```bash
   npm run process:landscape public/assets/landscapes/[tên_thư_mục]
   ```
   *(Hoặc gõ `npm run process:landscape` để tự động quét và xử lý tất cả các thư mục landscapes).*

