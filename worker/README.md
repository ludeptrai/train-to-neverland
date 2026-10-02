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

## 🌐 LỰA CHỌN 2: Triển khai qua Giao diện Web (Cloudflare Dashboard)

Nếu bạn không muốn dùng terminal, bạn có thể click chuột trực tiếp trên giao diện web:

1. Đăng nhập [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Chọn menu **Workers & Pages** ➔ **D1 SQL Database** ➔ Bấm **Create database**:
   - Đặt tên: `neverland-stats-db` ➔ Bấm **Create**.
   - Chuyển sang tab **Console** của database vừa tạo, mở file [`worker/schema.sql`](./schema.sql), sao chép toàn bộ nội dung và dán vào ô SQL rồi bấm **Execute**.
3. Quay lại menu **Workers & Pages** ➔ Bấm **Create application** ➔ Chọn **Create Worker**:
   - Đặt tên: `train-neverland-stats` ➔ Bấm **Deploy**.
   - Bấm **Edit code**, xóa code mặc định và sao chép toàn bộ nội dung trong file [`worker/src/index.js`](./src/index.js) dán vào, sau đó bấm **Save and Deploy**.
4. Liên kết Database vào Worker:
   - Trong trang chi tiết của Worker vừa tạo, vào tab **Settings** ➔ **Bindings** ➔ Bấm **Add** ➔ Chọn **D1 database**.
   - Đặt **Variable name** chính xác là: `DB`
   - Chọn database: `neverland-stats-db`
   - Bấm **Save and Deploy**.
5. Sao chép URL của Worker dán vào file `.env` ở frontend:
   ```env
   VITE_STATS_API_URL=https://train-neverland-stats.your-subdomain.workers.dev
   ```

---

## 🛡️ Cam Kết Bảo Mật & Hiệu Năng
- Không lưu trữ địa chỉ IP của người dùng.
- Định danh bằng UUID phiên ẩn danh (`sessionStorage`).
- Tự động xóa các phiên hết hạn sau 90 giây không có tín hiệu.
- Gói tin heartbeat định kỳ 45s siêu nhỏ (< 100 bytes), không ảnh hưởng đến chuyển động 60 FPS.
