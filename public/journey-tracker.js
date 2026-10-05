/* journey-tracker.js
 * Ghi log session + hoạt động lên Cloudflare Worker (D1) và hiển thị bảng thống kê.
 * Nhúng: <script src="journey-tracker.js"></script>
 */
(function (global) {
  "use strict";

  const API_BASE = "https://journey-api.USERNAME.workers.dev"; // <-- đổi thành URL Worker của bạn
  const FLUSH_MS = 15000;      // gửi gói log mỗi 15s
  const STATS_MS = 30000;      // làm mới bảng thống kê mỗi 30s
  const LS_VISITOR = "journey_visitor_id";

  // ---------- tiện ích ----------
  const uuid = () =>
    (crypto.randomUUID ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 3) | 8).toString(16);
        }));
  const nowSec = () => Math.floor(Date.now() / 1000);
  const fmtNum = n => Number(n || 0).toLocaleString("vi-VN");

  function getVisitorId() {
    try {
      let id = localStorage.getItem(LS_VISITOR);
      if (!id) { id = uuid(); localStorage.setItem(LS_VISITOR, id); }
      return id;
    } catch { return uuid(); } // chế độ ẩn danh chặn localStorage
  }

  function deviceType() {
    const w = Math.min(screen.width, screen.height);
    if (/Mobi|Android/i.test(navigator.userAgent) && w < 768) return "mobile";
    return w < 1024 ? "tablet" : "desktop";
  }

  function fmtDuration(sec) {
    sec = Math.floor(sec);
    if (sec < 60) return sec + "s";
    const m = Math.floor(sec / 60), s = sec % 60;
    if (m < 60) return m + "p " + String(s).padStart(2, "0") + "s";
    return Math.floor(m / 60) + "g " + (m % 60) + "p";
  }
  function fmtMinutes(sec) {
    const m = Math.floor(sec / 60);
    return m < 60 ? m + " phút" : Math.floor(m / 60) + " giờ " + (m % 60) + " phút";
  }

  // ---------- Tracker ----------
  const Tracker = {
    visitorId: null,
    sessionId: null,
    started: false,
    startedAt: 0,
    baseTotalSec: 0,           // tổng thời gian đã gắn bó từ các session trước (server trả về)
    queue: [],                 // event chưa gửi
    pending: { active_sec: 0, rain_sec: 0, lofi_sec: 0 },
    audio: { rain: false, lofi: false },
    current: { station_id: null, train_id: null, weather: null, time_of_day: null },
    activeSecTotal: 0,         // active của session này (client)
    _tick: null, _flush: null, _lastTick: 0,

    /** Gọi 1 lần khi trang sẵn sàng.
     *  init({ station_id, train_id, weather, time_of_day, auto_mode })  */
    async init(initial = {}) {
      if (this.started) return;
      this.started = true;
      this.visitorId = getVisitorId();
      this.sessionId = uuid();
      this.startedAt = Date.now();
      Object.assign(this.current, {
        station_id: initial.station_id || null, train_id: initial.train_id || null,
        weather: initial.weather || null, time_of_day: initial.time_of_day || null,
      });

      try {
        const res = await this._post("/api/session/start", {
          session_id: this.sessionId, visitor_id: this.visitorId,
          station_id: this.current.station_id, train_id: this.current.train_id,
          weather: this.current.weather, time_of_day: this.current.time_of_day,
          auto_mode: !!initial.auto_mode,
          language: navigator.language, device_type: deviceType(),
          screen_w: screen.width, screen_h: screen.height,
          referrer_host: document.referrer ? new URL(document.referrer).hostname : null,
        });
        this.baseTotalSec = (res.me && res.me.total_active_sec) || 0;
      } catch (e) { console.warn("[tracker] start failed", e); }

      // ga đầu tiên
      if (this.current.station_id) this.stationArrive(this.current, "init");

      // đếm giờ: chỉ cộng khi tab đang hiển thị
      this._lastTick = Date.now();
      this._tick = setInterval(() => this._onTick(), 1000);
      this._flush = setInterval(() => this.flush(), FLUSH_MS);

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.flush(false, true);
        else this._lastTick = Date.now();
      });
      window.addEventListener("pagehide", () => this.flush(true, true));
    },

    _onTick() {
      const t = Date.now();
      const dt = Math.min(2, (t - this._lastTick) / 1000); // chặn nhảy cóc khi máy sleep
      this._lastTick = t;
      if (document.visibilityState !== "visible") return;
      this.activeSecTotal += dt;
      this.pending.active_sec += dt;
      if (this.audio.rain) this.pending.rain_sec += dt;
      if (this.audio.lofi) this.pending.lofi_sec += dt;
      this._emit("tick");
    },

    // ----- API log cho phần giao diện gọi -----
    /** Tàu dừng ở ga mới. trigger: 'auto' | 'user' | 'init' */
    stationArrive({ station_id, train_id, weather, time_of_day }, trigger = "user") {
      Object.assign(this.current, {
        station_id: station_id ?? this.current.station_id,
        train_id: train_id ?? this.current.train_id,
        weather: weather ?? this.current.weather,
        time_of_day: time_of_day ?? this.current.time_of_day,
      });
      this._event("station_arrive", { trigger });
      this._emit("station");
    },
    trainChange(train_id) {
      this.current.train_id = train_id;
      this._event("train_change", { trigger: "user" });
      this._emit("train");
    },
    weatherChange(weather) {
      this.current.weather = weather;
      this._event("weather_change", { trigger: "user", value: weather });
      this._emit("weather");
    },
    /** Người dùng chọn thời điểm: 'dawn' | 'day' | 'dusk' | 'night' */
    timeSelect(time_of_day) {
      this.current.time_of_day = time_of_day;
      this._event("time_select", { trigger: "user", value: time_of_day });
      this._emit("time");
    },
    autoToggle(on) { this._event("auto_toggle", { trigger: "user", value: on ? "on" : "off" }); },
    /** kind: 'rain' | 'lofi' */
    audioStart(kind) {
      if (this.audio[kind]) return;
      this.audio[kind] = true;
      this._event("audio_start", { value: kind });
    },
    audioStop(kind) {
      if (!this.audio[kind]) return;
      this.audio[kind] = false;
      this._event("audio_stop", { value: kind });
    },
    volumeChange(kind, v) { this._event("volume_change", { value: kind + ":" + Number(v).toFixed(2) }); },

    // ----- gửi dữ liệu -----
    _event(type, extra = {}) {
      this.queue.push({
        id: uuid(), type, ts: nowSec(),
        station_id: this.current.station_id, train_id: this.current.train_id,
        weather: this.current.weather, time_of_day: this.current.time_of_day,
        trigger: extra.trigger || null, value: extra.value || null,
        payload: extra.payload || null,
      });
      if (this.queue.length >= 30) this.flush();
    },

    flush(isEnd = false, useBeacon = false) {
      if (!this.started) return;
      const delta = {
        active_sec: Math.round(this.pending.active_sec),
        rain_sec: Math.round(this.pending.rain_sec),
        lofi_sec: Math.round(this.pending.lofi_sec),
      };
      const events = this.queue.splice(0, 50);
      if (!events.length && !delta.active_sec && !isEnd) return;

      // giữ lại phần lẻ giây chưa gửi
      this.pending.active_sec -= delta.active_sec;
      this.pending.rain_sec -= delta.rain_sec;
      this.pending.lofi_sec -= delta.lofi_sec;

      const body = {
        session_id: this.sessionId, visitor_id: this.visitorId,
        delta, events, end: !!isEnd,
      };

      if (useBeacon && navigator.sendBeacon) {
        // text/plain để tránh preflight; Worker tự parse JSON
        const ok = navigator.sendBeacon(API_BASE + "/api/session/track", JSON.stringify(body));
        if (!ok) this._requeue(events, delta);
        return;
      }
      this._post("/api/session/track", body, true).catch(() => this._requeue(events, delta));
    },

    _requeue(events, delta) {
      // gửi lỗi -> trả lại hàng đợi (event có id nên server chống trùng)
      this.queue.unshift(...events);
      this.pending.active_sec += delta.active_sec;
      this.pending.rain_sec += delta.rain_sec;
      this.pending.lofi_sec += delta.lofi_sec;
    },

    async _post(path, body, keepalive = false) {
      const res = await fetch(API_BASE + path, {
        method: "POST", keepalive,
        headers: { "Content-Type": "text/plain" }, // simple request, không preflight
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    },

    // ----- dữ liệu cho khung "Hành trình của bạn" -----
    sessionSeconds() { return this.activeSecTotal; },
    totalSeconds() { return this.baseTotalSec + this.activeSecTotal; },

    _listeners: [],
    onChange(fn) { this._listeners.push(fn); },
    _emit(kind) { this._listeners.forEach(fn => fn(kind, this)); },
  };

  // ---------- Hiển thị thống kê ----------
  /* HTML dùng thuộc tính data-stat / data-me, ví dụ:
   *   <span data-stat="online"></span>
   *   <span data-stat="visitors"></span> <span data-stat="trips"></span>
   *   <span data-stat="train_minutes"></span> <span data-stat="rain_minutes"></span>
   *   <span data-stat="lofi_hours"></span> <span data-stat="stations_explored"></span>
   *   <div id="top-stations"></div>
   *   <span data-tod="dawn|day|dusk|night"></span>
   *   <span data-me="session_time|total_time|station|train|weather|time_of_day"></span>
   */
  const LABELS = {
    weather: { clear: "Trời quang", rain: "Trời mưa", cloudy: "Nhiều mây", snow: "Tuyết rơi" },
    tod: { dawn: "Bình minh", day: "Ban ngày", dusk: "Hoàng hôn", night: "Đêm sao" },
  };
  // Tên ga/tàu hiển thị: đăng ký từ phía trang (id -> tên)
  const NAMES = { stations: {}, trains: {} };

  const Stats = {
    registerNames({ stations = {}, trains = {} }) {
      Object.assign(NAMES.stations, stations);
      Object.assign(NAMES.trains, trains);
    },

    async refresh() {
      try {
        const url = `${API_BASE}/api/stats?visitor_id=${encodeURIComponent(Tracker.visitorId || getVisitorId())}`;
        const res = await fetch(url);
        if (!res.ok) return;
        this.render(await res.json());
      } catch (e) { console.warn("[stats]", e); }
    },

    render(d) {
      const set = (sel, text) =>
        document.querySelectorAll(sel).forEach(el => (el.textContent = text));

      set('[data-stat="online"]', fmtNum(d.online));
      set('[data-stat="visitors"]', fmtNum(d.totals.visitors));
      set('[data-stat="trips"]', fmtNum(d.totals.trips));
      set('[data-stat="train_minutes"]', fmtNum(d.totals.train_minutes));
      set('[data-stat="rain_minutes"]', fmtNum(d.totals.rain_minutes));
      set('[data-stat="lofi_hours"]', fmtNum(d.totals.lofi_hours));
      set('[data-stat="stations_explored"]', fmtNum(d.totals.stations_explored));

      // Top ga + thanh tiến độ
      const box = document.getElementById("top-stations");
      if (box) {
        const max = Math.max(1, ...d.top_stations.map(s => s.visits));
        box.innerHTML = d.top_stations.map((s, i) => `
          <div class="top-row">
            <div class="top-head">
              <span>${i + 1}. ${escapeHtml(s.name)}</span>
              <span>${fmtNum(s.visits)} lượt</span>
            </div>
            <div class="bar"><div class="bar-fill" style="width:${(s.visits / max) * 100}%"></div></div>
          </div>`).join("");
      }

      // Thời điểm được chọn
      Object.entries(d.time_of_day_pct).forEach(([k, v]) =>
        set(`[data-tod="${k}"]`, v + "%"));

      // tổng thời gian cá nhân từ server (cập nhật gốc)
      if (d.me && typeof d.me.total_active_sec === "number" && !Tracker.baseTotalSec)
        Tracker.baseTotalSec = d.me.total_active_sec;
    },

    renderMe() {
      const set = (k, text) =>
        document.querySelectorAll(`[data-me="${k}"]`).forEach(el => (el.textContent = text));
      const c = Tracker.current;
      set("session_time", fmtDuration(Tracker.sessionSeconds()));
      set("total_time", fmtMinutes(Tracker.totalSeconds()));
      set("station", NAMES.stations[c.station_id] || c.station_id || "—");
      set("train", NAMES.trains[c.train_id] || c.train_id || "—");
      set("weather", LABELS.weather[c.weather] || c.weather || "—");
      set("time_of_day", LABELS.tod[c.time_of_day] || c.time_of_day || "—");
    },

    start() {
      this.refresh();
      setInterval(() => this.refresh(), STATS_MS);
      Tracker.onChange(() => this.renderMe());
      this.renderMe();
    },
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  global.JourneyTracker = Tracker;
  global.JourneyStats = Stats;
})(window);

/* ---------------- Cách dùng trong trang chính ----------------
JourneyStats.registerNames({
  stations: { "ho-chi-minh": "TP. Hồ Chí Minh", "da-lat": "Đà Lạt", ... },
  trains:   { "future-bullet": "Tàu Cao Tốc Tương Lai" },
});

await JourneyTracker.init({
  station_id: "ho-chi-minh", train_id: "future-bullet",
  weather: "clear", time_of_day: "dusk", auto_mode: true,
});
JourneyStats.start();

// Gắn vào các hành động hiện có:
//   tàu tự chuyển ga      -> JourneyTracker.stationArrive({ station_id }, "auto")
//   người dùng chọn ga    -> JourneyTracker.stationArrive({ station_id }, "user")
//   chọn tàu              -> JourneyTracker.trainChange(id)
//   nút Trời quang/mưa    -> JourneyTracker.weatherChange("clear")
//   nút Hoàng hôn...      -> JourneyTracker.timeSelect("dusk")
//   nút Tự chuyển ga      -> JourneyTracker.autoToggle(true/false)
//   bật/tắt mưa, lo-fi    -> JourneyTracker.audioStart("rain") / audioStop("lofi")
*/
