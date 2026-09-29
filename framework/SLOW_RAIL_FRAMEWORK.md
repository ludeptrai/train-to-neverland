# 🚂 Slow Rail Asset Framework & Pixel Art Standard Specification
> **Chuẩn hóa kiến trúc đồ họa, tỉ lệ vật thể, độ phân giải và thông số kỹ thuật cho Web App "Chuyến Tàu Không Vội (Train to the Neverland)" dựa trên phân tích từ [Slow Rail (panoramascenery.live)](https://panoramascenery.live/).**

---

## 📐 1. Tổng quan kiến trúc & Hệ trục tọa độ (Viewport & Canvas Dimensions)

### 1.1. Kích thước Logic & Tỉ lệ khung hình (Stage Aspect Ratio)
* **Khung hiển thị chính (Cinema Letterbox)**: Cố định tỉ lệ điện ảnh **`21 : 9`** (`aspect-ratio: 21 / 9 ≈ 2.33 : 1`) hoặc chuẩn Slow Rail (`aspect-ratio: 2.65 : 1`).
* **Độ phân giải Logic Canvas**:
  - Chuẩn gốc Slow Rail: **`960 x 440 px`** (`2.18 : 1`).
  - Chuẩn High-DPI Desktop: **`1920 x 822 px`** (Full HD 21:9) hoặc **`1680 x 720 px`**.
* **Nguyên tắc hiển thị Pixel Art**:
  ```css
  canvas, img {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
  ```
  Tuyệt đối không dùng khử răng cưa mờ (anti-aliasing) trên các layer pixel art để đảm bảo cạnh pixel vuông vức sắc nét.

---

## 🥞 2. Phân lớp đồ họa & Thứ tự Z-Index (Layer Hierarchy)

Hệ thống được tổ chức thành 8 tầng sâu tạo hiệu ứng 3D Parallax chân thực:

```
[Layer 8 - HUD & Controls]           zIndex: 50  (Header, Pomodoro, Audio Mixer, Zen toggle)
[Layer 7 - Tunnel Station Transition] zIndex: 40  (Hầm tối #0c0d14, đèn neon trần, bảng ga)
[Layer 6 - Weather Particles]         zIndex: 30  (Canvas hạt mưa 1x13px, hoa anh đào, tuyết)
[Layer 5 - Foreground Utility Poles]  zIndex: 22  (Cột điện tiền cảnh, dây điện cao thế lướt nhanh)
[Layer 4 - Train Theme]               zIndex: 15  (Đoàn tàu 3 toa, đèn cửa sổ, đèn pha, khói)
[Layer 3 - Midground Track & Rails]   zIndex: 10  (Đường ray thép, tà vẹt, ballast, cây cỏ ven ray)
[Layer 2 - Landmark Background]       zIndex: 2   (Toàn cảnh thành phố/núi non panorama lặp vô tận)
[Layer 1 - Procedural Sky & Stars]    zIndex: 1   (CSS Gradient bầu trời + 50 sao đêm lấp lánh)
```

---

## 🏙️ 3. Thông số chuẩn Background Panorama (Landmark Background)

### 3.1. Kích thước & Tỉ lệ lát cắt (Slice Ratio)
* **Kích thước ảnh gốc trong kho Slow Rail (`anh-1.png` → `anh-8.png`)**:
  - Chiều rộng: **`724 - 728 px`** (xấp xỉ `725px`).
  - Chiều cao mỗi lát cắt: **`217 px`** (1 atlas chứa 10 lát cắt = tổng chiều cao `2170px`).
  - Tỉ lệ lát cắt gốc: **`725 : 217 ≈ 3.34 : 1`**.
* **Kích thước hiển thị trên Canvas (`dw x dh`)**:
  - Chiếm từ đỉnh màn hình (`y = 0`) đến mặt đường ray (`y = 378px` trên canvas 440px).
  - Tỉ lệ hiển thị: **`960 x 378 px`** (**chiếm đúng 85.9% chiều cao canvas**).
  - Tỉ lệ khung cảnh: **`2.54 : 1`**.
  - 14.1% chiều cao còn lại ở dưới đáy (`y = 378 → 440px`) dành riêng cho đường ray thép và ballast.

### 3.2. Kỹ thuật Ghép Nền Lật Gương (Reversible Horizontal Mirroring)
Để bất kỳ ảnh phong cảnh nào cũng nối liền vô tận 100% không để lại gờ cắt:
```javascript
// Tile 0: Bình thường (x = 0 → 960)
// Tile 1: Lật ngược gương ngang scale(-1, 1) (x = 960 → 1920)
// Mép phải Tile 0 (x = 960) tiếp xúc hoàn hảo với mép phải Tile 1 (vì Tile 1 bị lật gương)
if (k % 2 === 1) {
  ctx.translate(960, 0);
  ctx.scale(-1, 1);
}
```

### 3.3. Tốc độ cuộn Parallax
* Tốc độ nền chậm (Far Background): **`8 - 12 px/s`** (tạo cảm giác núi đồi, thành phố ở rất xa).
* Tốc độ ray trung cảnh (Midground): **`100 px/s`** (tương đương vận tốc tàu 80-100 km/h).

---

## 🚆 4. Thông số chuẩn Đoàn tàu (Train Standard Ratio)

### 4.1. Kích thước & Tỉ lệ Chiếm chỗ (Occupancy Ratio)
* **Chiều dài con tàu**:
  - Luôn nằm trong khoảng **`50% - 53%` chiều rộng khung hình** (tối đa không bao giờ vượt quá 55%).
  - Trên canvas 960px: Tàu dài đúng **`507px`** (**52.8%**).
  - Lề an toàn trái: **`21% - 24%`** (khoảng trống ngắm cảnh bên trái).
  - Lề an toàn phải: **`24% - 26%`** (khoảng trống đón cảnh vật phía trước).
* **Chiều cao con tàu**:
  - Chiếm **`14.0% - 14.5%` chiều cao khung hình**.
  - Trên canvas 440px: Thân toa cao **`51px`**, bánh xe cao **`12px`** (tổng **`63px`**).
  - Trên màn hình responsive CSS: `height: clamp(36px, 11vh, 58px)`.

### 4.2. Cấu trúc Đoàn tàu Chuẩn 3 Toa (3-Car Modular Architecture)
```
[Đầu máy (Locomotive)]  +  [Toa khách giữa (Coach)]  +  [Đuôi tàu (Rear Cab)]
     ~30 - 180px                ~160 - 400px                ~30 - 180px
```
* **Bánh xe & Piston**:
  - Đường kính bánh xe: `12 - 14px`.
  - Animation quay bánh xe: Điểm sáng piston dao động theo `Math.sin(animTime * 12) * 3px`.
* **Độ nảy thân tàu (Suspension Micro-Bounce)**:
  - Biên độ nảy: **`0.6px`** (`Math.sin(animTime * 6) * 0.6`). Cực kỳ êm ái, không gây rung lắc.
* **Cửa sổ toa tàu**:
  - Chiều cao cửa sổ: 12 - 17px.
  - Màu phản chiếu:
    - Ban ngày: Xanh gương sáng `#acced0`.
    - Hoàng hôn: Hổ phách `#eec58c`.
    - Ban đêm: Vàng ấm `#ffe29e` kèm glow tỏa sáng ra mặt ray.

---

## ⚡ 5. Thông số Tiền cảnh: Cột điện & Dây điện (Foreground Catenary Layer)

Tạo chiều sâu điện ảnh 3D nổi bật:
* **Dây điện cao thế**:
  - 2 đường dây chạy ngang nóc tàu tại `y = 22%` (dày 2px, `#282333`, alpha 0.65) và `y = 26%` (dày 1px, `#342e40`, alpha 0.45).
* **Cột điện pixel (Utility Poles)**:
  - Khoảng cách giữa các cột: **`520 - 580 px`**.
  - Chiều rộng thân cột: **`6 - 8 px`**. Chiều cao: **`40% - 45%` khung hình**.
  - Xà ngang 1: Rộng 68px, dày 5px, đỡ 2 bát sứ cách điện màu kem (`#e2d8c9`).
  - Xà ngang 2: Rộng 44px, dày 4px.
  - Vận tốc lướt qua: **`1.35x - 1.4x` vận tốc đường ray** (tạo cảm giác cột điện nằm sát mắt người xem).

---

## 🎨 6. Bảng màu & Ánh sáng 4 thời điểm trong ngày (Atmospheric Shaders)

| Thời điểm | CSS Background Gradient | Bộ lọc hòa trộn (Canvas Shader) | Màu cửa sổ tàu |
| :--- | :--- | :--- | :--- |
| **Ban ngày (Day)** | `linear-gradient(180deg, #78a2b8 0%, #b8d5e5 100%)` | Screen `#608ea34f` | `#acced0` |
| **Hoàng hôn (Sunset)** | `linear-gradient(180deg, #d36b5c 0%, #f0a378 50%, #f7d4a4 100%)` | Normal / Warm Amber overlay | `#eec58c` |
| **Ban đêm (Night)** | `linear-gradient(180deg, #0b0d1a 0%, #171b30 60%, #252b48 100%)` | Multiply `#6d80ab` + Dark Tint `rgba(18,25,58,0.15)` | `#ffe29e` (Glow 8px) |
| **Bình minh (Dawn)** | `linear-gradient(180deg, #443e5c 0%, #91687d 50%, #dca28d 100%)` | Soft Light `#dca28d33` | `#dfc5a0` |

---

## 🗂️ 7. Danh mục 110 danh lam thắng cảnh Slow Rail đã lưu sẵn tại máy

Toàn bộ 12 file spritesheet atlas gốc đã được tải về lưu trữ nguyên vẹn tại:
📁 **`f:\TrainToThe Neverland\public\assets\reference_slowrail\`**

* `anh-5.png` (10 danh lam Bắc Bộ): **Sa Pa, Hà Giang, Cao Bằng, Hạ Long, Ninh Bình, Hải Phòng, Mai Châu, Phong Nha, Huế, Đà Nẵng**.
* `anh-6.png` (10 danh lam Nam Trung Bộ & Nam Bộ): **Hội An, Quy Nhơn, Phú Yên, Nha Trang, Đà Lạt, Mũi Né, Vũng Tàu, Cần Thơ, Rừng tràm Trà Sư, Phú Quốc**.
* `anh-7.png` (10 danh lam Nhật Bản): **Kanazawa, Nara, Miyajima, Himeji, Shirakawa-go, Sapporo, Hakodate, Yokohama, Okinawa, Beppu**.
* `anh-8.png` (10 danh lam Trung Quốc): **Bắc Kinh, Tây An, Thành Đô, Trùng Khánh, Quế Lâm, Trương Gia Giới, Hoàng Sơn, Hàng Châu, Tô Châu, Đôn Hoàng**.
* `anh-1.png` → `anh-4.png`: **Châu Âu, Châu Mỹ, Nam Cực, Dải Ngân Hà, Kim Tự Tháp,...**
* `landscapes.png` & `cities-1.png` → `cities-3.png`: **Tokyo, New York, Paris, Rome, London, Sydney,...**

---
*Tài liệu này là tiêu chuẩn kỹ thuật thống nhất để mở rộng vô hạn các ga tàu và phong cảnh mới trong tương lai.*
