import React, { useEffect, useRef, useState } from 'react';
import { SceneConfig, TrainTheme } from '../types';
import { LightingTheme } from './LightingManager';

interface ParallaxEngineProps {
  scene: SceneConfig;
  train: TrainTheme;
  lighting: LightingTheme;
  isPaused?: boolean;
}

export const ParallaxEngine: React.FC<ParallaxEngineProps> = ({
  scene,
  train,
  lighting,
  isPaused = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Position offsets
  const bgOffsetRef = useRef(0);
  const mgOffsetRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const [bgOffset, setBgOffset] = useState(0);
  const [mgOffset, setMgOffset] = useState(0);
  const [trainBounce, setTrainBounce] = useState(0);

  // Steam puffs for steam train
  const [steamPuffs, setSteamPuffs] = useState<Array<{ id: number; x: number; y: number; size: number; alpha: number }>>([]);

  // Tunnel Transition State when switching stations
  const prevSceneIdRef = useRef(scene.id);
  const [displayedScene, setDisplayedScene] = useState<SceneConfig>(scene);
  const [tunnelState, setTunnelState] = useState<{
    active: boolean;
    opacity: number;
    stationName: string;
    subtitle: string;
  }>({
    active: false,
    opacity: 0,
    stationName: '',
    subtitle: '',
  });

  useEffect(() => {
    if (scene.id !== prevSceneIdRef.current) {
      prevSceneIdRef.current = scene.id;
      // Enter dark tunnel
      setTunnelState({
        active: true,
        opacity: 1,
        stationName: scene.name,
        subtitle: `${scene.location} • ${scene.subtitle}`,
      });

      // Switch landscape visually inside the dark tunnel
      const swapTimer = setTimeout(() => {
        setDisplayedScene(scene);
      }, 700);

      // Exit tunnel smoothly
      const exitTimer = setTimeout(() => {
        setTunnelState((prev) => ({ ...prev, opacity: 0 }));
      }, 1900);

      const finishTimer = setTimeout(() => {
        setTunnelState((prev) => ({ ...prev, active: false }));
      }, 2600);

      return () => {
        clearTimeout(swapTimer);
        clearTimeout(exitTimer);
        clearTimeout(finishTimer);
      };
    } else {
      setDisplayedScene(scene);
    }
  }, [scene]);

  useEffect(() => {
    let lastTime = performance.now();
    const bgWidth = 1920; // virtual canvas width for wrapping
    const mgWidth = 1680;

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 16.66, 2.0);
      lastTime = currentTime;

      if (!isPaused) {
        // Update background offset (slow)
        bgOffsetRef.current = (bgOffsetRef.current + displayedScene.bgSpeed * 1.5 * delta) % bgWidth;
        // Update midground track offset (fast)
        mgOffsetRef.current = (mgOffsetRef.current + displayedScene.mgSpeed * 5.5 * delta) % mgWidth;

        setBgOffset(bgOffsetRef.current);
        setMgOffset(mgOffsetRef.current);

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

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [scene, train, isPaused]);

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

      {/* 2. Layer Hậu Cảnh (Landmark Background) - Seamless Double Panel */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: lighting.ambientFilter,
          transition: 'filter 1.5s ease',
          zIndex: 2,
        }}
      >
        {/* Panel 1 */}
        <img
          src={displayedScene.backgroundUrl}
          alt="Landmark Background 1"
          style={{
            position: 'absolute',
            bottom: '8%',
            left: `${-bgOffset}px`,
            width: '1920px',
            height: '75%',
            objectFit: 'fill',
            objectPosition: 'bottom left',
            imageRendering: 'pixelated',
          }}
        />
        {/* Panel 2 - Mirror flipped for seamless join with Panel 1 */}
        <img
          src={displayedScene.backgroundUrl}
          alt="Landmark Background 2"
          style={{
            position: 'absolute',
            bottom: '8%',
            left: `${1920 - bgOffset}px`,
            width: '1920px',
            height: '75%',
            objectFit: 'fill',
            objectPosition: 'bottom left',
            imageRendering: 'pixelated',
            transform: 'scaleX(-1)', // Mirrored!
          }}
        />
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
            zIndex: 4,
          }}
        >
          {/* Panel 1 */}
          <img
            src={displayedScene.backgroundLightsUrl}
            alt="Background Lights 1"
            style={{
              position: 'absolute',
              bottom: '8%',
              left: `${-bgOffset}px`,
              width: '1920px',
              height: '75%',
              objectFit: 'fill',
              objectPosition: 'bottom left',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 0 2px rgba(255, 240, 150, 0.95)) drop-shadow(0 0 8px rgba(255, 195, 60, 0.85)) drop-shadow(0 0 16px rgba(255, 160, 40, 0.45))',
              mixBlendMode: 'screen',
            }}
          />
          {/* Panel 2 - Mirror flipped */}
          <img
            src={displayedScene.backgroundLightsUrl}
            alt="Background Lights 2"
            style={{
              position: 'absolute',
              bottom: '8%',
              left: `${1920 - bgOffset}px`,
              width: '1920px',
              height: '75%',
              objectFit: 'fill',
              objectPosition: 'bottom left',
              imageRendering: 'pixelated',
              transform: 'scaleX(-1)', // Mirrored!
              filter: 'drop-shadow(0 0 2px rgba(255, 240, 150, 0.95)) drop-shadow(0 0 8px rgba(255, 195, 60, 0.85)) drop-shadow(0 0 16px rgba(255, 160, 40, 0.45))',
              mixBlendMode: 'screen',
            }}
          />
        </div>
      )}

      {/* 3. Layer Mặt Đất & Đường Ray (Midground Track) - Seamless Double Panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '32%',
          filter: lighting.ambientFilter,
          transition: 'filter 1.5s ease',
          zIndex: 10,
        }}
      >
        <img
          src={displayedScene.midgroundUrl}
          alt="Midground Track 1"
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${-mgOffset}px`,
            width: '1680px',
            height: '100%',
            objectFit: 'fill',
            imageRendering: 'pixelated',
          }}
        />
        <img
          src={displayedScene.midgroundUrl}
          alt="Midground Track 2"
          style={{
            position: 'absolute',
            bottom: 0,
            left: `${1680 - mgOffset}px`,
            width: '1680px',
            height: '100%',
            objectFit: 'fill',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* 4. Layer Đoàn Tàu (Train Theme) - Căn giữa an toàn, không bao giờ tràn lề màn hình */}
      <div
        style={{
          position: 'absolute',
          bottom: '5.2%', // Tiếp xúc hoàn hảo trên mặt ray thép
          left: '50%',
          transform: `translateX(-50%) translateY(${trainBounce}px)`,
          zIndex: 15,
          filter: lighting.ambientFilter,
          transition: 'filter 1.5s ease',
          maxWidth: '52%', // Tối đa 52% chiều ngang khung hình -> luôn giữ 24% lề 2 bên, tuyệt đối không tràn
          width: 'max-content',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {/* Steam Puffs for Retro Train */}
        {train.hasSmoke && (
          <div style={{ position: 'absolute', top: '5px', right: '60px', pointerEvents: 'none' }}>
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
          <img
            src={train.bodyUrl}
            alt={train.name}
            style={{
              display: 'block',
              height: 'clamp(36px, 11vh, 58px)',
              maxHeight: '13%',
              maxWidth: '100%',
              width: 'auto',
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
          />

          {/* Train Lights (Windows & Headlight glow at night) */}
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
                opacity: lighting.emissiveOpacity,
                filter: 'drop-shadow(0 0 8px rgba(255, 230, 100, 0.95))',
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                transition: 'opacity 1.5s ease',
                imageRendering: 'pixelated',
              }}
            />
          )}

          {/* Subtle Headlight beam forward */}
          <div
            style={{
              position: 'absolute',
              right: '-60px',
              bottom: '15px',
              width: '140px',
              height: '35px',
              background: 'linear-gradient(90deg, rgba(255, 245, 150, 0.8) 0%, transparent 100%)',
              clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%)',
              opacity: lighting.emissiveOpacity * 0.7,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* 5. Layer Tiền Cảnh: Cột Điện & Dây Điện Cao Thế (Foreground Utility Poles & Catenary) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 22, // Nằm ở phía trước đoàn tàu, tạo chiều sâu 3D Parallax chân thực như Slow Rail
          pointerEvents: 'none',
        }}
      >
        {/* Dây điện cao thế chạy ngang nóc tàu */}
        <div
          style={{
            position: 'absolute',
            bottom: '22%',
            left: 0,
            width: '100%',
            height: '2px',
            backgroundColor: '#282333',
            opacity: 0.65,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '26%',
            left: 0,
            width: '100%',
            height: '1px',
            backgroundColor: '#342e40',
            opacity: 0.45,
          }}
        />

        {/* Các cột điện pixel art lướt qua phía trước màn hình */}
        {[0, 1, 2, 3].map((i) => {
          const poleSpacing = 580;
          // Tốc độ lướt qua phía trước nhanh hơn đoàn tàu (Foreground Parallax)
          const poleX = ((i * poleSpacing - mgOffset * 1.35) % (poleSpacing * 4) + (poleSpacing * 4)) % (poleSpacing * 4) - 80;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${poleX}px`,
                width: '8px',
                height: '40%',
                backgroundColor: '#242030',
                filter: lighting.ambientFilter,
                imageRendering: 'pixelated',
              }}
            >
              {/* Xà ngang đỡ sứ cách điện 1 */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '-30px',
                  width: '68px',
                  height: '5px',
                  backgroundColor: '#2f2a3d',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div style={{ position: 'absolute', top: '-5px', left: '4px', width: '5px', height: '5px', backgroundColor: '#e2d8c9' }} />
                <div style={{ position: 'absolute', top: '-5px', right: '4px', width: '5px', height: '5px', backgroundColor: '#e2d8c9' }} />
              </div>

              {/* Xà ngang đỡ sứ cách điện 2 */}
              <div
                style={{
                  position: 'absolute',
                  top: '32px',
                  left: '-18px',
                  width: '44px',
                  height: '4px',
                  backgroundColor: '#2f2a3d',
                }}
              >
                <div style={{ position: 'absolute', top: '-4px', left: '4px', width: '4px', height: '4px', backgroundColor: '#e2d8c9' }} />
                <div style={{ position: 'absolute', top: '-4px', right: '4px', width: '4px', height: '4px', backgroundColor: '#e2d8c9' }} />
              </div>

              {/* Hộp biến áp nhỏ trên thân cột */}
              <div
                style={{
                  position: 'absolute',
                  top: '52px',
                  right: '-12px',
                  width: '12px',
                  height: '22px',
                  backgroundColor: '#1b1926',
                  border: '1px solid #36324a',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 6. Ambient Mood Overlay Color (Warm tone or deep night tint) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: lighting.overlayBlend,
          mixBlendMode: 'color',
          pointerEvents: 'none',
          transition: 'background-color 1.5s ease',
          zIndex: 25,
        }}
      />

      {/* 7. Tunnel Station Transition Overlay (Hiệu ứng chui hầm chuyển ga) */}
      {tunnelState.active && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            backgroundColor: '#0c0d14',
            opacity: tunnelState.opacity,
            transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Passing tunnel ceiling lamps */}
          <div style={{ position: 'absolute', top: '15%', left: 0, width: '100%', height: '8px', overflow: 'hidden' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: `${((k * 320 - bgOffset * 9) % 2240 + 2240) % 2240 - 200}px`,
                  width: '80px',
                  height: '4px',
                  backgroundColor: '#ffb347',
                  boxShadow: '0 0 20px 4px rgba(255, 179, 71, 0.85)',
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>

          {/* Next Station Callout Badge */}
          <div
            style={{
              textAlign: 'center',
              transform: `scale(${tunnelState.opacity > 0.4 ? 1 : 0.95})`,
              transition: 'transform 0.5s ease',
              padding: '20px 40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(25, 25, 35, 0.65)',
              border: '1px solid rgba(237, 176, 143, 0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono', 'Silkscreen', monospace",
                fontSize: '11px',
                letterSpacing: '3px',
                color: '#edb08f',
                marginBottom: '8px',
                opacity: 0.95,
              }}
            >
              GA TIẾP THEO · NEXT STATION
            </div>
            <div
              style={{
                fontFamily: "'Zen Maru Gothic', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: '#fdf6ee',
                textShadow: '0 0 25px rgba(237, 176, 143, 0.65)',
              }}
            >
              {tunnelState.stationName}
            </div>
            <div
              style={{
                fontFamily: "'Zen Maru Gothic', sans-serif",
                fontSize: '13px',
                color: '#aaa4b5',
                marginTop: '6px',
              }}
            >
              {tunnelState.subtitle}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
