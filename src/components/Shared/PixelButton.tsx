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
        justifyContent: 'center',
        gap: '6px',
        height: '34px',
        padding: '0 12px',
        boxSizing: 'border-box',
        backgroundColor: active ? 'rgba(74, 53, 50, 0.9)' : 'rgba(32, 28, 36, 0.75)',
        color: active ? '#ffd166' : '#f5e6d3',
        fontFamily: "'VT323', monospace",
        fontSize: '17px',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        border: active ? '1.5px solid #ffd166' : '1.5px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '6px',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        boxShadow: active
          ? 'inset 0 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(255, 209, 102, 0.25)'
          : '0 2px 6px rgba(0,0,0,0.4)',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? 'rgba(84, 60, 56, 0.95)'
          : 'rgba(50, 44, 56, 0.88)';
        e.currentTarget.style.borderColor = active
          ? '#ffeaa7'
          : 'rgba(255, 255, 255, 0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? 'rgba(74, 53, 50, 0.9)'
          : 'rgba(32, 28, 36, 0.75)';
        e.currentTarget.style.borderColor = active
          ? '#ffd166'
          : '1.5px solid rgba(255, 255, 255, 0.16)';
      }}
    >
      {children}
    </button>
  );
};
