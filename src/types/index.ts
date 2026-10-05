export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night' | 'auto';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'sakura';

export type DSPPreset = 'normal' | 'lofi' | 'bit8' | 'vinyl' | 'underwater' | 'telephone' | 'dreamy';

export interface SunTimeConfig {
  y?: number | string; // Vị trí trục dọc/độ cao (ví dụ: "46%" hoặc 46)
  top?: number | string; // Bí danh cho y
  x?: number | string; // Vị trí trục ngang (ví dụ: "72%" hoặc 72)
  left?: number | string; // Bí danh cho x
  size?: number; // Kích thước pixel (ví dụ: 130)
  width?: number; // Bí danh cho size
}

export interface SunConfig {
  dawn?: SunTimeConfig;
  day?: SunTimeConfig;
  sunset?: SunTimeConfig;
  night?: SunTimeConfig;
}

export interface SceneConfig {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  bgSpeed: number; // 0.15 - 0.25
  mgSpeed: number; // 0.8 - 1.2
  bgScaleRatio?: number; // Tỉ lệ co dãn background (mặc định 1.0 = 100% chiều cao khung hình)
  bgY?: number | string; // Vị trí trục Y của background (px hoặc %, mặc định 0)
  bgMirror?: boolean; // Bật/tắt tính năng đảo ngược background để kéo dài (mặc định: true)
  mgScaleRatio?: number; // Tỉ lệ co dãn midground (mặc định 1.0 = 32% chiều cao khung hình)
  mgY?: number | string; // Vị trí trục Y của midground (px hoặc %, mặc định 0)
  trainY?: number | string; // Vị trí trục Y của đoàn tàu (độc lập với midground, mặc định 0)
  trainScaleRatio?: number; // Tỉ lệ phóng to/thu nhỏ đoàn tàu (mặc định 1.0)
  sun?: SunConfig; // Cấu hình độ cao và kích thước mặt trời theo thời điểm (dawn, day, sunset, night)
  backgroundUrl: string;
  backgroundLightsUrl?: string;
  midgroundUrl: string;
  midgroundLightsUrl?: string;
  foregroundUrl?: string; // URL ảnh tiền cảnh (optional, fallback default_foreground.png)
  foregroundLightsUrl?: string; // URL đèn đêm tiền cảnh
  fgSpeed?: number; // Tốc độ cuộn tiền cảnh (mặc định 1.35x)
  fgScaleRatio?: number; // Tỉ lệ co dãn tiền cảnh (mặc định 1.0)
  fgY?: number | string; // Vị trí trục Y của tiền cảnh (px hoặc %, mặc định 0)
  fgOpacity?: number; // Độ trong suốt của tiền cảnh (mặc định 1.0)
  skyPresets?: {
    dawn?: string[];
    day?: string[];
    sunset?: string[];
    night?: string[];
  };
  ambientFilter?: {
    dawn?: string;
    day?: string;
    sunset?: string;
    night?: string;
  } | string;
  nightFilter?: string;
  nightOverlayBlend?: string;
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
  isMuted: boolean;
  currentTrackIndex: number;
  dspPreset: DSPPreset;
}
