/**
 * AnalyticsService - Trình quản lý Thống kê & Nhật ký Hành trình
 * Đồng bộ theo giao thức Cloudflare Worker + D1 (journey-tracker)
 * 
 * Thiết kế theo tiêu chuẩn:
 * 1. ZERO PERMISSION: Hoàn toàn không yêu cầu bất kỳ quyền nào từ người dùng (Không GPS, không cookie định danh, không thông báo).
 * 2. ZERO FPS OVERHEAD: Flush ngầm mỗi 15s, heartbeat chính xác không giật lag 60 FPS, navigator.sendBeacon không chặn main thread.
 * 3. ANONYMOUS: Tạo visitor ID ẩn danh trong localStorage, session ID uuid cho từng phiên.
 */

export interface CommunityStats {
  travelers: number;        // Tổng số lữ khách (visitors)
  journeys: number;         // Tổng số chuyến hành trình đã lăn bánh (trips / station_visits)
  totalMinutes: number;     // Tổng thời gian mọi người đã ở trên tàu (phút)
  activeNow: number;        // Số hành khách đang cùng trên tàu thời điểm này (online)
  rainMinutes: number;      // Số phút đã lắng nghe tiếng mưa
  musicHours: number;       // Số giờ nghe nhạc Lo-Fi
  musicMinutes?: number;    // Số phút nghe nhạc Lo-Fi
  topDestinations: Array<{ id: string; name: string; visits: number; percentage: number }>;
  timeDistribution: {
    dawn: number;
    day: number;
    sunset: number;
    night: number;
  };
}

export interface PersonalStats {
  currentSessionSeconds: number;
  totalVisitedScenes: number;
  totalLifetimeMinutes: number;
  favoriteScene?: string;
}

interface TrackEvent {
  id: string;
  type: string;
  station_id?: string | null;
  train_id?: string | null;
  weather?: string | null;
  time_of_day?: string | null;
  trigger?: 'auto' | 'user' | 'init' | null;
  value?: string | null;
  payload?: Record<string, unknown> | null;
  ts: number;
}

const uuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
};

const getVisitorId = (): string => {
  const LS_VISITOR = 'journey_visitor_id';
  try {
    let id = localStorage.getItem(LS_VISITOR);
    if (!id) {
      id = uuid();
      localStorage.setItem(LS_VISITOR, id);
    }
    return id;
  } catch {
    return uuid();
  }
};

const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  const w = Math.min(screen.width, screen.height);
  if (/Mobi|Android/i.test(navigator.userAgent) && w < 768) return 'mobile';
  return w < 1024 ? 'tablet' : 'desktop';
};

class AnalyticsService {
  private visitorId: string;
  private sessionId: string;
  private started: boolean = false;
  private baseTotalSec: number = 0;
  private activeSecTotal: number = 0;
  private lastTickTime: number = Date.now();

  private pendingDelta = {
    active_sec: 0,
    rain_sec: 0,
    lofi_sec: 0,
  };

  private eventQueue: TrackEvent[] = [];
  private visitedSceneIds: Set<string> = new Set();

  private currentSceneId: string = 'hochiminhcity';
  private currentTrainId: string = 'futuristic_train';
  private currentWeather: string = 'clear';
  private currentTimeOfDay: string = 'sunset';
  private isAudioPlaying: boolean = false;

  private apiUrl: string =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_STATS_API_URL) ||
    '';

  // Seeded Community Stats khi chưa kết nối backend hoặc offline
  private fallbackCommunityStats: CommunityStats = {
    travelers: 12482,
    journeys: 38721,
    totalMinutes: 284620,
    activeNow: 127,
    rainMinutes: 42380,
    musicHours: 3140,
    musicMinutes: 188400,
    topDestinations: [
      { id: 'hochiminhcity', name: 'TP. Hồ Chí Minh', visits: 9382, percentage: 21 },
      { id: 'dalat', name: 'Đà Lạt', visits: 8421, percentage: 19 },
      { id: 'hoian', name: 'Phố Cổ Hội An', visits: 7231, percentage: 16 },
      { id: 'hanoi', name: 'Hà Nội 36 Phố Phường', visits: 6410, percentage: 14 },
      { id: 'halong', name: 'Vịnh Hạ Long', visits: 5120, percentage: 11 },
      { id: 'hagiang', name: 'Hà Giang', visits: 4680, percentage: 10 },
      { id: 'ninhbinh', name: 'Ninh Bình', visits: 4190, percentage: 9 },
      { id: 'nhatrang', name: 'Biển Nha Trang', visits: 3887, percentage: 9 },
    ],
    timeDistribution: {
      dawn: 14,
      day: 39,
      sunset: 21,
      night: 26,
    },
  };

  private localSessionAccumulator = {
    addedJourneys: 0,
    addedRainMinutes: 0,
    addedMusicMinutes: 0,
    sceneVisits: {} as Record<string, number>,
  };

  constructor() {
    this.visitorId = getVisitorId();
    this.sessionId = uuid();
    this.initTimerAndFlush();
    this.setupPageUnloadListener();
  }

  /**
   * Khởi động bộ đếm thời gian và tự động flush định kỳ mỗi 15 giây
   */
  private initTimerAndFlush() {
    if (typeof window === 'undefined') return;

    this.lastTickTime = Date.now();

    // Bộ đếm thời gian thực: chỉ đếm khi tab đang hiển thị
    window.setInterval(() => {
      const now = Date.now();
      const dt = Math.min(2, (now - this.lastTickTime) / 1000);
      this.lastTickTime = now;

      if (document.visibilityState !== 'visible') return;

      this.activeSecTotal += dt;
      this.pendingDelta.active_sec += dt;

      if (this.currentWeather === 'rain') {
        this.pendingDelta.rain_sec += dt;
        this.localSessionAccumulator.addedRainMinutes += dt / 60;
      }
      if (this.isAudioPlaying) {
        this.pendingDelta.lofi_sec += dt;
        this.localSessionAccumulator.addedMusicMinutes += dt / 60;
      }
    }, 1000);

    // Tự động flush gói log về server mỗi 15 giây
    window.setInterval(() => {
      this.flushQueue(false, false);
    }, 15000);
  }

  /**
   * Lắng nghe sự kiện rời trang / chuyển tab để flush dữ liệu cuối cùng
   */
  private setupPageUnloadListener() {
    if (typeof window === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushQueue(false, true);
      } else {
        this.lastTickTime = Date.now();
      }
    });

    window.addEventListener('pagehide', () => {
      this.flushQueue(true, true);
    });
  }

  /**
   * Khởi tạo phiên của lữ khách ngay khi vừa vào trang web:
   * Gửi /api/session/start lên Cloudflare Worker D1
   */
  public async initSession(
    sceneId: string,
    sceneName?: string,
    weather?: string,
    allScenes?: Array<{ id: string; name: string }>,
    trainId?: string,
    timeOfDay?: string,
    autoMode: boolean = true
  ) {
    if (this.started) return;
    this.started = true;

    this.currentSceneId = sceneId;
    if (weather) this.currentWeather = weather;
    if (trainId) this.currentTrainId = trainId;
    if (timeOfDay) this.currentTimeOfDay = timeOfDay;

    this.visitedSceneIds.add(sceneId);
    this.localSessionAccumulator.sceneVisits[sceneId] = (this.localSessionAccumulator.sceneVisits[sceneId] || 0) + 1;
    this.localSessionAccumulator.addedJourneys += 1;

    if (Array.isArray(allScenes)) {
      for (const s of allScenes) {
        if (!this.fallbackCommunityStats.topDestinations.some((d) => d.id === s.id)) {
          this.fallbackCommunityStats.topDestinations.push({
            id: s.id,
            name: s.name || s.id,
            visits: 0,
            percentage: 0,
          });
        }
      }
    }

    // Ghi nhận ga đầu tiên
    this.enqueueEvent('station_arrive', {
      station_id: sceneId,
      train_id: this.currentTrainId,
      weather: this.currentWeather,
      time_of_day: this.currentTimeOfDay,
      trigger: 'init',
      payload: sceneName ? { sceneName } : null,
    });

    if (!this.apiUrl) return;

    try {
      const res = await fetch(`${this.apiUrl}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: this.sessionId,
          visitor_id: this.visitorId,
          station_id: this.currentSceneId,
          train_id: this.currentTrainId,
          weather: this.currentWeather,
          time_of_day: this.currentTimeOfDay,
          auto_mode: autoMode,
          language: navigator.language,
          device_type: detectDeviceType(),
          screen_w: screen.width,
          screen_h: screen.height,
          referrer_host: document.referrer ? new URL(document.referrer).hostname : null,
        }),
        keepalive: true,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.me && typeof data.me.total_active_sec === 'number') {
          this.baseTotalSec = data.me.total_active_sec;
        }
      }
    } catch {
      // Offline fallback
    }
  }

  /**
   * Đưa 1 event vào hàng đợi để gửi hàng loạt
   */
  private enqueueEvent(type: string, extra: Partial<TrackEvent> = {}) {
    this.eventQueue.push({
      id: uuid(),
      type,
      ts: Math.floor(Date.now() / 1000),
      station_id: extra.station_id ?? this.currentSceneId,
      train_id: extra.train_id ?? this.currentTrainId,
      weather: extra.weather ?? this.currentWeather,
      time_of_day: extra.time_of_day ?? this.currentTimeOfDay,
      trigger: extra.trigger || 'user',
      value: extra.value || null,
      payload: extra.payload || null,
    });

    if (this.eventQueue.length >= 30) {
      this.flushQueue(false, false);
    }
  }

  /**
   * Flush hàng đợi sự kiện & delta thời gian lên /api/session/track
   */
  public flushQueue(isEnd: boolean = false, useBeacon: boolean = false) {
    if (!this.started || !this.apiUrl) return;

    const delta = {
      active_sec: Math.round(this.pendingDelta.active_sec),
      rain_sec: Math.round(this.pendingDelta.rain_sec),
      lofi_sec: Math.round(this.pendingDelta.lofi_sec),
    };

    const events = this.eventQueue.splice(0, 50);
    if (!events.length && !delta.active_sec && !isEnd) return;

    this.pendingDelta.active_sec -= delta.active_sec;
    this.pendingDelta.rain_sec -= delta.rain_sec;
    this.pendingDelta.lofi_sec -= delta.lofi_sec;

    const body = JSON.stringify({
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      delta,
      events,
      end: isEnd,
    });

    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const ok = navigator.sendBeacon(`${this.apiUrl}/api/session/track`, body);
      if (!ok) {
        this.requeue(events, delta);
      }
      return;
    }

    fetch(`${this.apiUrl}/api/session/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      this.requeue(events, delta);
    });
  }

  private requeue(events: TrackEvent[], delta: { active_sec: number; rain_sec: number; lofi_sec: number }) {
    this.eventQueue.unshift(...events);
    this.pendingDelta.active_sec += delta.active_sec;
    this.pendingDelta.rain_sec += delta.rain_sec;
    this.pendingDelta.lofi_sec += delta.lofi_sec;
  }

  /**
   * Ghi nhận khi tàu đổi ga (tự động hoặc người dùng bấm)
   */
  public recordSceneChange(newSceneId: string, toSceneName?: string, fromSceneId?: string, trigger: 'auto' | 'user' = 'user') {
    this.currentSceneId = newSceneId;
    this.visitedSceneIds.add(newSceneId);
    this.localSessionAccumulator.sceneVisits[newSceneId] = (this.localSessionAccumulator.sceneVisits[newSceneId] || 0) + 1;
    this.localSessionAccumulator.addedJourneys += 1;

    this.enqueueEvent('station_arrive', {
      station_id: newSceneId,
      train_id: this.currentTrainId,
      trigger,
      payload: {
        toSceneName: toSceneName || newSceneId,
        fromSceneId: fromSceneId || null,
      },
    });
  }

  /**
   * Ghi nhận khi người dùng đổi đoàn tàu
   */
  public recordTrainChange(trainId: string) {
    this.currentTrainId = trainId;
    this.enqueueEvent('train_change', {
      train_id: trainId,
      trigger: 'user',
    });
  }

  /**
   * Ghi nhận khi thời điểm trong ngày thay đổi
   */
  public recordTimeSelect(timeOfDay: string) {
    this.currentTimeOfDay = timeOfDay;
    this.enqueueEvent('time_select', {
      time_of_day: timeOfDay,
      value: timeOfDay,
      trigger: 'user',
    });
  }

  /**
   * Cập nhật ngữ cảnh âm thanh & thời tiết
   */
  public updateContext(weather: string, isAudioPlaying: boolean) {
    if (this.currentWeather !== weather) {
      this.currentWeather = weather;
      this.enqueueEvent('weather_change', {
        weather,
        value: weather,
        trigger: 'user',
      });
    }

    if (this.isAudioPlaying !== isAudioPlaying) {
      this.isAudioPlaying = isAudioPlaying;
      this.enqueueEvent(isAudioPlaying ? 'audio_start' : 'audio_stop', {
        value: 'lofi',
      });
    }
  }

  /**
   * Lấy số liệu thống kê cộng đồng từ Worker D1
   */
  public async getCommunityStats(): Promise<CommunityStats> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/stats?visitor_id=${encodeURIComponent(this.visitorId)}`);
        if (res.ok) {
          const data = await res.json();
          const userMinutes = Math.floor(this.activeSecTotal / 60);

          if (data.me && typeof data.me.total_active_sec === 'number' && !this.baseTotalSec) {
            this.baseTotalSec = data.me.total_active_sec;
          }

          const totals = data.totals || {};
          const todPct = data.time_of_day_pct || {};

          return {
            travelers: Math.max(1, totals.visitors ?? data.travelers ?? 0),
            journeys: Math.max(1, totals.trips ?? data.journeys ?? 0),
            totalMinutes: Math.max(totals.train_minutes ?? data.totalMinutes ?? 0, (totals.train_minutes || 0) + userMinutes),
            activeNow: Math.max(1, data.online ?? data.activeNow ?? 1),
            rainMinutes: totals.rain_minutes ?? data.rainMinutes ?? 0,
            musicHours: totals.lofi_hours ?? data.musicHours ?? 0,
            musicMinutes: typeof totals.lofi_hours === 'number' ? Math.round(totals.lofi_hours * 60) : (data.musicMinutes ?? 0),
            topDestinations: data.top_stations || data.topDestinations || [],
            timeDistribution: {
              dawn: todPct.dawn ?? 25,
              day: todPct.day ?? 25,
              sunset: todPct.dusk ?? todPct.sunset ?? 25,
              night: todPct.night ?? 25,
            },
          };
        }
      } catch {
        // Fallback về local stats nếu server offline
      }
    }

    // Chế độ Giả lập Sống động khi chưa kết nối backend hoặc offline
    const jitter = Math.floor(Math.sin(Date.now() / 60000) * 8);
    const activeNow = Math.max(115, 127 + jitter);
    const userMinutes = Math.floor(this.activeSecTotal / 60);

    const base = this.fallbackCommunityStats;
    const addedRain = Math.round(this.localSessionAccumulator.addedRainMinutes);
    const addedMusic = Math.round(this.localSessionAccumulator.addedMusicMinutes);

    const mergedDestinations = base.topDestinations.map((dest) => {
      const extraVisits = this.localSessionAccumulator.sceneVisits[dest.id] || 0;
      return {
        ...dest,
        visits: dest.visits + extraVisits,
      };
    });

    const totalVisits = mergedDestinations.reduce((sum, d) => sum + d.visits, 0);
    const topDestinationsWithPercentage = mergedDestinations.map((dest) => ({
      ...dest,
      percentage: totalVisits > 0 ? Math.round((dest.visits / totalVisits) * 100) : 0,
    }));

    const totalMusicMinutes = (base.musicMinutes || (base.musicHours * 60)) + addedMusic;
    const musicHours = Math.round((totalMusicMinutes / 60) * 10) / 10;

    return {
      travelers: base.travelers,
      journeys: base.journeys + this.localSessionAccumulator.addedJourneys,
      totalMinutes: base.totalMinutes + userMinutes,
      activeNow,
      rainMinutes: base.rainMinutes + addedRain,
      musicHours,
      musicMinutes: totalMusicMinutes,
      topDestinations: topDestinationsWithPercentage,
      timeDistribution: base.timeDistribution,
    };
  }

  /**
   * Lấy số liệu thống kê của riêng người dùng này trên máy của họ
   */
  public getPersonalStats(): PersonalStats {
    const totalSeconds = this.baseTotalSec + this.activeSecTotal;
    return {
      currentSessionSeconds: Math.floor(this.activeSecTotal),
      totalLifetimeMinutes: Math.floor(totalSeconds / 60),
      totalVisitedScenes: Math.max(1, this.visitedSceneIds.size),
    };
  }
}

export const analyticsService = new AnalyticsService();
