# 🪄 Thư Viện Prompt Mẫu Chuẩn Hóa (Prompt Engineering Templates)
> **Bộ sưu tập Prompt mẫu chuyên nghiệp dùng cho Midjourney v6, DALL-E 3, Stable Diffusion (XL) hoặc Canvas Design để tạo sinh các chủ đề phong cảnh Panorama và Đoàn tàu Pixel Art chuẩn theo hệ thống framework của Slow Rail & Chuyến Tàu Không Vội.**

---

## 📌 Nguyên tắc cốt lõi khi viết Prompt cho hệ thống này

1. **Góc nhìn (Perspective)**: Bắt buộc là **`flat side-scrolling profile`** hoặc **`side view 2D`**. Tuyệt đối không dùng góc chéo isometric hay góc nhìn phối cảnh tụ (perspective convergence) vì sẽ làm hỏng hiệu ứng cuộn Parallax ngang.
2. **Đường chân trời (Horizon Line)**: Luôn nhắc nhở AI đặt mặt đất/chân trời ở **75% phía dưới** (`clear horizon line at bottom 75% of canvas`), chừa 70-75% phía trên cho bầu trời thoáng đãng.
3. **Không vẽ sẵn ray hoặc tàu vào nền (Clean Background Layer)**: Dùng Negative Prompt `--no train, tracks, rails, foreground obstruction` vì đường ray và tàu do code engine phụ trách.
4. **Tỉ lệ khung hình (Aspect Ratio)**:
   - Phong cảnh Panorama: **`--ar 3:1`** hoặc **`--ar 21:9`**.
   - Đoàn tàu 3 toa: **`--ar 9:1`** (hoặc `--ar 8:1`).
5. **Độ sắc nét Pixel (Crisp Pixel Edges)**: Luôn có từ khóa: `16-bit retro arcade aesthetic, pixel-perfect, crisp clean edges, limited color palette, Studio Ghibli nostalgic vibe`.

---

## 🏙️ PHẦN 1: PROMPT TẠO PHONG CẢNH PANORAMA (LANDMARK BACKGROUND)

### 1. Thành phố hiện đại & Skyline (Modern Metropolis)
* **Thích hợp cho**: Tokyo, New York, Seoul, Singapore, Thượng Hải, Hong Kong.

```text
Pixel art horizontal seamless panorama landscape of modern Tokyo city skyline with Tokyo Tower and distant Mount Fuji silhouette, 16-bit retro aesthetic, Studio Ghibli nostalgic vibe, side scrolling 2D view, flat side perspective, clear horizon line at bottom 75% of the frame, soft golden hour sunset glow reflecting off glass skyscrapers, warm amber and peach tones, crisp clean pixel lines, limited palette of 32 colors, ultra wide panoramic ratio 3:1, horizontal repeating wallpaper texture, no trains, no tracks, no ground obstruction --ar 3:1 --style raw --v 6.0
```

### 2. Danh lam Cố đô & Phố cổ truyền thống (Ancient & Historic Towns)
* **Thích hợp cho**: Phố cổ Hội An, Cố đô Huế, Kyoto, Tô Châu, Venice, Prague.

```text
Pixel art horizontal seamless panorama landscape of Hoi An ancient town Vietnam along the Hoai River, traditional yellow wooden shop-houses, glowing colorful lanterns reflecting on calm river water, small wooden sampan boats, weeping willow trees, romantic twilight evening dusk atmosphere, side scrolling 2D profile view, horizon line at bottom 75%, 16-bit cozy retro pixel aesthetic, warm vermilion and indigo lighting palette, clean pixel edges, ultra wide panoramic ratio 3:1, no train, no rails, no tracks --ar 3:1 --style raw --v 6.0
```

### 3. Vùng cao, Đồi thông & Núi non hùng vĩ (Highlands & Mountains)
* **Thích hợp cho**: Sa Pa, Đà Lạt, Fansipan, Hà Giang, Dãy Alps, Núi Phú Sĩ.

```text
Pixel art horizontal seamless panorama landscape of Da Lat Vietnam misty pine forest hills, French colonial vintage rooftops, rolling morning fog and mist between green pine ridges, soft sunrise pastel pink and lavender gradient sky, peaceful quiet mountain plateau, side scrolling 2D profile view, flat horizon line at bottom 75%, 16-bit Ghibli inspired pixel art, crisp pixel cluster details, limited nostalgic palette, ultra wide panoramic ratio 3:1, no trains, no rails --ar 3:1 --style raw --v 6.0
```

```text
Pixel art horizontal seamless panorama landscape of Sa Pa Northwest Vietnam terraced rice fields winding along mountain slopes, majestic misty green mountains, rustic wooden ethnic stilt houses, soft morning sunlight rays, 16-bit retro aesthetic, side scrolling 2D view, horizon line at bottom 75%, vibrant emerald green and golden yellow palette, clean sharp pixel lines, ultra wide panoramic ratio 3:1, no tracks, no trains --ar 3:1 --style raw --v 6.0
```

### 4. Kỳ quan Vịnh đảo & Biển nhiệt đới (Coastal & Island Wonders)
* **Thích hợp cho**: Vịnh Hạ Long, Phú Quốc, Nha Trang, Đảo Jeju, Santorini Hy Lạp.

```text
Pixel art horizontal seamless panorama landscape of Ha Long Bay Vietnam with iconic towering limestone karst pillars rising from calm emerald turquoise sea, traditional junk sailing boats with reddish sails in distance, dreamy sunset lilac and golden haze, side scrolling 2D view, flat horizon line at bottom 75%, 16-bit pixel art style, limited 32 color palette, crisp borders, ultra wide panoramic ratio 3:1, no tracks, no trains --ar 3:1 --style raw --v 6.0
```

### 5. Cyberpunk & Tương lai viễn tưởng (Sci-Fi & Cyberpunk)
* **Thích hợp cho**: Neo-Tokyo 2088, Dải Ngân Hà, Thành phố Neon tương lai.

```text
Pixel art horizontal seamless panorama landscape of futuristic Neo-Tokyo 2088 cyberpunk skyline, massive neon holographic billboards, flying vehicle silhouettes in the far distance, towering dark chrome mega-structures with magenta and cyan neon rim lighting, rainy reflective night atmosphere, side scrolling 2D view, flat horizon line at bottom 75%, 16-bit arcade pixel art, deep navy and electric neon palette, ultra wide panoramic ratio 3:1, no tracks, no train --ar 3:1 --style raw --v 6.0
```

---

## 🛤️ PHẦN 2: PROMPT TẠO TRUNG CẢNH & ĐƯỜNG RAY (MIDGROUND & TRACK LAYER)

> [!IMPORTANT]
> **Yêu cầu kỹ thuật cốt lõi cho Midground**:
> 1. **Tỉ lệ khung hình**: Dùng **`--ar 5:1`** (tương thích độ phân giải `1200 x 240 px` hoặc `1920 x 384 px`).
> 2. **Phần trên trong suốt (Transparent Upper 60%)**: 60-70% phần trên phải để trống trên nền trắng tinh khiết (`isolated on pure solid white background`) để sau đó tách nền trong suốt cho hậu cảnh lộ ra.
> 3. **Mặt phẳng tiếp xúc ray**: Thanh ray thép nằm ngang phẳng lì ở tầm 15-20% tính từ đáy ảnh (cách đáy ảnh đúng 40px trên canvas 240px).
> 4. **Khớp mí lặp vô tận (Seamless Loop)**: Mép ngoài cùng bên trái và mép phải nối tiếp trơn tru.
> 5. **Loại trừ tàu**: Tuyệt đối không vẽ tàu hoặc toa xe (`--no train, locomotive, carriage`).

---

### 1. Đường ray Đô thị Hiện đại & Cầu cạn Bê tông (Urban Concrete Viaduct & Metro Track)
* **Thích hợp cho**: Tokyo, New York, Singapore, Thượng Hải, các tuyến Metro trên cao.

```text
Pixel art horizontal seamless side-scrolling tile of a modern urban elevated railway track, 16-bit retro arcade aesthetic, flat 2D side elevation profile, modern concrete viaduct with grey ballast gravel and steel dual rails, low glass acoustic barrier fence, small signal box with green and red LED lights, industrial electrical cable conduits running along the edge, upper 65% is pure solid white background with NO sky, flat horizontal rail line aligned 40px from bottom, seamless repeating pattern on left and right borders, crisp pixel art, no trains, no background buildings, isolated sprite asset --ar 5:1 --style raw --v 6.0
```

### 2. Đường ray Nông thôn & Thảo nguyên Hoa dại (Countryside Gravel & Wildflowers)
* **Thích hợp cho**: Đà Lạt, Sa Pa, Ngoại ô Nhật Bản (Kamikatsu, Nara), Đồng quê Châu Âu.

```text
Pixel art horizontal seamless side-scrolling tile of a rustic countryside railway track, 16-bit Studio Ghibli nostalgic vibe, flat 2D side profile, weathered dark brown wooden railroad ties, crushed grey granite ballast rocks, patches of vibrant green moss and tiny white and yellow wildflowers blooming along the track shoulder, low rustic wooden picket fence in background, upper 65% is pure solid white background with NO sky, level rails aligned near bottom edge, perfectly seamless repeating left and right edges, crisp clean pixel clusters, no trains, no tracks clutter, isolated asset --ar 5:1 --style raw --v 6.0
```

### 3. Đường ray Cầu Sắt Giàn Không Gian (Industrial Steel Truss Bridge)
* **Thích hợp cho**: Cầu Long Biên Hà Nội, Cầu đường sắt sông Seine Paris, Cầu thép bắc qua sông/hẻm núi.

```text
Pixel art horizontal seamless side-scrolling tile of a historic industrial steel truss railway bridge, 16-bit retro aesthetic, flat 2D side elevation view, dark weathered iron lattice girders with detailed circular rivets, heavy steel beams, timber railway ties with double steel rails, open framework showing white empty space above, upper 65% pure solid white background, flat ground plane near bottom, seamless horizontal tileable pattern, crisp authentic pixel lines, no trains, no landscape, isolated bridge asset --ar 5:1 --style raw --v 6.0
```

### 4. Đường ray Ven Biển & Kè Đá Chắn Sóng (Coastal Seawall & Wave Breakers)
* **Thích hợp cho**: Tuyến Enoshima Shonan Kaigan Nhật Bản, Đường ray ven biển Quy Nhơn / Nha Trang / Phú Yên.

```text
Pixel art horizontal seamless side-scrolling tile of a coastal seaside railway track, 16-bit retro arcade style, flat 2D side view, sturdy concrete seawall embankment with grey tetrapod wave breakers along the bottom base, gleaming twin steel tracks on dark gravel, white metal seaside safety railing, occasional sea grass sprouts, upper 65% pure solid white background with NO ocean or sky, horizontal rail line 40px above bottom edge, seamless repeating texture, clean sharp pixels, no trains, isolated sprite sheet --ar 5:1 --style raw --v 6.0
```

### 5. Đường ray Mùa Đông Tuyết Phủ (Snow-Covered Winter Embankment)
* **Thích hợp cho**: Sapporo Hokkaido, Dãy Alps Thụy Sĩ, Cáp Nhĩ Tân tuyết trắng.

```text
Pixel art horizontal seamless side-scrolling tile of a peaceful winter railway track covered in fresh powdery white snow, 16-bit pixel art aesthetic, flat 2D side profile, dark steel rails with frost highlights on top of snow-blanketed gravel ballast, icy patches and icicles clinging to embankment stones, bare frosted winter shrubs, upper 65% pure solid white background, flat level track alignment, seamless horizontal loop, limited cool blue and white palette, no trains, isolated asset --ar 5:1 --style raw --v 6.0
```

### 6. Đường ray Tương Lai & Đệm Từ Sci-Fi (Futuristic Maglev Guideway)
* **Thích hợp cho**: Neo-Tokyo, Cyberpunk, Trạm không gian vũ trụ.

```text
Pixel art horizontal seamless side-scrolling tile of a futuristic sci-fi maglev guideway track, 16-bit arcade aesthetic, flat 2D side profile, sleek matte black titanium alloy rail bed, glowing cyan and neon purple magnetic levitation power strips, digital sensor node boxes, energy conduit pipes, upper 65% pure solid white background with NO scenery, level flat horizontal guide rail, seamless repeating left-to-right pattern, crisp glowing pixel edges, no train --ar 5:1 --style raw --v 6.0
```

---

## 🚆 PHẦN 3: PROMPT TẠO ĐOÀN TÀU PIXEL ART CHUẨN 3 TOA (3-CAR TRAIN SPRITE)

> **Lưu ý kỹ thuật**: Tất cả sprite tàu phải nằm trên nền trong suốt (transparent PNG) hoặc nền trắng đồng nhất (pure white background) để script tự động bóc tách nền.

### 1. Tàu Cao Tốc Shinkansen Hiện Đại (Modern Bullet Train)
```text
Pixel art side view of a modern 3-car Japanese Shinkansen bullet train, aerodynamic pointed bullet nose locomotive cab, 1 middle passenger coach with dark tinted passenger windows, 1 rear aerodynamic cab, crisp crimson red body with elegant yellow and white racing stripes, side-scrolling 2D game sprite profile, perfectly level flat wheels resting on an invisible horizontal ground line, uniform 108px sprite height, pure white background, isolated sprite sheet, no tracks, no scenery, crisp 16-bit pixel art --ar 9:1 --style raw --v 6.0
```

### 2. Tàu Hơi Nước Cổ Điển (Vintage Steam Locomotive)
```text
Pixel art side view of a vintage 19th century steam train, consisting of exactly 1 black steam locomotive engine with brass boiler bands and tall smokestack, 1 coal tender car, and 1 ornate wooden passenger carriage with warm glowing windows, side-scrolling 2D game sprite profile, perfectly horizontal wheel alignment with visible mechanical coupling rods, isolated on pure white background, uniform 108px sprite height, no tracks, no smoke, crisp 16-bit retro arcade pixel style --ar 9:1 --style raw --v 6.0
```

### 3. Tàu Điện Mặt Đất / Phố Cổ (Nostalgic Tramway / Streetcar)
```text
Pixel art side view of a nostalgic vintage city tramway streetcar, 3 interconnected articulated cars, warm mustard orange and cream ivory body, classic roof-mounted diamond pantograph, large square passenger windows with retro warm interior light, black steel undercarriage and wheels on flat ground line, side-scrolling 2D sprite profile, isolated on pure white background, uniform 108px sprite height, no tracks, crisp pixel art --ar 8:1 --style raw --v 6.0
```

### 4. Tàu Điện Ngầm Đô Thị (Urban Metro / Subway)
```text
Pixel art side view of a modern 3-car urban metro subway train, silver stainless steel body with vibrant royal blue stripe, squared aerodynamic front cab with glass cockpit, 1 middle passenger car with double sliding doors, 1 rear cab, flat horizontal side-scrolling 2D game sprite, wheels on invisible ground line, isolated on pure white background, uniform 108px sprite height, no rails, no background, 16-bit pixel art --ar 8:1 --style raw --v 6.0
```

### 5. Tàu Monorail Treo Tương Lai (Futuristic Monorail)
```text
Pixel art side view of a futuristic 3-car sleek monorail train, aerodynamic rounded capsule design, glossy white and turquoise body with glowing cyan LED trim, large panoramic observation windows, top suspension bogie mounts, flat horizontal side-scrolling profile, isolated on pure white background, uniform 108px sprite height, no tracks, no background, clean crisp 16-bit pixel art --ar 8:1 --style raw --v 6.0
```

---

## 🛠️ PHẦN 4: BỘ NEGATIVE PROMPT (NHỮNG THỨ CẦN LOẠI TRỪ)

Khi tạo ảnh bằng Midjourney, Stable Diffusion hoặc DALL-E, hãy luôn kèm theo các từ khóa loại trừ:

* **Cho Hậu cảnh (Background)**:
  ```text
  --no 3d render, photorealistic, blurry, antialiased, gradients, isometric perspective, front view, train tracks, railroad ties, power lines, ground clutter, text, watermark, signature
  ```
* **Cho Trung cảnh đường ray (Midground Track)**:
  ```text
  --no train, locomotive, carriage, sky, clouds, tall skyscrapers, mountains, 3d render, antialiased, curved tracks, perspective distortion
  ```
* **Cho Đoàn tàu (Train Sprite)**:
  ```text
  --no tracks, rails, background scenery, landscape, passengers outside, blurry, 3d render, isometric angle, front view, tilted wheels
  ```

---

## 💡 Lệnh Tự Động Xử Lý Tách Nền & Tạo Đèn Đêm (All-in-One CLI)

Hệ thống đã tích hợp sẵn script tự động với thuật toán **BFS Flood Fill** chống cắt lủng lỗ bên trong tác phẩm:

### Cách thực hiện nhanh nhất:
1. Thả ảnh JPG vừa tải về vào thư mục: `public/assets/landscapes/[id_ga]/` (ví dụ `background.jpg` và `midground.jpg`).
2. Mở terminal và chạy lệnh:
   ```bash
   npm run process:landscape public/assets/landscapes/[id_ga]
   ```
   *Script sẽ tự động:*
   - Dùng thuật toán **BFS Flood Fill** từ viền trên để tách sạch bầu trời ngoài trời, **bảo vệ 100%** các pixel trắng trong cửa sổ, tường nhà, cánh buồm, sóng biển.
   - Tự động trích xuất các ô cửa sổ phát sáng thành file mặt nạ đèn đêm **`background_lights.png`** rực rỡ vào ban đêm.
   - Tự động tách nền và cân chỉnh độ cao đường ray chuẩn cho **`midground_track.png`**.
3. Khai báo vào [scenes.ts](file:///f:/TrainToThe%20Neverland/src/config/scenes.ts) để trải nghiệm ngay trên website!

