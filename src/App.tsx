import React, { useState, useEffect } from 'react';
import { SCENES } from './config/scenes';
import { TRAINS } from './config/trains';
import { TimeOfDay, WeatherType, SceneConfig, TrainTheme } from './types';
import { resolveTimeOfDay, getLightingTheme } from './engines/LightingManager';
import { ParallaxEngine } from './engines/ParallaxEngine';
import { WeatherCanvas } from './engines/WeatherCanvas';
import { AmbientSpawner } from './engines/AmbientSpawner';
import { HeaderBar } from './components/HUD/HeaderBar';
import { PomodoroTimer } from './components/HUD/PomodoroTimer';
import { AudioMixerDrawer } from './components/HUD/AudioMixerDrawer';
import { ZenModeToggle } from './components/HUD/ZenModeToggle';
import { audioManager } from './engines/AudioManager';

export const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<SceneConfig>(SCENES[0]);
  const [currentTrain, setCurrentTrain] = useState<TrainTheme>(TRAINS[0]);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('sunset');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-Tour state (Slow Rail style 60s per station)
  const [isAutoTour, setIsAutoTour] = useState<boolean>(true);
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
        {/* 1. Core Parallax Engine (60 FPS Background, Track, Train) */}
        <ParallaxEngine
          scene={currentScene}
          train={currentTrain}
          lighting={lighting}
          isPaused={isPaused}
        />

        {/* 2. Ambient Spawner (Birds, Balloon, Plane) */}
        <AmbientSpawner />

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
              fontFamily: "'Silkscreen', 'Press Start 2P', monospace",
              fontSize: '13px',
              letterSpacing: '2.5px',
              color: '#f5e6d3',
              fontWeight: 700,
            }}
          >
            CHUYẾN TÀU KHÔNG VỘI
          </span>
          <span
            style={{
              fontFamily: "'Zen Maru Gothic', sans-serif",
              fontSize: '11px',
              letterSpacing: '1px',
              color: '#d4bda8',
            }}
          >
            {currentScene.location} • {currentScene.subtitle}
          </span>
        </div>

        {/* 5. HUD Controls (Toggles with smooth transition when Zen Mode is active) */}
        <div
          style={{
            opacity: isZenMode ? 0 : 1,
            pointerEvents: isZenMode ? 'none' : 'auto',
            transition: 'opacity 0.35s ease',
          }}
        >
          {/* Top-Left Selectors */}
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

          {/* Top-Right Pomodoro Focus Timer */}
          <PomodoroTimer />

          {/* Bottom-Right Audio Mixer Drawer */}
          <AudioMixerDrawer />
        </div>

        {/* Zen Mode & Fullscreen Trigger */}
        <ZenModeToggle
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(!isZenMode)}
        />

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
