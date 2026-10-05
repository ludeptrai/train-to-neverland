// Cloudflare Worker - API cho "Nhật ký hành trình vô tận"
// Binding D1: DB   |   Biến môi trường: ALLOWED_ORIGIN (vd https://username.github.io)

const ONLINE_WINDOW_SEC = 60;       // heartbeat trong 60s => đang trực tuyến
const MAX_EVENTS_PER_REQ = 50;
const MAX_DELTA_SEC = 120;          // chặn client gửi delta bất thường mỗi lần

const now = () => Math.floor(Date.now() / 1000);
const clampInt = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));
const str = (v, max = 64) => (v == null ? null : String(v).slice(0, max));

function cors(env, req) {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env?.ALLOWED_ORIGIN || "*").split(",").map(s => s.trim());
  const ok = allowed.includes("*") || allowed.includes(origin) || !env?.ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": ok ? (allowed.includes("*") ? "*" : origin) : allowed[0] || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

export default {
  async fetch(req, env) {
    const h = cors(env, req);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });

    const url = new URL(req.url);
    try {
      if (req.method === "POST" && url.pathname === "/api/session/start")
        return json(await startSession(env, req), 200, h);
      if (req.method === "POST" && url.pathname === "/api/session/track")
        return json(await track(env, req), 200, h);
      if (req.method === "GET" && url.pathname === "/api/stats")
        return json(await getStats(env, url), 200, {
          ...h, "Cache-Control": "public, max-age=15",
        });
      if (req.method === "POST" && url.pathname === "/api/feedback")
        return json(await handleFeedback(env, req), 200, h);
      if (req.method === "GET" && url.pathname === "/api/feedback")
        return json(await getFeedback(env, req), 200, h);
      return json({ error: "not_found" }, 404, h);
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      return json({ error: e.message || "server_error" }, status, h);
    }
  },
};

class HttpError extends Error {
  constructor(status, msg) { super(msg); this.status = status; }
}

async function readBody(req) {
  // sendBeacon gửi text/plain nên tự parse
  const text = await req.text();
  try { return JSON.parse(text); } catch { throw new HttpError(400, "bad_json"); }
}

// ------------------------------------------------------------
// POST /api/session/start
// body: { session_id, visitor_id, station_id, train_id, weather, time_of_day,
//         auto_mode, language, device_type, screen_w, screen_h, referrer_host }
// ------------------------------------------------------------
async function startSession(env, req) {
  const b = await readBody(req);
  if (!b.session_id || !b.visitor_id) throw new HttpError(400, "missing_ids");
  const t = now();
  const sid = str(b.session_id), vid = str(b.visitor_id);
  const country = req.cf?.country || null;

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO visitors (id, first_seen_at, last_seen_at, session_count)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(id) DO UPDATE SET last_seen_at = excluded.last_seen_at,
                                     session_count = session_count + 1`
    ).bind(vid, t, t),
    env.DB.prepare(
      `INSERT OR IGNORE INTO sessions
        (id, visitor_id, started_at, last_seen_at, first_station_id, first_train_id,
         auto_mode_start, language, device_type, screen_w, screen_h, referrer_host, country)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      sid, vid, t, t, str(b.station_id), str(b.train_id), b.auto_mode ? 1 : 0,
      str(b.language, 16), str(b.device_type, 16),
      clampInt(b.screen_w, 10000), clampInt(b.screen_h, 10000),
      str(b.referrer_host, 128), country
    ),
  ]);

  // Dữ liệu cá nhân để hiện ở khung "Hành trình của bạn"
  const me = await env.DB.prepare(
    `SELECT total_active_sec, session_count FROM visitors WHERE id = ?`
  ).bind(vid).first();

  return { ok: true, server_time: t, me };
}

// ------------------------------------------------------------
// POST /api/session/track
// body: {
//   session_id, visitor_id,
//   delta: { active_sec, rain_sec, lofi_sec },     // phần tăng thêm từ lần gửi trước
//   events: [{ id, type, station_id, train_id, weather, time_of_day,
//              trigger, value, payload, ts }],
//   end: true|false
// }
// ------------------------------------------------------------
async function track(env, req) {
  const b = await readBody(req);
  const sid = str(b.session_id), vid = str(b.visitor_id);
  if (!sid || !vid) throw new HttpError(400, "missing_ids");

  const sess = await env.DB.prepare(
    `SELECT id FROM sessions WHERE id = ? AND visitor_id = ?`
  ).bind(sid, vid).first();
  if (!sess) throw new HttpError(404, "session_not_found");

  const t = now();
  const d = b.delta || {};
  const active = clampInt(d.active_sec, MAX_DELTA_SEC);
  const rain = Math.min(clampInt(d.rain_sec, MAX_DELTA_SEC), active || MAX_DELTA_SEC);
  const lofi = Math.min(clampInt(d.lofi_sec, MAX_DELTA_SEC), active || MAX_DELTA_SEC);
  const events = Array.isArray(b.events) ? b.events.slice(0, MAX_EVENTS_PER_REQ) : [];

  const stmts = [];

  // 1) Cập nhật session + visitor
  stmts.push(env.DB.prepare(
    `UPDATE sessions SET last_seen_at = ?, active_sec = active_sec + ?,
            rain_sec = rain_sec + ?, lofi_sec = lofi_sec + ?
     WHERE id = ?`
  ).bind(t, active, rain, lofi, sid));
  stmts.push(env.DB.prepare(
    `UPDATE visitors SET last_seen_at = ?, total_active_sec = total_active_sec + ? WHERE id = ?`
  ).bind(t, active, vid));

  // 2) Ghi event + xử lý dừng ga
  for (const e of events) {
    if (!e || !e.id || !e.type) continue;
    const ts = Math.min(t, clampInt(e.ts, t) || t);
    const trig = e.trigger === "auto" || e.trigger === "user" ? e.trigger : null;

    stmts.push(env.DB.prepare(
      `INSERT OR IGNORE INTO session_events
        (id, session_id, event_type, station_id, train_id, weather, time_of_day,
         trigger, value, payload, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      str(e.id), sid, str(e.type, 32), str(e.station_id), str(e.train_id),
      str(e.weather, 16), str(e.time_of_day, 16), trig, str(e.value, 64),
      e.payload ? JSON.stringify(e.payload).slice(0, 1000) : null, ts
    ));

    if (e.type === "station_arrive" && e.station_id) {
      // đóng lượt dừng trước
      // event_id != ? : nếu event bị gửi lại thì không đóng nhầm lượt dừng đang mở
      stmts.push(env.DB.prepare(
        `UPDATE station_visits SET left_at = ?, dwell_sec = MAX(0, ? - arrived_at)
         WHERE session_id = ? AND left_at IS NULL
           AND NOT EXISTS (SELECT 1 FROM station_visits WHERE event_id = ?)
           AND EXISTS (SELECT 1 FROM stations WHERE id = ?)`
      ).bind(ts, ts, sid, str(e.id), str(e.station_id)));
      // mở lượt dừng mới; event_id UNIQUE + OR IGNORE chặn trùng, EXISTS chặn ga lạ
      stmts.push(env.DB.prepare(
        `INSERT OR IGNORE INTO station_visits
          (event_id, session_id, station_id, train_id, weather, time_of_day, trigger, arrived_at)
         SELECT ?,?,?,?,?,?,?,?
         WHERE EXISTS (SELECT 1 FROM stations WHERE id = ?)`
      ).bind(
        str(e.id), sid, str(e.station_id), str(e.train_id), str(e.weather, 16),
        str(e.time_of_day, 16), trig || "init", ts, str(e.station_id)
      ));
      stmts.push(env.DB.prepare(
        `UPDATE sessions SET station_count = (SELECT COUNT(*) FROM station_visits WHERE session_id = ?)
         WHERE id = ?`
      ).bind(sid, sid));
    }
  }

  // 3) Kết thúc session
  if (b.end) {
    stmts.push(env.DB.prepare(
      `UPDATE station_visits SET left_at = ?, dwell_sec = MAX(0, ? - arrived_at)
       WHERE session_id = ? AND left_at IS NULL`
    ).bind(t, t, sid));
    stmts.push(env.DB.prepare(`UPDATE sessions SET ended_at = ? WHERE id = ?`).bind(t, sid));
  }

  await env.DB.batch(stmts);
  return { ok: true };
}

// ------------------------------------------------------------
// GET /api/stats?visitor_id=...
// ------------------------------------------------------------
async function getStats(env, url) {
  const vid = url.searchParams.get("visitor_id");
  const t = now();

  const [totals, online, top, tod, me, stationCount] = await env.DB.batch([
    env.DB.prepare(
      `SELECT
         (SELECT COUNT(*) FROM visitors)                         AS visitors,
         (SELECT COUNT(*) FROM station_visits)                   AS trips,
         (SELECT COALESCE(SUM(active_sec),0) FROM sessions)      AS active_sec,
         (SELECT COALESCE(SUM(rain_sec),0)   FROM sessions)      AS rain_sec,
         (SELECT COALESCE(SUM(lofi_sec),0)   FROM sessions)      AS lofi_sec`
    ),
    env.DB.prepare(
      `SELECT COUNT(*) AS n FROM sessions WHERE ended_at IS NULL AND last_seen_at >= ?`
    ).bind(t - ONLINE_WINDOW_SEC),
    env.DB.prepare(
      `SELECT s.id, s.name, COUNT(v.id) AS visits
       FROM stations s LEFT JOIN station_visits v ON v.station_id = s.id
       WHERE s.is_active = 1
       GROUP BY s.id ORDER BY visits DESC, s.sort_order LIMIT 8`
    ),
    env.DB.prepare(
      `SELECT value AS time_of_day, COUNT(*) AS n
       FROM session_events WHERE event_type = 'time_select' AND value IS NOT NULL
       GROUP BY value`
    ),
    vid
      ? env.DB.prepare(
          `SELECT total_active_sec, session_count FROM visitors WHERE id = ?`
        ).bind(vid)
      : env.DB.prepare(`SELECT NULL AS total_active_sec, NULL AS session_count WHERE 0`),
    env.DB.prepare(
      `SELECT COUNT(DISTINCT station_id) AS n FROM station_visits`
    ),
  ]);

  const tt = totals.results[0];
  const todRows = tod.results;
  const todTotal = todRows.reduce((a, r) => a + r.n, 0) || 1;
  const todPct = Object.fromEntries(
    ["dawn", "day", "dusk", "night"].map(k => [
      k, Math.round(((todRows.find(r => r.time_of_day === k)?.n || 0) / todTotal) * 100),
    ])
  );

  // Tính tỷ lệ % cho top ga
  const topRows = top.results || [];
  const totalStationVisits = topRows.reduce((sum, r) => sum + (r.visits || 0), 0);
  const formattedTopStations = topRows.map(r => ({
    id: r.id,
    name: r.name,
    visits: r.visits,
    percentage: totalStationVisits > 0 ? Math.round((r.visits / totalStationVisits) * 100) : 0,
  }));

  return {
    online: online.results[0].n,
    totals: {
      visitors: tt.visitors,
      trips: tt.trips,
      train_minutes: Math.floor(tt.active_sec / 60),
      rain_minutes: Math.floor(tt.rain_sec / 60),
      lofi_hours: Math.round((tt.lofi_sec / 3600) * 10) / 10,
      stations_explored: stationCount.results[0].n,
    },
    top_stations: formattedTopStations,
    time_of_day_pct: todPct,
    me: me.results[0] || null,
    generated_at: t,
  };
}

// ------------------------------------------------------------
// POST /api/feedback & GET /api/feedback
// ------------------------------------------------------------
async function handleFeedback(env, req) {
  const b = await readBody(req);
  const name = str(b.name, 100) || "Lữ khách ẩn danh";
  const contact = str(b.contact, 100) || "";
  const message = str(b.message, 2000);
  if (!message) throw new HttpError(400, "missing_message");
  const t = now();
  await env.DB.prepare(
    `INSERT INTO feedbacks (name, contact, message, created_at) VALUES (?, ?, ?, ?)`
  ).bind(name, contact, message, t).run();
  return { ok: true, message: "Cảm ơn lữ khách đã gửi lời nhắn lại nhà ga!" };
}

async function getFeedback(env, req) {
  const res = await env.DB.prepare(
    `SELECT id, name, contact, message, created_at FROM feedbacks ORDER BY created_at DESC LIMIT 50`
  ).all();
  return { ok: true, feedbacks: res.results || [] };
}
