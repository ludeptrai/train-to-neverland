# 🌤️ Thư Viện Asset Bầu Trời (Sky Layer Assets)

Thư mục này chứa toàn bộ các đối tượng chuyển động và trang trí trên tầng bầu trời (`SkyLayer`), nằm ở độ sâu **`zIndex: 1`** (phía trên dải màu nền trời gradient CSS và phía sau lớp Hậu cảnh Landmark Background `zIndex: 2`).

Nhờ vị trí này, các đối tượng trên bầu trời (mặt trời, mặt trăng, mây, chim bay, khinh khí cầu, máy bay) khi lướt ngang qua màn hình sẽ **tự nhiên bị các đỉnh núi cao, chùa tháp và nhà chọc trời che khuất**, tạo hiệu ứng chiều sâu không gian 3D Parallax chân thực và sống động.

---

## 📂 Cấu trúc Thư mục Phân loại Chuẩn hóa

```text
public/assets/sky/
├── celestial/          # ☀️ & 🌙 Mặt Trời & Mặt Trăng theo từng thời điểm
│   ├── sun_dawn.png    # Mặt trời bình minh ửng hồng phấn/đào (294x160px)
│   ├── sun_noon.png    # Mặt trời trưa rực rỡ vàng chanh (227x219px)
│   ├── sun_sunset.png  # Mặt trời hoàng hôn đỏ cam rực rỡ (324x176px)
│   ├── moon_full.png   # Trăng tròn viên mãn ánh bạc ngà (187x177px)
│   └── moon_crescent.png # Trăng lưỡi liềm thanh khiết (143x192px)
│
├── clouds/             # ☁️ Các hình thái mây đa dạng
│   ├── cloud_cumulus_small.png    # Mây tích nhỏ bồng bềnh tầng cao
│   ├── cloud_stratus_wide.png     # Dải mây ngang dài nhiều lớp tầng trung
│   ├── cloud_cumulonimbus_huge.png # Khối mây lớn cuồn cuộn nhiều lớp
│   ├── cloud_sunset_golden.png    # Mây hoàng hôn nhuộm vàng cam rực rỡ
│   ├── cloud_sunset_rose.png      # Mây ráng chiều phớt hồng tím
│   ├── cloud_sunset_amber.png     # Mây hoàng hôn màu hổ phách
│   ├── cloud_night_slate.png      # Mây đêm xám xanh thẫm dưới ánh trăng
│   ├── cloud_cumulus_alt1.png     # Biến thể mây tích nhẹ
│   ├── cloud_stratus_alt1.png     # Biến thể mây ngang nhẹ
│   └── cloud_puffy_alt1.png       # Biến thể mây bồng bềnh
│
├── flying/             # 🎈 & ✈️ & 🕊️ Vật thể bay & Đàn chim
│   ├── hot_air_balloon.png # Khinh khí cầu sọc đỏ/vàng/kem cổ điển
│   ├── airplane_jet.png    # Máy bay phản lực dân dụng với vệt khói contrail
│   ├── airplane_biplane.png # Máy bay cánh kép cổ điển thập niên 30
│   └── birds_flock.png     # Đàn chim di cư 7 con bay hình chữ V
│
├── clouds_sheet.jpg    # Sprite sheet gốc (Bộ sưu tập 6 hình thái mây)
└── master_sheet.jpg    # Sprite sheet gốc (Bộ sưu tập 12 đối tượng tổng hợp)
```

---

## ✂️ Công cụ Tự động Cắt (Auto-Slicer Script)

Hệ thống đã tích hợp sẵn script **[`scripts/slice_and_organize_sky.js`](file:///f:/TrainToThe%20Neverland/scripts/slice_and_organize_sky.js)**:
- Tự động nhận diện bounding box từng ô trong sprite sheet.
- Áp dụng thuật toán **BFS Flood Fill** từ 4 đường viền ngoài để bóc tách sạch 100% nền trắng `#FFFFFF` thành PNG trong suốt (Transparent Alpha).
- Bảo vệ nguyên vẹn các chi tiết màu trắng bên trong tác phẩm (lõi mặt trời, thân máy bay, vệt khói, mảng sáng của mây).
- Tự động khử viền trắng tiếp giáp (Anti-Halo Defringe).
- Tự động phân loại và lưu về 3 thư mục `celestial/`, `clouds/`, `flying/`.

Khi có thêm ảnh sprite sheet mới, bạn chỉ cần chạy:
```bash
node scripts/slice_and_organize_sky.js
```
