# 🚂 Hướng Dẫn Triển Khai Backend Thống Kê Cloudflare Worker + D1

Backend này được tối ưu hóa 100% cho dự án **Chuyến Tàu Không Vội (Train to the Neverland)**, chạy trên nền tảng **Cloudflare Serverless Edge** miễn phí hoàn toàn, không tốn bất kỳ chi phí duy trì nào và có độ trễ cực thấp (< 50ms).

---

## ⚡ LỰA CHỌN 1: Triển khai nhanh bằng Dòng lệnh (Wrangler CLI - Khuyên dùng, 2 phút)

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
Tạo file `.env` ở thư mục gốc của dự án web (hoặc sao chép từ `.env.example`):
```env
VITE_STATS_API_URL=https://train-neverland-stats.<tên-subdomain-của-bạn>.workers.dev
```
Chạy lại `npm run build` hoặc `npm run dev`. Website sẽ tự động kết nối và đồng bộ các con số thực tế từ máy chủ!

---

## 🔍 API Kiểm Tra & Debug Nhật Ký Phiên (Session Logs)

Backend cung cấp sẵn các endpoint để bạn trực tiếp kiểm tra và xác minh luồng dữ liệu trên trình duyệt:

1. **Xem tổng quan cộng đồng**: `GET /api/stats`
2. **Xem danh sách 50 phiên lữ khách gần nhất**: `GET /api/sessions?limit=50`
   - Hiển thị chi tiết: `session_id`, thời gian bắt đầu, thời lượng trên tàu (`duration_seconds`), ga ban đầu, danh sách các ga đã ghé (`scenes_visited`), số chuyến đi (`journey_count`), quốc gia, thiết bị (desktop/mobile) và trạng thái.
3. **Xem dòng thời gian sự kiện của 1 session**: `GET /api/sessions/timeline?sessionId=traveler_...`
   - Xem từng bước của session: lúc bước lên tàu (`arrival`), lúc chuyển cảnh qua các ga (`scene_change`), lúc rời tàu (`session_end`).
4. **Xem danh sách góp ý**: `GET /api/feedback`
5. **Reset an toàn (Yêu cầu mật khẩu)**: `POST /api/reset` kèm header `Authorization: Bearer <ADMIN_SECRET>` hoặc query `?secret=<ADMIN_SECRET>`.

---

## 🛡️ Cam Kết Bảo Mật & Quyền Riêng Tư (Zero Tracking)
- Không thu thập địa chỉ IP, không dùng GPS hay cookie theo dõi cá nhân.
- Định danh hoàn toàn ẩn danh theo UUID phiên (`sessionStorage`).
- Tự động dọn dẹp các phiên không còn hoạt động.
- Dữ liệu hoàn toàn thuộc quyền sở hữu của bạn trên Cloudflare D1.