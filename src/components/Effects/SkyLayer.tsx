import React, { useMemo, useState, useEffect, useRef } from 'react';
import { TimeOfDay, SceneConfig } from '../../types';
import { LightingTheme, resolveTimeOfDay } from '../../engines/LightingManager';
import { PixelSun, PixelCelestialType } from './PixelSun';

interface SkyLayerProps {
  timeOfDay: TimeOfDay;
  lighting: LightingTheme;
  isPaused?: boolean;
  scene?: SceneConfig;
}

interface ActiveSkyEvent {
  id: number;
  type: 'balloon' | 'jet' | 'biplane' | 'birds';
  src: string;
  direction: 'left-to-right' | 'right-to-left';
  top: string;
  width: number;
  duration: number; // thời gian bay qua màn hình (giây)
  opacity: number;
}

export const SkyLayer: React.FC<SkyLayerProps> = ({
  timeOfDay,
  lighting: _lighting,
  isPaused = false,
  scene,
}) => {
  const resolvedTime = useMemo(() => resolveTimeOfDay(timeOfDay), [timeOfDay]);

  interface CelestialItemConfig {
    time: PixelCelestialType;
    top: string;
    left: string;
    width: number;
    filter: string;
    opacity: number;
  }

  const formatCoord = (val: number | string | undefined, defaultVal: string): string => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'number') {
      if (val <= 1 && val > 0) return `${val * 100}%`;
      return `${val}%`;
    }
    return String(val);
  };

  const getCelestialConfig = (resolvedTime: 'dawn' | 'day' | 'sunset' | 'night'): CelestialItemConfig => {
    const sunOverride = scene?.sun?.[resolvedTime];

    switch (resolvedTime) {
      case 'dawn':
        return {
          time: 'dawn',
          top: formatCoord(sunOverride?.top ?? sunOverride?.y, '46%'), // Nằm sát đường chân trời, nhô lên sau rặng núi/hòn đảo
          left: formatCoord(sunOverride?.left ?? sunOverride?.x, '72%'),
          width: Number(sunOverride?.width ?? sunOverride?.size ?? 130), // Mặt trời bình minh pixel art
          filter: 'drop-shadow(0 0 28px rgba(255, 175, 120, 0.8)) drop-shadow(0 0 52px rgba(255, 140, 80, 0.45))',
          opacity: 0.98,
        };
      case 'day':
        return {
          time: 'day',
          top: formatCoord(sunOverride?.top ?? sunOverride?.y, '12%'),
          left: formatCoord(sunOverride?.left ?? sunOverride?.x, '68%'),
          width: Number(sunOverride?.width ?? sunOverride?.size ?? 58), // Mặt trời giữa trưa pixel art
          filter: 'drop-shadow(0 0 18px rgba(255, 230, 90, 0.85))',
          opacity: 1,
        };
      case 'sunset':
        return {
          time: 'sunset',
          top: formatCoord(sunOverride?.top ?? sunOverride?.y, '44%'), // Nằm thấp sát chân trời, lặn dần sau đường chân trời
          left: formatCoord(sunOverride?.left ?? sunOverride?.x, '24%'),
          width: Number(sunOverride?.width ?? sunOverride?.size ?? 140), // Mặt trời hoàng hôn pixel art
          filter: 'drop-shadow(0 0 32px rgba(255, 95, 40, 0.88)) drop-shadow(0 0 60px rgba(230, 60, 20, 0.5))',
          opacity: 0.98,
        };
      case 'night':
        return {
          time: 'night',
          top: formatCoord(sunOverride?.top ?? sunOverride?.y, '14%'),
          left: formatCoord(sunOverride?.left ?? sunOverride?.x, '78%'),
          width: Number(sunOverride?.width ?? sunOverride?.size ?? 38),
          filter: 'drop-shadow(0 0 14px rgba(220, 230, 255, 0.75))',
          opacity: 0.92,
        };
    }
  };

  type CelestialPhase = 'idle' | 'sinking' | 'rising-prep' | 'rising';

  // =========================================================================
  // 1. THIÊN THỂ: HIỆU ỨNG LẶN THẲNG ĐỨNG VÀ MỌC THẲNG ĐỨNG KHI ĐỔI THỜI ĐIỂM
  // Khi đổi thời gian: mặt trời/trăng cũ chìm thẳng đứng xuống sau chân trời,
  // sau đó mặt trời/trăng mới mọc thẳng đứng lên từ chân trời tại vị trí mới.
  // =========================================================================
  const [displayedCelestial, setDisplayedCelestial] = useState<CelestialItemConfig>(() => getCelestialConfig(resolvedTime));
  const [celestialPhase, setCelestialPhase] = useState<CelestialPhase>('idle');
  const prevResolvedTimeRef = useRef(resolvedTime);
  const celestialTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Tự động cập nhật vị trí/kích thước khi cấu hình cảnh thay đổi
  useEffect(() => {
    if (celestialPhase === 'idle') {
      setDisplayedCelestial(getCelestialConfig(resolvedTime));
    }
  }, [scene?.sun, resolvedTime]);

  useEffect(() => {
    if (prevResolvedTimeRef.current === resolvedTime) return;
    prevResolvedTimeRef.current = resolvedTime;

    // Clear các timeout chuyển tiếp trước đó nếu người dùng chuyển đổi nhanh
    celestialTimeoutsRef.current.forEach(clearTimeout);
    celestialTimeoutsRef.current = [];

    const targetConfig = getCelestialConfig(resolvedTime);

    // Giai đoạn 1: Lặn thẳng đứng xuống sau dãy núi/chân trời (1.2s)
    setCelestialPhase('sinking');

    const t1 = setTimeout(() => {
      // Giai đoạn 2: Hoán đổi tọa độ X và asset mới khi đang ở dưới đáy (tức thời, không animation ngang)
      setDisplayedCelestial(targetConfig);
      setCelestialPhase('rising-prep');

      const t2 = setTimeout(() => {
        // Giai đoạn 3: Bắt đầu nhô thẳng đứng lên từ chân trời lên vị trí mới (1.6s)
        setCelestialPhase('rising');

        const t3 = setTimeout(() => {
          setCelestialPhase('idle');
        }, 1600);
        celestialTimeoutsRef.current.push(t3);
      }, 50);
      celestialTimeoutsRef.current.push(t2);
    }, 1200);
    celestialTimeoutsRef.current.push(t1);

    return () => {
      celestialTimeoutsRef.current.forEach(clearTimeout);
      celestialTimeoutsRef.current = [];
    };
  }, [resolvedTime]);

  // =========================================================================
  // 2. MÂY THƯA THỚT (Chỉ 2 đám mây nhỏ nhẹ, thanh bình, không bị dày đặc)
  // =========================================================================
  const cloudVariants = useMemo(() => {
    switch (resolvedTime) {
      case 'sunset':
        return {
          cloud1: './assets/sky/clouds/cloud_05_large.png',
          cloud2: './assets/sky/clouds/cloud_14_huge.png',
          filter: 'sepia(0.55) saturate(2.2) hue-rotate(-25deg) brightness(0.95)',
        };
      case 'night':
        return {
          cloud1: './assets/sky/clouds/cloud_04_large.png',
          cloud2: './assets/sky/clouds/cloud_09_huge.png',
          filter: 'brightness(0.38) saturate(0.6) hue-rotate(15deg) contrast(1.15)',
        };
      case 'dawn':
        return {
          cloud1: './assets/sky/clouds/cloud_10_medium.png',
          cloud2: './assets/sky/clouds/cloud_16_large.png',
          filter: 'sepia(0.25) saturate(1.4) hue-rotate(-15deg) brightness(1.02)',
        };
      case 'day':
      default:
        return {
          cloud1: './assets/sky/clouds/cloud_06_small.png',
          cloud2: './assets/sky/clouds/cloud_20_large.png',
          filter: 'brightness(1.05) contrast(1.02)',
        };
    }
  }, [resolvedTime]);

  // =========================================================================
  // 3. SỰ KIỆN BAY NGẪU NHIÊN (Chỉ 1 object xuất hiện tại một thời điểm)
  // =========================================================================
  const [activeEvent, setActiveEvent] = useState<ActiveSkyEvent | null>(null);
  const nextSpawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hàm kích hoạt 1 sự kiện ngẫu nhiên
    const scheduleNextEvent = (delayMs: number) => {
      if (nextSpawnTimeoutRef.current) clearTimeout(nextSpawnTimeoutRef.current);
      nextSpawnTimeoutRef.current = setTimeout(() => {
        spawnRandomEvent();
      }, delayMs);
    };

    const spawnRandomEvent = () => {
      // Danh sách các loại vật thể có thể xuất hiện theo thời gian
      const candidates: Array<'balloon' | 'jet' | 'biplane' | 'birds'> = [];

      if (resolvedTime === 'night') {
        // Ban đêm: máy bay dân dụng đèn nháy hoặc đàn chim đêm
        candidates.push('jet', 'jet', 'birds');
      } else {
        // Ban ngày / bình minh / hoàng hôn: khinh khí cầu, đàn chim, máy bay phản lực, máy bay cổ điển
        candidates.push('balloon', 'birds', 'birds', 'jet', 'biplane');
      }

      const chosenType = candidates[Math.floor(Math.random() * candidates.length)];
      const direction: 'left-to-right' | 'right-to-left' = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';

      let src = './assets/sky/flying/birds_flock.png';
      let width = 42;
      let duration = 38; // giây
      let topPercent = 14;

      switch (chosenType) {
        case 'balloon':
          src = './assets/sky/flying/hot_air_balloon.png';
          width = 30; // khinh khí cầu nhỏ nhắn đằng xa
          duration = 85; // trôi rất thong thả
          topPercent = 15 + Math.floor(Math.random() * 10); // 15% - 25%
          break;
        case 'jet':
          src = './assets/sky/flying/airplane_jet.png';
          width = 62; // máy bay phản lực nhỏ ở tầng cao
          duration = 45;
          topPercent = 8 + Math.floor(Math.random() * 8); // 8% - 16%
          break;
        case 'biplane':
          src = './assets/sky/flying/airplane_biplane.png';
          width = 38; // máy bay cánh kép nhỏ
          duration = 52;
          topPercent = 12 + Math.floor(Math.random() * 10); // 12% - 22%
          break;
        case 'birds':
          src = './assets/sky/flying/birds_flock.png';
          width = 44; // đàn chim nhỏ bay lượn
          duration = 36;
          topPercent = 14 + Math.floor(Math.random() * 12); // 14% - 26%
          break;
      }

      const newEvent: ActiveSkyEvent = {
        id: Date.now(),
        type: chosenType,
        src,
        direction,
        top: `${topPercent}%`,
        width,
        duration,
        opacity: resolvedTime === 'night' && chosenType !== 'jet' ? 0.7 : 0.88,
      };

      setActiveEvent(newEvent);

      // Khi vật thể bay hết thời gian, dọn dẹp và lên lịch cho sự kiện tiếp theo sau một khoảng nghỉ yên bình (18s - 35s)
      if (eventEndTimeoutRef.current) clearTimeout(eventEndTimeoutRef.current);
      eventEndTimeoutRef.current = setTimeout(() => {
        setActiveEvent(null);
        // Khoảng nghỉ trống giữa các sự kiện từ 18 đến 35 giây để bầu trời có lúc tĩnh lặng hoàn toàn
        const pauseDelay = 18000 + Math.random() * 17000;
        scheduleNextEvent(pauseDelay);
      }, duration * 1000);
    };

    // Khởi động sự kiện đầu tiên sau 6 giây mở ứng dụng
    scheduleNextEvent(6000);

    return () => {
      if (nextSpawnTimeoutRef.current) clearTimeout(nextSpawnTimeoutRef.current);
      if (eventEndTimeoutRef.current) clearTimeout(eventEndTimeoutRef.current);
    };
  }, [resolvedTime]);

  const animPlayState = isPaused ? 'paused' : 'running';

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1, // Nằm dưới Landmark Background (zIndex 2) để rặng núi & thành phố che khuất tự nhiên
      }}
    >
      <style>{`
        @keyframes skyCloudDrift1 {
          0% {
            transform: translateX(105vw);
          }
          100% {
            transform: translateX(-250px);
          }
        }

        @keyframes skyCloudDrift2 {
          0% {
            transform: translateX(105vw);
          }
          100% {
            transform: translateX(-250px);
          }
        }

        @keyframes eventFlyLeftToRight {
          0% {
            transform: translateX(-150px);
          }
          100% {
            transform: translateX(105vw);
          }
        }

        @keyframes eventFlyRightToLeft {
          0% {
            transform: translateX(105vw);
          }
          100% {
            transform: translateX(-150px);
          }
        }

        @keyframes balloonGentleBob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>

      {/* 1. Mặt Trời hoặc Mặt Trăng (Lặn thẳng đứng xuống sau chân trời, rồi mọc thẳng đứng lên ở vị trí mới) */}
      {(() => {
        let celestialTransform = 'translateY(0px)';
        let celestialOpacity = displayedCelestial.opacity;
        let celestialTransition = 'none';

        if (celestialPhase === 'sinking') {
          celestialTransform = 'translateY(55vh)';
          celestialOpacity = 0;
          celestialTransition = 'transform 1.2s cubic-bezier(0.4, 0, 1, 1), opacity 1.0s ease-in, filter 1.0s ease';
        } else if (celestialPhase === 'rising-prep') {
          celestialTransform = 'translateY(55vh)';
          celestialOpacity = 0;
          celestialTransition = 'none';
        } else if (celestialPhase === 'rising') {
          celestialTransform = 'translateY(0px)';
          celestialOpacity = displayedCelestial.opacity;
          celestialTransition = 'transform 1.6s cubic-bezier(0, 0, 0.2, 1), opacity 1.4s ease-out, filter 1.6s ease';
        }

        return (
          <div
            style={{
              position: 'absolute',
              top: displayedCelestial.top,
              left: displayedCelestial.left,
              width: `${displayedCelestial.width}px`,
              height: 'auto',
              opacity: celestialOpacity,
              filter: displayedCelestial.filter,
              transform: celestialTransform,
              transition: celestialTransition,
              pointerEvents: 'none',
            }}
          >
            <PixelSun time={displayedCelestial.time} />
          </div>
        );
      })()}

      {/* 2. Mây thưa thớt (Chỉ 2 cụm mây nhỏ lướt chậm, tạo không gian thoáng đãng) */}
      {/* Đám mây 1 (Tầng cao nhỏ nhẹ) */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: 0,
          width: '95px',
          animation: `skyCloudDrift1 135s linear infinite`,
          animationDelay: '-40s',
          animationPlayState: animPlayState,
          opacity: 0.72,
        }}
      >
        <img
          src={cloudVariants.cloud1}
          alt="Cloud gentle 1"
          style={{
            width: '100%',
            height: 'auto',
            imageRendering: 'pixelated',
            filter: cloudVariants.filter,
            transition: 'filter 1.5s ease',
          }}
        />
      </div>

      {/* Đám mây 2 (Tầng trung bình dài mỏng) */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: 0,
          width: '135px',
          animation: `skyCloudDrift2 105s linear infinite`,
          animationDelay: '-90s',
          animationPlayState: animPlayState,
          opacity: 0.76,
        }}
      >
        <img
          src={cloudVariants.cloud2}
          alt="Cloud gentle 2"
          style={{
            width: '100%',
            height: 'auto',
            imageRendering: 'pixelated',
            filter: cloudVariants.filter,
            transition: 'filter 1.5s ease',
          }}
        />
      </div>

      {/* 3. Sự kiện ngẫu nhiên duy nhất (Chỉ 1 object xuất hiện tại một thời điểm) */}
      {activeEvent && (
        <div
          key={activeEvent.id}
          style={{
            position: 'absolute',
            top: activeEvent.top,
            left: 0,
            animation: `${activeEvent.direction === 'left-to-right' ? 'eventFlyLeftToRight' : 'eventFlyRightToLeft'} ${activeEvent.duration}s linear forwards`,
            animationPlayState: animPlayState,
            opacity: activeEvent.opacity,
          }}
        >
          <div
            style={{
              width: `${activeEvent.width}px`,
              animation: activeEvent.type === 'balloon' ? 'balloonGentleBob 6s ease-in-out infinite' : 'none',
              animationPlayState: animPlayState,
              // Ảnh gốc hướng mặt sang TRÁI. Khi bay từ Trái qua Phải thì lật gương scaleX(-1) để hướng đầu bay đúng chiều
              transform: activeEvent.direction === 'left-to-right' && activeEvent.type !== 'balloon' ? 'scaleX(-1)' : 'none',
            }}
          >
            <img
              src={activeEvent.src}
              alt={activeEvent.type}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                imageRendering: 'pixelated',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
