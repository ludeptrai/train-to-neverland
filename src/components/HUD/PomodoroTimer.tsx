import React, { useState, useEffect } from 'react';
import { PixelButton } from '../Shared/PixelButton';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';

export const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 50,
      }}
    >
      <PixelButton onClick={() => setIsExpanded(!isExpanded)} title="Đồng hồ Pomodoro tập trung">
        <Timer size={14} color="#686de0" />
        <span style={{ fontSize: '12px', letterSpacing: '1px' }}>{timeFormatted}</span>
      </PixelButton>

      {isExpanded && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(30, 25, 25, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '4px 8px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <PixelButton onClick={toggleRun} title={isRunning ? 'Tạm dừng' : 'Bắt đầu'}>
            {isRunning ? <Pause size={12} color="#ff7675" /> : <Play size={12} color="#55efc4" />}
          </PixelButton>
          <PixelButton onClick={resetTimer} title="Đặt lại">
            <RotateCcw size={12} color="#dfe6e9" />
          </PixelButton>
        </div>
      )}
    </div>
  );
};
