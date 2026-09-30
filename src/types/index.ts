export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night' | 'auto';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'sakura';

export type DSPPreset = 'normal' | 'lofi' | 'bit8' | 'vinyl' | 'underwater' | 'telephone' | 'dreamy';

export interface SceneConfig {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  bgSpeed: number; // 0.15 - 0.25
  mgSpeed: number; // 0.8 - 1.2
  mgScaleRatio?: number; // Tỉ lệ co dãn midground (mặc định 1.0 = 32% chiều cao khung hình)
  mgY?: number | string; // Vị trí trục Y của midground (px hoặc %, mặc định 0)
  backgroundUrl: string;
  backgroundLightsUrl?: string;
  midgroundUrl: string;
  midgroundLightsUrl?: string;
  skyPresets?: {
    dawn?: string[];
    day?: string[];
    sunset?: string[];
    night?: string[];
  };
}

export interface TrainTheme {
  id: string;
  name: string;
  description: string;
  carCount: number;
  bodyUrl: string;
  lightsUrl?: string;
  wheelType: 'standard' | 'spoke' | 'maglev_glow';
  hasPantograph: boolean;
  hasSmoke: boolean;
}

export interface AudioChannelState {
  muted: boolean;
  volume: number; // 0.0 to 1.0
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  isCustom?: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  trainVolume: number;
  rainVolume: number;
  windVolume: number;
  natureVolume: number;
  isPlayingMusic: boolean;
  currentTrackIndex: number;
  dspPreset: DSPPreset;
}
