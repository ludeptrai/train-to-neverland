-- =========================================================================
-- SCHEMA D1 CHO CHUYẾN TÀU KHÔNG VỘI (TỰ ĐỘNG THÍCH ỨNG - ZERO MAINTENANCE)
-- =========================================================================

-- 1. BẢNG CHỈ SỐ CỘNG ĐỒNG (Mô hình Key-Value, tự động mở rộng)
CREATE TABLE IF NOT EXISTS community_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

-- Khởi tạo các mốc ban đầu về 0
INSERT OR IGNORE INTO community_stats (key, value) VALUES
  ('total_travelers', 0),
  ('total_journeys', 0),
  ('total_minutes', 0),
  ('rain_minutes', 0),
  ('music_hours', 0);

-- 2. BẢNG GA TÀU (TỰ ĐỘNG ĐĂNG KÝ MỌI ĐỊA DANH MỚI TRONG TƯƠNG LAI)
CREATE TABLE IF NOT EXISTS location_stats (
  location_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0,
  last_visited INTEGER
);

-- Khởi tạo ban đầu cho các địa danh hiện có với 0 lượt đi
INSERT OR IGNORE INTO location_stats (location_id, name, visits, last_visited) VALUES
  ('hochiminhcity', 'TP. Hồ Chí Minh', 0, unixepoch()),
  ('dalat', 'Đà Lạt Sương Mù', 0, unixepoch()),
  ('hoian', 'Phố Cổ Hội An', 0, unixepoch()),
  ('halong', 'Vịnh Hạ Long', 0, unixepoch()),
  ('hagiang', 'Hà Giang Hùng Vĩ', 0, unixepoch()),
  ('nhatrang', 'Nha Trang Biển Xanh', 0, unixepoch());

-- 3. BẢNG THEO DÕI SỐ LỮ KHÁCH ĐANG CÙNG TRÊN TÀU (Heartbeat trực tiếp)
CREATE TABLE IF NOT EXISTS active_sessions (
  session_id TEXT PRIMARY KEY,
  last_seen INTEGER NOT NULL,
  scene_id TEXT
);
