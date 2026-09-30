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
import { ZenModeToggle } from './components/HUD/ZenModeToggle';
import { audioManager } from './engines/AudioManager';

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
    return SCENES[0];
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

  // Auto-Tour state (Slow Rail style 60s per station)
  const [isAutoTour, setIsAutoTour] = useState<boolean>(() => {
    return initialParams.tour ?? true;
  });
  const [tourProgress, setTourProgress] = useState<number>(0);
  const tourDuration = 60; // 60 seconds

  // Auto-tour progression timer
  useEffect(() => {
    if (!isAutoTour || isPaused) return;

    const interval = setInterval(() => {
      setTourProgress((prev) => {
        const next = prev + (0.2 / tourDuration) * 100;
        if (next >= 100) {
          // Advance to next station
          setCurrentScene((prevScene) => {
            const idx = SCENES.findIndex((s) => s.id === prevScene.id);
            return SCENES[(idx + 1) % SCENES.length];
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

  // Handle manual scene switch (resets progress)
  const handleSceneChange = (scene: SceneConfig) => {
    setCurrentScene(scene);
    setTourProgress(0);
  };

  // Sync lighting
  const effectiveTime = resolveTimeOfDay(timeOfDay);
  const lighting = getLightingTheme(effectiveTime);

  // When weather changes, naturally harmonize ambient rain sound
  const handleWeatherChange = (newWeather: WeatherType) => {
    setWeather(newWeather);
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
          ...(meta.skyPresets ? { skyPresets: meta.skyPresets } : {}),
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

  // Auto-unlock audio engine on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      audioManager.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key.toLowerCase() === 'z') {
        setIsZenMode((prev) => !prev);
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
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 
        Cinema Letterbox Stage (Pure Responsive 21:9 Viewport)
        Never distorts, fits completely within any browser window with automatic letterboxing!
      */}
      <div
        style={{
          position: 'relative',
          width: 'min(100vw, calc(100vh * (21 / 9)))',
          height: 'min(100vh, calc(100vw * (9 / 21)))',
          aspectRatio: '21 / 9',
          boxShadow: '0 0 100px rgba(0, 0, 0, 0.95)',
          overflow: 'hidden',
          backgroundColor: '#0b0c10',
        }}
      >
        {/* 1. Core Parallax Engine with Dynamic Sky Layer, Background, Track, Train */}
        <ParallaxEngine
          scene={currentScene}
          train={currentTrain}
          lighting={lighting}
          timeOfDay={timeOfDay}
          isPaused={isPaused}
        />

        {/* 3. Weather Particles Canvas (Rain, Snow, Sakura, Sun specks) */}
        <WeatherCanvas weather={weather} />

        {/* 4. Bottom-Left Watermark Title ("CHUYẾN TÀU KHÔNG VỘI") */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            left: '26px',
            zIndex: 45,
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            opacity: isZenMode ? 0.35 : 0.85,
            transition: 'opacity 0.4s ease',
          }}
        >
          <span
            className="watermark-glow"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '22px',
              letterSpacing: '2px',
              color: '#f5e6d3',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            CHUYẾN TÀU KHÔNG VỘI
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

        {/* 5. HUD Controls */}
        {/* Top-Left Selectors (fade out during Zen Mode) */}
        <div
          style={{
            opacity: isZenMode ? 0 : 1,
            pointerEvents: isZenMode ? 'none' : 'auto',
            transition: 'opacity 0.35s ease',
          }}
        >
          <HeaderBar
            weather={weather}
            onWeatherChange={handleWeatherChange}
            timeOfDay={timeOfDay}
            onTimeOfDayChange={setTimeOfDay}
            currentScene={currentScene}
            onSceneChange={handleSceneChange}
            scenes={SCENES}
            currentTrain={currentTrain}
            onTrainChange={setCurrentTrain}
            trains={TRAINS}
            isAutoTour={isAutoTour}
            onToggleAutoTour={() => setIsAutoTour(!isAutoTour)}
          />
        </div>

        {/* Top-Right Tools & Controls (Pomodoro, Audio Mixer, Zen Mode, Fullscreen) */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            zIndex: 50,
          }}
        >
          {/* Collapsible tools (fade out in Zen Mode) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isZenMode ? 0 : 1,
              pointerEvents: isZenMode ? 'none' : 'auto',
              transition: 'opacity 0.35s ease',
            }}
          >
            <PomodoroTimer />
            <AudioMixerDrawer />
          </div>

          {/* Zen Mode Toggle & Fullscreen (Zen Mode button stays interactive to restore UI) */}
          <ZenModeToggle
            isZenMode={isZenMode}
            onToggleZenMode={() => setIsZenMode(!isZenMode)}
          />
        </div>

        {/* 6. Auto-Tour Progress Bar (Slow Rail style) */}
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
      </div>
    </div>
  );
};
