import React, { useState, useEffect, useRef } from 'react';
import { PixelButton } from '../Shared/PixelButton';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Tự động đóng popup khi click ra bên ngoài
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    let timer: number;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Ring sound
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        } catch {
          // ignore
        }
      }

      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('focus');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);

  const toggleRun = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const setTimerMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    setIsRunning(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <PixelButton
        active={isExpanded || isRunning}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Đồng hồ Pomodoro tập trung"
      >
        <Timer size={14} color={isRunning ? '#55efc4' : '#ffd166'} />
        <span>{timeFormatted}</span>
      </PixelButton>

      {isExpanded && (
        <div
          ref={popupRef}
          className="custom-scrollbar"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '230px',
            maxWidth: 'calc(100vw - 20px)',
            maxHeight: 'min(420px, calc(100vh - 120px))',
            overflowY: 'auto',
            zIndex: 1000,
            background: 'rgba(20, 16, 20, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '12px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
            color: '#f5e6d3',
            fontFamily: "'VT323', monospace",
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#ffd166', letterSpacing: '1px' }}>
              POMODORO • {mode === 'focus' ? 'TẬP TRUNG' : 'NGHỈ NGƠI'}
            </span>
          </div>

          <div
            style={{
              fontSize: '32px',
              color: isRunning ? '#55efc4' : '#f5e6d3',
              textAlign: 'center',
              letterSpacing: '2px',
              padding: '4px 0',
              textShadow: isRunning ? '0 0 12px rgba(85, 239, 196, 0.4)' : 'none',
            }}
          >
            {timeFormatted}
          </div>

          {/* Mode Switchers */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setTimerMode('focus')}
              style={{
                flex: 1,
                padding: '6px',
                background: mode === 'focus' ? 'rgba(255, 209, 102, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: mode === 'focus' ? '1px solid #ffd166' : '1px solid rgba(255, 255, 255, 0.1)',
                color: mode === 'focus' ? '#ffd166' : '#d4bda8',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'VT323', monospace",
                fontSize: '14px',
              }}
            >
              25P TẬP TRUNG
            </button>
            <button
              onClick={() => setTimerMode('break')}
              style={{
                flex: 1,
                padding: '6px',
                background: mode === 'break' ? 'rgba(85, 239, 196, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: mode === 'break' ? '1px solid #55efc4' : '1px solid rgba(255, 255, 255, 0.1)',
                color: mode === 'break' ? '#55efc4' : '#d4bda8',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'VT323', monospace",
                fontSize: '14px',
              }}
            >
              5P NGHỈ NGƠI
            </button>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
            <PixelButton
              onClick={toggleRun}
              title={isRunning ? 'Tạm dừng' : 'Bắt đầu'}
              style={{ flex: 1, padding: '0 8px' }}
            >
              {isRunning ? <Pause size={14} color="#ff7675" /> : <Play size={14} color="#55efc4" />}
              <span>{isRunning ? 'TẠM DỪNG' : 'BẮT ĐẦU'}</span>
            </PixelButton>
            <PixelButton
              onClick={resetTimer}
              title="Đặt lại thời gian"
              style={{ width: '34px', height: '34px', minWidth: '34px', padding: 0 }}
            >
              <RotateCcw size={14} color="#dfe6e9" />
            </PixelButton>
          </div>
        </div>
      )}
    </div>
  );
};
