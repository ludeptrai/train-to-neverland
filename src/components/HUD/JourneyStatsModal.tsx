import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PixelButton } from '../Shared/PixelButton';
import { Activity, X, Globe, Clock, Train, CloudRain, Music, Users } from 'lucide-react';
import { analyticsService, CommunityStats, PersonalStats } from '../../services/AnalyticsService';
import { SceneConfig, TrainTheme, WeatherType, TimeOfDay } from '../../types';

interface JourneyStatsModalProps {
  currentScene: SceneConfig;
  currentTrain: TrainTheme;
  weather: WeatherType;
  timeOfDay: TimeOfDay;
}

export const JourneyStatsModal: React.FC<JourneyStatsModalProps> = ({
  currentScene,
  currentTrain,
  weather,
  timeOfDay,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [personalStats, setPersonalStats] = useState<PersonalStats>(analyticsService.getPersonalStats());

  useEffect(() => {
    if (isOpen) {
      analyticsService.getCommunityStats().then(setStats);
      setPersonalStats(analyticsService.getPersonalStats());
    }
  }, [isOpen]);

  // Cập nhật thời gian cá nhân mỗi 2s khi modal đang mở
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPersonalStats(analyticsService.getPersonalStats());
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const sessionMinutes = Math.floor(personalStats.currentSessionSeconds / 60);
  const sessionSecondsRemainder = personalStats.currentSessionSeconds % 60;
  const sessionTimeFormatted = `${sessionMinutes}p ${sessionSecondsRemainder}s`;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Nút bấm Thống Kê trên thanh HUD */}
      <PixelButton
        active={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        title="Xem nhật ký & thống kê hành trình cộng đồng"
      >
        <Activity size={14} color="#55efc4" />
        <span>THỐNG KÊ</span>
      </PixelButton>

      {/* Modal / Bảng Thống Kê Hành Trình */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 8, 0.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="custom-scrollbar"
            style={{
              width: 'min(760px, 94vw)',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'rgba(28, 24, 34, 0.96)',
              border: '2px solid rgba(255, 209, 102, 0.45)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.75), 0 0 20px rgba(255, 209, 102, 0.15)',
              color: '#f5e6d3',
              fontFamily: "'VT323', monospace",
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                paddingBottom: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Train size={22} color="#ffd166" />
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '28px',
                      color: '#ffd166',
                      letterSpacing: '2px',
                      lineHeight: 1,
                    }}
                  >
                    NHẬT KÝ HÀNH TRÌNH VÔ TẬN
                  </h2>
                </div>
                <div style={{ fontSize: '15px', color: '#c8b8a8', marginTop: '4px' }}>
                  Cộng hưởng cùng các lữ khách khắp nơi trên thế giới
                </div>
              </div>

              {/* Nút Đóng */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e0d0c0',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ff7675')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#e0d0c0')}
                title="Đóng bảng thống kê"
              >
                <X size={20} />
              </button>
            </div>

            {/* Live Indicator Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '10px 16px',
                backgroundColor: 'rgba(85, 239, 196, 0.1)',
                border: '1px solid rgba(85, 239, 196, 0.3)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#55efc4',
                    boxShadow: '0 0 10px #55efc4',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <span style={{ color: '#55efc4', fontWeight: 'bold' }}>
                  {stats ? stats.activeNow : 127} lữ khách đang cùng trên tàu
                </span>
              </div>
              <span style={{ fontSize: '14px', color: '#a0b0a8' }}>
                Thế giới đang chuyển động theo thời gian thực
              </span>
            </div>

            {/* 6 Grid Metric Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Total Travelers */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffd166', fontSize: '14px' }}>
                  <Users size={14} /> TỔNG LƯỢT LỮ KHÁCH
                </div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5e6d3' }}>
                  {stats ? stats.travelers.toLocaleString() : '0'}
                </div>
                <div style={{ fontSize: '12px', color: '#a09080' }}>Những tâm hồn đã dừng chân</div>
              </div>

              {/* Total Journeys */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#74b9ff', fontSize: '14px' }}>
                  <Train size={14} /> CHUYẾN ĐI ĐÃ LĂN BÁNH
                </div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5e6d3' }}>
                  {stats ? stats.journeys.toLocaleString() : '0'}
                </div>
                <div style={{ fontSize: '12px', color: '#a09080' }}>Các chặng đường qua ga tàu</div>
              </div>

              {/* Total Time Onboard */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff7675', fontSize: '14px' }}>
                  <Clock size={14} /> THỜI GIAN TRÊN TÀU
                </div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5e6d3' }}>
                  {stats ? stats.totalMinutes.toLocaleString() : '0'} <span style={{ fontSize: '16px' }}>phút</span>
                </div>
                <div style={{ fontSize: '12px', color: '#a09080' }}>Cùng tập trung và thư giãn</div>
              </div>

              {/* Rain Minutes */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00cec9', fontSize: '14px' }}>
                  <CloudRain size={14} /> LẮNG NGHE MƯA RƠI
                </div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5e6d3' }}>
                  {stats ? stats.rainMinutes.toLocaleString() : '0'} <span style={{ fontSize: '16px' }}>phút</span>
                </div>
                <div style={{ fontSize: '12px', color: '#a09080' }}>Những giọt mưa vỗ nhẹ mái tàu</div>
              </div>

              {/* Lo-Fi Music Hours */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a29bfe', fontSize: '14px' }}>
                  <Music size={14} /> GIAI ĐIỆU LO-FI
                </div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5e6d3' }}>
                  {stats ? (
                    stats.musicHours >= 1 ? (
                      <>
                        {stats.musicHours.toLocaleString()} <span style={{ fontSize: '16px' }}>giờ</span>
                      </>
                    ) : (
                      <>
                        {stats.musicMinutes !== undefined
                          ? stats.musicMinutes.toLocaleString()
                          : Math.round(stats.musicHours * 60)}{' '}
                        <span style={{ fontSize: '16px' }}>phút</span>
                      </>
                    )
                  ) : (
                    <>
                      0 <span style={{ fontSize: '16px' }}>phút</span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#a09080' }}>Âm hưởng ấm áp đồng hành</div>
              </div>

              {/* Destinations Discovered */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#55efc4', fontSize: '14px' }}>
                  <Globe size={14} /> GA TÀU ĐÃ KHÁM PHÁ
                </div>
                <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f5e6d3' }}>
                  {stats ? stats.topDestinations.length : 0} <span style={{ fontSize: '16px' }}>địa danh</span>
                </div>
                <div style={{ fontSize: '12px', color: '#a09080' }}>Hành trình xuyên Việt & Quốc tế</div>
              </div>
            </div>

            {/* Row: Most Visited Destinations & Time of Day */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
              }}
            >
              {/* Most Visited Destinations */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '16px', color: '#ffd166', letterSpacing: '1px' }}>
                  🚂 CÁC GA TÀU ĐƯỢC GHÉ THĂM NHIỀU NHẤT
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats?.topDestinations.map((dest, idx) => (
                    <div key={dest.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span>
                          {idx + 1}. {dest.name}
                        </span>
                        <span style={{ color: '#d0c0b0' }}>{dest.visits.toLocaleString()} lượt</span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${dest.percentage * 2.5}%`,
                            height: '100%',
                            backgroundColor: idx === 0 ? '#ffd166' : idx === 1 ? '#74b9ff' : '#55efc4',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Personal Journey & Time Distribution */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Personal Session Card */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(255, 209, 102, 0.06)',
                    border: '1px solid rgba(255, 209, 102, 0.25)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '16px', color: '#ffd166', letterSpacing: '1px' }}>
                    ✨ HÀNH TRÌNH CỦA BẠN HIỆN TẠI
                  </div>
                  <div style={{ fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      ⏱️ <strong>Thời gian phiên này:</strong> {sessionTimeFormatted}
                    </div>
                    <div>
                      ⏳ <strong>Tổng thời gian đã gắn bó:</strong> {personalStats.totalLifetimeMinutes} phút
                    </div>
                    <div>
                      📍 <strong>Đang dừng chân tại:</strong> {currentScene.name}
                    </div>
                    <div>
                      🚆 <strong>Đang đi trên chuyến tàu:</strong> {currentTrain.name}
                    </div>
                    <div>
                      🌤️ <strong>Thời tiết:</strong>{' '}
                      {weather === 'rain'
                        ? 'Mưa rơi'
                        : weather === 'snow'
                          ? 'Tuyết trắng'
                          : weather === 'sakura'
                            ? 'Hoa anh đào'
                            : 'Trời quang'}
                    </div>
                    <div>
                      🌙 <strong>Thời điểm:</strong>{' '}
                      {timeOfDay === 'dawn'
                        ? 'Bình minh'
                        : timeOfDay === 'day'
                          ? 'Ban ngày'
                          : timeOfDay === 'sunset'
                            ? 'Hoàng hôn'
                            : timeOfDay === 'night'
                              ? 'Ban đêm'
                              : 'Tự động (Giờ thật)'}
                    </div>
                  </div>
                </div>

                {/* Time of Day Distribution */}
                <div
                  style={{
                    padding: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '15px', color: '#c8b8a8', letterSpacing: '1px' }}>
                    🌙 THỜI ĐIỂM ĐƯỢC CHỌN (THE TRAIN NEVER SLEEPS)
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                      color: '#d0c0b0',
                      padding: '4px 0',
                    }}
                  >
                    <span>🌅 Bình minh: 14%</span>
                    <span>☀️ Ban ngày: 39%</span>
                    <span>🌇 Hoàng hôn: 21%</span>
                    <span>🌙 Đêm sao: 26%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Footer */}

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
