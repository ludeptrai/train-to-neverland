import React, { useState, useEffect } from 'react';
import { SCENES } from './config/scenes';
import { TRAINS } from './config/trains';
import { TimeOfDay, WeatherType, SceneConfig, TrainTheme } from './types';
import { resolveTimeOfDay, getLightingTheme } from './engines/LightingManager';
import { ParallaxEngine } from './engines/ParallaxEngine';
import { WeatherCanvas } from './engines/WeatherCanvas';
import { HeaderBar } from './components/HUD/HeaderBar';
import { PomodoroTimer } from './components/HUD/PomodoroTimer';
import { AudioMixerDrawer } from './components/HUD/AudioMixerDrawer';
import { JourneyStatsModal } from './components/HUD/JourneyStatsModal';
import { FeedbackDonateModal } from './components/HUD/FeedbackDonateModal';
import { ZenModeToggle } from './components/HUD/ZenModeToggle';
import { audioManager } from './engines/AudioManager';
import { analyticsService } from './services/AnalyticsService';
import { usePageSeo } from './hooks/usePageSeo';
import { InitialLoadingScreen } from './components/HUD/InitialLoadingScreen';

const VALID_TIMES: TimeOfDay[] = ['dawn', 'day', 'sunset', 'night', 'auto'];
const VALID_WEATHERS: WeatherType[] = ['clear', 'rain', 'snow', 'sakura'];

function getInitialUrlParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    sceneId: params.get('scene') || params.get('station') || params.get('location') || undefined,
    trainId: params.get('train') || undefined,
    weather: (params.get('weather') as WeatherType) || undefined,
    timeOfDay: (params.get('time') || params.get('timeOfDay')) as TimeOfDay || undefined,
    zen: params.has('zen') ? params.get('zen') === '1' || params.get('zen') === 'true' : undefined,
    tour: params.has('tour') ? params.get('tour') === '1' || params.get('tour') === 'true' : undefined,
  };
}

export const App: React.FC = () => {
  const initialParams = getInitialUrlParams();

  const [currentScene, setCurrentScene] = useState<SceneConfig>(() => {
    if (initialParams.sceneId) {
      const q = initialParams.sceneId.toLowerCase();
      const found = SCENES.find((s) => s.id.toLowerCase() === q || s.name.toLowerCase().includes(q));
      if (found) return found;
    }
    // Ưu tiên ga TP. Hồ Chí Minh làm mặc định cho trang chủ
    const hcm = SCENES.find((s) => s.id === 'hochiminhcity');
    return hcm || SCENES[0];
  });

  const [currentTrain, setCurrentTrain] = useState<TrainTheme>(() => {
    if (initialParams.trainId) {
      const q = initialParams.trainId.toLowerCase();
      const found = TRAINS.find((t) => t.id.toLowerCase() === q || t.name.toLowerCase().includes(q));
      if (found) return found;
    }
    return TRAINS[0];
  });

  const [weather, setWeather] = useState<WeatherType>(() => {
    if (initialParams.weather && VALID_WEATHERS.includes(initialParams.weather)) {
      return initialParams.weather;
    }
    return 'clear';
  });

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => {
    if (initialParams.timeOfDay && VALID_TIMES.includes(initialParams.timeOfDay)) {
      return initialParams.timeOfDay;
    }
    return 'sunset';
  });

  const [isZenMode, setIsZenMode] = useState<boolean>(() => {
    return initialParams.zen ?? false;
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);

  // Tự động tối ưu Title, Meta tags, Canonical URL và Open Graph cho từng địa điểm + thời gian
  usePageSeo({ currentScene, timeOfDay });

  // Auto-Tour state (Slow Rail style 60s per station)
  const [isAutoTour, setIsAutoTour] = useState<boolean>(() => {
    return initialParams.tour ?? true;
  });
  const [tourProgress, setTourProgress] = useState<number>(0);
  const tourDuration = 60; // 60 seconds

  // Auto-tour progression timer
  useEffect(() => {
    if (!isAutoTour || isPaused || !isInitialLoaded) return;

    const interval = setInterval(() => {
      setTourProgress((prev) => {
        const next = prev + (0.2 / tourDuration) * 100;
        if (next >= 100) {
          // Advance to next station
          setCurrentScene((prevScene) => {
            const idx = SCENES.findIndex((s) => s.id === prevScene.id);
            const nextScene = SCENES[(idx + 1) % SCENES.length];
            analyticsService.recordSceneChange(nextScene.id, nextScene.name, prevScene.id, 'auto');
            return nextScene;
          });
          return 0;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isAutoTour, isPaused, tourDuration]);

  // Đồng bộ hóa trạng thái hiện tại (địa điểm, thời tiết, thời gian, tàu, v.v.) vào URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set('scene', currentScene.id);
    params.set('train', currentTrain.id);
    params.set('time', timeOfDay);
    params.set('weather', weather);

    if (isZenMode) {
      params.set('zen', '1');
    } else {
      params.delete('zen');
    }

    if (!isAutoTour) {
      params.set('tour', '0');
    } else {
      params.delete('tour');
    }

    const newSearch = params.toString();
    const newRelativePath = window.location.pathname + (newSearch ? `?${newSearch}` : '');

    // Cập nhật URL mượt mà không làm reload trang và không gây tràn lịch sử duyệt web
    window.history.replaceState(null, '', newRelativePath);
  }, [currentScene.id, currentTrain.id, timeOfDay, weather, isZenMode, isAutoTour]);

  // Hỗ trợ nút Back / Forward trên trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      const p = getInitialUrlParams();
      if (p.sceneId) {
        const q = p.sceneId.toLowerCase();
        const found = SCENES.find((s) => s.id.toLowerCase() === q || s.name.toLowerCase().includes(q));
        if (found) setCurrentScene(found);
      } else {
        const hcm = SCENES.find((s) => s.id === 'hochiminhcity');
        if (hcm) setCurrentScene(hcm);
      }
      if (p.trainId) {
        const q = p.trainId.toLowerCase();
        const found = TRAINS.find((t) => t.id.toLowerCase() === q || t.name.toLowerCase().includes(q));
        if (found) setCurrentTrain(found);
      }
      if (p.timeOfDay && VALID_TIMES.includes(p.timeOfDay)) {
        setTimeOfDay(p.timeOfDay);
      }
      if (p.weather && VALID_WEATHERS.includes(p.weather)) {
        setWeather(p.weather);
      }
      if (p.zen !== undefined) {
        setIsZenMode(p.zen);
      }
      if (p.tour !== undefined) {
        setIsAutoTour(p.tour);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Khởi tạo phiên lữ khách lên hệ thống thống kê ngay khi vừa bước lên tàu
  useEffect(() => {
    const sceneList = SCENES.map((s) => ({ id: s.id, name: s.name }));
    analyticsService.initSession(currentScene.id, currentScene.name, weather, sceneList, currentTrain.id, timeOfDay, isAutoTour);
  }, []);

  // Đồng bộ trạng thái âm thanh & thời tiết vào analytics
  useEffect(() => {
    const unsub = audioManager.subscribe((settings) => {
      const isMusicActive = Boolean(settings.isPlayingMusic && !settings.isMuted && settings.musicVolume > 0 && settings.masterVolume > 0);
      analyticsService.updateContext(weather, isMusicActive);
    });
    return unsub;
  }, [weather]);

  // Handle manual scene switch (resets progress)
  const handleSceneChange = (scene: SceneConfig) => {
    analyticsService.recordSceneChange(scene.id, scene.name, currentScene.id, 'user');
    setCurrentScene(scene);
    setTourProgress(0);
  };

  const handleTrainChange = (train: TrainTheme) => {
    setCurrentTrain(train);
    analyticsService.recordTrainChange(train.id);
  };

  const handleTimeOfDayChange = (time: TimeOfDay) => {
    setTimeOfDay(time);
    analyticsService.recordTimeSelect(time);
  };

  // Sync lighting
  const effectiveTime = resolveTimeOfDay(timeOfDay);
  const lighting = getLightingTheme(effectiveTime);

  // When weather changes, naturally harmonize ambient rain sound
  const handleWeatherChange = (newWeather: WeatherType) => {
    setWeather(newWeather);
    const audioSettings = audioManager.settings;
    const isMusicActive = Boolean(audioSettings.isPlayingMusic && !audioSettings.isMuted && audioSettings.musicVolume > 0 && audioSettings.masterVolume > 0);
    analyticsService.updateContext(newWeather, isMusicActive);
    if (newWeather === 'rain') {
      audioManager.setChannelVolume('rainVolume', 0.65);
    } else {
      audioManager.setChannelVolume('rainVolume', 0.0);
    }
  };

  // Harmonize rain sound if weather is initially rain from URL
  useEffect(() => {
    if (weather === 'rain') {
      audioManager.setChannelVolume('rainVolume', 0.65);
    }
  }, []);

  // Dynamic Live Metadata Sync: Reads directly from disk on Ctrl+Shift+R or scene switch
  useEffect(() => {
    let cancelled = false;
    const fetchLiveMeta = async () => {
      try {
        const res = await fetch(`./assets/landscapes/${currentScene.id}/meta.json?t=${Date.now()}`);
        if (!res.ok) return;
        const meta = await res.json();
        if (cancelled) return;

        setCurrentScene((prev) => ({
          ...prev,
          ...(meta.name ? { name: meta.name } : {}),
          ...(meta.subtitle ? { subtitle: meta.subtitle } : {}),
          ...(meta.location ? { location: meta.location } : {}),
          ...(meta.bgSpeed !== undefined ? { bgSpeed: Number(meta.bgSpeed) } : {}),
          ...(meta.mgSpeed !== undefined ? { mgSpeed: Number(meta.mgSpeed) } : {}),
          ...(meta.bgScaleRatio !== undefined ? { bgScaleRatio: Number(meta.bgScaleRatio) } : (meta.bgScale !== undefined ? { bgScaleRatio: Number(meta.bgScale) } : {})),
          ...(meta.bgY !== undefined ? { bgY: meta.bgY } : (meta.bgOffsetY !== undefined ? { bgY: meta.bgOffsetY } : {})),
          ...(meta.mgScaleRatio !== undefined ? { mgScaleRatio: Number(meta.mgScaleRatio) } : (meta.mgScale !== undefined ? { mgScaleRatio: Number(meta.mgScale) } : (meta.scaleRatio !== undefined ? { mgScaleRatio: Number(meta.scaleRatio) } : {}))),
          ...(meta.mgY !== undefined ? { mgY: meta.mgY } : (meta.mgOffsetY !== undefined ? { mgY: meta.mgOffsetY } : (meta.yAxis !== undefined ? { mgY: meta.yAxis } : {}))),
          ...(meta.trainY !== undefined ? { trainY: meta.trainY } : (meta.trainOffsetY !== undefined ? { trainY: meta.trainOffsetY } : {})),
          ...(meta.trainScaleRatio !== undefined ? { trainScaleRatio: Number(meta.trainScaleRatio) } : (meta.trainScale !== undefined ? { trainScaleRatio: Number(meta.trainScale) } : {})),
          ...(meta.foregroundUrl ? { foregroundUrl: meta.foregroundUrl } : {}),
          ...(meta.foregroundLightsUrl ? { foregroundLightsUrl: meta.foregroundLightsUrl } : {}),
          ...(meta.fgSpeed !== undefined ? { fgSpeed: Number(meta.fgSpeed) } : {}),
          ...(meta.fgScaleRatio !== undefined
            ? { fgScaleRatio: Number(meta.fgScaleRatio) }
            : (meta.fgRatio !== undefined
                ? { fgScaleRatio: Number(meta.fgRatio) }
                : (meta.fgScale !== undefined
                    ? { fgScaleRatio: Number(meta.fgScale) }
                    : (meta.foregroundRatio !== undefined ? { fgScaleRatio: Number(meta.foregroundRatio) } : {})))),
          ...(meta.fgY !== undefined
            ? { fgY: meta.fgY }
            : (meta.fgOffsetY !== undefined
                ? { fgY: meta.fgOffsetY }
                : (meta.foregroundY !== undefined ? { fgY: meta.foregroundY } : {}))),
          ...(meta.fgOpacity !== undefined ? { fgOpacity: Number(meta.fgOpacity) } : {}),
          ...(meta.skyPresets ? { skyPresets: meta.skyPresets } : {}),
          ...(meta.ambientFilter !== undefined ? { ambientFilter: meta.ambientFilter } : {}),
          ...(meta.nightFilter !== undefined ? { nightFilter: meta.nightFilter } : {}),
          ...(meta.nightOverlayBlend !== undefined ? { nightOverlayBlend: meta.nightOverlayBlend } : {}),
        }));
      } catch {
        // Fallback to auto_scenes.ts defaults
      }
    };

    fetchLiveMeta();
    return () => {
      cancelled = true;
    };
  }, [currentScene.id]);

  // Auto-unlock audio engine on page load or first user interaction
  useEffect(() => {
    // Kích hoạt phát nhạc ngay khi vừa vào trang web
    audioManager.init();

    const unlockAudio = () => {
      audioManager.init();
      window.removeEventListener('click', unlockAudio, { capture: true });
      window.removeEventListener('keydown', unlockAudio, { capture: true });
      window.removeEventListener('touchstart', unlockAudio, { capture: true });
      window.removeEventListener('pointerdown', unlockAudio, { capture: true });
    };

    window.addEventListener('click', unlockAudio, { capture: true });
    window.addEventListener('keydown', unlockAudio, { capture: true });
    window.addEventListener('touchstart', unlockAudio, { capture: true });
    window.addEventListener('pointerdown', unlockAudio, { capture: true });

    return () => {
      window.removeEventListener('click', unlockAudio, { capture: true });
      window.removeEventListener('keydown', unlockAudio, { capture: true });
      window.removeEventListener('touchstart', unlockAudio, { capture: true });
      window.removeEventListener('pointerdown', unlockAudio, { capture: true });
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key.toLowerCase() === 'z') {
        setIsZenMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'm') {
        audioManager.toggleMute();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#07080c',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Căn giữa toàn bộ cụm sát nhau
        gap: '6px', // Sát mép khung hình
        padding: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Màn hình chờ tải toàn bộ asset khi mới vào trang web */}
      {!isInitialLoaded && (
        <InitialLoadingScreen
          scene={currentScene}
          train={currentTrain}
          onLoaded={() => setIsInitialLoaded(true)}
        />
      )}

      {/* 
        1. CỤM NÚT ĐIỀU KHIỂN NẰM SÁT MÉP TRÊN CỦA KHUNG HÌNH
      */}
      <header
        id="hud-controls-container"
        style={{
          width: 'min(98vw, calc((100vh - 105px) * (21 / 9)))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          zIndex: 100,
          minHeight: '34px',
        }}
      >
        {/* Cụm nút chuyển đổi bên trái (Địa điểm, Tàu, Thời tiết, Thời điểm, Tự chuyển ga) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            opacity: isZenMode ? 0 : 1,
            pointerEvents: isZenMode ? 'none' : 'auto',
            transition: 'opacity 0.3s ease',
          }}
        >
          <HeaderBar
            weather={weather}
            onWeatherChange={handleWeatherChange}
            timeOfDay={timeOfDay}
            onTimeOfDayChange={handleTimeOfDayChange}
            currentScene={currentScene}
            onSceneChange={handleSceneChange}
            scenes={SCENES}
            currentTrain={currentTrain}
            onTrainChange={handleTrainChange}
            trains={TRAINS}
            isAutoTour={isAutoTour}
            onToggleAutoTour={() => setIsAutoTour(!isAutoTour)}
          />
        </div>

        {/* Cụm nút công cụ bên phải (Pomodoro, Audio Mixer, Zen Mode Toggle) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isZenMode ? 0 : 1,
              pointerEvents: isZenMode ? 'none' : 'auto',
              transition: 'opacity 0.3s ease',
            }}
          >
            <PomodoroTimer />
            <AudioMixerDrawer />
            <JourneyStatsModal
              currentScene={currentScene}
              currentTrain={currentTrain}
              weather={weather}
              timeOfDay={timeOfDay}
            />
            <FeedbackDonateModal />
          </div>

          {/* Zen Mode Toggle (Luôn có thể tương tác để tắt/bật Zen Mode) */}
          <ZenModeToggle
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode(!isZenMode)}
          />
        </div>
      </header>

      {/* 
        2. KHUNG HÌNH NGHỆ THUẬT (CINEMA LETTERBOX 21:9 - HOÀN TOÀN THOÁNG ĐÃNG)
      */}
      <main
        id="cinema-stage"
        style={{
          position: 'relative',
          width: 'min(98vw, calc((100vh - 105px) * (21 / 9)))',
          height: 'min(calc(98vw * (9 / 21)), calc(100vh - 105px))',
          aspectRatio: '21 / 9',
          boxShadow: '0 0 80px rgba(0, 0, 0, 0.95), 0 20px 50px rgba(0,0,0,0.8)',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#0b0c10',
          zIndex: 20,
        }}
      >
        <ParallaxEngine
          scene={currentScene}
          train={currentTrain}
          lighting={lighting}
          timeOfDay={timeOfDay}
          isPaused={isPaused}
        />

        {/* Weather Particles Canvas (Rain, Snow, Sakura, Sun specks) */}
        <WeatherCanvas weather={weather} />

        {/* Auto-Tour Progress Bar (Slow Rail style) */}
        {isAutoTour && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '3px',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              zIndex: 48,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: `${tourProgress}%`,
                height: '100%',
                backgroundColor: '#edb08f',
                boxShadow: '0 0 10px rgba(237, 176, 143, 0.85)',
                transition: 'width 0.2s linear',
              }}
            />
          </div>
        )}
      </main>

      {/* 3. TITLE Ở PHÍA DƯỚI SÁT MÉP DƯỚI KHUNG CẢNH */}
      <footer
        id="app-bottom-title"
        style={{
          width: 'min(98vw, calc((100vh - 105px) * (21 / 9)))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 8px',
          opacity: isZenMode ? 0.3 : 0.95,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            className="watermark-glow"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '26px',
              letterSpacing: '3px',
              color: '#f5e6d3',
              fontWeight: 700,
              lineHeight: 1.1,
              textShadow: '0 0 16px rgba(245, 230, 211, 0.4)',
            }}
          >
            CHUYẾN TÀU TỚI XỨ SỞ VĨNH HẰNG
          </span>
          <span
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '16px',
              letterSpacing: '1px',
              color: '#d4bda8',
            }}
          >
            {currentScene.location} • {currentScene.subtitle}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: "'VT323', monospace",
            fontSize: '15px',
            color: '#ffd166',
            letterSpacing: '1px',
          }}
        >
          <span>🚆 {currentTrain.name}</span>
        </div>
      </footer>
    </div>
  );
};
