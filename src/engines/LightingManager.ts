import { TimeOfDay } from '../types';

export interface LightingTheme {
  skyGradient: string;
  ambientFilter: string;
  emissiveOpacity: number;
  emissiveGlow: string;
  overlayBlend: string;
  starsOpacity: number;
}

export function resolveTimeOfDay(timeOfDay: TimeOfDay): 'dawn' | 'day' | 'sunset' | 'night' {
  if (timeOfDay !== 'auto') return timeOfDay;
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'sunset';
  return 'night';
}

export function getLightingTheme(time: 'dawn' | 'day' | 'sunset' | 'night'): LightingTheme {
  switch (time) {
    case 'dawn':
      return {
        skyGradient: 'linear-gradient(180deg, #6a4c93 0%, #b5838d 35%, #e5989b 65%, #ffb4a2 85%, #ffcdb2 100%)',
        ambientFilter: 'brightness(0.92) contrast(1.02) saturate(1.1) sepia(0.15)',
        emissiveOpacity: 0.35,
        emissiveGlow: 'drop-shadow(0 0 4px rgba(255, 220, 100, 0.6))',
        overlayBlend: 'rgba(106, 76, 147, 0.15)',
        starsOpacity: 0.1,
      };
    case 'day':
      return {
        // Aesthetic anime sunset-gold or clear bright sky
        skyGradient: 'linear-gradient(180deg, #90caf9 0%, #bbdefb 40%, #e3f2fd 75%, #fff3e0 100%)',
        ambientFilter: 'brightness(1.0) contrast(1.0) saturate(1.0)',
        emissiveOpacity: 0.0,
        emissiveGlow: 'none',
        overlayBlend: 'transparent',
        starsOpacity: 0.0,
      };
    case 'sunset':
      return {
        skyGradient: 'linear-gradient(180deg, #53354a 0%, #903749 30%, #e84545 60%, #ff847c 85%, #fecea8 100%)',
        ambientFilter: 'brightness(0.95) contrast(1.08) saturate(1.25) sepia(0.25)',
        emissiveOpacity: 0.65,
        emissiveGlow: 'drop-shadow(0 0 6px rgba(255, 180, 50, 0.8))',
        overlayBlend: 'rgba(232, 69, 69, 0.12)',
        starsOpacity: 0.2,
      };
    case 'night':
      return {
        skyGradient: 'linear-gradient(180deg, #050b14 0%, #0d1b2a 40%, #1b263b 75%, #2a3d54 100%)',
        ambientFilter: 'brightness(0.68) contrast(1.15) saturate(0.85) hue-rotate(200deg)',
        emissiveOpacity: 1.0,
        emissiveGlow: 'drop-shadow(0 0 8px rgba(255, 230, 110, 0.9))',
        overlayBlend: 'rgba(13, 27, 42, 0.35)',
        starsOpacity: 0.95,
      };
  }
}
