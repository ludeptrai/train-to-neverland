import React, { useEffect, useState } from 'react';

interface AmbientItem {
  id: number;
  type: 'balloon' | 'birds' | 'plane';
  x: number; // percentage 0 - 100
  y: number; // percentage
  speed: number;
  scale: number;
  opacity: number;
}

export const AmbientSpawner: React.FC = () => {
  const [items, setItems] = useState<AmbientItem[]>([
    { id: 1, type: 'balloon', x: 22, y: 14, speed: 0.015, scale: 1, opacity: 0.9 },
  ]);

  useEffect(() => {
    // Movement loop
    const interval = setInterval(() => {
      setItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            x: item.x - item.speed, // drifting right to left
          }))
          .filter((item) => item.x > -20)
      );
    }, 50);

    // Spawner loop
    const spawner = setInterval(() => {
      if (Math.random() < 0.45) {
        const types: Array<'balloon' | 'birds' | 'plane'> = ['balloon', 'birds', 'plane'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        const newItem: AmbientItem = {
          id: Date.now() + Math.random(),
          type: chosen,
          x: 110,
          y: chosen === 'plane' ? 10 + Math.random() * 12 : chosen === 'birds' ? 18 + Math.random() * 20 : 12 + Math.random() * 18,
          speed: chosen === 'plane' ? 0.08 : chosen === 'birds' ? 0.06 : 0.02,
          scale: 0.8 + Math.random() * 0.4,
          opacity: 0.85,
        };
        setItems((prev) => [...prev, newItem]);
      }
    }, 12000);

    return () => {
      clearInterval(interval);
      clearInterval(spawner);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `scale(${item.scale})`,
            opacity: item.opacity,
            transition: 'left 50ms linear',
          }}
        >
          {item.type === 'balloon' && (
            <div title="Khinh khí cầu" style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
              <svg width="40" height="52" viewBox="0 0 20 26" style={{ imageRendering: 'pixelated' }}>
                {/* Pixel Art Hot Air Balloon */}
                <rect x="6" y="2" width="8" height="2" fill="#e74c3c" />
                <rect x="4" y="4" width="12" height="3" fill="#f39c12" />
                <rect x="3" y="7" width="14" height="4" fill="#3498db" />
                <rect x="5" y="11" width="10" height="3" fill="#2ecc71" />
                <rect x="7" y="14" width="6" height="2" fill="#f1c40f" />
                <rect x="8" y="16" width="4" height="2" fill="#e67e22" />
                {/* Ropes */}
                <rect x="7" y="18" width="1" height="3" fill="#7f8c8d" />
                <rect x="12" y="18" width="1" height="3" fill="#7f8c8d" />
                {/* Basket */}
                <rect x="7" y="21" width="6" height="3" fill="#8d6e63" />
                <rect x="8" y="22" width="4" height="1" fill="#5d4037" />
              </svg>
            </div>
          )}

          {item.type === 'birds' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* V formation birds */}
              <svg width="18" height="12" viewBox="0 0 12 8" style={{ imageRendering: 'pixelated' }}>
                <rect x="2" y="2" width="3" height="1" fill="#2c3e50" />
                <rect x="4" y="3" width="4" height="1" fill="#2c3e50" />
                <rect x="7" y="2" width="3" height="1" fill="#2c3e50" />
              </svg>
              <svg width="18" height="12" viewBox="0 0 12 8" style={{ imageRendering: 'pixelated', marginTop: '6px' }}>
                <rect x="2" y="3" width="3" height="1" fill="#34495e" />
                <rect x="4" y="4" width="4" height="1" fill="#34495e" />
                <rect x="7" y="3" width="3" height="1" fill="#34495e" />
              </svg>
              <svg width="18" height="12" viewBox="0 0 12 8" style={{ imageRendering: 'pixelated', marginTop: '-4px' }}>
                <rect x="2" y="2" width="3" height="1" fill="#2c3e50" />
                <rect x="4" y="3" width="4" height="1" fill="#2c3e50" />
                <rect x="7" y="2" width="3" height="1" fill="#2c3e50" />
              </svg>
            </div>
          )}

          {item.type === 'plane' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="24" height="10" viewBox="0 0 16 6" style={{ imageRendering: 'pixelated' }}>
                <rect x="2" y="2" width="12" height="2" fill="#ecf0f1" />
                <rect x="6" y="0" width="4" height="2" fill="#bdc3c7" />
                <rect x="7" y="4" width="3" height="2" fill="#bdc3c7" />
                <rect x="14" y="1" width="2" height="3" fill="#e74c3c" />
                {/* Red beacon light */}
                <rect x="8" y="2" width="1" height="1" fill="#e74c3c" />
              </svg>
              {/* Contrail / Khói máy bay */}
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.7))',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
