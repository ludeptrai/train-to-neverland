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
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '185px',
        zIndex: 50,
        display: 'flex',
        gap: '8px',
      }}
    >
      <PixelButton
        onClick={onToggleZenMode}
        title={isZenMode ? 'Hiện giao diện' : 'Chế độ ngắm cảnh (Ẩn UI)'}
      >
        {isZenMode ? <Eye size={13} color="#f5e6d3" /> : <EyeOff size={13} color="#f5e6d3" />}
        <span>{isZenMode ? 'HIỆN UI' : 'ZEN MODE'}</span>
      </PixelButton>

      <PixelButton onClick={toggleFullscreen} title="Toàn màn hình">
        <Maximize2 size={13} color="#f5e6d3" />
      </PixelButton>
    </div>
  );
};
