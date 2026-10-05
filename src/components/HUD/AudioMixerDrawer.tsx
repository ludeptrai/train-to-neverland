import React, { useState, useEffect, useRef } from 'react';
import { audioManager } from '../../engines/AudioManager';
import { AudioSettings, DSPPreset } from '../../types';
import { PixelButton } from '../Shared/PixelButton';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sliders,
  Music,
  CloudRain,
  Wind,
  Trees,
  Upload,
  Radio,
  Gamepad2,
  Disc,
  PhoneCall,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';

export const AudioMixerDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(audioManager.settings);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Tự động đóng popup khi click ra bên ngoài
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    return audioManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });
  }, []);

  const currentTrack = audioManager.tracks[settings.currentTrackIndex] || audioManager.tracks[0];

  const handleSliderChange = (channel: keyof AudioSettings, val: number) => {
    audioManager.setChannelVolume(channel, val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      audioManager.loadCustomTrack(file);
    }
  };

  const dspPresets: Array<{ id: DSPPreset; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'normal', label: 'BẢN GỐC', icon: <Music size={11} color="#f5e6d3" />, desc: 'Âm thanh tự nhiên gốc' },
    { id: 'lofi', label: 'LO-FI CHILL', icon: <Radio size={11} color="#ffd166" />, desc: 'Ấm áp, cắt dải cao, xước đĩa nhẹ' },
    { id: 'bit8', label: '8-BIT RETRO', icon: <Gamepad2 size={11} color="#00f2fe" />, desc: 'Chiptune Game Boy 4-bit giòn tan' },
    { id: 'vinyl', label: 'ĐĨA THAN', icon: <Disc size={11} color="#ff7675" />, desc: 'Gramophone 1950s sột soạt, rung cao độ' },
    { id: 'underwater', label: 'DƯỚI NƯỚC', icon: <Waves size={11} color="#55efc4" />, desc: 'Muffled trầm ấm như ở đáy hồ' },
    { id: 'telephone', label: 'ĐIỆN THOẠI', icon: <PhoneCall size={11} color="#fdcb6e" />, desc: 'Loa ống nghe cổ, méo tiếng retro' },
    { id: 'dreamy', label: 'MỘNG MƠ', icon: <Sparkles size={11} color="#a29bfe" />, desc: 'Vang vọng không gian ethereal' },
  ];

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
      {/* Drawer Dropdown Content */}
      {isOpen && (
        <div
          ref={popupRef}
          className="custom-scrollbar"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '330px',
            maxWidth: 'calc(100vw - 20px)',
            maxHeight: 'min(480px, calc(100vh - 120px))',
            overflowY: 'auto',
            zIndex: 1000,
            background: 'rgba(20, 16, 20, 0.96)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
            color: '#f5e6d3',
            fontFamily: "'VT323', monospace",
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: '#ffd166', letterSpacing: '1px' }}>AUDIO DSP & MIXER</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Lo-Fi Music Player Box */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Music size={15} color="#f368e0" />
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', width: '100%' }}>
                <div style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>{currentTrack.title}</div>
                <div style={{ fontSize: '9px', color: '#a09080' }}>{currentTrack.artist}</div>
              </div>
            </div>

            {/* Danh sách nhạc tự động quét từ public/assets/music/ */}
            <select
              value={settings.currentTrackIndex}
              onChange={(e) => audioManager.setTrack(Number(e.target.value))}
              title="Chọn bài hát từ danh sách nhạc"
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 209, 102, 0.25)',
                color: '#ffd166',
                borderRadius: '6px',
                padding: '4px 6px',
                fontSize: '13px',
                fontFamily: "'VT323', monospace",
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {audioManager.tracks.map((t, idx) => (
                <option key={t.id || idx} value={idx} style={{ background: '#1c1720', color: '#f5e6d3' }}>
                  {idx + 1}. {t.title} {t.artist ? `(${t.artist})` : ''}
                </option>
              ))}
            </select>

            {/* Playback Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <PixelButton onClick={() => audioManager.prevTrack()} style={{ padding: '4px 8px' }} title="Bài trước">
                  <SkipBack size={10} />
                </PixelButton>
                <PixelButton
                  active={settings.isPlayingMusic}
                  onClick={() => audioManager.toggleMusic()}
                  style={{ padding: '6px 14px' }}
                >
                  {settings.isPlayingMusic ? <Pause size={12} color="#ff7675" /> : <Play size={12} color="#55efc4" />}
                  <span style={{ fontSize: '9px' }}>{settings.isPlayingMusic ? 'DỪNG' : 'PHÁT'}</span>
                </PixelButton>
                <PixelButton onClick={() => audioManager.nextTrack()} style={{ padding: '4px 8px' }} title="Bài tiếp">
                  <SkipForward size={10} />
                </PixelButton>
              </div>

              {/* Upload custom track button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  style={{ display: 'none' }}
                />
                <PixelButton
                  onClick={() => fileInputRef.current?.click()}
                  title="Chọn 1 bài nhạc bất kỳ từ máy tính để áp dụng DSP realtime"
                  style={{ padding: '4px 8px', fontSize: '9px' }}
                >
                  <Upload size={10} color="#00f2fe" />
                  <span>NẠP NHẠC</span>
                </PixelButton>
              </div>
            </div>
          </div>

          {/* REALTIME DSP FILTER PRESETS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#ffd166', letterSpacing: '0.8px' }}>
                BỘ LỌC REALTIME DSP ({dspPresets.length})
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {dspPresets.map((p) => {
                const isActive = settings.dspPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => audioManager.setDSPPreset(p.id)}
                    title={p.desc}
                    style={{
                      background: isActive ? 'rgba(255, 209, 102, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: isActive ? '1px solid #ffd166' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isActive ? '#ffd166' : '#d4bda8',
                      borderRadius: '6px',
                      padding: '8px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontFamily: "'VT323', monospace",
                      fontSize: '14px',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '10px', color: '#ffd166', letterSpacing: '0.8px' }}>ÂM LƯỢNG MÔI TRƯỜNG</span>

            {/* Master Volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '4px' }}>
                <span
                  onClick={() => audioManager.toggleMute()}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  title="Nhấn để Tắt/Bật toàn bộ tiếng"
                >
                  {!settings.isMuted ? <Volume2 size={11} color="#ffbe76" /> : <VolumeX size={11} color="#ff7675" />}
                  TỔNG (MASTER)
                </span>
                <span
                  onClick={() => audioManager.toggleMute()}
                  style={{
                    cursor: 'pointer',
                    color: settings.isMuted ? '#ff7675' : '#f5e6d3',
                    fontWeight: settings.isMuted ? 'bold' : 'normal',
                  }}
                  title="Nhấn để Tắt/Bật toàn bộ tiếng"
                >
                  {settings.isMuted ? 'MUTE (TẮT TIẾNG)' : `${Math.round(settings.masterVolume * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.isMuted ? 0 : settings.masterVolume}
                onChange={(e) => handleSliderChange('masterVolume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: settings.isMuted ? '#ff7675' : '#ffbe76', cursor: 'pointer' }}
              />
            </div>

            {/* Music Volume */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Music size={11} color="#f368e0" /> ÂM LƯỢNG NHẠC
                </span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleSliderChange('musicVolume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f368e0', cursor: 'pointer' }}
              />
            </div>

            {/* Train Rhythm */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '4px' }}>
                <span>🚂 TIẾNG RAY TÀU</span>
                <span>{Math.round(settings.trainVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.trainVolume}
                onChange={(e) => handleSliderChange('trainVolume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#e056fd', cursor: 'pointer' }}
              />
            </div>

            {/* Rain */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CloudRain size={11} color="#70a1ff" /> TIẾNG MƯA
                </span>
                <span>{Math.round(settings.rainVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.rainVolume}
                onChange={(e) => handleSliderChange('rainVolume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#70a1ff', cursor: 'pointer' }}
              />
            </div>

            {/* Wind */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wind size={11} color="#1dd1a1" /> TIẾNG GIÓ
                </span>
                <span>{Math.round(settings.windVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.windVolume}
                onChange={(e) => handleSliderChange('windVolume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#1dd1a1', cursor: 'pointer' }}
              />
            </div>

            {/* Nature (Birds/Crickets) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trees size={11} color="#badc58" /> CHIM & DẾ
                </span>
                <span>{Math.round(settings.natureVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.natureVolume}
                onChange={(e) => handleSliderChange('natureVolume', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#badc58', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <PixelButton
        active={isOpen}
        onClick={() => {
          audioManager.init();
          setIsOpen(!isOpen);
        }}
        title="Bật/Mở bàn trộn âm thanh"
      >
        <Sliders size={14} color="#ffd166" />
        <span>ÂM THANH</span>
      </PixelButton>

      <PixelButton
        active={!settings.isMuted}
        onClick={() => audioManager.toggleMute()}
        title={settings.isMuted ? 'Bật lại toàn bộ âm thanh (Phím M)' : 'Tắt toàn bộ âm thanh trang web (Mute - Phím M)'}
        style={{ width: '34px', height: '34px', minWidth: '34px', padding: 0 }}
      >
        {!settings.isMuted ? <Volume2 size={14} color="#55efc4" /> : <VolumeX size={14} color="#ff7675" />}
      </PixelButton>
    </div>
  );
};
