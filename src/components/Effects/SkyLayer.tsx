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

  // =========================================================================
  // 1. THIÊN THỂ: HIỆU ỨNG T1 LẶN XUỐNG VÀ T2 MỌC LÊN KHI ĐỔI THỜI ĐIỂM
  // Khi đổi thời gian:
  // - Thiên thể t1 (thời điểm cũ) giữ nguyên vị trí của t1 và lặn thẳng đứng xuống sau chân trời.
  // - Thiên thể t2 (thời điểm mới) xuất hiện từ dưới chân trời tại vị trí của t2 và mọc thẳng đứng lên.
  // =========================================================================
  const [currentCelestial, setCurrentCelestial] = useState<CelestialItemConfig>(() => getCelestialConfig(resolvedTime));
  const [isCurrentRising, setIsCurrentRising] = useState(true);

  const [departingCelestial, setDepartingCelestial] = useState<CelestialItemConfig | null>(null);
  const [isDepartingSinking, setIsDepartingSinking] = useState(false);

  const prevResolvedTimeRef = useRef(resolvedTime);
  const currentConfigRef = useRef(currentCelestial);
  currentConfigRef.current = currentCelestial;

  const celestialTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Tự động cập nhật toạ độ/kích thước khi cấu hình cảnh thay đổi nhưng không đổi thời điểm
  useEffect(() => {
    if (!departingCelestial) {
      setCurrentCelestial(getCelestialConfig(resolvedTime));
    }
  }, [scene?.sun]);

  useEffect(() => {
    if (prevResolvedTimeRef.current === resolvedTime) return;
    prevResolvedTimeRef.current = resolvedTime;

    // Clear các timeout chuyển tiếp trước đó nếu người dùng chuyển đổi nhanh
    celestialTimeoutsRef.current.forEach(clearTimeout);
    celestialTimeoutsRef.current = [];

    const oldConfig = currentConfigRef.current;
    const targetConfig = getCelestialConfig(resolvedTime);

    // Bước 1: t1 bắt đầu lặn xuống (bắt đầu tại vị trí cũ của t1)
    setDepartingCelestial(oldConfig);
    setIsDepartingSinking(false);

    // Bước 2: Chuẩn bị t2 nằm ẩn bên dưới chân trời tại vị trí mới của t2
    setCurrentCelestial(targetConfig);
    setIsCurrentRising(false);

    // Frame tiếp theo (20ms): Cho t1 trượt thẳng đứng xuống sau chân trời (1.2s)
    const tSink = setTimeout(() => {
      setIsDepartingSinking(true);
    }, 20);
    celestialTimeoutsRef.current.push(tSink);

    // Bước 3: Sau 400ms (khi t1 đang lặn dần), t2 bắt đầu mọc thẳng đứng lên vị trí mới (1.5s)
    const tRise = setTimeout(() => {
      setIsCurrentRising(true);
    }, 400);
    celestialTimeoutsRef.current.push(tRise);

    // Bước 4: Sau 1200ms: t1 đã hoàn toàn chìm xuống dưới chân trời -> dọn dẹp departingCelestial
    const tClean = setTimeout(() => {
      setDepartingCelestial(null);
      setIsDepartingSinking(false);
    }, 1200);
    celestialTimeoutsRef.current.push(tClean);

    return () => {
      celestialTimeoutsRef.current.forEach(clearTimeout);
      celestialTimeoutsRef.current = [];
    };
  }, [resolvedTime]);

  // =========================================================================
  // =========================================================================
  // 2. MÂY THƯA THỚT (Sử dụng bộ asset mây anime Studio Ghibli mới, thanh bình, sắc nét)
  // =========================================================================
  const cloudVariants = useMemo(() => {
    switch (resolvedTime) {
      case 'sunset':
        return {
          cloud1: './assets/sky/clouds/ghibli_cloud_02.png',
          cloud2: './assets/sky/clouds/ghibli_cloud_05.png',
          filter: 'sepia(0.55) saturate(2.2) hue-rotate(-25deg) brightness(0.95)',
        };
      case 'night':
        return {
          cloud1: './assets/sky/clouds/ghibli_cloud_06.png',
          cloud2: './assets/sky/clouds/ghibli_cloud_03.png',
          filter: 'brightness(0.38) saturate(0.6) hue-rotate(15deg) contrast(1.15)',
        };
      case 'dawn':
        return {
          cloud1: './assets/sky/clouds/ghibli_cloud_03.png',
          cloud2: './assets/sky/clouds/ghibli_cloud_07.png',
          filter: 'sepia(0.48) saturate(2.4) hue-rotate(-42deg) brightness(0.96) drop-shadow(0 0 16px rgba(242, 171, 149, 0.45))',
        };
      case 'day':
      default:
        return {
          cloud1: './assets/sky/clouds/ghibli_cloud_01.png',
          cloud2: './assets/sky/clouds/ghibli_cloud_04.png',
          filter: 'brightness(1.04) contrast(1.02)',
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

      {/* 1. Mặt Trời hoặc Mặt Trăng: t1 lặn xuống, t2 mọc lên */}
      {/* Thiên thể cũ t1 (Lặn thẳng đứng xuống sau chân trời tại vị trí của t1) */}
      {departingCelestial && (
        <div
          key={`departing-${departingCelestial.time}`}
          style={{
            position: 'absolute',
            top: departingCelestial.top,
            left: departingCelestial.left,
            width: `${departingCelestial.width}px`,
            height: 'auto',
            opacity: isDepartingSinking ? 0 : departingCelestial.opacity,
            filter: departingCelestial.filter,
            transform: isDepartingSinking ? 'translateY(55vh)' : 'translateY(0px)',
            transition: isDepartingSinking
              ? 'transform 1.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.9s ease-in, filter 1.0s ease'
              : 'none',
            pointerEvents: 'none',
          }}
        >
          <PixelSun time={departingCelestial.time} />
        </div>
      )}

      {/* Thiên thể mới t2 (Mọc thẳng đứng lên từ sau chân trời tại vị trí của t2) */}
      <div
        key={`current-${currentCelestial.time}`}
        style={{
          position: 'absolute',
          top: currentCelestial.top,
          left: currentCelestial.left,
          width: `${currentCelestial.width}px`,
          height: 'auto',
          opacity: isCurrentRising ? currentCelestial.opacity : 0,
          filter: currentCelestial.filter,
          transform: isCurrentRising ? 'translateY(0px)' : 'translateY(55vh)',
          transition: isCurrentRising
            ? 'transform 1.5s cubic-bezier(0, 0, 0.2, 1), opacity 1.2s ease-out, filter 1.4s ease'
            : 'none',
          pointerEvents: 'none',
        }}
      >
        <PixelSun time={currentCelestial.time} />
      </div>

      {/* 2. Mây thưa thớt (Chỉ 2 cụm mây anime Studio Ghibli lướt chậm, tạo không gian thoáng đãng) */}
      {/* Đám mây 1 (Tầng cao nhẹ nhàng) */}
      <div
        style={{
          position: 'absolute',
          top: '7%',
          left: 0,
          width: '120px',
          animation: `skyCloudDrift1 140s linear infinite`,
          animationDelay: '-40s',
          animationPlayState: animPlayState,
          opacity: 0.85,
        }}
      >
        <img
          src={cloudVariants.cloud1}
          alt="Cloud Ghibli 1"
          style={{
            width: '100%',
            height: 'auto',
            filter: cloudVariants.filter,
            transition: 'filter 1.5s ease',
          }}
        />
      </div>

      {/* Đám mây 2 (Tầng trung bình bồng bềnh) */}
      <div
        style={{
          position: 'absolute',
          top: '16%',
          left: 0,
          width: '165px',
          animation: `skyCloudDrift2 110s linear infinite`,
          animationDelay: '-90s',
          animationPlayState: animPlayState,
          opacity: 0.88,
        }}
      >
        <img
          src={cloudVariants.cloud2}
          alt="Cloud Ghibli 2"
          style={{
            width: '100%',
            height: 'auto',
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
