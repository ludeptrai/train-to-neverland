# 📐 BỘ TIÊU CHUẨN THIẾT KẾ & THAM SỐ ASSET PIXEL ART
## Dành cho dự án: Chuyến Tàu Không Vội (Train to the Neverland)

Tài liệu này cung cấp đầy đủ các thông số kích thước, tỷ lệ, vị trí tiếp xúc và quy chuẩn kỹ thuật để bạn hoặc bất kỳ họa sĩ / công cụ AI nào (Midjourney, DALL-E, Aseprite) có thể tạo ra các phong cảnh và đoàn tàu mới tương thích 100% với hệ thống.

---

## 1. HỆ TỌA ĐỘ VÀ TỶ LỆ KHUNG NHÌN CHUẨN (Viewport Standard)

- **Tỷ lệ điện ảnh cố định (Fixed Aspect Ratio):** **`21:9`** (Ultrawide Cinema).
- **Độ phân giải ảo chuẩn (Virtual Canvas Resolution):** **`1680 x 720 px`**.
- **Cơ chế Responsive:** Hệ thống tự động tính toán `scale = Math.min(windowWidth / 1680, windowHeight / 720)` và áp dụng `transform: scale(scale)` căn giữa màn hình.
  - Trên màn hình 4K: Tự động phóng to 2.28x sắc nét.
  - Trên màn hình Full HD (1080p): Tự động scale 1.14x vừa khít.
  - Trên laptop 1366x768: Tự động scale 0.81x với hai dải đen cinema trên dưới.
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
> **YÊU CẦU BẮT BUỘC: BẦU TRỜI PHẢI TRONG SUỐT (100% Transparent Alpha)**
> - Bức tranh chỉ vẽ các công trình, đồi núi, tháp, cây cầu, skyline thành phố...
> - Toàn bộ vùng phía trên đỉnh núi và nóc các tòa nhà **bắt buộc phải là nền trong suốt (PNG)** để màu bầu trời CSS và các ngôi sao ban đêm có thể hiển thị tự nhiên phía sau!

### Thông số kỹ thuật:
- **Tên file:** `background.png`
- **Kích thước khuyến nghị:**
  - **Chiều rộng (Width):** `1920 px` (độ dài lý tưởng để cuộn chậm vô tận không tạo cảm giác lặp quá nhanh).
  - **Chiều cao (Height):** `560 px` đến `650 px` (ở tỷ lệ 1680x720).
- **Quy tắc lặp (Seamless Loop):** Mép ngoài cùng bên trái (`x = 0`) và mép ngoài cùng bên phải (`x = 1920`) nên có độ cao đường chân trời hoặc đỉnh đồi nối tiếp mượt mà.
- **File đèn đêm (Emissive Mask):** `background_lights.png` (cùng kích thước với `background.png`, nền 100% trong suốt, chỉ vẽ các chấm vàng/xanh của bóng đèn cửa sổ các tòa nhà).

### Prompt mẫu tạo Hậu cảnh bằng AI (Midjourney / DALL-E):
> *"16-bit retro pixel art horizontal panoramic skyline of [Tên địa danh: Paris Eiffel Tower / Swiss Alps / Singapore Marina]. Crisp pixels, side-scroller game background asset. Only mountains and city buildings, ISOLATED ON PURE SOLID WHITE BACKGROUND (or transparent), NO SKY, flat horizon line at the bottom, warm ambient aesthetic, authentic pixel art style."*

---

## 4. QUY CHUẨN LAYER 3: MẶT ĐẤT & ĐƯỜNG RAY (Midground Track)

### Thông số kỹ thuật:
- **Tên file:** `midground_track.png` (hoặc `.svg`)
- **Kích thước chuẩn:**
  - **Chiều rộng (Width):** `1200 px` (hai mép trái - phải **bắt buộc nối khớp mí 100%** để cuộn vô tận liên tục).
  - **Chiều cao (Height):** `240 px`.
- **TỌA ĐỘ TIẾP XÚC ĐƯỜNG RAY (CỰC KỲ QUAN TRỌNG):**
  - Mặt trên của thanh ray thép **phải nằm cách đáy ảnh đúng `40 px`** (tương ứng `y = 200 px` tính từ đỉnh ảnh).
  - Quy chuẩn này đảm bảo bất kỳ con tàu nào trong hệ thống khi đặt lên ray cũng sẽ tiếp xúc bánh xe hoàn hảo, không bị bay lơ lửng hay chìm vào đá dăm!
- **Nội dung vẽ:** Lớp đá dăm ba-lát xám, tà-vẹt gỗ, ray thép đôi, rào chắn ven đường, hàng cây nhỏ hoặc cột điện.

---

## 5. QUY CHUẨN LAYER 4: TEMPLATE ĐOÀN TÀU (Train Theme)

### Thông số kỹ thuật:
- **Tên file:** `train_body.png`
- **Nền ảnh:** 100% Trong suốt (Transparent PNG).
- **Góc nhìn:** Chiều ngang nhìn nghiêng 2D (Side elevation view), đầu tàu hướng về phía bên phải màn hình (hướng tàu chạy).
- **Chiều cao tiêu chuẩn:**
  - Native pixel resolution: **`36 px`** (chiều cao thân tàu).
  - Phóng to 3x chuẩn hóa trong web: **`108 px`** đến **`112 px`**.
- **Chiều dài (Width):** Thường từ **`900 px` đến `1800 px`** (tùy tàu 3 toa, 4 toa hay 6 toa).
- **Quy tắc bánh xe (Wheel Grounding):** Đáy các bánh xe phải chạm sát mép dưới cùng của ảnh PNG (cách viền đáy 1 - 2 px).
- **File đèn đêm (Emissive Mask):** `train_lights.png` (cùng kích thước với `train_body.png`, nền trong suốt, chỉ chứa các ô kính cửa sổ toa tàu màu vàng hoặc cyan phát sáng).

### Prompt mẫu tạo Đoàn Tàu bằng AI:
> *"2D side elevation view of a retro 16-bit pixel art [Loại tàu: steam locomotive / bullet train / futuristic tram]. Side scroller game sprite, crisp clean pixels, sharp outlines, isolated on pure white background, wheels aligned at the bottom edge, passenger windows, authentic video game asset."*

---

## 6. DANH MỤC THƯ MỤC LƯU TRỮ CHUẨN

Khi bạn chuẩn bị xong một bộ ảnh mới, chỉ cần thả vào thư mục tương ứng theo cấu trúc:

```
public/assets/
├── landscapes/
│   └── [id_phong_canh]/
│       ├── background.png           # (Bắt buộc) Hậu cảnh núi/thành phố, bầu trời trong suốt
│       ├── background_lights.png    # (Tùy chọn) Đèn thành phố ban đêm
│       ├── midground_track.png      # (Bắt buộc) Mặt đất & ray tàu khớp mí 1200x240px
│       └── midground_lights.png     # (Tùy chọn) Đèn đường ven ray
└── trains/
    └── templates/
        └── [id_doan_tau]/
            ├── train_body.png       # (Bắt buộc) Thân tàu nền trong suốt (cao ~108px)
            └── train_lights.png     # (Bắt buộc) Lớp đèn cửa sổ phát sáng ban đêm
```

Sau đó chỉ cần thêm 1 dòng cấu hình vào file [scenes.ts](file:///f:/TrainToThe%20Neverland/src/config/scenes.ts) hoặc [trains.ts](file:///f:/TrainToThe%20Neverland/src/config/trains.ts), giao diện website sẽ tự động cập nhật ngay lập tức!
