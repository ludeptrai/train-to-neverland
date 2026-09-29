import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  active = false,
  children,
  style,
  ...props
}) => {
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        backgroundColor: active ? 'rgba(74, 53, 50, 0.85)' : 'rgba(50, 40, 40, 0.65)',
        color: active ? '#ffd166' : '#f5e6d3',
        fontFamily: "'Silkscreen', 'Press Start 2P', monospace",
        fontSize: '11px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        border: '2px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        backdropFilter: 'blur(6px)',
        cursor: 'pointer',
        boxShadow: active
          ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 6px rgba(0,0,0,0.35)',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(80, 60, 60, 0.85)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? 'rgba(74, 53, 50, 0.85)'
          : 'rgba(50, 40, 40, 0.65)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
    >
      {children}
    </button>
  );
};
