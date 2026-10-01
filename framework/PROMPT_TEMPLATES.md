# 🪄 Thư Viện Prompt Mẫu Chuẩn Hóa (Prompt Engineering Templates)
> **Bộ sưu tập Prompt mẫu chuyên nghiệp dùng cho Midjourney v6, DALL-E 3, Stable Diffusion (XL), Flux hoặc ChatGPT để tạo sinh Phong cảnh Panorama và Đoàn tàu Pixel Art chuẩn theo hệ thống framework của Slow Rail & Chuyến Tàu Không Vội.**
> 
> ⚡ **2 NGUYÊN TẮC CỐT LÕI BẮT BUỘC:**
> 1. **NỀN ĐEN THUẦN KHIẾT (`pure solid pitch black background #000000`)**: Thay vì nền trắng, giúp tăng độ tương phản pixel, bảo vệ chi tiết màu sáng và tối ưu hóa việc bóc tách nền trong suốt tự động.
> 2. **MÀU NGUYÊN BẢN & ÁNH SÁNG BAN NGÀY (`clear neutral daylight, normal exposure, true base colors`)**: Ảnh tạo ra BẮT BUỘC là ban ngày rõ ràng, màu gốc tự nhiên, độ sáng bình thường. Tuyệt đối KHÔNG tạo cảnh đêm u tối, KHÔNG ám màu hoàng hôn cam gắt, để Shader động của Game tự động biến đổi thời gian (Bình minh -> Trưa nắng -> Hoàng hôn -> Đêm sao).

---

## ☀️ QUY CHUẨN ÁNH SÁNG BAN NGÀY & MÀU SẮC NGUYÊN BẢN
> *(Đọc kỹ trước khi tạo ảnh)*

1. **Ánh sáng ban ngày tự nhiên (Clear Neutral Daylight Lighting)**:
   - Tất cả asset hình ảnh (Hậu cảnh, Đường ray, Đoàn tàu) phải được chiếu sáng dưới **ánh sáng ban ngày dịu rõ, độ phơi sáng cân bằng chuẩn (normal exposure)**.
   - **Lý do kỹ thuật sống còn:** Engine của game đã tích hợp sẵn hệ thống đổi màu thời gian thực theo 4 thời khắc: Bình minh, Ban ngày, Hoàng hôn, Ban đêm. Nếu hình nạp vào đã bị AI vẽ sẵn cảnh đêm (tối thui, ám xanh đậm) hoặc cảnh hoàng hôn (ám đỏ cam chói gắt), khi game chạy đến ban ngày sẽ bị tối om kỳ dị, hoặc khi đến hoàng hôn sẽ bị chồng màu 2 lần gây bệt màu.
2. **Màu sắc nguyên bản (True Natural Base Colors)**:
   - Giữ nguyên màu sắc đặc trưng của vật liệu: biển xanh ngọc bích, cây cối xanh tươi, mái ngói đỏ đất nung, tường vàng cổ kính, thân tàu đúng màu sơn thực tế.
3. **Từ khóa bắt buộc có trong Prompt:**
   - `clear bright neutral daylight lighting, natural original vibrant colors, normal balanced exposure, clean daytime atmosphere`.
   - **Negative prompt:** `--no night scene, nighttime, dark shadows, twilight, sunset tint, gloomy, underexposed, heavy color cast, moody darkness`.

---

## 🌟 4 PROMPT MẪU CHÍNH THỨC CỦA HỆ THỐNG

---

### 👑 PROMPT MẪU 1: ChatGPT Meta-Prompt Cho Địa Điểm Mới
> **Mục đích:** Dán prompt này vào ChatGPT kèm tên địa điểm bạn muốn làm. ChatGPT sẽ tự động đóng vai Giám đốc Kỹ thuật Pixel Art và sinh ra **3 prompt tạo ảnh hoàn chỉnh** (Background Panorama, Midground Track và Cận cảnh/Ga).

```markdown
Bạn là Technical Pixel Art Director của dự án game 2D side-scrolling "Chuyến Tàu Không Vội" (Train to Neverland).
Tôi muốn tạo một ga tàu mới dựa trên địa danh: "[ĐIỀN TÊN ĐỊA DANH / QUỐC GIA Ở ĐÂY, ví dụ: Phố cổ Hội An / Vịnh Hạ Long / Sa Pa Tây Bắc / Cố đô Kyoto / Paris Eiffel Tower / New York Skyline]".

Hãy phân tích kiến trúc, cảnh quan và tông màu đặc trưng nhất của địa danh này, sau đó viết chính xác 3 Prompt tạo ảnh bằng tiếng Anh (dành cho Midjourney v6 / DALL-E 3 / Flux) tuân thủ 100% các tiêu chuẩn kỹ thuật bất di bất dịch sau:

---
### 1. PROMPT HẬU CẢNH PANORAMA (BACKGROUND):
- **Góc nhìn:** 2D Side-scrolling flat profile view (nhìn ngang phẳng 2D, không góc nghiêng, không phối cảnh tụ, không 3D).
- **Ánh sáng & Màu sắc (CỰC KỲ QUAN TRỌNG):** Ảnh BẮT BUỘC là ánh sáng ban ngày tự nhiên, rõ ràng, độ sáng và phơi sáng bình thường (`clear bright neutral daylight lighting, natural original base colors, normal balanced exposure, clean daytime atmosphere`). TUYỆT ĐỐI KHÔNG vẽ cảnh đêm tối tăm, KHÔNG vẽ hoàng hôn cam gắt, KHÔNG dùng bộ lọc màu u ám, để bộ lọc thời gian của engine game tự động đổi màu theo giờ.
- **Quy chuẩn bầu trời (NỀN ĐEN):** Toàn bộ 65% - 70% phần trên canvas là BẦU TRỜI NỀN ĐEN THUẦN KHIẾT: `upper sky on pure solid pitch black background #000000, empty black void, no stars, no moon, no clouds, no atmospheric gradients`.
- **Quy chuẩn mép đáy (LẤP ĐẦY 100%):** 30% - 35% phần dưới canvas BẮT BUỘC LẤP ĐẦY HOÀN TOÀN bằng địa hình thực tế (mặt nước biển/sông hồ, mặt đường phố, thảm cỏ, thung lũng, mái nhà thấp tầng...) kéo dài chạm sát mép đáy tranh (`completely filled with solid terrain/ground/water extending all the way down to the bottom canvas edge, touching bottom border, flat horizon line at bottom 70-75%`). TUYỆT ĐỐI KHÔNG để khoảng trống màu đen ở đáy, KHÔNG có nhà hay đảo lơ lửng.
- **Nội dung:** Tái hiện đường chân trời (skyline), các công trình biểu tượng hoặc rặng núi trập trùng đặc trưng của địa danh với màu sắc nguyên bản.
- **Chi tiết cửa sổ:** Có các ô cửa sổ nhỏ màu vàng nhạt/trắng để thuật toán tự động bóc tách làm đèn đêm.
- **Quy cách:** `sharp hard silhouette borders, no drop shadow, zero ambient glow, no edge blur, 16-bit retro pixel art, limited 32 color palette, Studio Ghibli nostalgic aesthetic --ar 3:1 --style raw --v 6.0`.
- **Negative prompt:** `--no train, tracks, rails, sky, clouds, stars, moon, night, nighttime, dark, twilight, sunset tint, gloomy, underexposed, white background, blurry, 3d render, floating buildings, empty bottom margin`.

---
### 2. PROMPT TRUNG CẢNH ĐƯỜNG RAY TIẾP XÚC (MIDGROUND TRACK):
- **Góc nhìn:** 2D Side elevation profile view.
- **Ánh sáng:** Ban ngày rõ nét (`clear neutral daylight, normal exposure`).
- **Quy chuẩn độ cao:** Nền đen 65% phía trên (`upper 65% is pure solid pitch black background #000000 with NO scenery, NO sky`). Mặt trên của ray thép đôi phẳng lì, cách mép đáy tranh đúng ~15-20% chiều cao (chuẩn tiếp xúc bánh xe).
- **Nội dung:** Lớp đá ba-lát, tà-vẹt và đường ray thép đôi phối hợp hài hòa với phong cách địa phương (ví dụ: ray kè đá ven biển, ray rải sỏi hoa dại nông thôn, cầu cạn bê tông đô thị, hoặc cầu sắt giàn không gian cổ điển).
- **Khớp mí:** Hai mép trái - phải nối khớp mí hoàn hảo để cuộn vô tận (`seamless repeating tile pattern on left and right borders`).
- **Quy cách:** `crisp pixel art, hard edges, no drop shadow, zero ambient blur, no trains, isolated asset --ar 5:1 --style raw --v 6.0`.
- **Negative prompt:** `--no train, locomotive, carriage, sky, mountains, buildings, night, dark, white background, blurry`.

---
### 3. PROMPT BIỂN BÁO & CHI TIẾT CẬN CẢNH (FOREGROUND PROPS):
- **Nội dung:** 1 sprite chi tiết đặt cạnh đường ray mang nét văn hóa của địa danh (ví dụ: biển tên ga bằng gỗ/đồng cổ điển, cột đèn tín hiệu retro, cột điện dây cáp, hàng hoa dại bản địa).
- **Quy cách:** `2D side view, 16-bit pixel art sprite, clear daylight, natural colors, isolated on pure solid pitch black background #000000, no shadow, crisp clean edges --ar 1:1 --style raw --v 6.0`.

Hãy xuất kết quả dưới dạng Markdown với từng khối Code block rõ ràng để tôi chỉ việc copy chạy ngay.
```

---

### 🎨 PROMPT MẪU 2: Direct Prompt Hậu Cảnh (Dùng Ngay Không Cần Qua ChatGPT)
> **Mục đích:** Chỉ cần thay thế đoạn trong ngoặc vuông `[...]` bằng tên địa danh và loại địa hình lấp đáy, sau đó copy dán thẳng vào Midjourney / DALL-E / Flux. Đã tích hợp đầy đủ chuẩn ánh sáng ban ngày và màu nguyên bản.

```text
Pixel art horizontal seamless panorama landscape of [TÊN ĐỊA DANH, ví dụ: Da Lat pine forest hills with French vintage villas / Ha Long Bay limestone karsts / Tokyo modern city skyline], clear bright neutral daylight illumination, natural original vibrant colors, normal balanced exposure, clean daytime atmosphere, 16-bit retro arcade aesthetic, Studio Ghibli nostalgic vibe, side scrolling 2D profile view, flat side perspective, upper sky on pure solid pitch black background #000000, empty black void sky with no clouds and no stars, lower 30% of canvas is completely filled with solid [LOẠI NỀN ĐẤT/NƯỚC, ví dụ: calm emerald turquoise sea water / lush green pine slopes and grassy ground / dark asphalt street and low rooftops] extending all the way down to the bottom canvas edge, flat horizon line at bottom 75%, warm cozy distinct windows and architectural details, crisp clean pixel lines, hard silhouette edges against the black background, limited nostalgic palette of 32 colors, ultra wide panoramic ratio 3:1, horizontal repeating wallpaper texture, no trains, no tracks, no ground obstruction, no blank black space at bottom, no floating buildings --ar 3:1 --style raw --v 6.0 --no train, tracks, rails, sky, clouds, stars, moon, night, nighttime, dark, twilight, sunset tint, gloomy, underexposed, heavy color cast, white background, drop shadow, ambient glow, edge blur, floating islands, cutoff ground
```

---

### 🚂 PROMPT MẪU 3: ChatGPT Meta-Prompt Cho Đoàn Tàu
> **Mục đích:** Dán prompt này vào ChatGPT kèm phong cách tàu bạn muốn tạo. ChatGPT sẽ thiết kế thông số và viết Prompt đoàn tàu 4 toa hoàn hảo với màu sơn ban ngày nguyên bản.

```markdown
Bạn là Senior Vehicle Pixel Artist cho tựa game 2D side-scrolling "Chuyến Tàu Không Vội".
Tôi muốn thiết kế một đoàn tàu 4 toa mới theo phong cách: "[ĐIỀN PHONG CÁCH TÀU Ở ĐÂY, ví dụ: Tàu hơi nước cổ điển Pháp 1900s / Tàu cao tốc Shinkansen đỏ siêu tốc / Tàu điện mặt đất bằng gỗ Đà Lạt / Tàu hàng container Diesel xanh lá / Tàu Cyberpunk Maglev tương lai]".

Hãy viết cho tôi 1 Prompt hoàn chỉnh bằng tiếng Anh (dành cho Midjourney v6 / DALL-E 3 / Flux) tuân thủ 100% các tiêu chuẩn kỹ thuật xe lửa của game:

1. **Ánh sáng & Màu sắc nguyên bản (Daylight & Original Colors):**
   - Đoàn tàu được chiếu sáng dưới ánh sáng ban ngày rõ nét, độ phơi sáng bình thường (`clear bright neutral daylight lighting, natural original livery colors, normal exposure, vibrant clean colors`).
   - Thể hiện rõ màu sơn nguyên bản của thân tàu, kim loại và các chi tiết cơ khí. Cửa sổ kính có ánh sáng nội thất nhẹ nhàng.

2. **Cấu trúc 4 toa cân bằng (4-Car Articulated Train):**
   - Toa 1 (Đầu tàu/Cabin lái): Có mũi khí động học hoặc đầu máy hơi nước đặc trưng, đèn pha chính rực sáng phía trước hướng sang phải.
   - Toa 2 (Toa hành khách giữa 1): Toa hành khách với các ô cửa sổ kính đều đặn (`first passenger coach with clean windows`).
   - Toa 3 (Toa hành khách giữa 2): Toa hành khách thứ hai đồng bộ liền mạch (`second matching passenger coach with clean windows`).
   - Toa 4 (Toa đuôi/Cabin sau): Toa hành khách có đuôi bo tròn hoặc buồng quan sát phía sau (`matching rear coach with aerodynamic tail / observation end`).
   - Giữa các toa nối liền nhau bằng khớp nối cơ khí (`articulated rubber bellows / gangways connecting all 4 cars`).

3. **Góc nhìn & Hướng di chuyển:**
   - 2D Flat side-scrolling profile view (nhìn ngang 100%, không góc chéo isometric, không 3D).
   - Đầu tàu hướng về phía bên phải màn hình (hướng di chuyển chuẩn).

4. **Quy chuẩn nền & Bánh xe (CỰC KỲ QUAN TRỌNG):**
   - **Nền ảnh:** NỀN ĐEN THUẦN KHIẾT: `isolated on pure solid pitch black background #000000, empty black background`.
   - **Tiếp xúc ray:** Tất cả các cặp bánh xe thép nằm trên một đường thẳng ngang vô hình (`wheels resting on an invisible horizontal ground line`).
   - **KHÔNG CÓ BÓNG ĐỔ:** `ABSOLUTELY NO drop shadow, zero cast shadow, no shadow under wheels, no ground plane` (để khi gắn vào thanh ray của game không bị bóng đen đè lên thanh ray).

5. **Kích thước & Phong cách:**
   - Chiều cao thân tàu đồng đều, tỉ lệ siêu dài cho 4 toa: `--ar 11:1` (hoặc `--ar 10:1` / `--ar 12:1`).
   - `16-bit retro arcade pixel art, crisp hard pixel edges, clean silhouette against black, limited cohesive color palette`.
   - Negative prompt: `--no tracks, rails, ground, landscape, scenery, passengers outside, night, dark, underexposed, gloomy, drop shadow under wheels, ground shadow, white background, blurry, 3d render, tilted wheels`.
Toàn bộ prompt dưới 100 chữ
Hãy xuất kết quả dưới dạng Markdown Code block để tôi sử dụng ngay.
```

---

### 🚄 PROMPT MẪU 4: Direct Prompt Cho Đoàn Tàu 4 Toa (Dùng Ngay Không Cần Qua ChatGPT)
> **Mục đích:** Thay đoạn trong ngoặc vuông `[...]` bằng mô tả phong cách và màu sắc tàu, sau đó copy dán thẳng vào AI Generator.

```text
Pixel art side view of a modern balanced 4-car train, [MÔ TẢ LOẠI TÀU VÀ MÀU SẮC, ví dụ: classic 19th century vintage black steam locomotive with brass boiler bands and dark green wooden passenger cars / aerodynamic crimson red bullet train with yellow racing stripes / retro mustard orange city tramway streetcar], clear bright neutral daylight lighting, natural original vibrant livery colors, normal balanced exposure, consisting of 1 front locomotive engine facing right, 2 identical middle passenger carriages with clean passenger windows, and 1 matching rear carriage, articulated accordion bellows connecting the four cars, side-scrolling 2D game vehicle sprite profile, perfectly level flat steel wheels resting on an invisible horizontal ground line, uniform sprite height, isolated on pure solid pitch black background #000000, hard crisp pixel borders, absolutely no drop shadow, zero shadow under wheels, no ambient occlusion, no tracks, no ground, no scenery, crisp authentic 16-bit arcade pixel art style --ar 11:1 --style raw --v 6.0 --no tracks, rails, ground plane, ballast, landscape, night, dark, gloomy, underexposed, white background, drop shadow under wheels, ground shadow, cast shadow, blurry, 3d render, isometric, tilted perspective
```

---

## 📌 BỘ THƯ VIỆN PRESET BAN NGÀY MÀU NGUYÊN BẢN (NỀN ĐEN #000000)

### 1. Preset Hậu Cảnh Đô Thị & Skyline (Tokyo)
```text
Pixel art horizontal seamless panorama landscape of modern Tokyo city skyline with Tokyo Tower and distant Mount Fuji silhouette, clear bright neutral daylight lighting, natural original architectural colors, normal balanced exposure, 16-bit retro aesthetic, Studio Ghibli nostalgic vibe, side scrolling 2D view, flat side perspective, upper sky on pure solid pitch black background #000000, empty black void, lower 30% of canvas is completely filled with solid city ground, asphalt streets, pavement and low building rooftops extending all the way down to the bottom canvas edge, clear horizon line at bottom 75% of the frame, distinct windows and glass skyscraper textures, crisp clean pixel lines, hard silhouette edges against black, limited palette of 32 colors, ultra wide panoramic ratio 3:1, horizontal repeating wallpaper texture, no trains, no tracks, no ground obstruction, no blank space at bottom, no floating buildings --ar 3:1 --style raw --v 6.0 --no train, tracks, rails, white background, sky, clouds, stars, moon, night, dark, twilight, sunset tint, gloomy, drop shadow, ambient glow
```

### 2. Preset Hậu Cảnh Phố Cổ & Sông Nước (Hội An)
```text
Pixel art horizontal seamless panorama landscape of Hoi An ancient town Vietnam along the Hoai River, traditional vibrant yellow wooden shop-houses, classic mossy ceramic roof tiles, small wooden sampan boats moored along bank, weeping willow trees, clear bright daytime sunlight, natural rich colors, normal balanced exposure, side scrolling 2D profile view, upper sky on pure solid pitch black background #000000, empty black void sky, lower 30% of canvas is completely filled with solid calm dark reflective river water surface extending all the way down to the bottom canvas edge, horizon line at bottom 75%, 16-bit cozy retro pixel aesthetic, clean sharp pixel edges, ultra wide panoramic ratio 3:1, no train, no rails, no tracks, no blank space at bottom, no floating houses --ar 3:1 --style raw --v 6.0 --no train, tracks, rails, white background, sky, clouds, stars, night, dark, sunset tint, drop shadow
```

### 3. Preset Hậu Cảnh Vịnh Đảo Nhiệt Đới (Hạ Long)
```text
Pixel art horizontal seamless panorama landscape of Ha Long Bay Vietnam with iconic towering limestone karst pillars rising from calm emerald turquoise sea, traditional junk sailing boats with reddish-brown sails in distance, clear bright daylight sun, natural rich limestone cliff textures and vibrant emerald sea, normal balanced exposure, side scrolling 2D view, upper sky on pure solid pitch black background #000000, empty black void sky, lower 30% of canvas is completely filled with calm turquoise emerald sea water surface extending all the way down to the bottom canvas edge, flat horizon line at bottom 75%, 16-bit pixel art style, limited 32 color palette, crisp borders against black, ultra wide panoramic ratio 3:1, no tracks, no trains, no blank space at bottom, no floating islands --ar 3:1 --style raw --v 6.0 --no tracks, trains, white background, sky, clouds, stars, night, dark, sunset tint, drop shadow
```

### 4. Preset Trung Cảnh Đường Ray Đô Thị (Midground Track)
```text
Pixel art horizontal seamless side-scrolling tile of a modern urban elevated railway track, clear neutral daylight lighting, natural concrete and steel colors, 16-bit retro arcade aesthetic, flat 2D side elevation profile, modern concrete viaduct with grey ballast gravel and steel dual rails, low glass acoustic barrier fence, small signal box with LED lights, industrial electrical cable conduits running along the edge, upper 65% is pure solid pitch black background #000000 with NO sky, flat horizontal rail line aligned 40px from bottom, seamless repeating pattern on left and right borders, crisp pixel art, sharp hard silhouette borders, no drop shadow, zero edge glow, no ambient occlusion, no trains, no background buildings, isolated sprite asset --ar 5:1 --style raw --v 6.0 --no train, locomotive, carriage, white background, sky, clouds, night, dark, drop shadow
```

### 5. Preset Trung Cảnh Đường Ray Nông Thôn & Hoa Dại
```text
Pixel art horizontal seamless side-scrolling tile of a rustic countryside railway track, clear bright daytime light, natural rich green and timber colors, 16-bit Studio Ghibli nostalgic vibe, flat 2D side profile, weathered dark brown wooden railroad ties, crushed grey granite ballast rocks, patches of vibrant green moss and tiny white and yellow wildflowers blooming along the track shoulder, low rustic wooden picket fence in background, upper 65% is pure solid pitch black background #000000 with NO sky, level rails aligned near bottom edge, perfectly seamless repeating left and right edges, crisp clean pixel clusters, sharp distinct outline, no drop shadow, no border glow, no trains, no tracks clutter, isolated asset --ar 5:1 --style raw --v 6.0 --no train, locomotive, carriage, white background, sky, night, dark, drop shadow
```

---

## ⚡ Hướng Dẫn Tải & Xử Lý Tự Động Vào Game

1. **Lưu file ảnh:**
   - Hậu cảnh lưu vào: `public/assets/landscapes/[tên_ga]/background.jpg` (hoặc giữ nguyên tên dài của AI).
   - Trung cảnh đường ray (nếu có) lưu vào: `public/assets/landscapes/[tên_ga]/midground.jpg`.
2. **Hệ thống tự động kích hoạt:**
   - Vite Watcher và script `scripts/process_landscape_theme.js` sẽ **tự động nhận diện nền đen (#000000)**, thực hiện BFS Flood Fill xóa nền sạch sẽ sang PNG trong suốt, tạo bản đèn đêm `background_lights.png` và đăng ký vào game ngay lập tức!
