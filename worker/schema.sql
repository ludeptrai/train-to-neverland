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
  ('music_minutes', 0),
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
  ('dalat', 'Đà Lạt', 0, unixepoch()),
  ('hoian', 'Phố Cổ Hội An', 0, unixepoch()),
  ('halong', 'Vịnh Hạ Long', 0, unixepoch()),
  ('hagiang', 'Hà Giang', 0, unixepoch()),
  ('nhatrang', 'Biển Nha Trang', 0, unixepoch()),
  ('hanoi', 'Hà Nội 36 Phố Phường', 0, unixepoch()),
  ('ninhbinh', 'Ninh Bình', 0, unixepoch());

-- 3. BẢNG THEO DÕI SỐ LỮ KHÁCH ĐANG CÙNG TRÊN TÀU (Heartbeat trực tiếp)
CREATE TABLE IF NOT EXISTS active_sessions (
  session_id TEXT PRIMARY KEY,
  last_seen INTEGER NOT NULL,
  scene_id TEXT
);

-- 4. BẢNG LƯU PHIÊN ĐÃ ĐĂNG KÝ (IDEMPOTENCY: 1 session chỉ đếm 1 lần duy nhất trong lịch sử)
CREATE TABLE IF NOT EXISTS registered_sessions (
  session_id TEXT PRIMARY KEY,
  first_seen INTEGER NOT NULL
);

-- 5. BẢNG NHẬT KÝ CHI TIẾT TỪNG PHIÊN (SESSION LOGS)
-- Theo dõi tổng quan hành trình của từng lữ khách: thời gian, địa danh, thiết bị, trạng thái
CREATE TABLE IF NOT EXISTS session_logs (
  session_id TEXT PRIMARY KEY,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  initial_scene TEXT,
  current_scene TEXT,
  scenes_visited TEXT, -- Danh sách các ga đã ghé, định dạng JSON e.g. ["hochiminhcity","dalat"]
  journey_count INTEGER NOT NULL DEFAULT 1,
  rain_minutes INTEGER NOT NULL DEFAULT 0,
  music_minutes INTEGER NOT NULL DEFAULT 0,
  country TEXT DEFAULT 'VN',
  device_type TEXT DEFAULT 'desktop',
  status TEXT NOT NULL DEFAULT 'active' -- 'active' | 'ended'
);

-- 6. BẢNG DÒNG THỜI GIAN SỰ KIỆN HÀNH TRÌNH (JOURNEY EVENTS TIMELINE)
-- Ghi lại các mốc sự kiện quan trọng: bước lên tàu (arrival), đổi ga (scene_change), rời tàu (session_end)
CREATE TABLE IF NOT EXISTS journey_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'arrival' | 'scene_change' | 'session_end'
  scene_id TEXT,
  scene_name TEXT,
  details TEXT, -- Thông tin bổ sung (JSON)
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journey_events_session ON journey_events(session_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_created ON journey_events(created_at);

