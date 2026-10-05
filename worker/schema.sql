-- ============================================================
-- NHẬT KÝ HÀNH TRÌNH VÔ TẬN - Cloudflare D1 schema
-- Áp dụng:  wrangler d1 execute neverland-stats-db --file=schema.sql --remote
-- Thời gian lưu dạng unix seconds (INTEGER).
-- ============================================================

PRAGMA foreign_keys = ON;

-- ---------- Danh mục Ga Tàu ----------
CREATE TABLE IF NOT EXISTS stations (
  id          TEXT PRIMARY KEY,           -- slug, vd: 'hochiminhcity' hoặc 'ho-chi-minh'
  name        TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1
);

-- ---------- Danh mục Đoàn Tàu ----------
CREATE TABLE IF NOT EXISTS trains (
  id        TEXT PRIMARY KEY,             -- vd: 'futuristic_train', 'metro'
  name      TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Khởi tạo danh mục ga tàu (hỗ trợ cả slug chuẩn & id thư mục asset)
INSERT OR IGNORE INTO stations (id, name, description, sort_order) VALUES
  ('hochiminhcity', 'TP. Hồ Chí Minh',     'Hòn Ngọc Viễn Đông & Nhịp Sống Đô Thị Hoa Lệ', 1),
  ('ho-chi-minh',   'TP. Hồ Chí Minh',     'Hòn Ngọc Viễn Đông & Nhịp Sống Đô Thị Hoa Lệ', 1),
  ('dalat',         'Đà Lạt',              'Xứ sở ngàn hoa', 2),
  ('da-lat',        'Đà Lạt',              'Xứ sở ngàn hoa', 2),
  ('hoian',         'Phố Cổ Hội An',       'Đèn lồng lung linh bên bờ sông Hoài', 3),
  ('hoi-an',        'Phố Cổ Hội An',       'Đèn lồng lung linh bên bờ sông Hoài', 3),
  ('hanoi',         'Hà Nội 36 Phố Phường', 'Hành trình qua ga Hà Nội 36 Phố Phường', 4),
  ('ha-noi-36',     'Hà Nội 36 Phố Phường', 'Hành trình qua ga Hà Nội 36 Phố Phường', 4),
  ('halong',        'Vịnh Hạ Long',        'Kỳ quan đảo ngọc & Biển xanh huyền ảo', 5),
  ('ha-long',       'Vịnh Hạ Long',        'Kỳ quan đảo ngọc & Biển xanh huyền ảo', 5),
  ('hagiang',       'Hà Giang',            'Núi non hùng vĩ, nơi đá cũng nở hoa', 6),
  ('ha-giang',      'Hà Giang',            'Núi non hùng vĩ, nơi đá cũng nở hoa', 6),
  ('ninhbinh',      'Ninh Bình',           'Hành trình qua ga Tràng An Ninh Bình', 7),
  ('ninh-binh',     'Ninh Bình',           'Hành trình qua ga Tràng An Ninh Bình', 7),
  ('nhatrang',      'Biển Nha Trang',      'Bờ cát trắng & Tuyến đường sắt ven biển ngọc', 8),
  ('nha-trang',     'Biển Nha Trang',      'Bờ cát trắng & Tuyến đường sắt ven biển ngọc', 8);

-- Khởi tạo danh mục đoàn tàu tương ứng với kho asset
INSERT OR IGNORE INTO trains (id, name) VALUES
  ('futuristic_train',            'Tàu Cao Tốc Tương Lai'),
  ('future-bullet',               'Tàu Cao Tốc Tương Lai'),
  ('metro',                       'Tàu Metro'),
  ('train_blue_metro',            'Tàu Điện Ngầm Xanh Lam'),
  ('train_green_cargo',           'Tàu Hàng Container Xanh Lá'),
  ('train_monorail',              'Tàu Monorail Treo Tương Lai'),
  ('train_orange_bullet',         'Tàu Shinkansen Orange Bullet'),
  ('train_orange_tram',           'Tàu Điện Mặt Đất Orange Tram'),
  ('train_shinkansen_high_speed', 'Tàu Shinkansen Siêu Tốc'),
  ('train_vintage_steam',         'Tàu Hơi Nước Cổ Điển'),
  ('train_yellow_metro',          'Tàu Metro Vàng Rực Rỡ');

-- ---------- Người dùng (ẩn danh) ----------
-- visitor_id sinh ở client, lưu localStorage -> đếm "Tổng lượt lữ khách"
CREATE TABLE IF NOT EXISTS visitors (
  id               TEXT PRIMARY KEY,
  first_seen_at    INTEGER NOT NULL,
  last_seen_at     INTEGER NOT NULL,
  session_count    INTEGER NOT NULL DEFAULT 0,
  total_active_sec INTEGER NOT NULL DEFAULT 0   -- "Tổng thời gian đã gắn bó"
);

-- ---------- Session (mỗi lần mở trang) ----------
CREATE TABLE IF NOT EXISTS sessions (
  id               TEXT PRIMARY KEY,             -- uuid từ client
  visitor_id       TEXT NOT NULL REFERENCES visitors(id),
  started_at       INTEGER NOT NULL,
  last_seen_at     INTEGER NOT NULL,             -- cập nhật theo heartbeat -> "đang cùng trên tàu"
  ended_at         INTEGER,
  active_sec       INTEGER NOT NULL DEFAULT 0,   -- thời gian tab thực sự hiển thị
  rain_sec         INTEGER NOT NULL DEFAULT 0,   -- nghe mưa rơi
  lofi_sec         INTEGER NOT NULL DEFAULT 0,   -- nghe lo-fi
  station_count    INTEGER NOT NULL DEFAULT 0,   -- số lần dừng ga trong session
  first_station_id TEXT REFERENCES stations(id),
  first_train_id   TEXT REFERENCES trains(id),
  auto_mode_start  INTEGER NOT NULL DEFAULT 1,  -- bật "Tự chuyển ga" lúc vào
  language         TEXT,
  device_type      TEXT,                         -- mobile | tablet | desktop
  screen_w         INTEGER,
  screen_h         INTEGER,
  referrer_host    TEXT,
  country          TEXT                          -- lấy từ request.cf.country
);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor   ON sessions(visitor_id, started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_lastseen  ON sessions(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_sessions_started   ON sessions(started_at);

-- ---------- Các lần dừng ga ("Chuyến đi đã lăn bánh") ----------
CREATE TABLE IF NOT EXISTS station_visits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id     TEXT UNIQUE,                     -- id event station_arrive => chống ghi trùng khi retry
  session_id   TEXT NOT NULL REFERENCES sessions(id),
  station_id   TEXT NOT NULL REFERENCES stations(id),
  train_id     TEXT REFERENCES trains(id),
  weather      TEXT,                            -- clear | rain | cloudy | snow ...
  time_of_day  TEXT,                            -- dawn | day | dusk | night
  trigger      TEXT NOT NULL CHECK (trigger IN ('auto','user','init')),
  arrived_at   INTEGER NOT NULL,
  left_at      INTEGER,
  dwell_sec    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_visits_station ON station_visits(station_id);
CREATE INDEX IF NOT EXISTS idx_visits_session ON station_visits(session_id, arrived_at);
CREATE INDEX IF NOT EXISTS idx_visits_open    ON station_visits(session_id) WHERE left_at IS NULL;

-- ---------- Nhật ký hoạt động chi tiết ----------
-- event_type: station_arrive | train_change | weather_change | time_select |
--             auto_toggle | audio_start | audio_stop | volume_change | click ...
CREATE TABLE IF NOT EXISTS session_events (
  id          TEXT PRIMARY KEY,                 -- id sinh ở client => retry không bị trùng
  session_id  TEXT NOT NULL REFERENCES sessions(id),
  event_type  TEXT NOT NULL,
  station_id  TEXT,
  train_id    TEXT,
  weather     TEXT,
  time_of_day TEXT,
  trigger     TEXT,                             -- auto | user
  value       TEXT,                             -- giá trị phụ: 'rain' | 'lofi' | '0.6' | 'on' ...
  payload     TEXT,                             -- JSON tự do
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_session ON session_events(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_type    ON session_events(event_type, created_at);

-- ---------- Hộp góp ý của lữ khách ----------
CREATE TABLE IF NOT EXISTS feedbacks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT,
  contact    TEXT,
  message    TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
