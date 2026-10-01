# ⚡ BẢNG TRA CỨU NHANH THÔNG SỐ (1-PAGE CHEAT SHEET)
> **Dành cho thiết kế đồ họa, viết Prompt AI & Code hệ thống Parallax.**

---

## 📐 1. Tỉ lệ & Kích thước Bắt buộc (Hard Rules)

| Thông số | Giá trị chuẩn | Ghi chú & Giới hạn |
| :--- | :--- | :--- |
| **Stage Aspect Ratio** | **`21 : 9`** (`2.33 : 1`) | Cố định Cinema Letterbox, tự căn giữa màn hình |
| **Logic Canvas Resolution** | **`960 x 440 px`** | Chuẩn atlas gốc của Slow Rail |
| **High-DPI Virtual Stage** | **`1680 x 720 px`** | Chuẩn hiển thị cho desktop 1080p/2K/4K |
| **Pixel Rendering** | `pixelated / crisp-edges` | Tuyệt đối không bật khử răng cưa (anti-aliasing) |
| **Độ dài đoàn tàu (Train Length)** | **`52.8%` chiều rộng khung** | Giới hạn: `50% - 53%` (tuyệt đối không quá 55%) |
| **Khoảng hở hai bên tàu** | **`Lề trái ≥ 24%` \| `Lề phải ≥ 24%`** | Đảm bảo ngắm cảnh và tàu không bao giờ chạm viền |
| **Chiều cao đoàn tàu (Train Height)** | **`14.3%` chiều cao khung** | Thân toa: `51px`, Bánh xe: `12px` (tổng `63px` trên canvas 440px) |
| **Độ nhún đoàn tàu (Bounce)** | **`±0.6 px`** | `Math.sin(time * 0.008) * 0.6` (êm ái, không giật) |
| **Tỉ lệ lát cắt Hậu cảnh (Slice)** | **`3.34 : 1`** | Chuẩn gốc: `725 x 217 px`, High-DPI: `1920 x 600 px` |
| **Chiều cao hiển thị Hậu cảnh** | **`85.9%` canvas** (`y: 0 → 378px`) | 14.1% đáy (`y: 378 → 440px`) dành cho ray và ballast |

---

## 🥞 2. Hệ trục Z-Index & Vận tốc Parallax

| Layer | Tên lớp | Z-Index | Vận tốc tương đối | Nội dung & Kỹ thuật |
| :---: | :--- | :---: | :---: | :--- |
| **L8** | HUD & Controls | `50` | Cố định (`0`) | Header, Zen mode, Pomodoro, Lo-fi DSP Mixer |
| **L7** | Tunnel Transition | `40` | Phủ đen | Hầm tàu `#0c0d14`, 3 đèn trần neon, badge tên ga mới |
| **L6** | Weather Particles | `30` | `100 - 300 px/s` | Canvas 2D: Mưa nghiêng 1x13px, tuyết bay, hoa anh đào |
| **L5** | Foreground Poles | `22` | **`1.35x`** (`135 px/s`) | Cột điện tiền cảnh & 2 dây điện cao thế lướt nhanh |
| **L4** | Train Theme | `15` | Cố định + Nhún | Đoàn tàu 3 toa + mặt nạ đèn đêm phát sáng + đèn pha |
| **L3** | Midground Track | `10` | **`1.00x`** (`100 px/s`) | Đường ray thép, tà-vẹt gỗ, đá dăm ballast (loop liền) |
| **L2** | Landmark Background | `2` | **`0.08x - 0.12x`** (`8-12 px/s`) | Skyline danh lam, lặp vô tận bằng lật gương `scaleX(-1)` |
| **L1** | Procedural Sky | `1` | Cố định (`0`) | CSS Gradient 4 thời điểm + 50 hạt sao đêm nhấp nháy |

---

## 🎨 3. Bảng màu Bầu trời & Hòa trộn Ánh sáng (Shaders)

```typescript
// 1. Ban ngày (Daytime)
Sky:   linear-gradient(180deg, #78a2b8 0%, #b8d5e5 100%)
Blend: Screen '#608ea34f' | Cửa sổ: #acced0 (Gương xanh sáng)

// 2. Hoàng hôn (Sunset)
Sky:   linear-gradient(180deg, #d36b5c 0%, #f0a378 50%, #f7d4a4 100%)
Blend: Normal / Warm Amber overlay | Cửa sổ: #eec58c (Hổ phách ấm)

// 3. Ban đêm (Night)
Sky:   linear-gradient(180deg, #0b0d1a 0%, #171b30 60%, #252b48 100%)
Blend: Multiply '#6d80ab' + Dark Tint rgba(18,25,58,0.15) | Cửa sổ: #ffe29e (Glow 8px)

// 4. Bình minh (Dawn)
Sky:   linear-gradient(180deg, #443e5c 0%, #91687d 50%, #dca28d 100%)
Blend: Soft Light '#dca28d33' | Cửa sổ: #dfc5a0 (Hồng đào nhạt)
```

---

## 🪄 4. Cú pháp Prompt Tóm tắt (Midjourney v6 / DALL-E)

> 💡 **Quy tắc viền ảnh & Mép đáy (Border & Bottom Rules)**:
> 1. **Phần trên (Bầu trời)**: Nền trắng tinh khiết `#FFFFFF` để thuật toán bóc tách bầu trời sang trong suốt.
> 2. **Phần dưới (Đáy ảnh)**: **Bắt buộc lấp đầy đất / nước / đường phố** (solid ground, calm water, grass) tràn kín sát mép đáy ảnh. Tuyệt đối **không để trống (white/blank) hoặc để công trình lơ lửng**!
> 3. **Viền ảnh**: Hạn chế bóng đổ (no drop shadow) và hào quang/phát sáng viền (no edge glow/bloom).

### Prompt Phong cảnh Panorama (`--ar 3:1`):
```text
Pixel art horizontal seamless panorama landscape of [ĐỊA DANH], 16-bit retro aesthetic, Studio Ghibli nostalgic vibe, side scrolling 2D view, flat side perspective, upper sky on pure solid white background, lower 30% of canvas is completely filled with solid terrain/ground/water (calm water, grass, pavement, low rooftops) extending all the way down to the bottom canvas edge, clear horizon line at bottom 75%, warm golden hour tones, crisp clean pixel lines, hard silhouette edges, no drop shadow, zero ambient glow, limited palette of 32 colors, ultra wide panoramic ratio 3:1, horizontal repeating texture, no trains, no tracks, no ground obstruction, no blank white space at bottom, no floating buildings --ar 3:1 --style raw --v 6.0
```

### Prompt Trung cảnh & Đường ray (`--ar 5:1`):
```text
Pixel art horizontal seamless side-scrolling tile of [LOẠI RAY: modern urban elevated concrete railway / rustic countryside track with wildflowers / coastal seawall track], 16-bit retro arcade aesthetic, flat 2D side elevation profile, twin steel rails on gravel ballast, upper 65% is pure solid white background with NO sky, flat horizontal rail line aligned 40px from bottom edge, seamless repeating left and right borders, crisp pixel art, sharp hard borders, no drop shadow, no border glow, no trains, isolated sprite asset --ar 5:1 --style raw --v 6.0
```

### Prompt Đoàn tàu 4 Toa (`--ar 11:1`):
```text
Pixel art side view of a 4-car modular train [LOẠI TÀU: Shinkansen / Steam locomotive / City metro], 16-bit arcade video game sprite, perfectly horizontal side-scrolling profile, consisting of 1 front locomotive engine facing right, 2 middle passenger coaches, and 1 matching rear cab, connected by articulated gangways, flat wheels on invisible ground line, glowing yellow passenger windows, pure solid pitch black background #000000, uniform sprite height, sharp hard borders, no drop shadow under wheels, zero ground shadow bleed --ar 11:1 --style raw --v 6.0
```

### Negative Prompt (Loại trừ toàn diện):
```text
--no 3d render, photorealistic, blurry, antialiased, gradients, isometric perspective, front view, train tracks, railroad ties, power lines, ground clutter, text, watermark, signature, drop shadow, cast shadow, ambient occlusion, border glow, outer glow, bloom, rim lighting, atmospheric haze, edge bleed, vignette, white space at bottom, blank bottom void, floating buildings, floating mountains, floating islands, cutoff ground, empty bottom margin
```
