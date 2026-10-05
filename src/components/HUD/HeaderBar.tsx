import React, { useState, useRef, useEffect } from 'react';
import { TimeOfDay, WeatherType, SceneConfig, TrainTheme } from '../../types';
import { PixelButton } from '../Shared/PixelButton';
import { Sun, CloudRain, Snowflake, Sparkles, Sunrise, Sunset, Moon, Clock, MapPin, TrainTrack, ChevronDown, Compass } from 'lucide-react';

interface HeaderBarProps {
  weather: WeatherType;
  onWeatherChange: (w: WeatherType) => void;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (t: TimeOfDay) => void;
  currentScene: SceneConfig;
  onSceneChange: (scene: SceneConfig) => void;
  scenes: SceneConfig[];
  currentTrain: TrainTheme;
  onTrainChange: (train: TrainTheme) => void;
  trains: TrainTheme[];
  isAutoTour?: boolean;
  onToggleAutoTour?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  weather,
  onWeatherChange,
  timeOfDay,
  onTimeOfDayChange,
  currentScene,
  onSceneChange,
  scenes,
  currentTrain,
  onTrainChange,
  trains,
  isAutoTour = true,
  onToggleAutoTour,
}) => {
  const [isTrainMenuOpen, setIsTrainMenuOpen] = useState(false);
  const [isSceneMenuOpen, setIsSceneMenuOpen] = useState(false);

  const sceneBtnRef = useRef<HTMLDivElement | null>(null);
  const trainBtnRef = useRef<HTMLDivElement | null>(null);
  const scenePopupRef = useRef<HTMLDivElement | null>(null);
  const trainPopupRef = useRef<HTMLDivElement | null>(null);

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    if (!isSceneMenuOpen && !isTrainMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        isSceneMenuOpen &&
        sceneBtnRef.current &&
        !sceneBtnRef.current.contains(target)
      ) {
        setIsSceneMenuOpen(false);
      }
      if (
        isTrainMenuOpen &&
        trainBtnRef.current &&
        !trainBtnRef.current.contains(target)
      ) {
        setIsTrainMenuOpen(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSceneMenuOpen, isTrainMenuOpen]);

  // Cycle weather
  const weatherList: WeatherType[] = ['clear', 'rain', 'snow', 'sakura'];
  const nextWeather = () => {
    const idx = weatherList.indexOf(weather);
    onWeatherChange(weatherList[(idx + 1) % weatherList.length]);
  };

  const weatherLabels: Record<WeatherType, { text: string; icon: React.ReactNode }> = {
    clear: { text: 'TRỜI QUANG', icon: <Sun size={14} color="#f9ca24" /> },
    rain: { text: 'MƯA RƠI', icon: <CloudRain size={14} color="#70a1ff" /> },
    snow: { text: 'TUYẾT TRẮNG', icon: <Snowflake size={14} color="#ffffff" /> },
    sakura: { text: 'HOA ANH ĐÀO', icon: <Sparkles size={14} color="#ff9ff3" /> },
  };

  // Cycle time of day
  const timeList: TimeOfDay[] = ['day', 'sunset', 'night', 'dawn', 'auto'];
  const nextTime = () => {
    const idx = timeList.indexOf(timeOfDay);
    onTimeOfDayChange(timeList[(idx + 1) % timeList.length]);
  };

  const timeLabels: Record<TimeOfDay, { text: string; icon: React.ReactNode }> = {
    dawn: { text: 'BÌNH MINH', icon: <Sunrise size={14} color="#ffbe76" /> },
    day: { text: 'BAN NGÀY', icon: <Sun size={14} color="#f9ca24" /> },
    sunset: { text: 'HOÀNG HÔN', icon: <Sunset size={14} color="#ff7979" /> },
    night: { text: 'BAN ĐÊM', icon: <Moon size={14} color="#f6e58d" /> },
    auto: { text: 'GIỜ THẬT', icon: <Clock size={14} color="#dff9fb" /> },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 100,
        overflow: 'visible',
      }}
    >
      {/* Weather toggle button */}
      <PixelButton onClick={nextWeather} title="Nhấn để đổi thời tiết">
        {weatherLabels[weather].icon}
        <span>{weatherLabels[weather].text}</span>
      </PixelButton>

      {/* Time of day toggle button */}
      <PixelButton onClick={nextTime} title="Nhấn để đổi thời gian Ngày/Đêm">
        {timeLabels[timeOfDay].icon}
        <span>{timeLabels[timeOfDay].text}</span>
      </PixelButton>

      {/* Scene switch button with dropdown */}
      <div ref={sceneBtnRef} style={{ position: 'relative' }}>
        <PixelButton
          active={isSceneMenuOpen}
          onClick={() => {
            setIsSceneMenuOpen(!isSceneMenuOpen);
            setIsTrainMenuOpen(false);
          }}
          title="Chọn danh lam thắng cảnh"
        >
          <MapPin size={14} color="#badc58" />
          <span>{currentScene.name}</span>
          <ChevronDown size={12} />
        </PixelButton>

        {isSceneMenuOpen && (
          <div
            ref={scenePopupRef}
            className="custom-scrollbar"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              minWidth: '220px',
              maxWidth: 'calc(100vw - 20px)',
              maxHeight: '280px',
              overflowY: 'auto',
              zIndex: 1000,
              background: 'rgba(25, 20, 22, 0.96)',
              backdropFilter: 'blur(14px)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
            }}
          >
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSceneChange(s);
                  setIsSceneMenuOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  background: s.id === currentScene.id ? 'rgba(74, 53, 50, 0.9)' : 'transparent',
                  color: s.id === currentScene.id ? '#ffd166' : '#f5e6d3',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: "'VT323', monospace",
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{s.name}</span>
                <span style={{ fontSize: '10px', color: '#a09080' }}>{s.subtitle}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Train switch button with dropdown listing ALL 12 train templates */}
      <div ref={trainBtnRef} style={{ position: 'relative' }}>
        <PixelButton
          active={isTrainMenuOpen}
          onClick={() => {
            setIsTrainMenuOpen(!isTrainMenuOpen);
            setIsSceneMenuOpen(false);
          }}
          title="Chọn mẫu đoàn tàu (12 Themes)"
        >
          <TrainTrack size={14} color="#e056fd" />
          <span>{currentTrain.name}</span>
          <ChevronDown size={12} />
        </PixelButton>

        {isTrainMenuOpen && (
          <div
            ref={trainPopupRef}
            className="custom-scrollbar"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '320px',
              maxWidth: 'calc(100vw - 20px)',
              maxHeight: '260px',
              overflowY: 'auto',
              zIndex: 1000,
              background: 'rgba(25, 20, 22, 0.96)',
              backdropFilter: 'blur(14px)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
            }}
          >
            <div style={{ padding: '4px 8px', fontSize: '10px', color: '#ffd166', letterSpacing: '1px' }}>
              CHỌN MẪU ĐOÀN TÀU ({trains.length} LOẠI)
            </div>
            {trains.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onTrainChange(t);
                  setIsTrainMenuOpen(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  background: t.id === currentTrain.id ? 'rgba(74, 53, 50, 0.9)' : 'rgba(255, 255, 255, 0.03)',
                  color: t.id === currentTrain.id ? '#ffd166' : '#f5e6d3',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  fontFamily: "'VT323', monospace",
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                  {t.hasSmoke && <span style={{ fontSize: '9px', color: '#aaa' }}>💨 Hơi nước</span>}
                </div>
                {/* Mini sprite preview */}
                <div style={{ height: '28px', overflow: 'hidden', display: 'flex', alignItems: 'center', opacity: 0.9 }}>
                  <img
                    src={t.bodyUrl}
                    alt={t.name}
                    style={{ height: '24px', maxWidth: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
                  />
                </div>
                <span style={{ fontSize: '10px', color: '#a09080' }}>{t.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Auto-Tour Toggle Button */}
      {onToggleAutoTour && (
        <PixelButton
          active={isAutoTour}
          onClick={onToggleAutoTour}
          title={isAutoTour ? 'Đang tự chuyển ga (60s/ga). Nhấn để dừng tại ga này' : 'Nhấn để bật tự động chuyển ga'}
        >
          <Compass size={14} color="#edb08f" />
          <span>{isAutoTour ? 'TỰ CHUYỂN GA' : 'DỪNG TẠI GA'}</span>
        </PixelButton>
      )}
    </div>
  );
};
