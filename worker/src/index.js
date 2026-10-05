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
          'SELECT location_id as id, name, visits FROM location_stats ORDER BY visits DESC LIMIT 20'
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

      // 2. POST /api/reset : Reset toàn bộ số liệu về 0 (BẮT BUỘC XÁC THỰC BẢO MẬT)
      if (url.pathname === '/api/reset') {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({ 
            error: 'Phương thức không được phép. Reset số liệu chỉ được kích hoạt bằng POST kèm mã bảo mật.' 
          }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Kiểm tra Secret Key qua Header Authorization hoặc query string (?secret=...)
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        const secretParam = url.searchParams.get('secret') || '';
        const expectedSecret = env.ADMIN_SECRET || 'train_neverland_admin_secret_2026';

        if (token !== expectedSecret && secretParam !== expectedSecret) {
          return new Response(JSON.stringify({ 
            error: 'Từ chối truy cập: Bạn không có quyền reset dữ liệu hệ thống.' 
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await env.DB.prepare("UPDATE community_stats SET value = 0").run();
        await env.DB.prepare("UPDATE location_stats SET visits = 0").run();
        await env.DB.prepare("DELETE FROM active_sessions").run();
        try {
          await env.DB.prepare("DELETE FROM registered_sessions").run();
        } catch (_) {}

        return new Response(JSON.stringify({ success: true, message: 'Tất cả số liệu thống kê đã được reset về 0 an toàn!' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 3. POST /api/events : Tiếp nhận arrival, heartbeat, đổi cảnh, kết thúc phiên
      if (url.pathname === '/api/events' && request.method === 'POST') {
        const data = await request.json().catch(() => ({}));
        const now = Math.floor(Date.now() / 1000);

        // Nhận diện ngữ cảnh thiết bị và vị trí địa lý ẩn danh
        const country = request.cf?.country || 'VN';
        const ua = request.headers.get('user-agent') || '';
        let deviceType = 'desktop';
        if (/mobile|android|iphone/i.test(ua)) deviceType = 'mobile';
        else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

        // Đảm bảo các bảng lưu trữ nhật ký phiên luôn tồn tại tự động (Zero Maintenance)
        try {
          await env.DB.batch([
            env.DB.prepare(`CREATE TABLE IF NOT EXISTS registered_sessions (
              session_id TEXT PRIMARY KEY,
              first_seen INTEGER NOT NULL
            )`),
            env.DB.prepare(`CREATE TABLE IF NOT EXISTS session_logs (
              session_id TEXT PRIMARY KEY,
              first_seen INTEGER NOT NULL,
              last_seen INTEGER NOT NULL,
              duration_seconds INTEGER NOT NULL DEFAULT 0,
              initial_scene TEXT,
              current_scene TEXT,
              scenes_visited TEXT,
              journey_count INTEGER NOT NULL DEFAULT 1,
              rain_minutes INTEGER NOT NULL DEFAULT 0,
              music_minutes INTEGER NOT NULL DEFAULT 0,
              country TEXT DEFAULT 'VN',
              device_type TEXT DEFAULT 'desktop',
              status TEXT NOT NULL DEFAULT 'active'
            )`),
            env.DB.prepare(`CREATE TABLE IF NOT EXISTS journey_events (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              session_id TEXT NOT NULL,
              event_type TEXT NOT NULL,
              scene_id TEXT,
              scene_name TEXT,
              details TEXT,
              created_at INTEGER NOT NULL
            )`),
          ]);
        } catch (_) {}

        // A. Sự kiện Arrival (Khi lữ khách vừa bước lên tàu)
        if (data.event === 'arrival' && data.sessionId) {
          // Tự động đồng bộ hóa danh sách toàn bộ các địa danh từ client vào database
          if (Array.isArray(data.scenes) && data.scenes.length > 0) {
            const syncStmts = data.scenes
              .filter(s => s && s.id)
              .map(s => {
                return env.DB.prepare(`
                  INSERT INTO location_stats (location_id, name, visits, last_visited)
                  VALUES (?, ?, 0, ?)
                  ON CONFLICT(location_id) DO UPDATE SET
                    name = CASE WHEN excluded.name != '' THEN excluded.name ELSE location_stats.name END
                `).bind(s.id, s.name || s.id, now);
              });

            if (syncStmts.length > 0) {
              try {
                await env.DB.batch(syncStmts);
              } catch (_) {}
            }
          }

          const insertRes = await env.DB.prepare(
            'INSERT OR IGNORE INTO registered_sessions (session_id, first_seen) VALUES (?, ?)'
          ).bind(data.sessionId, now).run();

          const isNewVisitor = (insertRes.meta?.changes > 0) || (insertRes.changes > 0);

          if (isNewVisitor) {
            // Tăng tổng số lữ khách & chuyến đi
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('total_travelers', 1)
               ON CONFLICT(key) DO UPDATE SET value = value + 1`
            ).run();

            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('total_journeys', 1)
               ON CONFLICT(key) DO UPDATE SET value = value + 1`
            ).run();

            // Ghi nhận lượt ghé thăm ga ban đầu
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

            // Ghi nhận dòng nhật ký phiên vào session_logs
            const initialScenesJson = JSON.stringify([data.sceneId || 'unknown']);
            await env.DB.prepare(`
              INSERT INTO session_logs (
                session_id, first_seen, last_seen, duration_seconds,
                initial_scene, current_scene, scenes_visited, journey_count,
                country, device_type, status
              ) VALUES (?, ?, ?, 0, ?, ?, ?, 1, ?, ?, 'active')
              ON CONFLICT(session_id) DO UPDATE SET
                last_seen = excluded.last_seen,
                status = 'active'
            `).bind(
              data.sessionId, now, now,
              data.sceneId || '', data.sceneId || '',
              initialScenesJson, country, deviceType
            ).run();

            // Ghi nhận sự kiện bước lên tàu vào timeline journey_events
            await env.DB.prepare(`
              INSERT INTO journey_events (session_id, event_type, scene_id, scene_name, details, created_at)
              VALUES (?, 'arrival', ?, ?, ?, ?)
            `).bind(
              data.sessionId,
              data.sceneId || '',
              data.sceneName || data.sceneId || '',
              JSON.stringify({ weather: data.weather, country, deviceType }),
              now
            ).run();
          } else {
            // Gia hạn trạng thái active cho session_logs
            await env.DB.prepare(
              "UPDATE session_logs SET last_seen = ?, status = 'active' WHERE session_id = ?"
            ).bind(now, data.sessionId).run();
          }

          // Cập nhật active_sessions cho danh sách online
          await env.DB.prepare(
            `INSERT INTO active_sessions (session_id, last_seen, scene_id)
             VALUES (?, ?, ?)
             ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen, scene_id = excluded.scene_id`
          ).bind(data.sessionId, now, data.sceneId || '').run();

          return new Response(JSON.stringify({ success: true, isNewVisitor }), { headers: corsHeaders });
        }

        // B. Sự kiện Heartbeat (Định kỳ từ frontend)
        if (data.event === 'heartbeat' && data.sessionId) {
          // Phòng ngừa trường hợp arrival bị rớt mạng: đăng ký nếu chưa có
          const regRes = await env.DB.prepare(
            'INSERT OR IGNORE INTO registered_sessions (session_id, first_seen) VALUES (?, ?)'
          ).bind(data.sessionId, now).run();

          if ((regRes.meta?.changes > 0) || (regRes.changes > 0)) {
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('total_travelers', 1)
               ON CONFLICT(key) DO UPDATE SET value = value + 1`
            ).run();
          }

          // Gia hạn active session để giữ trạng thái online
          await env.DB.prepare(
            `INSERT INTO active_sessions (session_id, last_seen, scene_id)
             VALUES (?, ?, ?)
             ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen, scene_id = excluded.scene_id`
          ).bind(data.sessionId, now, data.sceneId || '').run();

          // Tính số phút chính xác dựa vào số giây thực tế trôi qua
          const elapsedSeconds = Number(data.seconds) || 45;
          const addedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
          const isRain = data.weather === 'rain' ? 1 : 0;
          const isMusic = data.isAudioPlaying ? 1 : 0;

          // Cập nhật community_stats
          await env.DB.prepare(
            `INSERT INTO community_stats (key, value) VALUES ('total_minutes', ?)
             ON CONFLICT(key) DO UPDATE SET value = value + excluded.value`
          ).bind(addedMinutes).run();

          if (isRain) {
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('rain_minutes', ?)
               ON CONFLICT(key) DO UPDATE SET value = value + excluded.value`
            ).bind(addedMinutes).run();
          }

          if (isMusic) {
            await env.DB.prepare(
              `INSERT INTO community_stats (key, value) VALUES ('music_minutes', ?)
               ON CONFLICT(key) DO UPDATE SET value = value + excluded.value`
            ).bind(addedMinutes).run();
          }

          // Cập nhật session_logs của phiên này
          await env.DB.prepare(`
            UPDATE session_logs SET
              last_seen = ?,
              duration_seconds = duration_seconds + ?,
              rain_minutes = rain_minutes + (CASE WHEN ? = 1 THEN ? ELSE 0 END),
              music_minutes = music_minutes + (CASE WHEN ? = 1 THEN ? ELSE 0 END),
              status = 'active'
            WHERE session_id = ?
          `).bind(
            now, elapsedSeconds,
            isRain, addedMinutes,
            isMusic, addedMinutes,
            data.sessionId
          ).run();

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // C. Sự kiện Chuyển Ga Tàu (Scene Change)
        if (data.event === 'scene_change' && data.toScene) {
          const sceneName = data.toSceneName || data.toScene;

          // Cộng dồn tổng số chuyến đi cộng đồng
          await env.DB.prepare(
            `INSERT INTO community_stats (key, value) VALUES ('total_journeys', 1)
             ON CONFLICT(key) DO UPDATE SET value = value + 1`
          ).run();

          // Cộng dồn lượt ghé thăm ga tàu
          await env.DB.prepare(
            `INSERT INTO location_stats (location_id, name, visits, last_visited)
             VALUES (?, ?, 1, ?)
             ON CONFLICT(location_id) DO UPDATE SET
               visits = visits + 1,
               name = CASE WHEN excluded.name != '' THEN excluded.name ELSE location_stats.name END,
               last_visited = excluded.last_visited`
          ).bind(data.toScene, sceneName, now).run();

          if (data.sessionId) {
            // Gia hạn active_sessions
            await env.DB.prepare(
              `INSERT INTO active_sessions (session_id, last_seen, scene_id)
               VALUES (?, ?, ?)
               ON CONFLICT(session_id) DO UPDATE SET last_seen = excluded.last_seen, scene_id = excluded.scene_id`
            ).bind(data.sessionId, now, data.toScene).run();

            // Cập nhật danh sách các ga đã ghé trong session_logs
            const currentLog = await env.DB.prepare(
              'SELECT scenes_visited FROM session_logs WHERE session_id = ?'
            ).bind(data.sessionId).first();

            let visitedList = [];
            try {
              visitedList = JSON.parse(currentLog?.scenes_visited || '[]');
            } catch (_) {}

            if (!visitedList.includes(data.toScene)) {
              visitedList.push(data.toScene);
            }

            await env.DB.prepare(`
              UPDATE session_logs SET
                last_seen = ?,
                current_scene = ?,
                scenes_visited = ?,
                journey_count = journey_count + 1,
                status = 'active'
              WHERE session_id = ?
            `).bind(now, data.toScene, JSON.stringify(visitedList), data.sessionId).run();

            // Ghi nhận sự kiện đổi cảnh vào journey_events
            await env.DB.prepare(`
              INSERT INTO journey_events (session_id, event_type, scene_id, scene_name, details, created_at)
              VALUES (?, 'scene_change', ?, ?, ?, ?)
            `).bind(
              data.sessionId,
              data.toScene,
              sceneName,
              JSON.stringify({ fromScene: data.fromScene }),
              now
            ).run();
          }

          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        // D. Sự kiện Kết Thúc Phiên (Session End)
        if (data.event === 'session_end') {
          if (data.sessionId) {
            const finalDuration = Number(data.durationSeconds) || 0;

            // Xóa khỏi active_sessions để cập nhật số người online
            await env.DB.prepare('DELETE FROM active_sessions WHERE session_id = ?').bind(data.sessionId).run();

            // Cập nhật trạng thái kết thúc trong session_logs
            await env.DB.prepare(`
              UPDATE session_logs SET
                last_seen = ?,
                duration_seconds = CASE WHEN ? > duration_seconds THEN ? ELSE duration_seconds END,
                status = 'ended'
              WHERE session_id = ?
            `).bind(now, finalDuration, finalDuration, data.sessionId).run();

            // Ghi sự kiện rời tàu vào timeline
            await env.DB.prepare(`
              INSERT INTO journey_events (session_id, event_type, scene_id, scene_name, details, created_at)
              VALUES (?, 'session_end', ?, ?, ?, ?)
            `).bind(
              data.sessionId,
              data.sceneId || '',
              '',
              JSON.stringify({ durationSeconds: finalDuration }),
              now
            ).run();
          }
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // 4. GET /api/sessions : Xem danh sách nhật ký các phiên gần nhất
      if (url.pathname === '/api/sessions' && request.method === 'GET') {
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
        const rows = await env.DB.prepare(
          'SELECT * FROM session_logs ORDER BY last_seen DESC LIMIT ?'
        ).bind(limit).all();

        return new Response(JSON.stringify(rows.results || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 5. GET /api/sessions/timeline : Xem dòng thời gian chi tiết của 1 session
      if (url.pathname === '/api/sessions/timeline' && request.method === 'GET') {
        const sessionId = url.searchParams.get('sessionId') || '';
        if (!sessionId) {
          return new Response(JSON.stringify({ error: 'Thiếu tham số sessionId' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const events = await env.DB.prepare(
          'SELECT * FROM journey_events WHERE session_id = ? ORDER BY created_at ASC LIMIT 100'
        ).bind(sessionId).all();

        return new Response(JSON.stringify(events.results || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 6. POST /api/feedback : Tiếp nhận góp ý từ người dùng
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

      // 7. GET /api/feedback : Xem danh sách góp ý đã nhận
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
