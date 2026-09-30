import React, { useMemo } from 'react';

export const TUNNEL_FLOW_DURATION = 4600; // ms: tăng thời lượng trải nghiệm hành trình trong hầm lên 4.6s
export const TUNNEL_SWAP_MIDPOINT = 2300; // ms: thời điểm giữa hầm tối 100% để tráo cảnh nền

export interface TunnelDarknessOverlayProps {
  isActive: boolean;
  stationName: string;
  subtitle: string;
  trainYOffset?: string;
  trainBottom?: string;
  bgOffset: number;
}

export const TunnelDarknessOverlay: React.FC<TunnelDarknessOverlayProps> = ({
  isActive,
  stationName,
  subtitle,
  trainYOffset = '0px',
  bgOffset: _bgOffset,
}) => {
  // Hạt bụi phản quang lơ lửng trong hầm
  const dustParticles = useMemo(() => {
    return [
      { id: 1, x: 22, y: 32, s: 3, o: 0.5 },
      { id: 2, x: 38, y: 58, s: 2, o: 0.65 },
      { id: 3, x: 52, y: 44, s: 3, o: 0.8 },
      { id: 4, x: 65, y: 68, s: 2, o: 0.55 },
      { id: 5, x: 78, y: 36, s: 3, o: 0.7 },
      { id: 6, x: 88, y: 52, s: 2, o: 0.45 },
    ];
  }, []);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30, // Nằm trên phong cảnh (zIndex 2, 10, 20), nhưng nằm DƯỚI đoàn tàu (zIndex 35)
        pointerEvents: 'none',
        overflow: 'hidden',
        imageRendering: 'pixelated',
      }}
    >
      <style>{`
        @keyframes tunnelShadowSweepFlow {
          0% {
            transform: translateX(115%);
            animation-timing-function: cubic-bezier(0.25, 0.85, 0.35, 1);
          }
          26% {
            transform: translateX(0%);
            animation-timing-function: linear;
          }
          74% {
            transform: translateX(0%);
            animation-timing-function: cubic-bezier(0.35, 0, 0.25, 1);
          }
          100% {
            transform: translateX(-130%);
          }
        }

        @keyframes tunnelInteriorFlow {
          0% { opacity: 0; }
          18% { opacity: 1; }
          78% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        /* TẦNG 1: ĐÈN TRẦN XA (Ceiling Far Lights) - Lướt nhanh sang trái liên tục không ngừng */
        @keyframes tunnelCeilingFastLoop {
          0% {
            transform: translateX(0px);
          }
          100% {
            transform: translateX(-1600px);
          }
        }

        /* TẦNG 2: VỆT ĐÈN TƯỜNG GẦN (Wall Near Motion Streaks) - Siêu tốc độ, xé gió sang trái liên tục */
        @keyframes tunnelWallStreakFastLoop {
          0% {
            transform: translateX(0px);
          }
          100% {
            transform: translateX(-1800px);
          }
        }

        @keyframes tunnelBadgeFlow {
          0%, 20% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.92);
          }
          28% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          72% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          82%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.96);
          }
        }

        @keyframes tunnelDustFlow {
          0%, 18% { opacity: 0; }
          26%, 74% { opacity: 1; }
          84%, 100% { opacity: 0; }
        }
      `}</style>

      {/* 
        1. Màn bóng tối hầm với viền bóng mờ đối xứng (Soft Shadow Tunnel Curtain)
        - Vào hầm (0% -> 26%): Viền bóng mờ quét từ phải sang trái, êm ái phủ đen màn hình
        - Trong hầm (26% -> 74%): Che phủ 100% lòng hầm, hiển thị đèn trần, tia lửa bánh xe, bụi phản quang và bảng ga
        - Ra hầm (74% -> 100%): Viền bóng mờ quét tiếp sang trái, hé lộ êm ái phong cảnh ga mới
      */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#05060a',
          boxShadow: '-80px 0 120px rgba(5, 6, 10, 0.95), 80px 0 120px rgba(5, 6, 10, 0.95)',
          animation: `tunnelShadowSweepFlow ${TUNNEL_FLOW_DURATION}ms forwards`,
          pointerEvents: 'none',
        }}
      >
        {/* Viền bóng mờ cạnh trái (Leading soft shadow edge khi vào hầm) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-320px',
            width: '320px',
            height: '100%',
            background: 'linear-gradient(to right, rgba(5, 6, 10, 0) 0%, rgba(5, 6, 10, 0.35) 25%, rgba(5, 6, 10, 0.75) 60%, rgba(5, 6, 10, 0.95) 85%, #05060a 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Viền bóng mờ cạnh phải (Trailing soft shadow edge khi ra khỏi hầm) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: '-320px',
            width: '320px',
            height: '100%',
            background: 'linear-gradient(to left, rgba(5, 6, 10, 0) 0%, rgba(5, 6, 10, 0.35) 25%, rgba(5, 6, 10, 0.75) 60%, rgba(5, 6, 10, 0.95) 85%, #05060a 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 
        2. Bên trong lòng hầm: Hệ thống Đèn Thị Sai (Motion Parallax) & Vệt Motion Blur Siêu Tốc
        - Tầng 1: Đèn trần trên cao (Ceiling Far Lights)
        - Tầng 2: Dải đèn tường hông gần (Wall Near Motion Streaks) biểu diễn gia tốc xé gió & ảo giác đảo chiều
        - Thanh ray kim loại phản quang dưới bánh xe
      */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          animation: `tunnelInteriorFlow ${TUNNEL_FLOW_DURATION}ms ease forwards`,
        }}
      >
        {/* TẦNG 1: Dãy đèn trần xa trên cao (Ceiling Far Lights) - Lướt nhanh sang trái liên tục */}
        <div
          style={{
            position: 'absolute',
            top: '7%',
            left: 0,
            width: '100%',
            height: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6000px',
              height: '100%',
              animation: 'tunnelCeilingFastLoop 0.85s linear infinite',
              transformOrigin: 'left center',
            }}
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={`ceil-${i}`}
                style={{
                  position: 'absolute',
                  left: `${i * 200}px`,
                  top: '2px',
                  width: '64px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #fffde7 0%, #ffeaa7 45%, rgba(255, 234, 167, 0.15) 100%)',
                  boxShadow: '0 0 12px 3px rgba(255, 234, 167, 0.75)',
                  borderRadius: '1px',
                  imageRendering: 'pixelated',
                }}
              />
            ))}
          </div>
        </div>

        {/* TẦNG 2: Dải đèn vách tường gần (Wall Near Motion Streaks) - Siêu tốc độ & Vệt Motion Blur xé gió */}
        <div
          style={{
            position: 'absolute',
            top: '19%',
            left: 0,
            width: '100%',
            height: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '8000px',
              height: '100%',
              animation: 'tunnelWallStreakFastLoop 0.38s linear infinite',
              transformOrigin: 'left center',
            }}
          >
            {Array.from({ length: 26 }).map((_, i) => (
              <div
                key={`wall-${i}`}
                style={{
                  position: 'absolute',
                  left: `${i * 300}px`,
                  top: '4px',
                  width: '150px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #ffffff 0%, #ffd166 25%, rgba(255, 209, 102, 0.4) 65%, rgba(255, 209, 102, 0) 100%)',
                  boxShadow: '0 0 18px 5px rgba(255, 209, 102, 0.95), 0 0 40px 10px rgba(255, 159, 67, 0.5)',
                  borderRadius: '2px',
                  imageRendering: 'pixelated',
                }}
              />
            ))}
          </div>
        </div>

        {/* Thanh ray bóng loáng dưới hầm tối */}
        <div
          style={{
            position: 'absolute',
            bottom: trainYOffset !== '0px' ? `calc(4.8% + ${trainYOffset})` : '4.8%',
            left: 0,
            width: '100%',
            height: '3px',
            backgroundColor: '#353347',
            boxShadow: '0 0 10px 2px rgba(255, 230, 130, 0.55)',
          }}
        />
      </div>

      {/* 3. Bụi phản quang lơ lửng bên trong hầm tối */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          animation: `tunnelDustFlow ${TUNNEL_FLOW_DURATION}ms ease-in-out forwards`,
        }}
      >
        {dustParticles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.s}px`,
              height: `${p.s}px`,
              backgroundColor: '#ffeaa7',
              opacity: p.o,
              boxShadow: '0 0 4px rgba(255, 234, 167, 0.5)',
            }}
          />
        ))}
      </div>

      {/* 
        4. Bảng thông báo ga đến (Station Callout Announcement Badge)
        Nổi bật trang trọng giữa màn hình tối trong lúc tàu đang chạy trong hầm
      */}
      <div
        style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `tunnelBadgeFlow ${TUNNEL_FLOW_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
          textAlign: 'center',
          padding: '20px 42px',
          borderRadius: '8px',
          backgroundColor: 'rgba(15, 14, 22, 0.92)',
          border: '1.5px solid rgba(237, 176, 143, 0.45)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.9), inset 0 0 14px rgba(237, 176, 143, 0.12)',
          zIndex: 42,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: '20px',
            letterSpacing: '3px',
            color: '#edb08f',
            marginBottom: '4px',
            opacity: 0.95,
          }}
        >
          GA TIẾP THEO · NEXT STATION
        </div>
        <div
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: '42px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#fdf6ee',
            textShadow: '0 0 24px rgba(237, 176, 143, 0.8)',
            lineHeight: 1.1,
          }}
        >
          {stationName}
        </div>
        <div
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: '19px',
            letterSpacing: '1px',
            color: '#d0c8d8',
            marginTop: '4px',
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
