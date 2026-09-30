# 🪄 Thư Viện Prompt Mẫu Chuẩn Hóa (Prompt Engineering Templates)
> **Bộ sưu tập Prompt mẫu chuyên nghiệp dùng cho Midjourney v6, DALL-E 3, Stable Diffusion (XL), Flux hoặc ChatGPT để tạo sinh Phong cảnh Panorama và Đoàn tàu Pixel Art chuẩn theo hệ thống framework của Slow Rail & Chuyến Tàu Không Vội.**
> 
> ⚡ **CẬP NHẬT QUAN TRỌNG:** Tất cả prompt mẫu hiện nay đều sử dụng **NỀN ĐEN THUẦN KHIẾT (`pure solid pitch black background #000000`)** thay vì nền trắng, giúp tăng độ tương phản pixel, bảo vệ chi tiết màu sáng và tối ưu hóa việc bóc tách nền trong suốt tự động.

---

## 🌟 4 PROMPT MẪU CHÍNH THỨC CỦA HỆ THỐNG

---

### 👑 PROMPT MẪU 1: ChatGPT Meta-Prompt Cho Địa Điểm Mới
> **Mục đích:** Dán prompt này vào ChatGPT kèm tên địa điểm bạn muốn làm. ChatGPT sẽ tự động đóng vai Giám đốc Kỹ thuật Pixel Art và sinh ra **3 prompt tạo ảnh hoàn chỉnh** (Background Panorama, Midground Track và Cận cảnh/Ga).

```markdown
Bạn là Technical Pixel Art Director của dự án game 2D side-scrolling "Chuyến Tàu Không Vội" (Train to Neverland).
Tôi muốn tạo một ga tàu mới dựa trên địa danh: "[ĐIỀN TÊN ĐỊA DANH / QUỐC GIA Ở ĐÂY, ví dụ: Phố cổ Hội An, Vịnh Hạ Long, Đồi chè Sa Pa, Cố đô Kyoto, Tháp Eiffel Paris, New York Skyline]".

Hãy phân tích kiến trúc, cảnh quan và tông màu đặc trưng nhất của địa danh này, sau đó viết chính xác 3 Prompt tạo ảnh bằng tiếng Anh (dành cho Midjourney v6 / DALL-E 3 / Flux) tuân thủ 100% các tiêu chuẩn kỹ thuật bất di bất dịch sau:

---
### 1. PROMPT HẬU CẢNH PANORAMA (BACKGROUND):
- **Góc nhìn:** 2D Side-scrolling flat profile view (nhìn ngang phẳng 2D, không góc nghiêng, không phối cảnh tụ, không 3D).
- **Quy chuẩn bầu trời (CỰC KỲ QUAN TRỌNG):** Toàn bộ 65% - 70% phần trên canvas là BẦU TRỜI NỀN ĐEN THUẦN KHIẾT: `upper sky on pure solid pitch black background #000000, empty black void, no stars, no moon, no clouds, no atmospheric gradients`.
- **Quy chuẩn mép đáy (LẤP ĐẦY 100%):** 30% - 35% phần dưới canvas BẮT BUỘC LẤP ĐẦY HOÀN TOÀN bằng địa hình thực tế (mặt nước biển/sông hồ, mặt đường phố, thảm cỏ, thung lũng, mái nhà thấp tầng...) kéo dài chạm sát mép đáy tranh (`completely filled with solid terrain/ground/water extending all the way down to the bottom canvas edge, touching bottom border, flat horizon line at bottom 70-75%`). TUYỆT ĐỐI KHÔNG để khoảng trống màu đen ở đáy, KHÔNG có nhà hay đảo lơ lửng.
- **Nội dung:** Tái hiện đường chân trời (skyline), các công trình biểu tượng hoặc rặng núi trập trùng đặc trưng của địa danh.
- **Đèn đêm:** Có các ô cửa sổ nhỏ, đèn lồng hoặc đèn đường màu vàng ấm/hổ phách phát sáng nhẹ.
- **Quy cách:** `sharp hard silhouette borders, no drop shadow, zero ambient glow, no edge blur, 16-bit retro pixel art, limited 32 color palette, Studio Ghibli nostalgic aesthetic --ar 3:1 --style raw --v 6.0`.
- **Negative prompt:** `--no train, tracks, rails, sky, clouds, stars, moon, white background, blurry, 3d render, floating buildings, empty bottom margin`.

---
### 2. PROMPT TRUNG CẢNH ĐƯỜNG RAY TIẾP XÚC (MIDGROUND TRACK):
- **Góc nhìn:** 2D Side elevation profile view.
- **Quy chuẩn độ cao:** Nền đen 65% phía trên (`upper 65% is pure solid pitch black background #000000 with NO scenery, NO sky`). Mặt trên của ray thép đôi phẳng lì, cách mép đáy tranh đúng ~15-20% chiều cao (chuẩn tiếp xúc bánh xe).
- **Nội dung:** Lớp đá ba-lát, tà-vẹt và đường ray thép đôi phối hợp hài hòa với phong cách địa phương (ví dụ: ray kè đá ven biển, ray rải sỏi hoa dại nông thôn, cầu cạn bê tông đô thị, hoặc cầu sắt giàn không gian cổ điển).
- **Khớp mí:** Hai mép trái - phải nối khớp mí hoàn hảo để cuộn vô tận (`seamless repeating tile pattern on left and right borders`).
- **Quy cách:** `crisp pixel art, hard edges, no drop shadow, zero ambient blur, no trains, isolated asset --ar 5:1 --style raw --v 6.0`.
- **Negative prompt:** `--no train, locomotive, carriage, sky, mountains, buildings, white background, blurry`.

---
### 3. PROMPT BIỂN BÁO & CHI TIẾT CẬN CẢNH (FOREGROUND PROPS):
- **Nội dung:** 1 sprite chi tiết đặt cạnh đường ray mang nét văn hóa của địa danh (ví dụ: biển tên ga bằng gỗ/đồng cổ điển, cột đèn tín hiệu retro, cột điện dây cáp, hàng hoa dại bản địa).
- **Quy cách:** `2D side view, 16-bit pixel art sprite, isolated on pure solid pitch black background #000000, no shadow, crisp clean edges --ar 1:1 --style raw --v 6.0`.

Hãy xuất kết quả dưới dạng Markdown với từng khối Code block rõ ràng để tôi chỉ việc copy chạy ngay.
```

---

### 🎨 PROMPT MẪU 2: Direct Prompt Hậu Cảnh (Dùng Ngay Không Cần Qua ChatGPT)
> **Mục đích:** Chỉ cần thay thế đoạn trong ngoặc vuông `[...]` bằng tên địa danh và đặc trưng cảnh quan, sau đó copy dán thẳng vào Midjourney / DALL-E / Flux.

```text
Pixel art horizontal seamless panorama landscape of [TÊN ĐỊA DANH, ví dụ: Da Lat pine forest hills with French vintage villas / Ha Long Bay limestone karsts / Tokyo modern city skyline], 16-bit retro arcade aesthetic, Studio Ghibli nostalgic vibe, side scrolling 2D profile view, flat side perspective, upper sky on pure solid pitch black background #000000, empty black void sky with no clouds and no stars, lower 30% of canvas is completely filled with solid [loại nền đất/nước: calm emerald turquoise sea water / lush green pine slopes and grassy ground / dark asphalt street and low rooftops] extending all the way down to the bottom canvas edge, flat horizon line at bottom 75%, warm cozy glowing windows and lanterns in buildings, crisp clean pixel lines, hard silhouette edges against the black background, limited nostalgic palette of 32 colors, ultra wide panoramic ratio 3:1, horizontal repeating wallpaper texture, no trains, no tracks, no ground obstruction, no blank black space at bottom, no floating buildings --ar 3:1 --style raw --v 6.0 --no train, tracks, rails, sky, clouds, stars, moon, white background, drop shadow, ambient glow, edge blur, floating islands, cutoff ground
```

---

### 🚂 PROMPT MẪU 3: ChatGPT Meta-Prompt Cho Đoàn Tàu Mới
> **Mục đích:** Dán prompt này vào ChatGPT kèm phong cách tàu bạn muốn tạo. ChatGPT sẽ thiết kế thông số và viết Prompt đoàn tàu 3 toa hoàn hảo.

```markdown
Bạn là Senior Vehicle Pixel Artist cho tựa game 2D side-scrolling "Chuyến Tàu Không Vội".
Tôi muốn thiết kế một đoàn tàu 3 toa mới theo phong cách: "[ĐIỀN PHONG CÁCH TÀU Ở ĐÂY, ví dụ: Tàu hơi nước cổ điển Pháp 1900s / Tàu cao tốc Shinkansen đỏ siêu tốc / Tàu điện mặt đất bằng gỗ Đà Lạt / Tàu hàng container Diesel xanh lá / Tàu Cyberpunk Maglev tương lai]".

Hãy viết cho tôi 1 Prompt hoàn chỉnh bằng tiếng Anh (dành cho Midjourney v6 / DALL-E 3 / Flux) tuân thủ 100% các tiêu chuẩn kỹ thuật xe lửa của game:

1. **Cấu trúc 3 toa cân bằng (3-Car Articulated Train):**
   - Toa 1 (Đầu tàu/Cabin lái): Có mũi khí động học hoặc đầu máy hơi nước đặc trưng, đèn pha chính chiếu sáng phía trước.
   - Toa 2 (Toa giữa): Toa hành khách hoặc toa hàng với hàng cửa sổ kính có đèn vàng ấm bên trong (`warm lit glowing interior windows`).
   - Toa 3 (Toa đuôi): Toa hành khách có đuôi bo tròn hoặc buồng quan sát phía sau.
   - Đoàn tàu nối liền với nhau bằng khớp nối cơ khí (`articulated bellows / gangways`).

2. **Góc nhìn & Hướng di chuyển:**
   - 2D Flat side-scrolling profile view (nhìn ngang 100%, không góc chéo isometric, không 3D).
   - Đầu tàu hướng về phía bên phải màn hình (hướng di chuyển chuẩn).

3. **Quy chuẩn nền & Bánh xe (CỰC KỲ QUAN TRỌNG):**
   - **Nền ảnh:** NỀN ĐEN THUẦN KHIẾT: `isolated on pure solid pitch black background #000000, empty black background`.
   - **Tiếp xúc ray:** Tất cả các cặp bánh xe thép nằm trên một đường thẳng ngang vô hình (`wheels resting on an invisible horizontal ground line`).
   - **KHÔNG CÓ BÓNG ĐỔ:** `ABSOLUTELY NO drop shadow, zero cast shadow, no shadow under wheels, no ground plane` (để khi gắn vào thanh ray của game không bị bóng đen đè lên thanh ray).

4. **Kích thước & Tỉ lệ:**
   - Chiều cao thân tàu đồng đều, chiếm trọn chiều ngang khung hình theo tỉ lệ siêu rộng: `--ar 8:1` (hoặc `--ar 9:1`).

5. **Phong cách:**
   - `16-bit retro arcade pixel art, crisp hard pixel edges, clean silhouette against black, limited cohesive color palette`.
   - Negative prompt: `--no tracks, rails, ground, landscape, scenery, passengers outside, drop shadow under wheels, ground shadow, white background, blurry, 3d render, tilted wheels`.

Hãy xuất kết quả dưới dạng Markdown Code block để tôi sử dụng ngay.
```

---

### 🚄 PROMPT MẪU 4: Direct Prompt Cho Đoàn Tàu 3 Toa (Dùng Ngay Không Cần Qua ChatGPT)
> **Mục đích:** Chỉ cần thay thế đoạn trong ngoặc vuông `[...]` bằng loại tàu và màu sắc mong muốn, sau đó copy dán thẳng vào AI Generator.

```text
Pixel art side view of a modern balanced 3-car train, [MÔ TẢ LOẠI TÀU VÀ MÀU SẮC, ví dụ: classic 19th century vintage black steam locomotive with brass boiler bands and wooden passenger cars / aerodynamic crimson red bullet train with yellow racing stripes / retro mustard orange city tramway streetcar], consisting of 1 front locomotive engine facing right, 1 middle passenger carriage with glowing warm amber illuminated windows, and 1 matching rear carriage, side-scrolling 2D game vehicle sprite profile, perfectly level flat steel wheels resting on an invisible horizontal ground line, uniform sprite height, isolated on pure solid pitch black background #000000, hard crisp pixel borders, absolutely no drop shadow, zero shadow under wheels, no ambient occlusion, no tracks, no ground, no scenery, crisp authentic 16-bit arcade pixel art style --ar 8:1 --style raw --v 6.0 --no tracks, rails, ground plane, ballast, landscape, white background, drop shadow under wheels, ground shadow, cast shadow, blurry, 3d render, isometric, tilted perspective
```

---

## 📌 BỘ THƯ VIỆN PRESET ĐÃ CẬP NHẬT NỀN ĐEN (#000000)

### 1. Preset Hậu Cảnh Đô Thị & Skyline Hiện Đại
```text
Pixel art horizontal seamless panorama landscape of modern Tokyo city skyline with Tokyo Tower and distant Mount Fuji silhouette, 16-bit retro aesthetic, Studio Ghibli nostalgic vibe, side scrolling 2D view, flat side perspective, upper sky on pure solid pitch black background #000000, empty black void, lower 30% of canvas is completely filled with solid city ground, asphalt streets, pavement and low building rooftops extending all the way down to the bottom canvas edge, clear horizon line at bottom 75% of the frame, warm glowing office windows and amber streetlights, crisp clean pixel lines, hard silhouette edges against black, limited palette of 32 colors, ultra wide panoramic ratio 3:1, horizontal repeating wallpaper texture, no trains, no tracks, no ground obstruction, no blank space at bottom, no floating buildings --ar 3:1 --style raw --v 6.0 --no train, tracks, rails, white background, sky, clouds, stars, moon, drop shadow, ambient glow
```

### 2. Preset Hậu Cảnh Phố Cổ & Sông Nước
```text
Pixel art horizontal seamless panorama landscape of Hoi An ancient town Vietnam along the Hoai River, traditional yellow wooden shop-houses, glowing colorful lanterns reflecting on calm river water, small wooden sampan boats, weeping willow trees, romantic twilight atmosphere, side scrolling 2D profile view, upper sky on pure solid pitch black background #000000, empty black void sky, lower 30% of canvas is completely filled with solid calm dark reflective river water surface extending all the way down to the bottom canvas edge, horizon line at bottom 75%, 16-bit cozy retro pixel aesthetic, warm vermilion and golden lantern lighting, clean sharp pixel edges, ultra wide panoramic ratio 3:1, no train, no rails, no tracks, no blank space at bottom, no floating houses --ar 3:1 --style raw --v 6.0 --no train, tracks, rails, white background, sky, clouds, stars, drop shadow
```

### 3. Preset Hậu Cảnh Vịnh Đảo Nhiệt Đới (Hạ Long)
```text
Pixel art horizontal seamless panorama landscape of Ha Long Bay Vietnam with iconic towering limestone karst pillars rising from calm emerald turquoise sea, traditional junk sailing boats with reddish sails in distance, side scrolling 2D view, upper sky on pure solid pitch black background #000000, empty black void sky, lower 30% of canvas is completely filled with calm turquoise emerald sea water surface extending all the way down to the bottom canvas edge, flat horizon line at bottom 75%, tiny warm golden cabin lights on sailing boats, 16-bit pixel art style, limited 32 color palette, crisp borders against black, ultra wide panoramic ratio 3:1, no tracks, no trains, no blank space at bottom, no floating islands --ar 3:1 --style raw --v 6.0 --no tracks, trains, white background, sky, clouds, stars, drop shadow
```

### 4. Preset Trung Cảnh Đường Ray Đô Thị (Midground Track)
```text
Pixel art horizontal seamless side-scrolling tile of a modern urban elevated railway track, 16-bit retro arcade aesthetic, flat 2D side elevation profile, modern concrete viaduct with grey ballast gravel and steel dual rails, low glass acoustic barrier fence, small signal box with green and red LED lights, industrial electrical cable conduits running along the edge, upper 65% is pure solid pitch black background #000000 with NO sky, flat horizontal rail line aligned 40px from bottom, seamless repeating pattern on left and right borders, crisp pixel art, sharp hard silhouette borders, no drop shadow, zero edge glow, no ambient occlusion, no trains, no background buildings, isolated sprite asset --ar 5:1 --style raw --v 6.0 --no train, locomotive, carriage, white background, sky, clouds, drop shadow
```

### 5. Preset Trung Cảnh Đường Ray Nông Thôn & Hoa Dại
```text
Pixel art horizontal seamless side-scrolling tile of a rustic countryside railway track, 16-bit Studio Ghibli nostalgic vibe, flat 2D side profile, weathered dark brown wooden railroad ties, crushed grey granite ballast rocks, patches of vibrant green moss and tiny white and yellow wildflowers blooming along the track shoulder, low rustic wooden picket fence in background, upper 65% is pure solid pitch black background #000000 with NO sky, level rails aligned near bottom edge, perfectly seamless repeating left and right edges, crisp clean pixel clusters, sharp distinct outline, no drop shadow, no border glow, no trains, no tracks clutter, isolated asset --ar 5:1 --style raw --v 6.0 --no train, locomotive, carriage, white background, sky, drop shadow
```

---

## ⚡ Hướng Dẫn Tải & Xử Lý Tự Động Vào Game

1. **Lưu file ảnh:**
   - Hậu cảnh lưu vào: `public/assets/landscapes/[tên_ga]/background.jpg` (hoặc giữ nguyên tên dài của AI).
   - Trung cảnh đường ray (nếu có) lưu vào: `public/assets/landscapes/[tên_ga]/midground.jpg`.
2. **Hệ thống tự động kích hoạt:**
   - Vite Watcher và script `scripts/process_landscape_theme.js` sẽ **tự động nhận diện nền đen (#000000)**, thực hiện BFS Flood Fill xóa nền sạch sẽ sang PNG trong suốt, tạo bản đèn đêm `background_lights.png` và đăng ký vào game ngay lập tức!
