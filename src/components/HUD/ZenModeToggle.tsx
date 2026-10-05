import React from 'react';
import { PixelButton } from '../Shared/PixelButton';
import { Maximize2, Eye, EyeOff } from 'lucide-react';

interface ZenModeToggleProps {
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

export const ZenModeToggle: React.FC<ZenModeToggleProps> = ({
  isZenMode,
  onToggleZenMode,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <PixelButton
        onClick={onToggleZenMode}
        title={isZenMode ? 'Hiện giao diện (phím Z)' : 'Chế độ ngắm cảnh ẩn UI (phím Z)'}
        style={{
          borderColor: isZenMode ? '#ffd166' : undefined,
          color: isZenMode ? '#ffd166' : '#f5e6d3',
        }}
      >
        {isZenMode ? <Eye size={14} color="#ffd166" /> : <EyeOff size={14} color="#f5e6d3" />}
        <span>{isZenMode ? '' : 'ZEN MODE'}</span>
      </PixelButton>

      {!isZenMode && (
        <PixelButton
          onClick={toggleFullscreen}
          title="Bật/Tắt toàn màn hình"
          style={{ width: '34px', height: '34px', minWidth: '34px', padding: 0 }}
        >
          <Maximize2 size={14} color="#f5e6d3" />
        </PixelButton>
      )}
    </div>
  );
};
