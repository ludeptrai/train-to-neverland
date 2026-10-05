import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PixelButton } from '../Shared/PixelButton';
import { Coffee, Heart, Send, MessageSquare, Ticket, CheckCircle2, X, Copy, Check, ZoomIn } from 'lucide-react';

export const FeedbackDonateModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'donate' | 'feedback'>('donate');
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // State cho Form Góp Ý
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  // State copy số tài khoản
  const [copied, setCopied] = useState(false);

  const apiUrl =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_STATS_API_URL) ||
    '';

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('PHAN DUY LUU - MoMo / VietQR');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      setSendError('Vui lòng nhập nội dung góp ý của bạn nhé!');
      return;
    }

    setIsSending(true);
    setSendError('');

    try {
      if (apiUrl) {
        const res = await fetch(`${apiUrl}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: feedbackName.trim() || 'Lữ khách ẩn danh',
            contact: feedbackContact.trim(),
            message: feedbackMessage.trim(),
          }),
        });

        if (!res.ok) {
          throw new Error('Không thể kết nối đến máy chủ');
        }
      } else {
        // Fallback lưu local nếu chưa kết nối backend
        const localFeedback = JSON.parse(localStorage.getItem('neverland_feedback') || '[]');
        localFeedback.push({
          name: feedbackName.trim() || 'Lữ khách ẩn danh',
          contact: feedbackContact.trim(),
          message: feedbackMessage.trim(),
          date: new Date().toISOString(),
        });
        localStorage.setItem('neverland_feedback', JSON.stringify(localFeedback));
      }

      setSendSuccess(true);
      setFeedbackMessage('');
      setTimeout(() => {
        setSendSuccess(false);
      }, 5000);
    } catch {
      // Lưu offline vào localStorage để không mất thư của người dùng
      try {
        const localFeedback = JSON.parse(localStorage.getItem('neverland_feedback') || '[]');
        localFeedback.push({
          name: feedbackName.trim() || 'Lữ khách ẩn danh',
          contact: feedbackContact.trim(),
          message: feedbackMessage.trim(),
          date: new Date().toISOString(),
        });
        localStorage.setItem('neverland_feedback', JSON.stringify(localFeedback));
        setSendSuccess(true);
        setFeedbackMessage('');
      } catch {
        setSendError('Có lỗi xảy ra khi gửi, bạn vui lòng thử lại sau nhé!');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Nút bấm trên thanh HUD */}
      <PixelButton
        active={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        title="Góp ý & Mời cà phê người lái tàu"
      >
        <Coffee size={14} color="#ffd166" />
        <span>GÓP Ý & ỦNG HỘ</span>
      </PixelButton>

      {/* Modal Dialog */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 5, 8, 0.78)',
            backdropFilter: 'blur(10px)',
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
              width: 'min(860px, 95vw)',
              maxHeight: '92vh',
              overflowY: 'auto',
              backgroundColor: 'rgba(26, 21, 28, 0.98)',
              border: '2px solid rgba(255, 209, 102, 0.5)',
              borderRadius: '12px',
              padding: '22px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 209, 102, 0.2)',
              color: '#f5e6d3',
              fontFamily: "'VT323', monospace",
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header with Close button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={24} color="#ffd166" />
                <h2
                  style={{
                    margin: 0,
                    fontSize: '26px',
                    color: '#ffd166',
                    letterSpacing: '2px',
                    lineHeight: 1,
                  }}
                >
                  TRẠM DỪNG CHÂN & GIAO LƯU
                </h2>
              </div>

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
                title="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '8px',
              }}
            >
              <button
                onClick={() => setActiveTab('donate')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: activeTab === 'donate' ? 'rgba(255, 209, 102, 0.2)' : 'transparent',
                  border: activeTab === 'donate' ? '1.5px solid #ffd166' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: activeTab === 'donate' ? '#ffd166' : '#c8b8a8',
                  fontFamily: "'VT323', monospace",
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Coffee size={16} /> VÉ TÀU ỦNG HỘ (DONATE)
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: activeTab === 'feedback' ? 'rgba(85, 239, 196, 0.2)' : 'transparent',
                  border: activeTab === 'feedback' ? '1.5px solid #55efc4' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: activeTab === 'feedback' ? '#55efc4' : '#c8b8a8',
                  fontFamily: "'VT323', monospace",
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <MessageSquare size={16} /> HÒM THƯ GÓP Ý
              </button>
            </div>

            {/* TAB 1: RETRO TRAIN TICKET DONATION (MÔ PHỎNG VÉ TÀU CHUẨN MẪU) */}
            {activeTab === 'donate' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '15px', color: '#c8b8a8', lineHeight: 1.4 }}>
                  Mỗi tách cà phê ấm hay lời động viên từ bạn là nguồn năng lượng quý giá giúp người lái tàu tiếp tục duy
                  trì đường ray và kiến tạo thêm nhiều ga tàu mới cho chuyến hành trình.
                </div>

                {/* THE AUTHENTIC BOARDING PASS / TRAIN TICKET */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.65), 0 0 1px rgba(0,0,0,0.2)',
                    color: '#2d3436',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left Edge Cutout Notch */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(26, 21, 28, 0.98)',
                      zIndex: 10,
                      boxShadow: 'inset -2px 0 5px rgba(0,0,0,0.4)',
                    }}
                  />

                  {/* Right Edge Cutout Notch */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(26, 21, 28, 0.98)',
                      zIndex: 10,
                      boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.4)',
                    }}
                  />

                  {/* ======================================================== */}
                  {/* PHẦN 1: THÂN VÉ CHÍNH (MAIN TICKET) */}
                  {/* ======================================================== */}
                  <div
                    style={{
                      flex: '1 1 420px',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    {/* Top Red Header Bar */}
                    <div
                      style={{
                        backgroundColor: '#c82333',
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '16px',
                        letterSpacing: '2.5px',
                        textTransform: 'uppercase',
                        borderRight: '2px dashed rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {/* Train Icon SVG */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="3" width="16" height="16" rx="2" />
                        <path d="M4 11h16" />
                        <path d="M12 3v8" />
                        <circle cx="8" cy="15" r="1" fill="currentColor" />
                        <circle cx="16" cy="15" r="1" fill="currentColor" />
                        <path d="m5 19-2 2" />
                        <path d="m19 19 2 2" />
                      </svg>
                      <span>TRAIN TICKET</span>
                      <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 500, letterSpacing: '1px', marginLeft: 'auto' }}>
                        NEVERLAND EXPRESS
                      </span>
                    </div>

                    {/* Main Ticket Body */}
                    <div
                      style={{
                        padding: '18px 24px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                        minHeight: '260px',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Authentic World Map Watermark Silhouette */}
                      <svg
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '55%',
                          transform: 'translate(-50%, -50%)',
                          width: '88%',
                          height: '80%',
                          opacity: 0.08,
                          pointerEvents: 'none',
                          zIndex: 0,
                        }}
                        viewBox="0 0 520 300"
                        fill="#c82333"
                      >
                        {/* North America */}
                        <path d="M 50,50 Q 80,30 110,40 Q 130,60 115,95 Q 95,115 80,105 Q 60,85 50,50 Z" />
                        <path d="M 75,100 Q 95,120 90,140 Q 75,150 65,135 Z" />
                        {/* South America */}
                        <path d="M 105,160 Q 135,170 130,210 Q 115,260 100,245 Q 85,200 105,160 Z" />
                        {/* Europe */}
                        <path d="M 215,55 Q 245,50 255,75 Q 235,95 210,85 Z" />
                        <path d="M 190,50 Q 205,45 200,60 Z" />
                        {/* Africa */}
                        <path d="M 215,105 Q 260,115 250,170 Q 235,220 210,195 Q 195,150 215,105 Z" />
                        <path d="M 265,195 Q 275,200 270,220 Z" />
                        {/* Asia */}
                        <path d="M 270,45 Q 370,35 390,95 Q 360,135 310,120 Q 275,85 270,45 Z" />
                        <path d="M 330,130 Q 355,140 345,160 Z" />
                        <path d="M 365,115 Q 390,120 380,145 Z" />
                        {/* Australia & Oceania */}
                        <path d="M 370,185 Q 420,185 410,225 Q 360,235 370,185 Z" />
                        <path d="M 425,230 Q 435,235 430,250 Z" />
                      </svg>

                      {/* Content Container (above watermark) */}
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Row 1: From / To & Authentic Top Barcode */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                              <span style={{ color: '#2d3436', fontWeight: 800, width: '45px' }}>From:</span>
                              <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}>
                                Ga Thực Tại (Real World)
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                              <span style={{ color: '#2d3436', fontWeight: 800, width: '45px' }}>To:</span>
                              <span style={{ color: '#c82333', fontWeight: 700, fontSize: '15px' }}>
                                Xứ Sở Vĩnh Hằng (Neverland)
                              </span>
                            </div>
                          </div>

                          {/* Authentic Barcode */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                            <div style={{ display: 'flex', gap: '2px', height: '26px', alignItems: 'flex-end' }}>
                              {[3, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2].map((w, i) => (
                                <div key={i} style={{ width: `${w * 1.4}px`, height: '100%', backgroundColor: '#1e293b' }} />
                              ))}
                            </div>
                            <span style={{ fontSize: '10px', color: '#64748b', letterSpacing: '1px', fontFamily: 'monospace' }}>
                              #NVL-2026-CHILL
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Passenger */}
                        <div style={{ fontSize: '13px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ color: '#2d3436', fontWeight: 800, width: '75px' }}>Passenger:</span>
                          <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '14px' }}>
                            Lữ Khách Đáng Quý (You)
                          </span>
                        </div>

                        {/* Row 3: Class & Train */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Class:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>Hạng Nhất (VIP)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Train:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>Neverland Express</span>
                          </div>
                        </div>

                        {/* Row 4: Date & Departure & Arrive */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '8px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Date:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>Không Giới Hạn</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Departure:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>00:00 (Mỗi Ngày)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Arrive:</span>
                            <span style={{ color: '#c82333', fontWeight: 700 }}>Bình Yên</span>
                          </div>
                        </div>

                        {/* Row 5: Platform & Carriage & Seat */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '8px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Platform:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>Ray Số 9</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Carriage:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>Toa 01</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ color: '#2d3436', fontWeight: 800 }}>Seat:</span>
                            <span style={{ color: '#334155', fontWeight: 600 }}>Cửa Sổ (01A)</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 6: Beneficiary Information Bar */}
                      <div
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                          backgroundColor: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          marginTop: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
                            NGƯỜI THỤ HƯỞNG:
                          </span>
                          <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800, letterSpacing: '0.5px' }}>
                            PHAN DUY LUU
                          </span>
                          <span style={{ fontSize: '11px', color: '#c82333', fontWeight: 700, backgroundColor: '#fee2e2', padding: '1px 6px', borderRadius: '4px' }}>
                            MoMo / VietQR
                          </span>
                        </div>

                        <button
                          onClick={handleCopyAccount}
                          style={{
                            padding: '5px 12px',
                            backgroundColor: copied ? '#10b981' : '#c82333',
                            border: 'none',
                            borderRadius: '5px',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {copied ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP TÊN'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* PHẦN 2: CUỐNG VÉ BÊN PHẢI CHỨA MÃ QR (STUB) */}
                  {/* ======================================================== */}
                  <div
                    style={{
                      flex: '0 0 280px',
                      borderLeft: '2px dashed #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#ffffff',
                      position: 'relative',
                    }}
                  >
                    {/* Top Notch directly on dashed perforation line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '-11px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(26, 21, 28, 0.98)',
                        zIndex: 10,
                      }}
                    />

                    {/* Bottom Notch directly on dashed perforation line */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-12px',
                        left: '-11px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(26, 21, 28, 0.98)',
                        zIndex: 10,
                      }}
                    />

                    {/* Top Red Header Bar on Stub */}
                    <div
                      style={{
                        backgroundColor: '#c82333',
                        padding: '12px 16px',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '16px',
                        letterSpacing: '2.5px',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                      }}
                    >
                      TRAIN TICKET
                    </div>

                    {/* Stub Body with QR Code */}
                    <div
                      style={{
                        padding: '12px 16px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between',
                        height: '100%',
                      }}
                    >
                      {/* Compact Trip Fields on Stub (like reference image) */}
                      <div
                        style={{
                          width: '100%',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '4px',
                          fontSize: '11px',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '4px',
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b', fontWeight: 700 }}>Passenger: </span>
                          <span style={{ color: '#0f172a', fontWeight: 700 }}>Lữ Khách</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#64748b', fontWeight: 700 }}>Seat: </span>
                          <span style={{ color: '#c82333', fontWeight: 800 }}>01A</span>
                        </div>
                      </div>

                      {/* QR Code Container: Sized 215px, strict 1:1 aspect ratio, un-squished */}
                      <div
                        onClick={() => setIsQrZoomed(true)}
                        title="Bấm vào để phóng to mã QR"
                        style={{
                          width: '215px',
                          height: '215px',
                          aspectRatio: '1 / 1',
                          flexShrink: 0,
                          backgroundColor: '#ffffff',
                          borderRadius: '10px',
                          padding: '6px',
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 35, 51, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                        }}
                      >
                        <img
                          src="./assets/donate/qr_code_only.png"
                          alt="QR Code MoMo Phan Duy Luu"
                          style={{
                            width: '100%',
                            height: '100%',
                            aspectRatio: '1 / 1',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: '4px',
                          }}
                        />

                        {/* Subtle zoom badge on corner */}
                        <div
                          style={{
                            position: 'absolute',
                            right: '6px',
                            bottom: '6px',
                            backgroundColor: 'rgba(200, 35, 51, 0.92)',
                            color: '#ffffff',
                            borderRadius: '4px',
                            padding: '2px 5px',
                            fontSize: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontWeight: 700,
                            pointerEvents: 'none',
                          }}
                        >
                          <ZoomIn size={11} />
                          <span>Phóng to</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#c82333', fontWeight: 800, letterSpacing: '0.6px' }}>
                          ⚡ QUÉT MOMO / APP NGÂN HÀNG
                        </div>
                        <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 800 }}>
                          PHAN DUY LUU
                        </div>
                      </div>

                      {/* Bottom Barcode of Stub (matching reference image) */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', width: '100%', marginTop: '2px' }}>
                        <div style={{ display: 'flex', gap: '2px', height: '20px', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                          {[2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 2, 1].map((w, i) => (
                            <div key={i} style={{ width: `${w * 1.3}px`, height: '100%', backgroundColor: '#1e293b' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '9px', color: '#64748b', letterSpacing: '1px', fontFamily: 'monospace' }}>
                          #NVL-8888-PASS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#a09080' }}>
                  <Heart size={14} color="#ff7675" />
                  <span>Cảm ơn bạn đã luôn là một phần ý nghĩa của Chuyến Tàu Không Vội!</span>
                </div>

                {/* ZOOMED QR MODAL OVERLAY */}
                {isQrZoomed && (
                  <div
                    style={{
                      position: 'fixed',
                      inset: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.85)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10000,
                      animation: 'fadeIn 0.15s ease',
                      padding: '16px',
                    }}
                    onClick={() => setIsQrZoomed(false)}
                  >
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '14px',
                        maxWidth: '92vw',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
                        position: 'relative',
                        color: '#1e293b',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setIsQrZoomed(false)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#475569',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        title="Đóng phóng to"
                      >
                        <X size={18} />
                      </button>

                      <div style={{ textAlign: 'center' }}>
                        <h3 style={{ margin: 0, color: '#c82333', fontSize: '18px', fontWeight: 800 }}>
                          MÃ QR ỦNG HỘ CHUYẾN TÀU
                        </h3>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                          Quét bằng MoMo hoặc bất kỳ ứng dụng ngân hàng nào
                        </p>
                      </div>

                      <div
                        style={{
                          width: '320px',
                          height: '320px',
                          maxWidth: '75vw',
                          maxHeight: '75vw',
                          aspectRatio: '1 / 1',
                          padding: '12px',
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src="./assets/donate/qr_code_only.png"
                          alt="QR MoMo Phan Duy Luu Phóng To"
                          style={{
                            width: '100%',
                            height: '100%',
                            aspectRatio: '1 / 1',
                            objectFit: 'contain',
                            display: 'block',
                          }}
                        />
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                          PHAN DUY LUU
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          MoMo / VietQR
                        </div>
                      </div>

                      <button
                        onClick={handleCopyAccount}
                        style={{
                          padding: '8px 18px',
                          backgroundColor: copied ? '#10b981' : '#c82333',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copied ? 'ĐÃ SAO CHÉP THÀNH CÔNG!' : 'SAO CHÉP THÔNG TIN TÀI KHOẢN'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: FEEDBACK FORM */}
            {activeTab === 'feedback' && (
              <form onSubmit={handleSendFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '15px', color: '#c8b8a8', lineHeight: 1.4 }}>
                  Bạn muốn gợi ý thêm danh lam thắng cảnh nào tiếp theo? Bạn có phát hiện lỗi hay muốn chia sẻ cảm nghĩ
                  về âm nhạc không? Hãy viết thư gửi cho người lái tàu nhé!
                </div>

                {sendSuccess && (
                  <div
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'rgba(85, 239, 196, 0.15)',
                      border: '1.5px solid #55efc4',
                      borderRadius: '8px',
                      color: '#55efc4',
                      fontSize: '17px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Lá thư của bạn đã được chuyển tới buồng lái thành công! Chân thành cảm ơn bạn. 💌</span>
                  </div>
                )}

                {sendError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255, 118, 117, 0.15)',
                      border: '1.5px solid #ff7675',
                      borderRadius: '8px',
                      color: '#ff7675',
                      fontSize: '16px',
                    }}
                  >
                    {sendError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {/* Name Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '14px', color: '#ffd166' }}>TÊN / DANH XƯNG (TÙY CHỌN):</label>
                    <input
                      type="text"
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      placeholder="VD: Một lữ khách từ Hà Nội..."
                      maxLength={100}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        color: '#f5e6d3',
                        fontFamily: "'VT323', monospace",
                        fontSize: '16px',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#ffd166')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                    />
                  </div>

                  {/* Contact Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '14px', color: '#ffd166' }}>EMAIL / THÔNG TIN LIÊN HỆ (TÙY CHỌN):</label>
                    <input
                      type="text"
                      value={feedbackContact}
                      onChange={(e) => setFeedbackContact(e.target.value)}
                      placeholder="VD: email@example.com để nhận hồi âm"
                      maxLength={100}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        color: '#f5e6d3',
                        fontFamily: "'VT323', monospace",
                        fontSize: '16px',
                        outline: 'none',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#ffd166')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '14px', color: '#ffd166' }}>
                    NỘI DUNG GÓP Ý / LỜI NHẮN (BẮT BUỘC):
                  </label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Hãy viết điều bạn muốn nhắn nhủ, đóng góp địa danh mới, hoặc cảm nhận của bạn về chuyến tàu..."
                    rows={5}
                    maxLength={2000}
                    required
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px',
                      color: '#f5e6d3',
                      fontFamily: "'VT323', monospace",
                      fontSize: '16px',
                      lineHeight: 1.3,
                      resize: 'vertical',
                      outline: 'none',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#55efc4')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
                  />
                  <span style={{ fontSize: '12px', color: '#888', textAlign: 'right' }}>
                    {feedbackMessage.length}/2000 ký tự
                  </span>
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="submit"
                    disabled={isSending}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: isSending ? 'rgba(74, 53, 50, 0.6)' : 'rgba(85, 239, 196, 0.25)',
                      border: '1.5px solid #55efc4',
                      borderRadius: '6px',
                      color: '#55efc4',
                      fontFamily: "'VT323', monospace",
                      fontSize: '18px',
                      letterSpacing: '1px',
                      cursor: isSending ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Send size={16} />
                    <span>{isSending ? 'ĐANG GỬI THƯ...' : 'GỬI LÁ THƯ ĐI'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
