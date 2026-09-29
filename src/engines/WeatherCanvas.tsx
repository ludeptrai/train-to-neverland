import React, { useEffect, useRef } from 'react';
import { WeatherType } from '../types';

interface WeatherCanvasProps {
  weather: WeatherType;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation?: number;
  rotSpeed?: number;
  life?: number;
  maxLife?: number;
}

export const WeatherCanvas: React.FC<WeatherCanvasProps> = ({ weather }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let splashes: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles based on weather
    const initParticles = () => {
      particles = [];
      splashes = [];
      const w = canvas.width;
      const h = canvas.height;

      const count = weather === 'rain' ? 140 : weather === 'snow' ? 90 : weather === 'sakura' ? 60 : 40;

      for (let i = 0; i < count; i++) {
        if (weather === 'rain') {
          particles.push({
            x: Math.random() * (w + 200) - 100,
            y: Math.random() * h,
            vx: -3.5 - Math.random() * 2, // angle falling leftwards due to train forward speed!
            vy: 12 + Math.random() * 6,
            size: 2,
            alpha: 0.4 + Math.random() * 0.4,
            color: '#b0d6ff',
          });
        } else if (weather === 'snow') {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: -1.5 + Math.random() * 0.8,
            vy: 1.2 + Math.random() * 1.5,
            size: Math.random() > 0.7 ? 3 : 2,
            alpha: 0.6 + Math.random() * 0.4,
            color: '#ffffff',
          });
        } else if (weather === 'sakura') {
          particles.push({
            x: Math.random() * (w + 200) - 100,
            y: Math.random() * h,
            vx: -2.5 - Math.random() * 2,
            vy: 1.5 + Math.random() * 2,
            size: 4 + Math.random() * 3,
            alpha: 0.7 + Math.random() * 0.3,
            color: Math.random() > 0.5 ? '#ffb7c5' : '#ff94aa',
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
          });
        } else {
          // Clear / Sun specks
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.2 - Math.random() * 0.4,
            size: Math.random() > 0.6 ? 2 : 1,
            alpha: 0.3 + Math.random() * 0.4,
            color: '#ffe599',
          });
        }
      }
    };

    initParticles();

    // Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const trainY = h * 0.82; // approximate train roof height

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (weather === 'rain') {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 1.5, p.y + p.vy * 1.5);
          ctx.stroke();

          p.x += p.vx;
          p.y += p.vy;

          // Check hit train roof or ground
          if (p.y >= trainY && Math.random() < 0.25) {
            // Spawn tiny splash
            splashes.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 2,
              vy: -1 - Math.random() * 1.5,
              size: 1.5,
              alpha: 0.6,
              color: '#d0e8ff',
              life: 0,
              maxLife: 8,
            });
          }

          if (p.y > h || p.x < -50) {
            p.y = -20;
            p.x = Math.random() * (w + 200) - 50;
          }
        } else if (weather === 'snow') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          // draw pixel square
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);

          p.x += p.vx + Math.sin(p.y * 0.02) * 0.5;
          p.y += p.vy;

          if (p.y > h) {
            p.y = -5;
            p.x = Math.random() * w;
          }
          if (p.x < 0) p.x = w;
        } else if (weather === 'sakura') {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) {
            p.rotation += p.rotSpeed || 0.02;
            ctx.rotate(p.rotation);
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          // Petal pixel shape
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();

          p.x += p.vx + Math.sin(p.y * 0.03) * 1.2;
          p.y += p.vy;

          if (p.y > h || p.x < -30) {
            p.y = -10;
            p.x = Math.random() * (w + 200) - 50;
          }
        } else {
          // Clear / Sun specks
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * (0.6 + Math.sin(Date.now() * 0.003 + p.x) * 0.4);
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);

          p.x += p.vx;
          p.y += p.vy;

          if (p.y < 0) {
            p.y = h;
            p.x = Math.random() * w;
          }
        }
      }

      // Render splashes
      for (let s = splashes.length - 1; s >= 0; s--) {
        const sp = splashes[s];
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha * (1 - (sp.life || 0) / (sp.maxLife || 8));
        ctx.fillRect(Math.floor(sp.x), Math.floor(sp.y), sp.size, sp.size);

        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.3; // gravity
        sp.life = (sp.life || 0) + 1;

        if (sp.life >= (sp.maxLife || 8)) {
          splashes.splice(s, 1);
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [weather]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 25,
      }}
    />
  );
};
