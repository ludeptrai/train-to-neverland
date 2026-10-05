# 🚂 Hướng Dẫn Triển Khai Backend Nhật Ký Hành Trình Cloudflare Worker + D1

Backend này được thiết kế và tối ưu hóa 100% cho dự án **Chuyến Tàu Không Vội (Train to the Neverland)**, chạy trên nền tảng **Cloudflare Serverless Edge + D1 SQL Database** miễn phí hoàn toàn, không tốn bất kỳ chi phí duy trì nào và có độ trễ cực thấp (< 50ms).

---

## ⚡ Triển khai nhanh bằng Wrangler CLI (2 phút)

Mở terminal trong thư mục `worker/` (hoặc từ thư mục gốc dự án) và chạy lần lượt các lệnh sau:

### Bước 1: Đăng nhập Cloudflare
```bash
npx wrangler login
```
*(Trình duyệt sẽ tự động mở lên, bạn chỉ cần bấm nút "Allow" để cấp quyền).*

### Bước 2: Tạo Cơ sở dữ liệu D1
```bash
npx wrangler d1 create neverland-stats-db
```
Terminal sẽ in ra thông tin dạng:
```toml
[[d1_databases]]
binding = "DB"
database_name = "neverland-stats-db"
database_id = "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
👉 Bạn hãy sao chép dòng `database_id` và dán vào file [`worker/wrangler.toml`](./wrangler.toml).

### Bước 3: Khởi tạo bảng dữ liệu (Run SQL Schema)
```bash
npx wrangler d1 execute neverland-stats-db --remote --file=./schema.sql
```

### Bước 4: Deploy Worker lên mạng Cloudflare toàn cầu
```bash
npx wrangler deploy
```
Sau khi hoàn tất, terminal sẽ cấp cho bạn một đường link dạng:
`https://train-neverland-stats.<tên-subdomain-của-bạn>.workers.dev`

### Bước 5: Kết nối vào Frontend
Tạo file `.env` ở thư mục gốc của dự án web (hoặc chỉnh sửa `.env` hiện tại):
```env
VITE_STATS_API_URL=https://train-neverland-stats.<tên-subdomain-của-bạn>.workers.dev
```
Chạy lại `npm run build` hoặc `npm run dev`. Website sẽ tự động kết nối và đồng bộ các con số thực tế từ máy chủ!

---

## 🔍 Kiến Trúc & Các Endpoint API

Hệ thống được thiết kế theo mô hình **Ghi log phiên + Batch Event Tracking** chính xác:

1. **`POST /api/session/start`**:
   - Khởi tạo phiên của lữ khách ngay khi vừa vào trang.
   - Tự động ghi nhận thiết bị, độ phân giải màn hình, ngôn ngữ, quốc gia (qua Cloudflare Edge), ga xuất phát, đoàn tàu và chế độ tự động chuyển ga.
   - Trả về thông tin cá nhân của lữ khách (`me.total_active_sec`, `session_count`).

2. **`POST /api/session/track`**:
   - Nhận gói tin đồng bộ delta thời gian định kỳ mỗi 15s (`active_sec`, `rain_sec`, `lofi_sec`).
   - Ghi nhận nhật ký sự kiện dạng hàng loạt (`station_arrive`, `train_change`, `weather_change`, `time_select`, `audio_start`, `audio_stop`).
   - Tự động đóng lượt dừng ga cũ và mở lượt dừng ga mới trong `station_visits` (chống ghi trùng bằng `event_id UNIQUE`).
   - Hỗ trợ `end: true` qua `navigator.sendBeacon` khi người dùng đóng tab / rời trang.

3. **`GET /api/stats?visitor_id=...`**:
   - Trả về tổng quan số liệu cộng đồng:
     - `online`: Số lượng lữ khách đang cùng trên tàu thời gian thực (trong cửa sổ 60s).
     - `totals`: Lượt lữ khách (`visitors`), chuyến đi (`trips`), phút đi tàu (`train_minutes`), phút nghe mưa (`rain_minutes`), giờ nghe nhạc (`lofi_hours`), số ga đã khám phá (`stations_explored`).
     - `top_stations`: Bảng xếp hạng các ga tàu được ghé thăm nhiều nhất kèm số lượt.
     - `time_of_day_pct`: Tỷ lệ % các khung giờ được lựa chọn (`dawn`, `day`, `dusk`, `night`).
     - `me`: Dữ liệu cá nhân của riêng lữ khách (`total_active_sec`, `session_count`).

4. **`POST /api/feedback` & `GET /api/feedback`**:
   - Nhận và lưu lại các lời nhắn, góp ý gửi về nhà ga từ `FeedbackDonateModal`.

---

## 🛠️ File Thư Viện Kèm Theo (`journey-tracker.js`)

File `journey-tracker.js` (được lưu tại `worker/journey-tracker.js` và `public/journey-tracker.js`) cung cấp sẵn đối tượng toàn cục `JourneyTracker` và `JourneyStats` cho các trang HTML tĩnh thuần nếu bạn muốn nhúng trực tiếp qua thẻ `<script src="journey-tracker.js"></script>`.

Trong ứng dụng React chính của dự án, logic này đã được tích hợp toàn diện và liền mạch vào `src/services/AnalyticsService.ts`.