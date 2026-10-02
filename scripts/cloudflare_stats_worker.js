/**
 * Cloudflare Worker Backend cho "Chuyến Tàu Không Vội (Train to the Neverland)"
 * 
 * ĐẶC TÍNH NỔI BẬT:
 * - Dynamic Upsert: Tự động phát hiện và đăng ký mọi ga tàu/địa danh mới mà không cần chỉnh sửa DB.
 * - Key-Value Community Stats: Linh hoạt mở rộng các chỉ số mới trong tương lai.
 * - Auto-Pruning: Tự động dọn dẹp các session không còn hoạt động.
 * - Realtime Arrival & Heartbeat: Tự động đếm chính xác từng lượt lữ khách, thời gian, nhạc Lo-Fi, và lượt ghé thăm ga tàu.
 * - Feedback System: Tiếp nhận góp ý từ người dùng và lưu vào D1 (/api/feedback).
 * - Reset API: Hỗ trợ reset toàn bộ số liệu về 0 qua endpoint /api/reset.
 * - CORS Enabled: Tương thích 100% với Static SPA trên GitHub Pages.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cấu hình CORS để web frontend (GitHub Pages hoặc localhost) gọi API
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. GET /api/stats : Trả về toàn bộ số liệu thống kê cộng đồng
      if (url.pathname === '/api/stats' && request.method === 'GET') {
        const now = Math.floor(Date.now() / 1000);
        const activeThreshold = now - 90; // Hoạt động trong 90s gần nhất

        // Dọn dẹp session cũ
        try {
          await env.DB.prepare('DELETE FROM active_sessions WHERE last_seen < ?').bind(activeThreshold - 3600).run();
        } catch (_) {}

        // Đếm số người online thực tế
        const activeRes = await env.DB.prepare('SELECT COUNT(*) as count FROM active_sessions WHERE last_seen >= ?').bind(activeThreshold).first();
        const activeNow = Math.max(1, activeRes?.count || 1);

        // Lấy các chỉ số cộng dồn
        const statsRows = await env.DB.prepare('SELECT key, value FROM community_stats').all();
        const statsMap = {};
        for (const row of statsRows.results || []) {
          statsMap[row.key] = row.value;
        }

        // Lấy danh sách điểm đến đã ghé thăm
        const locationsRes = await env.DB.prepare(
          'SELECT location_id as id, name, visits FROM location_stats ORDER BY visits DESC LIMIT 10'
        ).all();
        const locations = locationsRes.results || [];
        const totalVisits = locations.reduce((sum, l) => sum + (l.visits || 0), 0);
        const topDestinations = locations.map(loc => ({
          ...loc,
          percentage: totalVisits > 0 ? Math.round(((loc.visits || 0) / totalVisits) * 100) : 0
        }));

        // Quy đổi thời gian nghe nhạc Lo-Fi
        const musicMinutes = statsMap.music_minutes ?? ((statsMap.music_hours ?? 0) * 60);
        const musicHours = Math.round((musicMinutes / 60) * 10) / 10;

        const responseData = {
          travelers: statsMap.total_travelers ?? 0,
          journeys: statsMap.total_journeys ?? 0,
          totalMinutes: statsMap.total_minutes ?? 0,
          activeNow,
          rainMinutes: statsMap.rain_minutes ?? 0,
          musicHours,
          musicMinutes,
          topDestinations,
          timeDistribution: {
            dawn: 25,
            day: 25,
            sunset: 25,
            night: 25,
          }
        };

        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. POST hoặc GET /api/reset : Reset toàn bộ số liệu về 0
      if (url.pathname === '/api/reset' && (request.method === 'POST' || request.method === 'GET')) {
        await env.DB.prepare("UPDATE community_stats SET value = 0").run();
        await env.DB.prepare("UPDATE location_stats SET visits = 0").run();
        await env.DB.prepare("DELETE FROM active_sessions").run();

        return new Response(JSON.stringify({ success: true, message: 'Tất cả số liệu thống kê đã được reset về 0 thành công!' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 3. POST /api/events : Tiếp nhận arrival, heartbeat, đổi cảnh, kết thúc phiên
      if (url.pathname === '/api/events' && request.method === 'POST') {
        const data = await request.json().catch(() => ({}));
        const now = Math.floor(Date.now() / 1000);

        // A. Sự kiện Arrival (Khi lữ khách vừa bước lên tàu)
        if (data.event === 'arrival' && data.sessionId) {
          // Kiểm tra xem session đã từng xuất hiện chưa
          const existingSession = await env.DB.prepare(
            'SELECT session_id FROM active_sessions WHERE session_id = ?'
          ).bind(data.sessionId).first();

          if (!existingSession) {
            // Tăng tổng số lữ khách
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('total_travelers', 1)
               ON CONFLICT(key) DO UPDATE SET value = value + 1`
            ).run();

            // Tăng tổng số chuyến đi khởi đầu
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('total_journeys', 1)
               ON CONFLICT(key) DO UPDATE SET value = value + 1`
            ).run();

            // Ghi nhận lượt ghé thăm ga tàu ban đầu
            if (data.sceneId) {
              const sceneName = data.sceneName || data.sceneId;
              await env.DB.prepare(
                `INSERT INTO location_stats (location_id, name, visits, last_visited)
                 VALUES (?, ?, 1, ?)
                 ON CONFLICT(location_id) DO UPDATE SET
                   visits = visits + 1,
                   name = CASE WHEN excluded.name != '' THEN excluded.name ELSE location_stats.name END,
                   last_visited = excluded.last_visited`
              ).bind(data.sceneId, sceneName, now).run();
            }
          }

          // Cập nhật active session
          await env.DB.prepare(
            `INSERT INTO active_sessions (session_id, last_seen, scene_id)
             VALUES (?, ?, ?)
             ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen, scene_id = excluded.scene_id`
          ).bind(data.sessionId, now, data.sceneId || '').run();

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // B. Sự kiện Heartbeat (Định kỳ mỗi 30s-45s)
        if (data.event === 'heartbeat' && data.sessionId) {
          // Nếu session chưa có trong active_sessions (vd mở tab trực tiếp mà bỏ qua arrival), tăng total_travelers
          const existingSession = await env.DB.prepare(
            'SELECT session_id FROM active_sessions WHERE session_id = ?'
          ).bind(data.sessionId).first();

          if (!existingSession) {
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('total_travelers', 1)
               ON CONFLICT(key) DO UPDATE SET value = value + 1`
            ).run();
          }

          // Gia hạn active session
          await env.DB.prepare(
            `INSERT INTO active_sessions (session_id, last_seen, scene_id)
             VALUES (?, ?, ?)
             ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen, scene_id = excluded.scene_id`
          ).bind(data.sessionId, now, data.sceneId || '').run();

          // Cộng dồn thời gian (tối thiểu 1 phút mỗi chu kỳ heartbeat)
          const addedMinutes = Math.max(1, Math.round((data.seconds || 45) / 60));
          await env.DB.prepare(
            `INSERT INTO community_stats (key, value) VALUES ('total_minutes', ?)
             ON CONFLICT(key) DO UPDATE SET value = value + excluded.value`
          ).bind(addedMinutes).run();

          if (data.weather === 'rain') {
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('rain_minutes', ?)
               ON CONFLICT(key) DO UPDATE SET value = value + excluded.value`
            ).bind(addedMinutes).run();
          }

          if (data.isAudioPlaying) {
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('music_minutes', ?)
               ON CONFLICT(key) DO UPDATE SET value = value + excluded.value`
            ).bind(addedMinutes).run();
          }

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // C. Sự kiện Chuyển Ga Tàu (Scene Change) - TỰ ĐỘNG THÍCH ỨNG ĐỊA DANH MỚI
        if (data.event === 'scene_change' && data.toScene) {
          const sceneName = data.toSceneName || data.toScene;

          // Cộng tổng số chuyến đi
          await env.DB.prepare(
            `INSERT INTO community_stats (key, value) VALUES ('total_journeys', 1)
             ON CONFLICT(key) DO UPDATE SET value = value + 1`
          ).run();

          // TỰ ĐỘNG UPSERT: Nếu địa danh chưa từng có, tự động tạo mới! Nếu đã có, cộng lượt visits!
          await env.DB.prepare(
            `INSERT INTO location_stats (location_id, name, visits, last_visited)
             VALUES (?, ?, 1, ?)
             ON CONFLICT(location_id) DO UPDATE SET
               visits = visits + 1,
               name = CASE WHEN excluded.name != '' THEN excluded.name ELSE location_stats.name END,
               last_visited = excluded.last_visited`
          ).bind(data.toScene, sceneName, now).run();

          if (data.sessionId) {
            await env.DB.prepare(
              `INSERT INTO active_sessions (session_id, last_seen, scene_id)
               VALUES (?, ?, ?)
               ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen, scene_id = excluded.scene_id`
            ).bind(data.sessionId, now, data.toScene).run();
          }

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // D. Sự kiện Kết Thúc Phiên (Session End)
        if (data.event === 'session_end') {
          if (data.sessionId) {
            await env.DB.prepare('DELETE FROM active_sessions WHERE session_id = ?').bind(data.sessionId).run();
          }
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // 4. POST /api/feedback : Tiếp nhận góp ý từ người dùng
      if (url.pathname === '/api/feedback' && request.method === 'POST') {
        const data = await request.json().catch(() => ({}));
        if (!data.message || !data.message.trim()) {
          return new Response(JSON.stringify({ error: 'Nội dung góp ý không được để trống' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const now = Math.floor(Date.now() / 1000);
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            contact TEXT,
            message TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )`
        ).run();

        await env.DB.prepare(
          'INSERT INTO feedback (name, contact, message, created_at) VALUES (?, ?, ?, ?)'
        ).bind(
          (data.name || 'Lữ khách ẩn danh').substring(0, 100),
          (data.contact || '').substring(0, 100),
          data.message.substring(0, 2000),
          now
        ).run();

        return new Response(JSON.stringify({ success: true, message: 'Góp ý của bạn đã được gửi thành công!' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 5. GET /api/feedback : Xem danh sách góp ý đã nhận
      if (url.pathname === '/api/feedback' && request.method === 'GET') {
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            contact TEXT,
            message TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )`
        ).run();

        const rows = await env.DB.prepare('SELECT * FROM feedback ORDER BY id DESC LIMIT 50').all();
        return new Response(JSON.stringify(rows.results || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('API Route Not Found', { status: 404, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
  }
};
