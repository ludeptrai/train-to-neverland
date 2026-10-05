import React, { useEffect, useRef, useState } from 'react';
import { TimeOfDay, SceneConfig, TrainTheme } from '../types';
import { LightingTheme, resolveTimeOfDay } from './LightingManager';
import {
  TunnelDarknessOverlay,
  TunnelPhase,
} from '../components/Effects/TunnelDarknessOverlay';
import { SkyLayer } from '../components/Effects/SkyLayer';
import { PixelSkyGradient } from '../components/Effects/PixelSkyGradient';
import { audioManager } from './AudioManager';
import { preloadSceneAssets } from '../utils/assetLoader';

interface ParallaxEngineProps {
  scene: SceneConfig;
  train: TrainTheme;
  lighting: LightingTheme;
  timeOfDay?: TimeOfDay;
  isPaused?: boolean;
}

export const ParallaxEngine: React.FC<ParallaxEngineProps> = ({
  scene,
  train,
  lighting,
  timeOfDay = 'day',
  isPaused = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Position offsets
  const bgOffsetRef = useRef(0);
  const mgOffsetRef = useRef(0);
  const fgOffsetRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const [bgOffset, setBgOffset] = useState(0);
  const [mgOffset, setMgOffset] = useState(0);
  const [fgOffset, setFgOffset] = useState(0);
  const [trainBounce, setTrainBounce] = useState(0);

  // Background True Aspect Ratio & Responsive Viewport Tracking
  const [bgAspectRatio, setBgAspectRatio] = useState<number>(1920 / 1080);
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        if (w > 0 && h > 0) {
          setViewportSize({ width: w, height: h });
        }
      }
    };
    handleResize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => handleResize());
      ro.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Steam puffs for steam train
  const [steamPuffs, setSteamPuffs] = useState<Array<{ id: number; x: number; y: number; size: number; alpha: number }>>([]);

  // Wheel sparks inside tunnel
  const [sparks, setSparks] = useState<Array<{ id: number; x: number; y: number; alpha: number; color: string }>>([]);

  // 1-Flow Seamless Tunnel Transition with Dynamic Asset Preloading
  const [displayedScene, setDisplayedScene] = useState<SceneConfig>(scene);
  const [tunnelPhase, setTunnelPhase] = useState<TunnelPhase>('idle');
  const isTunneling = tunnelPhase !== 'idle';
  const [targetStation, setTargetStation] = useState({ name: '', subtitle: '' });

  useEffect(() => {
    if (!displayedScene.backgroundUrl) return;
    const img = new Image();
    img.src = displayedScene.backgroundUrl;
    if (img.complete && img.naturalWidth && img.naturalHeight) {
      setBgAspectRatio(img.naturalWidth / img.naturalHeight);
    } else {
      img.onload = () => {
        if (img.naturalWidth && img.naturalHeight) {
          setBgAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      };
    }
  }, [displayedScene.backgroundUrl]);

  // Dynamic Live Metadata Sync: Reads meta.json directly with cache-busting timestamp on Ctrl+Shift+R
  useEffect(() => {
    let cancelled = false;
    const fetchLiveMeta = async () => {
      try {
        const res = await fetch(`./assets/landscapes/${displayedScene.id}/meta.json?t=${Date.now()}`);
        if (!res.ok) return;
        const meta = await res.json();
        if (cancelled) return;

        setDisplayedScene((prev) => {
          if (prev.id !== displayedScene.id) return prev;
          return {
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
            ...(meta.backgroundUrl ? { backgroundUrl: meta.backgroundUrl } : {}),
            ...(meta.midgroundUrl ? { midgroundUrl: meta.midgroundUrl } : {}),
            ...(meta.backgroundLightsUrl ? { backgroundLightsUrl: meta.backgroundLightsUrl } : {}),
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
            ...(meta.bgMirror !== undefined ? { bgMirror: Boolean(meta.bgMirror) } : (meta.mirrorBackground !== undefined ? { bgMirror: Boolean(meta.mirrorBackground) } : {})),
            ...(Boolean(meta.sun || meta.celestial || meta.sunDawnY !== undefined || meta.sunDayY !== undefined || meta.sunSunsetY !== undefined) ? {
              sun: {
                dawn: {
                  ...((meta.sun && meta.sun.dawn) || (meta.celestial && meta.celestial.dawn) || {}),
                  ...(meta.sunDawnY !== undefined ? { y: meta.sunDawnY } : {}),
                  ...(meta.sunDawnSize !== undefined ? { size: Number(meta.sunDawnSize) } : {}),
                },
                day: {
                  ...((meta.sun && meta.sun.day) || (meta.celestial && meta.celestial.day) || {}),
                  ...(meta.sunDayY !== undefined ? { y: meta.sunDayY } : {}),
                  ...(meta.sunDaySize !== undefined ? { size: Number(meta.sunDaySize) } : {}),
                },
                sunset: {
                  ...((meta.sun && meta.sun.sunset) || (meta.celestial && meta.celestial.sunset) || {}),
                  ...(meta.sunSunsetY !== undefined ? { y: meta.sunSunsetY } : {}),
                  ...(meta.sunSunsetSize !== undefined ? { size: Number(meta.sunSunsetSize) } : {}),
                },
                night: {
                  ...((meta.sun && meta.sun.night) || (meta.celestial && meta.celestial.night) || {}),
                  ...(meta.sunNightY !== undefined ? { y: meta.sunNightY } : {}),
                  ...(meta.sunNightSize !== undefined ? { size: Number(meta.sunNightSize) } : {}),
                },
              }
            } : {}),
          };
        });
      } catch {
        // Fallback to static scene config
      }
    };
    fetchLiveMeta();
    return () => {
      cancelled = true;
    };
  }, [displayedScene.id]);

  const activeTransitionTargetId = useRef<string | null>(null);
  const transitionSeqRef = useRef<number>(0);

  const startTunnelTransition = async (targetScene: SceneConfig) => {
    const seq = ++transitionSeqRef.current;
    activeTransitionTargetId.current = targetScene.id;

    setTargetStation({
      name: targetScene.name,
      subtitle: `${targetScene.location} • ${targetScene.subtitle}`,
    });

    // 1. Pha 1: Bắt đầu vào hầm (quét bóng đen phủ màn hình - 1000ms)
    setTunnelPhase('entering');
    audioManager.enterTunnel(0.5);

    // Kích hoạt tải ngầm ngay lập tức toàn bộ ảnh nền của ga mới trong khi đang vào hầm
    const preloadPromise = preloadSceneAssets(targetScene, 9000);

    // Chờ 1000ms để màn đen phủ kín 100% màn hình
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (seq !== transitionSeqRef.current) return;

    // 2. Pha 2: Trong lòng hầm tối (Inside)
    setTunnelPhase('inside');
    const insideStartTime = Date.now();
    const MIN_INSIDE_DURATION = 1600; // Ít nhất 1.6s để tạo cảm giác chạy trong hầm và đọc tên ga

    // CHỜ CHO ASSET GA MỚI TẢI XONG 100% TRONG LÒNG HẦM (không lo bị pop-in hay giật hình)
    await preloadPromise;
    if (seq !== transitionSeqRef.current) return;

    // Nếu mạng tải nhanh hơn MIN_INSIDE_DURATION thì vẫn giữ trong hầm đủ 1.6s cho mượt mắt
    const elapsed = Date.now() - insideStartTime;
    if (elapsed < MIN_INSIDE_DURATION) {
      await new Promise((resolve) => setTimeout(resolve, MIN_INSIDE_DURATION - elapsed));
    }
    if (seq !== transitionSeqRef.current) return;

    // Tráo cảnh nền mới khi màn hình đang được che phủ 100% trong hầm
    setDisplayedScene(targetScene);

    // Nhịp nghỉ nhỏ 80ms để trình duyệt render xong cảnh nền mới
    await new Promise((resolve) => setTimeout(resolve, 80));
    if (seq !== transitionSeqRef.current) return;

    // 3. Pha 3: Bắt đầu ra khỏi hầm (quét mở bóng đen sang trái - 1100ms)
    setTunnelPhase('exiting');
    audioManager.exitTunnel(0.8);

    await new Promise((resolve) => setTimeout(resolve, 1100));
    if (seq !== transitionSeqRef.current) return;

    // 4. Hoàn tất hành trình hầm
    setTunnelPhase('idle');
    activeTransitionTargetId.current = null;
  };

  // Kích hoạt chuyển cảnh hầm khi scene thay đổi
  useEffect(() => {
    if (scene.id !== displayedScene.id && activeTransitionTargetId.current !== scene.id) {
      startTunnelTransition(scene);
    }
  }, [scene.id, displayedScene.id]);

  // Cleanup chỉ chạy khi unmount ParallaxEngine
  useEffect(() => {
    return () => {
      transitionSeqRef.current++;
      audioManager.exitTunnel(0.2);
    };
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 16.66, 2.0);
      lastTime = currentTime;

      if (!isPaused) {
        // Update background offset (slow) with seamless mirror cycle if enabled, or simple seamless repeat
        const isMirrorEnabled = displayedScene.bgMirror !== false;
        const cycleWidth = (panelWidthRef.current || 1920) * (isMirrorEnabled ? 2 : 1);
        bgOffsetRef.current = (bgOffsetRef.current + displayedScene.bgSpeed * 1.5 * delta) % cycleWidth;
        // Update midground track offset (fast) - scrolling smoothly forever
        mgOffsetRef.current = (mgOffsetRef.current + displayedScene.mgSpeed * 5.5 * delta) % 100000;
        // Update foreground offset (fastest, parallax in front of train)
        const fgSpeedMultiplier = displayedScene.fgSpeed ?? 1.35;
        fgOffsetRef.current = (fgOffsetRef.current + displayedScene.mgSpeed * 5.5 * fgSpeedMultiplier * delta) % 100000;

        setBgOffset(bgOffsetRef.current);
        setMgOffset(mgOffsetRef.current);
        setFgOffset(fgOffsetRef.current);

        // Train micro-bounce (gentle 0.6px suspension oscillation like Slow Rail)
        const bounce = Math.sin(currentTime * 0.008) * 0.6;
        setTrainBounce(bounce);

        // Steam puffs logic if retro train
        if (train.hasSmoke && Math.random() < 0.15) {
          setSteamPuffs((prev) => [
            ...prev.slice(-15),
            {
              id: Date.now() + Math.random(),
              x: 0,
              y: 0,
              size: 8,
              alpha: 0.8,
            },
          ]);
        }

        // Wheel sparks logic when train is inside tunnel
        if (isTunneling) {
          if (Math.random() < 0.28) {
            setSparks((prev) => [
              ...prev.slice(-6),
              {
                id: Math.random(),
                x: (Math.random() - 0.5) * 36,
                y: (Math.random() - 0.5) * 4,
                alpha: 1,
                color: Math.random() > 0.5 ? '#fffa65' : '#ff9f43',
              },
            ]);
          }
        }
      }

      if (train.hasSmoke) {
        setSteamPuffs((prev) =>
          prev
            .map((p) => ({
              ...p,
              x: p.x - 4.5 * delta,
              y: p.y - 1.2 * delta,
              size: p.size + 1.2 * delta,
              alpha: p.alpha - 0.025 * delta,
            }))
            .filter((p) => p.alpha > 0.05)
        );
      }

      if (sparks.length > 0) {
        setSparks((prev) =>
          prev
            .map((s) => ({
              ...s,
              x: s.x - 3.8 * delta,
              alpha: s.alpha - 0.16 * delta,
            }))
            .filter((s) => s.alpha > 0)
        );
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [scene, train, isPaused, isTunneling]);

  // Reference Stage Height (standard 21:9 cinema stage at 1920px width: 1920 * 9 / 21 = ~822.86px)
  const REFERENCE_STAGE_HEIGHT = 822.86;
  const stageScale = (viewportSize.height || REFERENCE_STAGE_HEIGHT) / REFERENCE_STAGE_HEIGHT;

  // Helper: Đồng bộ hóa toàn bộ tọa độ Y (px hoặc %) theo tỉ lệ chiều cao khung hình (ngăn lệch layer khi đổi browser width)
  const parseProportionalY = (val: string | number | undefined, defaultVal = '0px') => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'number') {
      return `${(val * stageScale).toFixed(2)}px`;
    }
    const str = String(val).trim();
    if (str.endsWith('%')) return str;
    const num = parseFloat(str);
    if (!isNaN(num)) {
      return `${(num * stageScale).toFixed(2)}px`;
    }
    return str || defaultVal;
  };

  // Dynamic Background Scaling preserving true aspect ratio & proportional Y
  const bgScale = displayedScene.bgScaleRatio ?? 1.0;
  const bgBottom = parseProportionalY(displayedScene.bgY, '0px');

  const panelHeight = Math.max(100, Math.round(viewportSize.height * bgScale));
  const panelWidth = Math.max(100, Math.round(panelHeight * bgAspectRatio));

  const panelWidthRef = useRef(panelWidth);
  panelWidthRef.current = panelWidth;

  const firstTile = Math.floor(bgOffset / panelWidth);
  const visibleTilesCount = Math.ceil(viewportSize.width / panelWidth) + 2;
  const tileIndices: number[] = [];
  for (let i = 0; i < visibleTilesCount; i++) {
    tileIndices.push(firstTile + i);
  }

  // Dynamic Midground Scaling & Proportional Y-Axis Positioning
  const mgScale = displayedScene.mgScaleRatio ?? 1.0;
  const mgHeight = `${(32 * mgScale).toFixed(2)}%`;
  const mgBottom = parseProportionalY(displayedScene.mgY, '0px');

  // Dynamic Foreground Scaling & Proportional Y-Axis Positioning
  const fgScale = displayedScene.fgScaleRatio ?? 1.0;
  const fgHeight = `${(100 * fgScale).toFixed(2)}%`;
  const fgBottom = parseProportionalY(displayedScene.fgY, '0px');

  // Vị trí đoàn tàu: bánh xe luôn bám khớp trên mặt ray tại mọi kích thước browser width/height
  const trainYStr = parseProportionalY(displayedScene.trainY, '0px');
  const trainBottom = trainYStr !== '0px' && trainYStr !== '0.00px'
    ? `calc(5.2% + ${trainYStr})`
    : '5.2%';

  const trainScale = displayedScene.trainScaleRatio ?? 1.0;
  // Chiều cao đoàn tàu co dãn tỉ lệ chuẩn theo khung hình (phóng to to hơn rõ nét: 72px chuẩn tại 1920x823)
  const trainHeightPx = Math.max(24, Math.round(72 * stageScale * trainScale));

  // Train Lights & Headlight: bật sáng khi trời tối HOẶC khi đang chui trong hầm
  const effectiveTrainLightOpacity = Math.max(lighting.emissiveOpacity, isTunneling ? 1.0 : 0);
  const isTunnelLighting = isTunneling;

  // Kích thước chùm sáng đèn pha tròn & mềm mại (tỷ lệ chuẩn theo chiều cao tàu)
  const beamHeight = Math.round(trainHeightPx * 1.45);
  const beamWidth = Math.round(beamHeight * (640 / 220));
  const beamBulbOffsetX = Math.round(beamWidth * (36 / 640));
  const beamBulbOffsetY = Math.round(beamHeight * (110 / 220));

  const effectiveTime = resolveTimeOfDay(timeOfDay);
  const sceneFilter = typeof displayedScene.ambientFilter === 'string'
    ? displayedScene.ambientFilter
    : displayedScene.ambientFilter?.[effectiveTime];
  const effectiveAmbientFilter = sceneFilter || (effectiveTime === 'night' && displayedScene.nightFilter ? displayedScene.nightFilter : lighting.ambientFilter);
  const effectiveOverlayBlend = (effectiveTime === 'night' && displayedScene.nightOverlayBlend) || lighting.overlayBlend;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: lighting.skyGradient,
        transition: 'background 1.5s ease',
      }}
    >
      {/* 0. Authentic Retro Dithered Pixel Sky Gradient */}
      <PixelSkyGradient timeOfDay={timeOfDay} />

      {/* 1. Twinkling Stars (Night only) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '60%',
          opacity: lighting.starsOpacity,
          pointerEvents: 'none',
          transition: 'opacity 1.5s ease',
          zIndex: 1,
        }}
      >
        <svg width="100%" height="100%" style={{ imageRendering: 'pixelated' }}>
          {[
            { cx: '12%', cy: '15%', r: 1.5 },
            { cx: '25%', cy: '8%', r: 2 },
            { cx: '38%', cy: '22%', r: 1 },
            { cx: '48%', cy: '12%', r: 2.5 },
            { cx: '62%', cy: '18%', r: 1.5 },
            { cx: '75%', cy: '9%', r: 2 },
            { cx: '85%', cy: '25%', r: 1 },
            { cx: '92%', cy: '14%', r: 2 },
          ].map((star, i) => (
            <circle key={i} cx={star.cx} cy={star.cy} r={star.r} fill="#fffde7" />
          ))}
        </svg>
      </div>

      {/* 1.1. Dynamic Sky Layer (Sun, Moon, Clouds, Birds, Balloon, Airplane) */}
      <SkyLayer
        timeOfDay={timeOfDay}
        lighting={lighting}
        isPaused={isPaused}
        scene={displayedScene}
      />

      {/* 2. Layer Hậu Cảnh (Landmark Background) - Seamless Parallax Mirror Loop with 100% True Aspect Ratio */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: effectiveAmbientFilter,
          transition: 'filter 1.5s ease',
          zIndex: 2,
        }}
      >
        {tileIndices.map((k) => {
          const drawX = k * panelWidth - bgOffset;
          const isMirrorEnabled = displayedScene.bgMirror !== false;
          const isMirrored = isMirrorEnabled && Math.abs(k) % 2 === 1;
          return (
            <img
              key={k}
              src={displayedScene.backgroundUrl}
              alt={`Landmark Background ${k}`}
              style={{
                position: 'absolute',
                bottom: bgBottom,
                left: `${drawX}px`,
                width: `${panelWidth}px`,
                height: `${panelHeight}px`,
                objectFit: 'fill',
                objectPosition: 'bottom left',
                imageRendering: 'pixelated',
                transform: isMirrored ? 'scaleX(-1)' : 'none',
                transformOrigin: 'center center',
              }}
            />
          );
        })}
      </div>

      {/* 2.1. Layer Đèn Đêm Thành Phố & Danh Lam (Emissive Night Lights Mask) - Lớp riêng biệt không bị mờ màu */}
      {displayedScene.backgroundLightsUrl && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: lighting.emissiveOpacity,
            transition: 'opacity 1.5s ease',
            pointerEvents: 'none',
            zIndex: 20, // Nằm trên Ambient Mood Overlay (zIndex 12) để bảo tồn 100% màu gốc không bị ám màu thời gian
          }}
        >
          {tileIndices.map((k) => {
            const drawX = k * panelWidth - bgOffset;
            const isMirrorEnabled = displayedScene.bgMirror !== false;
            const isMirrored = isMirrorEnabled && Math.abs(k) % 2 === 1;
            return (
              <img
                key={k}
                src={displayedScene.backgroundLightsUrl}
                alt={`Background Lights ${k}`}
                style={{
                  position: 'absolute',
                  bottom: bgBottom,
                  left: `${drawX}px`,
                  width: `${panelWidth}px`,
                  height: `${panelHeight}px`,
                  objectFit: 'fill',
                  objectPosition: 'bottom left',
                  imageRendering: 'pixelated',
                  transform: isMirrored ? 'scaleX(-1)' : 'none',
                  transformOrigin: 'center center',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 3. Layer Mặt Đất & Đường Ray (Midground Track) - Tự động lặp vô tận, tỷ lệ chuẩn không méo hình */}
      <div
        style={{
          position: 'absolute',
          bottom: mgBottom,
          left: 0,
          width: '100%',
          height: mgHeight,
          backgroundImage: `url(${displayedScene.midgroundUrl})`,
          backgroundRepeat: 'repeat-x',
          backgroundPosition: `${-mgOffset}px bottom`,
          backgroundSize: 'auto 100%',
          imageRendering: 'pixelated',
          filter: effectiveAmbientFilter,
          transition: 'filter 1.5s ease',
          zIndex: 10,
        }}
      />
      {displayedScene.midgroundLightsUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: mgBottom,
            left: 0,
            width: '100%',
            height: mgHeight,
            backgroundImage: `url(${displayedScene.midgroundLightsUrl})`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: `${-mgOffset}px bottom`,
            backgroundSize: 'auto 100%',
            imageRendering: 'pixelated',
            opacity: lighting.emissiveOpacity,
            transition: 'opacity 1.5s ease',
            pointerEvents: 'none',
            zIndex: 21, // Nằm trên Ambient Mood Overlay (zIndex 12) để giữ nguyên 100% màu gốc
          }}
        />
      )}

      {/* 4. Layer Đoàn Tàu (Train Theme) - Căn giữa an toàn, bánh xe luôn bám khớp trên mặt ray */}
      <div
        style={{
          position: 'absolute',
          bottom: trainBottom,
          left: '50%',
          transform: `translateX(-50%) translateY(${trainBounce}px)`,
          zIndex: 35, // Đặt đoàn tàu trên bóng đen hầm (zIndex 30) để đèn tàu rực sáng bên trong hầm
          maxWidth: '60%', // Tối đa 60% chiều ngang khung hình để đoàn tàu to rõ ràng, không bị co ép
          width: 'max-content',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {/* Steam Puffs for Retro Train */}
        {train.hasSmoke && (
          <div
            style={{
              position: 'absolute',
              top: '5px',
              right: '60px',
              pointerEvents: 'none',
              filter: effectiveAmbientFilter,
              transition: 'filter 1.5s ease',
            }}
          >
            {steamPuffs.map((puff) => (
              <div
                key={puff.id}
                style={{
                  position: 'absolute',
                  left: `${puff.x}px`,
                  top: `${puff.y}px`,
                  width: `${puff.size}px`,
                  height: `${puff.size}px`,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  opacity: puff.alpha,
                  filter: 'blur(1px)',
                }}
              />
            ))}
          </div>
        )}

        {/* Train Body Sprite & Lights Container */}
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          {/* Thân vỏ tàu chịu hiệu ứng ánh sáng môi trường / bóng hầm */}
          <img
            src={train.bodyUrl}
            alt={train.name}
            style={{
              display: 'block',
              height: `${trainHeightPx}px`,
              maxHeight: '16%',
              maxWidth: '100%',
              width: 'auto',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: isTunnelLighting
                ? 'brightness(0.92) contrast(1.15)'
                : effectiveAmbientFilter,
              transition: 'filter 0.6s ease',
            }}
          />

          {/* Train Lights (Windows & Headlight glow) - Giữ 100% màu gốc không bị ám filter/thời gian */}
          {train.lightsUrl && (
            <img
              src={train.lightsUrl}
              alt={`${train.name} Lights`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: effectiveTrainLightOpacity,
                pointerEvents: 'none',
                transition: 'opacity 0.6s ease',
                imageRendering: 'pixelated',
              }}
            />
          )}

          {/* Interior Cabin Window Glow inside Tunnel */}
          {isTunnelLighting && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 4%, rgba(255, 235, 130, 0.22) 18%, rgba(255, 220, 100, 0.3) 50%, rgba(255, 235, 130, 0.22) 82%, transparent 96%)',
                opacity: 1,
                transition: 'opacity 0.6s ease',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Chùm sáng đèn pha tròn & mềm mại (Round & Soft Pre-rendered Headlight Beam) */}
          <div
            style={{
              position: 'absolute',
              right: `-${beamWidth - beamBulbOffsetX}px`,
              bottom: `${Math.round(trainHeightPx * 0.35 - beamBulbOffsetY)}px`,
              width: `${beamWidth}px`,
              height: `${beamHeight}px`,
              pointerEvents: 'none',
              opacity: effectiveTrainLightOpacity,
              transition: 'opacity 0.6s ease',
            }}
          >
            <img
              src="./assets/trains/headlight_beam.png"
              alt="Train Headlight Beam"
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'fill',
                pointerEvents: 'none',
              }}
            />

            {/* Hạt bụi phản quang lơ lửng trong luồng sáng khi chui trong hầm tối */}
            {isTunnelLighting && (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: '18%', top: '48%', width: '3px', height: '3px', borderRadius: '50%', background: '#fff8e7', opacity: 0.85 }} />
                <div style={{ position: 'absolute', left: '35%', top: '42%', width: '2px', height: '2px', borderRadius: '50%', background: '#fff8e7', opacity: 0.7 }} />
                <div style={{ position: 'absolute', left: '55%', top: '56%', width: '3px', height: '3px', borderRadius: '50%', background: '#ffeaa7', opacity: 0.75 }} />
                <div style={{ position: 'absolute', left: '72%', top: '50%', width: '2px', height: '2px', borderRadius: '50%', background: '#ffd166', opacity: 0.55 }} />
              </div>
            )}
          </div>

          {/* Wheel Sparks on Rails under Train Bogie */}
          {sparks.map((spark) => (
            <div
              key={spark.id}
              style={{
                position: 'absolute',
                right: `${15 - spark.x}px`,
                bottom: `${2 + spark.y}px`,
                width: '3px',
                height: '3px',
                backgroundColor: spark.color,
                opacity: spark.alpha,
                imageRendering: 'pixelated',
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* 5. Layer Tiền Cảnh: Cột Điện & Dây Điện Cao Thế (Foreground Utility Poles, Wires & Props) */}
      <div
        style={{
          position: 'absolute',
          bottom: fgBottom,
          left: 0,
          width: '100%',
          height: fgHeight,
          zIndex: 38, // Nằm ở phía trước đoàn tàu (zIndex 35), tạo chiều sâu 3D Parallax chân thực
          opacity: isTunneling ? 0 : (displayedScene.fgOpacity ?? 1), // Tự động ẩn tiền cảnh ngoài trời khi tàu chui vào hầm
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      >
        {/* Lớp hình ảnh tiền cảnh (Tự động lấy ảnh riêng của địa điểm hoặc fallback về default_foreground.png) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${displayedScene.foregroundUrl || './assets/landscapes/default_foreground.png'})`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: `${-fgOffset}px bottom`,
            backgroundSize: 'auto 100%',
            imageRendering: 'pixelated',
            filter: effectiveAmbientFilter,
            transition: 'filter 1.5s ease',
          }}
        />

        {/* Ánh sáng tiền cảnh ban đêm (nếu địa điểm có file foreground_lights.png) */}
        {displayedScene.foregroundLightsUrl && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${displayedScene.foregroundLightsUrl})`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: `${-fgOffset}px bottom`,
              backgroundSize: 'auto 100%',
              imageRendering: 'pixelated',
              opacity: isTunneling ? 0 : lighting.emissiveOpacity,
              transition: 'opacity 1.5s ease',
              zIndex: 39,
            }}
          />
        )}
      </div>

      {/* 6. Ambient Mood Overlay Color (Warm tone or deep night tint cho cảnh quan) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: effectiveOverlayBlend,
          mixBlendMode: 'color',
          pointerEvents: 'none',
          transition: 'background-color 1.5s ease',
          zIndex: 12, // Đặt tại zIndex 12 để chỉ phủ màu cảnh nền (zIndex 2) và ray (zIndex 10), không đè lên đèn (zIndex 20, 21)
        }}
      />

      {/* 7. Tunnel Darkness Effect & Entrance Portal */}
      <TunnelDarknessOverlay
        isActive={isTunneling}
        phase={tunnelPhase}
        stationName={targetStation.name}
        subtitle={targetStation.subtitle}
        trainYOffset={trainYStr}
        trainBottom={trainBottom}
        bgOffset={bgOffset}
      />
    </div>
  );
};
