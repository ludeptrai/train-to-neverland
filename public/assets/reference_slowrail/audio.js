/**
 * Slow Rail - Procedural Web Audio Synthesizer
 * Generates dynamic, algorithmic ambient lofi music using native Web Audio API oscillators,
 * impulse-response convolution reverb, stereo delay line, and noise filters.
 *
 * Includes a rich catalog of 35 diverse procedural musical compositions that adaptively
 * change every 4-6 destinations or on user request.
 */
'use strict';

const RAIL_TRACKS = [
  {
    id: 'track_01',
    titleVi: 'Chiều trên đường ray',
    titleEn: 'Dusk on the Railroad',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 5, 3, 4, 2, 5, 1, 4],
    bpm: 66,
    defaultInstrument: 'piano',
    motifs: [[4, 2, null, 1, 2, 4, null, 6], [2, null, 1, 0, 2, null, 4, 2]]
  },
  {
    id: 'track_02',
    titleVi: 'Nắng qua ô cửa',
    titleEn: 'Sunlight Through Windows',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 3, 4, 0, 5, 1, 4, 0],
    bpm: 72,
    defaultInstrument: 'piano',
    motifs: [[0, 2, 4, 2, 0, null, 4, 5], [4, null, 2, 1, 0, 2, 4, null]]
  },
  {
    id: 'track_03',
    titleVi: 'Chuyến tàu dưới ánh trăng',
    titleEn: 'Train Under Moonlight',
    scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [0, 3, 4, 0, 3, 5, 4, 0],
    bpm: 58,
    defaultInstrument: 'ambient',
    motifs: [[2, null, 3, null, 0, 2, null, 4], [0, null, 2, 3, null, 2, 0, null]]
  },
  {
    id: 'track_04',
    titleVi: 'Những giọt mưa bên cửa sổ',
    titleEn: 'Raindrops on the Glass',
    scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [5, 3, 0, 4, 5, 1, 3, 4],
    bpm: 62,
    defaultInstrument: 'piano',
    motifs: [[3, 2, 0, null, 2, 3, null, 5], [2, 0, null, 3, 2, 0, null, 1]]
  },
  {
    id: 'track_05',
    titleVi: 'Tuyết rơi thật khẽ',
    titleEn: 'Quiet Falling Snow',
    scale: [0, 2, 4, 7, 9, 12, 14],
    progression: [0, 4, 2, 5, 0, 2, 4, 0],
    bpm: 56,
    defaultInstrument: 'bells',
    motifs: [[4, null, 2, 0, 4, null, 2, 1], [0, 2, 4, null, 2, 0, null, 4]]
  },
  {
    id: 'track_06',
    titleVi: 'Ký ức ga chiều',
    titleEn: 'Memories of Twilight Station',
    scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [0, 5, 2, 4, 0, 3, 4, 5],
    bpm: 64,
    defaultInstrument: 'lofi',
    motifs: [[2, 4, null, 1, 0, 2, 4, null], [4, 2, 1, null, 2, 0, null, 2]]
  },
  {
    id: 'track_07',
    titleVi: 'Giai điệu hoa anh đào',
    titleEn: 'Cherry Blossom Melody',
    scale: [0, 2, 4, 7, 9, 12, 14],
    progression: [0, 2, 4, 1, 0, 4, 2, 0],
    bpm: 68,
    defaultInstrument: 'piano',
    motifs: [[0, null, 2, 4, 5, 4, 2, 0], [2, 4, null, 2, 0, null, 2, 4]]
  },
  {
    id: 'track_08',
    titleVi: 'Tiếng vọng trong màn sương',
    titleEn: 'Echoes in the Mist',
    scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [0, 2, 5, 4, 0, 3, 4, 2],
    bpm: 56,
    defaultInstrument: 'ambient',
    motifs: [[1, null, 3, null, 2, 0, null, 2], [3, 2, 0, null, 1, null, 2, null]]
  },
  {
    id: 'track_09',
    titleVi: 'Tách cà phê sớm mai',
    titleEn: 'Morning Brew',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 4, 1, 4, 0, 3, 4, 0],
    bpm: 72,
    defaultInstrument: 'lofi',
    motifs: [[4, 2, 0, 2, 4, null, 2, 0], [0, 2, 4, null, 1, 2, null, 4]]
  },
  {
    id: 'track_10',
    titleVi: 'Ngắm sao qua khe rèm',
    titleEn: 'Stargazing Through Curtains',
    scale: [0, 2, 4, 6, 7, 9, 11],
    progression: [0, 3, 1, 4, 0, 4, 5, 4],
    bpm: 58,
    defaultInstrument: 'bells',
    motifs: [[3, null, 2, 4, null, 2, 0, null], [4, 3, 1, null, 2, null, 4, null]]
  },
  {
    id: 'track_11',
    titleVi: 'Đêm Kyoto vắng lặng',
    titleEn: 'Silent Night in Kyoto',
    scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [5, 3, 0, 4, 1, 3, 5, 0],
    bpm: 54,
    defaultInstrument: 'ambient',
    motifs: [[2, null, 0, 3, 2, null, 0, null], [0, 2, null, 3, 2, 0, null, 1]]
  },
  {
    id: 'track_12',
    titleVi: 'Khúc ru của gió mùa',
    titleEn: 'Lullaby of the Monsoon',
    scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [0, 3, 5, 4, 0, 2, 4, 5],
    bpm: 62,
    defaultInstrument: 'piano',
    motifs: [[3, 2, null, 0, 2, 4, null, 2], [2, 0, 1, null, 2, 3, null, 0]]
  },
  {
    id: 'track_13',
    titleVi: 'Chuyến tàu phương Bắc',
    titleEn: 'Northern Express',
    scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [0, 4, 3, 5, 0, 3, 4, 2],
    bpm: 60,
    defaultInstrument: 'bells',
    motifs: [[4, null, 2, 1, 0, null, 2, 4], [2, 0, null, 3, 4, null, 2, null]]
  },
  {
    id: 'track_14',
    titleVi: 'Bước chân trên lá khô',
    titleEn: 'Steps on Autumn Leaves',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 2, 3, 4, 5, 4, 2, 0],
    bpm: 66,
    defaultInstrument: 'lofi',
    motifs: [[2, 4, 2, null, 1, 2, 4, null], [0, null, 2, 4, 2, 0, null, 2]]
  },
  {
    id: 'track_15',
    titleVi: 'Bình minh trên cao nguyên',
    titleEn: 'Dawn Across Highlands',
    scale: [0, 2, 4, 6, 7, 9, 11],
    progression: [0, 3, 4, 5, 0, 4, 2, 4],
    bpm: 70,
    defaultInstrument: 'piano',
    motifs: [[3, 4, null, 2, 0, 2, 4, null], [4, 2, 0, null, 2, 4, 5, null]]
  },
  {
    id: 'track_16',
    titleVi: 'Hồi ức mùa hè ấy',
    titleEn: "That Summer's Memory",
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [3, 4, 0, 5, 3, 4, 0, 0],
    bpm: 68,
    defaultInstrument: 'piano',
    motifs: [[4, 2, null, 1, 2, 4, null, 2], [2, 0, 2, null, 4, 2, 0, null]]
  },
  {
    id: 'track_17',
    titleVi: 'Khói chiều ven đô',
    titleEn: 'Suburban Evening Mist',
    scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [0, 5, 3, 4, 0, 2, 4, 5],
    bpm: 60,
    defaultInstrument: 'lofi',
    motifs: [[2, null, 4, 2, 0, null, 2, 4], [0, 2, null, 1, 2, 0, null, 3]]
  },
  {
    id: 'track_18',
    titleVi: 'Nhịp bánh xe đều đặn',
    titleEn: 'Steady Wheels Rhythm',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 5, 1, 4, 0, 4, 2, 4],
    bpm: 74,
    defaultInstrument: 'lofi',
    motifs: [[0, 2, 4, null, 2, 0, 2, 4], [4, null, 2, 0, null, 2, 4, 2]]
  },
  {
    id: 'track_19',
    titleVi: 'Vườn trà sau cơn mưa',
    titleEn: 'Tea Garden After Rain',
    scale: [0, 2, 4, 7, 9, 12, 14],
    progression: [0, 3, 1, 4, 0, 2, 4, 0],
    bpm: 64,
    defaultInstrument: 'bells',
    motifs: [[2, 0, 2, 4, null, 2, 0, null], [4, null, 2, 0, 2, null, 4, null]]
  },
  {
    id: 'track_20',
    titleVi: 'Ánh đèn vàng phố cổ',
    titleEn: 'Old Town Lanterns',
    scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [5, 0, 3, 4, 5, 2, 3, 4],
    bpm: 62,
    defaultInstrument: 'piano',
    motifs: [[3, null, 2, 0, 2, 3, null, 4], [2, 0, null, 3, 2, 0, null, 2]]
  },
  {
    id: 'track_21',
    titleVi: 'Dòng sông lấp lánh',
    titleEn: 'Glistening River',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 4, 2, 5, 0, 3, 4, 0],
    bpm: 66,
    defaultInstrument: 'ambient',
    motifs: [[4, null, 2, 4, 5, null, 4, 2], [2, 0, null, 2, 4, 2, 0, null]]
  },
  {
    id: 'track_22',
    titleVi: 'Giấc mơ trôi lững lờ',
    titleEn: 'Drifting Dream',
    scale: [0, 2, 4, 6, 7, 9, 11],
    progression: [0, 1, 3, 4, 0, 4, 2, 4],
    bpm: 56,
    defaultInstrument: 'ambient',
    motifs: [[1, null, 3, null, 2, 0, null, 4], [3, 2, null, 0, 2, null, 3, null]]
  },
  {
    id: 'track_23',
    titleVi: 'Bên kia dãy núi mờ',
    titleEn: 'Beyond Misty Peaks',
    scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [0, 3, 5, 2, 0, 4, 3, 5],
    bpm: 58,
    defaultInstrument: 'piano',
    motifs: [[2, 3, null, 1, 0, 2, null, 3], [3, null, 2, 0, null, 2, 3, null]]
  },
  {
    id: 'track_24',
    titleVi: 'Gió thổi qua cánh đồng',
    titleEn: 'Wind Across the Valley',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 3, 4, 1, 0, 4, 2, 0],
    bpm: 68,
    defaultInstrument: 'lofi',
    motifs: [[2, 0, 2, 4, null, 2, 4, 5], [4, null, 2, 0, 2, 4, null, 2]]
  },
  {
    id: 'track_25',
    titleVi: 'Trạm dừng lúc nửa đêm',
    titleEn: 'Midnight Whistle Stop',
    scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [0, 4, 3, 0, 2, 4, 3, 0],
    bpm: 54,
    defaultInstrument: 'bells',
    motifs: [[2, null, 3, null, 1, 0, null, 2], [0, 2, 3, null, 2, 0, null, 1]]
  },
  {
    id: 'track_26',
    titleVi: 'Thư viện cổ và mưa rơi',
    titleEn: 'Old Library & Rain',
    scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [0, 5, 3, 4, 0, 3, 2, 4],
    bpm: 62,
    defaultInstrument: 'piano',
    motifs: [[3, 2, 0, null, 2, null, 3, 5], [2, 0, null, 3, 2, 0, null, 2]]
  },
  {
    id: 'track_27',
    titleVi: 'Cây cầu gỗ ngập nắng',
    titleEn: 'Sunlit Wooden Bridge',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 2, 4, 5, 0, 4, 1, 4],
    bpm: 70,
    defaultInstrument: 'lofi',
    motifs: [[4, 2, 0, null, 2, 4, 2, 0], [0, 2, 4, null, 2, 0, 2, null]]
  },
  {
    id: 'track_28',
    titleVi: 'Chuyến phiêu lưu tĩnh lặng',
    titleEn: 'A Quiet Odyssey',
    scale: [0, 2, 4, 6, 7, 9, 11],
    progression: [0, 4, 5, 3, 0, 3, 4, 0],
    bpm: 64,
    defaultInstrument: 'ambient',
    motifs: [[3, null, 2, 4, null, 2, 0, 2], [2, 4, 3, null, 2, 0, null, 4]]
  },
  {
    id: 'track_29',
    titleVi: 'Ngân hà bên ô kính',
    titleEn: 'Milky Way Window',
    scale: [0, 2, 4, 7, 9, 12, 14],
    progression: [0, 2, 4, 6, 0, 4, 2, 0],
    bpm: 54,
    defaultInstrument: 'bells',
    motifs: [[4, null, 2, 0, null, 2, 4, null], [0, 2, null, 4, 2, 0, null, 2]]
  },
  {
    id: 'track_30',
    titleVi: 'Tiếng chuông chùa xa',
    titleEn: 'Distant Temple Bell',
    scale: [0, 2, 4, 7, 9, 12, 14],
    progression: [0, 3, 2, 5, 0, 2, 4, 0],
    bpm: 58,
    defaultInstrument: 'bells',
    motifs: [[2, null, 0, null, 4, null, 2, 0], [0, 2, 4, null, 2, null, 0, null]]
  },
  {
    id: 'track_31',
    titleVi: 'Khúc dạo đầu mùa thu',
    titleEn: 'Autumn Prelude',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 5, 2, 4, 0, 3, 4, 0],
    bpm: 66,
    defaultInstrument: 'piano',
    motifs: [[2, 4, null, 2, 0, 2, 4, null], [4, 2, 0, null, 2, 4, 2, 0]]
  },
  {
    id: 'track_32',
    titleVi: 'Ngọn hải đăng trong sương',
    titleEn: 'Lighthouse in the Fog',
    scale: [0, 2, 3, 5, 7, 8, 10],
    progression: [5, 4, 3, 0, 5, 2, 3, 4],
    bpm: 56,
    defaultInstrument: 'ambient',
    motifs: [[3, null, 2, 0, 1, null, 2, null], [2, 0, null, 3, 2, null, 0, null]]
  },
  {
    id: 'track_33',
    titleVi: 'Trái tim bình yên',
    titleEn: 'Untroubled Heart',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 4, 3, 5, 0, 2, 4, 0],
    bpm: 64,
    defaultInstrument: 'piano',
    motifs: [[4, 2, null, 1, 2, 4, 2, 0], [0, 2, 4, null, 2, 0, null, 2]]
  },
  {
    id: 'track_34',
    titleVi: 'Đêm đông ấm áp',
    titleEn: 'Warm Winter Cabin',
    scale: [0, 2, 3, 5, 7, 9, 10],
    progression: [0, 3, 4, 5, 0, 2, 4, 0],
    bpm: 60,
    defaultInstrument: 'lofi',
    motifs: [[2, 4, 2, null, 1, 0, 2, 4], [3, null, 2, 0, 2, 4, null, 2]]
  },
  {
    id: 'track_35',
    titleVi: 'Đường ray vô tận',
    titleEn: 'The Endless Rails',
    scale: [0, 2, 4, 5, 7, 9, 11],
    progression: [0, 5, 3, 4, 0, 4, 2, 4],
    bpm: 72,
    defaultInstrument: 'piano',
    motifs: [[0, 2, 4, 2, 0, null, 2, 4], [4, null, 2, 1, 2, 4, null, 0]]
  }
];

class RailAudio {
  constructor() {
    this.ctx = null;
    this.running = false;
    this.step = 0;
    this.next = 0;
    this.timer = null;
    this.tracks = RAIL_TRACKS;
    // Choose random starting track
    this.currentTrackIndex = Math.floor(Math.random() * RAIL_TRACKS.length);
    this.settings = {
      time: 'sunset',
      weather: 'clear',
      instrument: 'piano',
      volume: 0.45,
      rainVolume: 0.6,
      city: 0
    };
  }

  /**
   * Initializes the AudioContext graph, convolver reverb, delay, and ambient rain generator.
   */
  init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const c = (this.ctx = new AudioContextClass());

    // Master volume & compressor
    this.master = c.createGain();
    this.master.gain.value = this.settings.volume * 0.75;

    const compressor = c.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    compressor.knee.value = 12;
    this.master.connect(compressor);
    compressor.connect(c.destination);

    // Audio bus
    this.bus = c.createGain();
    this.bus.connect(this.master);

    // Algorithmic impulse response for lush spatial reverb
    this.verb = c.createConvolver();
    const irDuration = 3.4;
    const irBuffer = c.createBuffer(2, Math.floor(c.sampleRate * irDuration), c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const channelData = irBuffer.getChannelData(ch);
      const len = channelData.length;
      for (let i = 0; i < len; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.8) * 0.25;
      }
    }
    this.verb.buffer = irBuffer;

    const reverbWet = c.createGain();
    reverbWet.gain.value = 0.28;
    this.verb.connect(reverbWet);
    reverbWet.connect(this.master);
    this.bus.connect(this.verb);

    // Stereo feedback delay line
    const delay = c.createDelay(2);
    const feedback = c.createGain();
    const delayFilter = c.createBiquadFilter();

    delay.delayTime.value = 0.43;
    feedback.gain.value = 0.18;
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 1700;

    this.bus.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    feedback.connect(this.master);

    // Procedural ambient rain sound generator (pink/white noise filtered)
    const noiseLength = Math.floor(c.sampleRate * 5);
    const noiseBuffer = c.createBuffer(1, noiseLength, c.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    this.noise = noiseBuffer;

    const rainSource = c.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = c.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 950;

    this.rain = c.createGain();
    this.rain.gain.value = 0;

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rain);
    this.rain.connect(this.master);
    rainSource.start();

    this.update(this.settings);
  }

  /**
   * Sets current track and resets beat step for smooth musical transition
   */
  setTrack(index) {
    this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
    this.step = 0;
    return this.getCurrentTrack();
  }

  nextTrack() {
    return this.setTrack(this.currentTrackIndex + 1);
  }

  prevTrack() {
    return this.setTrack(this.currentTrackIndex - 1);
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex] || this.tracks[0];
  }

  /**
   * Updates audio parameters (volume, rain intensity)
   */
  update(settings) {
    Object.assign(this.settings, settings);
    if (!this.ctx) return;

    const targetGain = this.settings.volume * 0.75;
    this.master.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);

    const rainVol = (this.settings.rainVolume !== undefined) ? this.settings.rainVolume : 0.6;
    const rainGain = this.settings.weather === 'rain' ? (rainVol * 0.14) : 0;
    this.rain.gain.setTargetAtTime(rainGain, this.ctx.currentTime, 0.4);
  }

  /**
   * Synthesizes a musical note with multiple harmonic partials and stereo panning
   */
  tone(midi, at, duration, velocity, kind = 'piano', pan = 0) {
    const c = this.ctx;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const panner = c.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(this.bus);

    const harmonicProfiles = {
      pad: [[1, 0.6], [2, 0.12], [0.5, 0.15]],
      bells: [[1, 0.6], [2.76, 0.14], [5.4, 0.045]],
      bass: [[1, 0.7], [2, 0.1]],
      piano: [[1, 0.58], [2, 0.23], [3, 0.085], [4, 0.035], [6, 0.012]]
    };

    const parts = harmonicProfiles[kind] || harmonicProfiles.piano;

    for (let j = 0; j < parts.length; j++) {
      const [ratio, weight] = parts[j];
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq * ratio * (kind === 'piano' ? 1 + 0.00022 * j * j : 1);
      osc.detune.value = kind === 'pad' ? (j - 1) * 3 : 0;

      const attack = kind === 'pad' ? 0.85 : kind === 'bass' ? 0.028 : 0.006;
      gain.gain.setValueAtTime(0.00001, at);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, velocity * weight), at + attack);
      gain.gain.exponentialRampToValueAtTime(0.00001, at + Math.max(attack + 0.1, duration / (1 + j * 0.3)));

      osc.connect(gain);
      gain.connect(panner);

      osc.start(at);
      osc.stop(at + duration + 0.1);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    }

    const cleanupMs = Math.max(0, (at + duration - c.currentTime + 0.3) * 1000);
    setTimeout(() => panner.disconnect(), cleanupMs);
  }

  /**
   * Synthesizes Lo-Fi drum percussions (Kick, Snare, Hi-hat)
   */
  drum(at, type) {
    const c = this.ctx;
    if (type === 'kick') {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.frequency.setValueAtTime(110, at);
      osc.frequency.exponentialRampToValueAtTime(42, at + 0.13);

      gain.gain.setValueAtTime(0.09, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);

      osc.connect(gain);
      gain.connect(this.bus);
      osc.start(at);
      osc.stop(at + 0.3);
    } else {
      const src = c.createBufferSource();
      const filter = c.createBiquadFilter();
      const gain = c.createGain();

      src.buffer = this.noise;
      filter.type = type === 'snare' ? 'bandpass' : 'highpass';
      filter.frequency.value = type === 'snare' ? 1800 : 6500;

      gain.gain.setValueAtTime(type === 'snare' ? 0.018 : 0.009, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.bus);

      src.start(at);
      src.stop(at + 0.14);
    }
  }

  /**
   * Generative musical scheduler: generates scales, chord progressions, and melodic lines
   * using the active composition from the 35-track library.
   */
  schedule() {
    const c = this.ctx;
    if (!this.running || !c || c.state !== 'running') return;

    if (this.next < c.currentTime - 0.1) {
      this.next = c.currentTime + 0.05;
    }

    const currentTrack = this.getCurrentTrack();

    while (this.next < c.currentTime + 0.18) {
      const s = this.settings;
      const scale = currentTrack.scale;
      const tonic = [48, 50, 53, 55, 57][s.city % 5];
      const degree = n => tonic + scale[((n % scale.length) + scale.length) % scale.length] + 12 * Math.floor(n / scale.length);

      const progression = currentTrack.progression;
      const bar = Math.floor(this.step / 8);
      const beat = this.step % 8;
      const root = progression[Math.floor(this.step / 32) % progression.length];
      const chord = [root, root + 2, root + 4, root + 6];
      const at = this.next;
      const style = s.instrument || currentTrack.defaultInstrument;

      // Chord progression triggering
      if (beat === 0) {
        chord.forEach((n, i) => {
          this.tone(
            degree(n),
            at + i * 0.023,
            style === 'ambient' ? 6 : 3.8,
            0.075,
            style === 'ambient' ? 'pad' : 'piano',
            (i - 1.5) * 0.19
          );
        });
        this.tone(degree(root) - 12, at, 3, 0.1, 'bass', -0.1);
      }

      // Melodic motif generation
      const motifs = currentTrack.motifs;
      const motif = motifs[Math.floor(bar / 2) % motifs.length];
      const noteDegree = motif[beat];

      if (noteDegree !== null && !(s.time === 'night' && beat % 2)) {
        const melodic = chord[noteDegree % chord.length] + 7 + (bar % 8 === 7 && beat > 4 ? -7 : 0);
        this.tone(
          degree(melodic),
          at + (beat % 2 ? 0.025 : 0),
          style === 'bells' ? 3.5 : 2.8,
          0.065 + (beat === 0 ? 0.022 : 0),
          style === 'ambient' ? 'bells' : style === 'lofi' ? 'piano' : style,
          Math.sin(this.step * 0.7) * 0.28
        );
      }

      // Drum sequencing for Lo-Fi style
      if (style === 'lofi') {
        if (beat === 0 || beat === 4) this.drum(at, 'kick');
        if (beat === 2 || beat === 6) this.drum(at + 0.018, 'snare');
        if (beat % 2) this.drum(at + 0.025, 'hat');
      }

      // Atmospheric pad swell
      if (style === 'ambient' && beat === 4) {
        this.tone(degree(root + 4) + 12, at, 5, 0.03, 'pad', 0.35);
      }

      // Adaptive tempo
      const bpmDelta = s.time === 'night' ? -4 : s.time === 'day' ? 4 : 0;
      const bpm = Math.max(48, currentTrack.bpm + bpmDelta);
      this.next += 30 / bpm;
      this.step++;
    }
  }

  /**
   * Starts procedural music synthesis
   */
  async play() {
    this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.running = true;
    this.next = this.ctx.currentTime + 0.08;
    this.schedule();

    clearInterval(this.timer);
    this.timer = setInterval(() => this.schedule(), 80);
  }

  /**
   * Pauses audio playback
   */
  async pause() {
    this.running = false;
    clearInterval(this.timer);
    if (this.ctx && this.ctx.state === 'running') {
      await this.ctx.suspend();
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = { RailAudio, RAIL_TRACKS };
}
