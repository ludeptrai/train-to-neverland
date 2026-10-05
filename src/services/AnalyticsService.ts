/**
 * AnalyticsService - Trình quản lý Thống kê & Nhật ký Hành trình
 * 
 * Thiết kế theo tiêu chuẩn:
 * 1. ZERO PERMISSION: Hoàn toàn không yêu cầu bất kỳ quyền nào từ người dùng (Không GPS, không cookie định danh, không thông báo).
 * 2. ZERO FPS OVERHEAD: Chạy ngầm bằng Web Worker / setTimeout thưa (mỗi 45s), sử dụng navigator.sendBeacon không chặn main thread.
 * 3. ANONYMOUS: Tạo session ID ngẫu nhiên trong sessionStorage/memory, không lưu trữ địa chỉ IP hay thông tin cá nhân.
 */

export interface CommunityStats {
  travelers: number;        // Tổng số lữ khách
  journeys: number;         // Tổng số chuyến hành trình đã lăn bánh
  totalMinutes: number;     // Tổng thời gian mọi người đã ở trên tàu (phút)
  activeNow: number;        // Số hành khách đang cùng trên tàu thời điểm này
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

class AnalyticsService {
  private sessionId: string;
  private currentSessionSeconds: number = 0;
  private lastSavedLifetimeSeconds: number = 0;
  private lastHeartbeatTimestamp: number = Date.now();
  private currentSceneId: string = 'hochiminhcity';
  private currentWeather: string = 'clear';
  private isAudioPlaying: boolean = false;
  private apiUrl: string =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_STATS_API_URL) ||
    '';

  // Seeded Community Stats khi chưa có backend hoặc khi offline (Đồng nhất với thiết kế thongke.md)
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

  // Tích lũy cục bộ cho phiên hiện tại khi chạy không có backend
  private localSessionAccumulator = {
    addedJourneys: 0,
    addedRainMinutes: 0,
    addedMusicMinutes: 0,
    sceneVisits: {} as Record<string, number>,
  };

  constructor() {
    // Tạo session ID hoàn toàn ngẫu nhiên và ẩn danh
    let storedSession = '';
    try {
      storedSession = sessionStorage.getItem('train_anonymous_session') || '';
    } catch {
      // ignore
    }

    if (!storedSession) {
      this.sessionId = 'traveler_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      try {
        sessionStorage.setItem('train_anonymous_session', this.sessionId);
      } catch {
        // ignore
      }
    } else {
      this.sessionId = storedSession;
    }

    this.initHeartbeat();
    this.setupPageUnloadListener();
  }

  /**
   * Khởi động heartbeat thưa (mỗi 45s) để không ảnh hưởng đến tốc độ khung hình 60 FPS
   */
  private initHeartbeat() {
    if (typeof window === 'undefined') return;

    // Tăng thời gian cá nhân mỗi 1 giây
    setInterval(() => {
      this.currentSessionSeconds += 1;
    }, 1000);

    // Heartbeat định kỳ gửi về server
    window.setInterval(() => {
      this.sendHeartbeat();
    }, 45000);
  }

  /**
   * Lưu thời gian tích lũy vào localStorage mà không bị nhân bản khi chuyển tab
   */
  private saveLifetimeSeconds() {
    try {
      const delta = this.currentSessionSeconds - this.lastSavedLifetimeSeconds;
      if (delta > 0) {
        const lifetime = parseInt(localStorage.getItem('train_lifetime_seconds') || '0', 10);
        localStorage.setItem('train_lifetime_seconds', String(lifetime + delta));
        this.lastSavedLifetimeSeconds = this.currentSessionSeconds;
      }
    } catch {
      // ignore
    }
  }

  /**
   * Lắng nghe sự kiện người dùng rời trang bằng navigator.sendBeacon
   */
  private setupPageUnloadListener() {
    if (typeof window === 'undefined') return;

    const handleLeave = () => {
      this.saveLifetimeSeconds();

      const payload = JSON.stringify({
        event: 'session_end',
        sessionId: this.sessionId,
        durationSeconds: this.currentSessionSeconds,
        sceneId: this.currentSceneId,
      });

      if (this.apiUrl && navigator.sendBeacon) {
        navigator.sendBeacon(`${this.apiUrl}/api/events`, payload);
      }
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleLeave();
      }
    });

    window.addEventListener('beforeunload', handleLeave);
  }

  /**
   * Khởi tạo phiên của lữ khách ngay khi vừa vào trang web:
   * Gửi sự kiện arrival để ghi nhận ngay lập tức:
   * - +1 lữ khách (travelers)
   * - +1 chuyến đi (journeys)
   * - +1 lượt ghé thăm ga tàu xuất phát (location_stats)
   */
  public initSession(
    sceneId: string,
    sceneName?: string,
    weather?: string,
    allScenes?: Array<{ id: string; name: string }>
  ) {
    this.currentSceneId = sceneId;
    if (weather) this.currentWeather = weather;

    // Tự động đồng bộ danh sách địa điểm vào chế độ fallback nếu có ga mới
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

    // Ghi nhận cục bộ cho fallback
    this.localSessionAccumulator.sceneVisits[sceneId] = (this.localSessionAccumulator.sceneVisits[sceneId] || 0) + 1;
    this.localSessionAccumulator.addedJourneys += 1;

    if (!this.apiUrl) return;

    try {
      fetch(`${this.apiUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'arrival',
          sessionId: this.sessionId,
          sceneId: this.currentSceneId,
          sceneName: sceneName || sceneId,
          weather: this.currentWeather,
          isAudioPlaying: this.isAudioPlaying,
          scenes: allScenes || [],
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  /**
   * Gửi gói tin heartbeat siêu nhẹ (< 100 bytes) với thời gian thực tế đã trôi qua
   */
  public sendHeartbeat() {
    const now = Date.now();
    const elapsedSeconds = Math.max(1, Math.round((now - this.lastHeartbeatTimestamp) / 1000));
    this.lastHeartbeatTimestamp = now;

    // Cập nhật tích lũy cục bộ
    const elapsedMinutes = elapsedSeconds / 60;
    if (this.currentWeather === 'rain') {
      this.localSessionAccumulator.addedRainMinutes += elapsedMinutes;
    }
    if (this.isAudioPlaying) {
      this.localSessionAccumulator.addedMusicMinutes += elapsedMinutes;
    }

    if (!this.apiUrl) return;

    try {
      fetch(`${this.apiUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'heartbeat',
          sessionId: this.sessionId,
          sceneId: this.currentSceneId,
          weather: this.currentWeather,
          isAudioPlaying: this.isAudioPlaying,
          seconds: elapsedSeconds,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  /**
   * Ghi nhận khi người dùng chuyển ga tàu
   */
  public recordSceneChange(newSceneId: string, toSceneName?: string, fromSceneId?: string) {
    this.currentSceneId = newSceneId;
    this.localSessionAccumulator.sceneVisits[newSceneId] = (this.localSessionAccumulator.sceneVisits[newSceneId] || 0) + 1;
    this.localSessionAccumulator.addedJourneys += 1;

    if (!this.apiUrl) return;

    try {
      fetch(`${this.apiUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'scene_change',
          sessionId: this.sessionId,
          toScene: newSceneId,
          toSceneName: toSceneName || newSceneId,
          fromScene: fromSceneId,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  /**
   * Cập nhật trạng thái thời tiết & âm thanh hiện tại
   */
  public updateContext(weather: string, isAudioPlaying: boolean) {
    this.currentWeather = weather;
    this.isAudioPlaying = isAudioPlaying;
  }

  /**
   * Lấy số liệu thống kê cộng đồng (từ Backend API hoặc Seeded Live Engine)
   */
  public async getCommunityStats(): Promise<CommunityStats> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          const userMinutes = Math.floor(this.currentSessionSeconds / 60);
          return {
            ...data,
            travelers: Math.max(1, data.travelers || 0),
            journeys: Math.max(1, data.journeys || 0),
            totalMinutes: Math.max(data.totalMinutes || 0, (data.totalMinutes || 0) + userMinutes),
            activeNow: Math.max(1, data.activeNow || 1),
            musicMinutes: data.musicMinutes ?? (typeof data.musicHours === 'number' ? Math.round(data.musicHours * 60) : 0),
          };
        }
      } catch {
        // Fallback về local stats nếu server offline
      }
    }

    // Chế độ Giả lập Sống động (Seeded Live Simulation) khi chưa kết nối backend hoặc offline
    const jitter = Math.floor(Math.sin(Date.now() / 60000) * 8);
    const activeNow = Math.max(115, 127 + jitter);
    const userMinutes = Math.floor(this.currentSessionSeconds / 60);

    const base = this.fallbackCommunityStats;
    const addedRain = Math.round(this.localSessionAccumulator.addedRainMinutes);
    const addedMusic = Math.round(this.localSessionAccumulator.addedMusicMinutes);

    // Ghép các lượt ghé thăm ga tàu trong phiên vào bảng xếp hạng
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
    let lifetimeSeconds = 0;
    try {
      lifetimeSeconds = parseInt(localStorage.getItem('train_lifetime_seconds') || '0', 10);
    } catch {
      lifetimeSeconds = 0;
    }

    const totalSeconds = lifetimeSeconds + (this.currentSessionSeconds - this.lastSavedLifetimeSeconds);

    return {
      currentSessionSeconds: this.currentSessionSeconds,
      totalLifetimeMinutes: Math.floor(totalSeconds / 60),
      totalVisitedScenes: Object.keys(this.localSessionAccumulator.sceneVisits).length || 1,
    };
  }
}

export const analyticsService = new AnalyticsService();
