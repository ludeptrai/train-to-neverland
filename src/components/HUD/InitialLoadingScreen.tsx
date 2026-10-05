import React, { useState, useEffect, useRef } from 'react';
import { SceneConfig, TrainTheme } from '../../types';
import { preloadSceneAssets, preloadTrainAssets } from '../../utils/assetLoader';
import { audioManager } from '../../engines/AudioManager';

interface InitialLoadingScreenProps {
  scene: SceneConfig;
  train: TrainTheme;
  onLoaded: () => void;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({
  scene,
  train,
  onLoaded,
}) => {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Đang khởi tạo trạm tín hiệu...');
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasTriggeredExitRef = useRef(false);

  // Quy trình tải tuần tự từng nhóm asset và cập nhật thanh tiến trình
  useEffect(() => {
    let cancelled = false;

    const loadSequence = async () => {
      // 1. Chờ font chữ pixel sẵn sàng
      try {
        if (typeof document !== 'undefined' && 'fonts' in document) {
          await document.fonts.ready;
        }
      } catch {
        // bỏ qua nếu browser không hỗ trợ
      }
      if (cancelled) return;
      setProgress(25);
      setStatusText(`Đang chuẩn bị đầu máy ${train.name}...`);

      // 2. Tải trước tài nguyên đoàn tàu & đèn pha
      await preloadTrainAssets(train, 6000);
      if (cancelled) return;
      setProgress(55);
      setStatusText(`Đang kết nối phong cảnh Ga ${scene.name}...`);

      // 3. Tải trước phong cảnh nền & đường ray
      await preloadSceneAssets(scene, 8000);
      if (cancelled) return;
      setProgress(90);
      setStatusText('Đang hòa âm không gian Lo-Fi & chu kỳ thời gian...');

      // 4. Hoàn tất tải: Tự động vào thẳng trang ngay lập tức
      await new Promise((res) => setTimeout(res, 200));
      if (cancelled) return;
      setProgress(100);
      setStatusText('Đoàn tàu bắt đầu khởi hành...');
      setIsReady(true);

      // Tự động vào luôn không cần người dùng bấm nút
      setTimeout(() => {
        if (!cancelled && !hasTriggeredExitRef.current) {
          handleEnter();
        }
      }, 350);
    };

    loadSequence();

    return () => {
      cancelled = true;
    };
  }, [scene, train]);

  // Hàm kích hoạt vào trang chính (bật âm thanh trình duyệt)
  const handleEnter = () => {
    if (hasTriggeredExitRef.current) return;
    hasTriggeredExitRef.current = true;

    // Kích hoạt Web Audio
    try {
      audioManager.init();
    } catch {
      // ignore
    }

    setIsFadingOut(true);
    setTimeout(() => {
      onLoaded();
    }, 550);
  };

  // Người dùng cũng có thể chạm hoặc bấm phím để vào ngay tức thì
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      onClick={isReady ? handleEnter : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#07080d',
        backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(26, 24, 40, 0.95) 0%, #050609 85%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isReady ? 'pointer' : 'default',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes loadingTrackShimmer {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
        @keyframes pulseGlowBtn {
          0%, 100% {
            box-shadow: 0 0 25px rgba(255, 209, 102, 0.7), 0 0 50px rgba(237, 176, 143, 0.35);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 209, 102, 0.95), 0 0 70px rgba(237, 176, 143, 0.55);
            transform: scale(1.025);
          }
        }
        @keyframes trainChugBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      {/* Trang trí: Đốm sao pixel lấp lánh */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { x: 15, y: 20, s: 2, o: 0.6 },
          { x: 28, y: 12, s: 3, o: 0.8 },
          { x: 42, y: 26, s: 2, o: 0.4 },
          { x: 68, y: 15, s: 3, o: 0.7 },
          { x: 82, y: 22, s: 2, o: 0.5 },
          { x: 88, y: 35, s: 2, o: 0.6 },
          { x: 10, y: 65, s: 2, o: 0.4 },
          { x: 22, y: 80, s: 3, o: 0.7 },
          { x: 75, y: 75, s: 2, o: 0.5 },
          { x: 92, y: 85, s: 2, o: 0.6 },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.s}px`,
              height: `${star.s}px`,
              backgroundColor: '#f5e6d3',
              opacity: star.o,
              boxShadow: '0 0 6px rgba(245, 230, 211, 0.8)',
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '540px',
          width: '90%',
          padding: '20px',
        }}
      >
        {/* Biểu tượng tàu pixel */}
        <div
          style={{
            fontSize: '44px',
            marginBottom: '10px',
            animation: 'trainChugBounce 0.6s infinite ease-in-out',
            filter: 'drop-shadow(0 0 20px rgba(255, 209, 102, 0.6))',
          }}
        >
          🚂
        </div>

        {/* Tiêu đề chính */}
        <h1
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 'min(9vw, 38px)',
            color: '#ffd166',
            letterSpacing: '4px',
            margin: '0 0 4px 0',
            textShadow: '0 0 24px rgba(255, 209, 102, 0.7)',
            lineHeight: 1.15,
          }}
        >
          CHUYẾN TÀU TỚI XỨ SỞ VĨNH HẰNG
        </h1>

        <div
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: 'min(4.5vw, 17px)',
            color: '#edb08f',
            letterSpacing: '2px',
            marginBottom: '26px',
            opacity: 0.9,
          }}
        >
          TRAIN TO NEVERLAND • SLOW RAIL CHILL JOURNEY
        </div>

        {/* Thông tin ga xuất phát */}
        <div
          style={{
            backgroundColor: 'rgba(25, 22, 34, 0.75)',
            border: '1px solid rgba(237, 176, 143, 0.35)',
            borderRadius: '8px',
            padding: '10px 20px',
            marginBottom: '24px',
            width: '100%',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '18px',
              color: '#ffd166',
              letterSpacing: '1px',
            }}
          >
            📍 GA KHỞI HÀNH: {scene.name.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: '14px',
              color: '#c4b5a5',
              marginTop: '2px',
            }}
          >
            {scene.location} • {scene.subtitle}
          </div>
        </div>

        {/* Khung thanh tiến trình Pixel Art */}
        <div style={{ width: '100%', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '6px',
              fontFamily: "'VT323', monospace",
            }}
          >
            <span
              style={{
                fontSize: '16px',
                color: '#e0d6cb',
                letterSpacing: '1px',
              }}
            >
              {statusText}
            </span>
            <span
              style={{
                fontSize: '20px',
                color: '#ffd166',
                fontWeight: 'bold',
                fontFamily: "'VT323', monospace",
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>

          {/* Thanh ray tiến trình */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '18px',
              backgroundColor: 'rgba(10, 10, 15, 0.9)',
              border: '2px solid rgba(237, 176, 143, 0.6)',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8), 0 0 16px rgba(237, 176, 143, 0.2)',
              padding: '2px',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ff7675 0%, #f0932b 50%, #f6e58d 100%)',
                boxShadow: '0 0 14px rgba(246, 229, 141, 0.85)',
                borderRadius: '2px',
                transition: 'width 0.35s ease-out',
                position: 'relative',
              }}
            />
          </div>
        </div>

        {/* Trạng thái vào thẳng khi hoàn tất 100% */}
        {isReady && (
          <div
            style={{
              marginTop: '16px',
              fontFamily: "'VT323', monospace",
              fontSize: '22px',
              color: '#ffd166',
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'pulseGlowBtn 1.2s infinite ease-in-out',
            }}
          >
            <span>🚆</span>
            <span>ĐANG KHỞI HÀNH...</span>
          </div>
        )}
      </div>
    </div>
  );
};
