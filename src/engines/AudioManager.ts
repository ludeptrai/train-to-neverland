import { AudioSettings, AudioTrack, DSPPreset } from '../types';

/**
 * AudioManager - Bộ quản lý âm thanh đa kênh tích hợp Realtime DSP Audio Engine
 * Cung cấp:
 * 1. Web Audio Realtime DSP Filter Chain: Chuyển đổi nhạc đang phát thành Lo-Fi / 8-Bit / Vinyl / Underwater / Telephone / Dreamy ngay trong trình duyệt.
 * 2. Hỗ trợ phát bài hát mẫu của người dùng (Rokudenashi - One Voice) & Tự nạp file MP3 bất kỳ từ máy.
 * 3. Bộ tạo âm thanh môi trường procedural: Tiếng ray tàu xình xịch, tiếng mưa rơi, tiếng gió thổi, chim hót.
 */
class AudioManager {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master & Channel Gain Nodes
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private trainGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private natureGain: GainNode | null = null;

  // Active procedural loop intervals/oscillators
  private trainIntervalId: number | null = null;
  private rainNode: AudioNode | null = null;
  private windNode: AudioNode | null = null;
  private natureIntervalId: number | null = null;
  private musicChordIntervalId: number | null = null;

  // --- HTML5 Audio Element for Real Music Tracks ---
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;

  // --- Realtime DSP Nodes ---
  private bitcrusherNode: ScriptProcessorNode | null = null;
  private waveShaperNode: WaveShaperNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private bassBoostFilter: BiquadFilterNode | null = null;
  private delayWobbleNode: DelayNode | null = null;
  private lfoWobbleOsc: OscillatorNode | null = null;
  private lfoWobbleGain: GainNode | null = null;
  private echoDelayNode: DelayNode | null = null;
  private echoFeedbackGain: GainNode | null = null;
  private vinylNoiseNode: AudioNode | null = null;
  private vinylGain: GainNode | null = null;

  // Bitcrusher parameters
  private bitDepth = 16;
  private downsampleFactor = 1;
  private isBitcrusherActive = false;

  // Playlists
  public tracks: AudioTrack[] = [
    {
      id: 'rokudenashi_one_voice',
      title: 'One Voice (ただ声一つ)',
      artist: 'Rokudenashi (ロクデナシ)',
      url: './assets/music/rokudenashi_one_voice.mp3',
    },
    {
      id: 'synth_tokyo_sunset',
      title: 'Tokyo Sunset Ambient Chords',
      artist: 'Neverland Lo-Fi Synthesizer',
      url: 'procedural',
    },
  ];

  public settings: AudioSettings = {
    masterVolume: 0.85,
    musicVolume: 0.8,
    trainVolume: 0.5,
    rainVolume: 0.0,
    windVolume: 0.25,
    natureVolume: 0.35,
    isPlayingMusic: false,
    currentTrackIndex: 0,
    dspPreset: 'normal',
  };

  private listeners: Array<(settings: AudioSettings) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  public subscribe(fn: (settings: AudioSettings) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((fn) => fn({ ...this.settings }));
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('neverland_audio_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('neverland_audio_settings', JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  public async init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. Master Output Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.settings.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 2. Channel Gains
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.settings.isPlayingMusic ? this.settings.musicVolume : 0, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.trainGain = this.ctx.createGain();
    this.trainGain.gain.setValueAtTime(this.settings.trainVolume, this.ctx.currentTime);
    this.trainGain.connect(this.masterGain);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.settings.rainVolume, this.ctx.currentTime);
    this.rainGain.connect(this.masterGain);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(this.settings.windVolume, this.ctx.currentTime);
    this.windGain.connect(this.masterGain);

    this.natureGain = this.ctx.createGain();
    this.natureGain.gain.setValueAtTime(this.settings.natureVolume, this.ctx.currentTime);
    this.natureGain.connect(this.masterGain);

    // 3. Build Realtime DSP Processing Graph
    this.buildDSPChain();

    // 4. Setup HTML5 Audio Element for MP3 tracks
    this.setupAudioElement();

    // 5. Start background procedural ambiance
    this.startTrainSynthesis();
    this.startRainSynthesis();
    this.startWindSynthesis();
    this.startNatureSynthesis();

    this.isInitialized = true;

    // Apply the saved DSP preset
    this.setDSPPreset(this.settings.dspPreset);
  }

  // --- Realtime DSP Chain Construction ---
  private buildDSPChain() {
    if (!this.ctx || !this.musicGain) return;

    // A. Bitcrusher (4096 buffer size, 2 channels in, 2 channels out)
    this.bitcrusherNode = this.ctx.createScriptProcessor(4096, 2, 2);
    let phaser = 0;
    let lastSampleL = 0;
    let lastSampleR = 0;

    this.bitcrusherNode.onaudioprocess = (e) => {
      const inL = e.inputBuffer.getChannelData(0);
      const inR = e.inputBuffer.getChannelData(1);
      const outL = e.outputBuffer.getChannelData(0);
      const outR = e.outputBuffer.getChannelData(1);

      if (!this.isBitcrusherActive) {
        outL.set(inL);
        outR.set(inR);
        return;
      }

      const step = Math.pow(0.5, this.bitDepth);
      const factor = this.downsampleFactor;

      for (let i = 0; i < inL.length; i++) {
        phaser++;
        if (phaser >= factor) {
          phaser = 0;
          lastSampleL = step * Math.floor(inL[i] / step + 0.5);
          lastSampleR = step * Math.floor(inR[i] / step + 0.5);
        }
        outL[i] = lastSampleL;
        outR[i] = lastSampleR;
      }
    };

    // B. WaveShaper for warm analogue saturation / tape clipping
    this.waveShaperNode = this.ctx.createWaveShaper();
    this.waveShaperNode.curve = this.makeDistortionCurve(0);
    this.waveShaperNode.oversample = '4x';

    // C. Frequency Filters (Lowpass, Highpass, LowShelf)
    this.lowpassFilter = this.ctx.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);

    this.highpassFilter = this.ctx.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.setValueAtTime(20, this.ctx.currentTime);

    this.bassBoostFilter = this.ctx.createBiquadFilter();
    this.bassBoostFilter.type = 'lowshelf';
    this.bassBoostFilter.frequency.setValueAtTime(100, this.ctx.currentTime);
    this.bassBoostFilter.gain.setValueAtTime(0, this.ctx.currentTime);

    // D. Tape Wobble (Delay node modulated by slow LFO)
    this.delayWobbleNode = this.ctx.createDelay();
    this.delayWobbleNode.delayTime.setValueAtTime(0.005, this.ctx.currentTime);

    this.lfoWobbleOsc = this.ctx.createOscillator();
    this.lfoWobbleOsc.frequency.setValueAtTime(0.3, this.ctx.currentTime);
    this.lfoWobbleGain = this.ctx.createGain();
    this.lfoWobbleGain.gain.setValueAtTime(0, this.ctx.currentTime); // default off

    this.lfoWobbleOsc.connect(this.lfoWobbleGain);
    this.lfoWobbleGain.connect(this.delayWobbleNode.delayTime);
    this.lfoWobbleOsc.start();

    // E. Echo / Cathedral Reverb Delay
    this.echoDelayNode = this.ctx.createDelay();
    this.echoDelayNode.delayTime.setValueAtTime(0.32, this.ctx.currentTime);
    this.echoFeedbackGain = this.ctx.createGain();
    this.echoFeedbackGain.gain.setValueAtTime(0, this.ctx.currentTime); // default dry

    this.echoDelayNode.connect(this.echoFeedbackGain);
    this.echoFeedbackGain.connect(this.echoDelayNode);

    // F. Vinyl Crackle Noise Channel
    this.createVinylNoise();

    // Connect DSP Chain:
    // bitcrusher -> waveShaper -> highpass -> lowpass -> bassBoost -> delayWobble -> musicGain
    this.bitcrusherNode.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.bassBoostFilter);
    this.bassBoostFilter.connect(this.delayWobbleNode);

    // Connect to echo & musicGain
    this.delayWobbleNode.connect(this.musicGain);
    this.delayWobbleNode.connect(this.echoDelayNode);
    this.echoFeedbackGain.connect(this.musicGain);
  }

  private makeDistortionCurve(amount = 0): Float32Array {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    return curve;
  }

  // --- Procedural Vinyl Crackle Generator ---
  private createVinylNoise() {
    if (!this.ctx || !this.musicGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Soft background vinyl hiss
      let sample = (Math.random() * 2 - 1) * 0.015;
      // Random loud vinyl crackle pop
      if (Math.random() < 0.0004) {
        sample += (Math.random() * 2 - 1) * 0.7;
      }
      data[i] = sample;
    }

    const vinylSource = this.ctx.createBufferSource();
    vinylSource.buffer = buffer;
    vinylSource.loop = true;

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0, this.ctx.currentTime); // default off

    vinylSource.connect(this.vinylGain);
    this.vinylGain.connect(this.musicGain);
    vinylSource.start();
    this.vinylNoiseNode = vinylSource;
  }

  // --- Setup HTML Audio Element ---
  private setupAudioElement() {
    if (!this.ctx || !this.bitcrusherNode) return;

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.loop = true;

    // Load initial track URL
    const track = this.tracks[this.settings.currentTrackIndex];
    if (track && track.url !== 'procedural') {
      this.audioElement.src = track.url;
    }

    // Connect audioElement output into the DSP Chain entrypoint
    try {
      this.mediaSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.mediaSourceNode.connect(this.bitcrusherNode);
    } catch {
      // already connected
    }
  }

  // --- Public Realtime DSP Preset Controller ---
  public setDSPPreset(preset: DSPPreset) {
    this.init();
    this.settings.dspPreset = preset;

    if (!this.ctx) {
      this.notify();
      return;
    }

    const now = this.ctx.currentTime;
    const lp = this.lowpassFilter;
    const hp = this.highpassFilter;
    const bb = this.bassBoostFilter;
    const ws = this.waveShaperNode;
    const lfoG = this.lfoWobbleGain;
    const echoG = this.echoFeedbackGain;
    const vG = this.vinylGain;

    switch (preset) {
      case 'normal':
        this.isBitcrusherActive = false;
        lp?.frequency.setTargetAtTime(20000, now, 0.05);
        hp?.frequency.setTargetAtTime(20, now, 0.05);
        bb?.gain.setTargetAtTime(0, now, 0.05);
        if (ws) ws.curve = this.makeDistortionCurve(0);
        lfoG?.gain.setTargetAtTime(0, now, 0.05);
        echoG?.gain.setTargetAtTime(0, now, 0.05);
        vG?.gain.setTargetAtTime(0, now, 0.05);
        break;

      case 'lofi':
        // Warm lowpass cut, bass boost, gentle tape wobble, vinyl crackle
        this.isBitcrusherActive = false;
        lp?.frequency.setTargetAtTime(3200, now, 0.08);
        hp?.frequency.setTargetAtTime(100, now, 0.08);
        bb?.frequency.setValueAtTime(120, now);
        bb?.gain.setTargetAtTime(4.5, now, 0.08);
        if (ws) ws.curve = this.makeDistortionCurve(12);
        lfoG?.gain.setTargetAtTime(0.0016, now, 0.08); // gentle pitch flutter
        echoG?.gain.setTargetAtTime(0.12, now, 0.08);
        vG?.gain.setTargetAtTime(0.18, now, 0.08);
        break;

      case 'bit8':
        // 8-bit retro Chiptune Game Boy crusher
        this.isBitcrusherActive = true;
        this.bitDepth = 4; // crunchy 4-bit / 8-bit quantization
        this.downsampleFactor = 6; // reduce sample rate to ~7.3 kHz
        lp?.frequency.setTargetAtTime(4200, now, 0.05);
        hp?.frequency.setTargetAtTime(140, now, 0.05);
        bb?.gain.setTargetAtTime(1.0, now, 0.05);
        if (ws) ws.curve = this.makeDistortionCurve(8);
        lfoG?.gain.setTargetAtTime(0, now, 0.05);
        echoG?.gain.setTargetAtTime(0.05, now, 0.05);
        vG?.gain.setTargetAtTime(0, now, 0.05);
        break;

      case 'vinyl':
        // Old 1950s Gramophone / Vinyl
        this.isBitcrusherActive = false;
        lp?.frequency.setTargetAtTime(4200, now, 0.08);
        hp?.frequency.setTargetAtTime(380, now, 0.08);
        bb?.gain.setTargetAtTime(-2, now, 0.08);
        if (ws) ws.curve = this.makeDistortionCurve(16);
        lfoG?.gain.setTargetAtTime(0.0025, now, 0.08); // old turntable speed fluctuation
        echoG?.gain.setTargetAtTime(0.08, now, 0.08);
        vG?.gain.setTargetAtTime(0.45, now, 0.08); // prominent crackle
        break;

      case 'underwater':
        // Deep submerged muffled tone from another room
        this.isBitcrusherActive = false;
        lp?.frequency.setTargetAtTime(480, now, 0.1);
        hp?.frequency.setTargetAtTime(30, now, 0.1);
        bb?.frequency.setValueAtTime(80, now);
        bb?.gain.setTargetAtTime(7.0, now, 0.1); // deep heavy sub-bass
        if (ws) ws.curve = this.makeDistortionCurve(2);
        lfoG?.gain.setTargetAtTime(0.0008, now, 0.1);
        echoG?.gain.setTargetAtTime(0.38, now, 0.1); // long smooth underwater decay
        vG?.gain.setTargetAtTime(0, now, 0.1);
        break;

      case 'telephone':
        // Narrow band vintage telephone / walkie-talkie
        this.isBitcrusherActive = false;
        lp?.frequency.setTargetAtTime(3000, now, 0.05);
        hp?.frequency.setTargetAtTime(550, now, 0.05);
        bb?.gain.setTargetAtTime(-6, now, 0.05);
        if (ws) ws.curve = this.makeDistortionCurve(35); // gritty speaker overdrive
        lfoG?.gain.setTargetAtTime(0, now, 0.05);
        echoG?.gain.setTargetAtTime(0, now, 0.05);
        vG?.gain.setTargetAtTime(0.1, now, 0.05);
        break;

      case 'dreamy':
        // Ethereal reverb space
        this.isBitcrusherActive = false;
        lp?.frequency.setTargetAtTime(9000, now, 0.1);
        hp?.frequency.setTargetAtTime(100, now, 0.1);
        bb?.gain.setTargetAtTime(2.0, now, 0.1);
        if (ws) ws.curve = this.makeDistortionCurve(4);
        lfoG?.gain.setTargetAtTime(0.0012, now, 0.1);
        echoG?.gain.setTargetAtTime(0.48, now, 0.1); // ethereal floating echoes
        vG?.gain.setTargetAtTime(0, now, 0.1);
        break;
    }

    this.notify();
  }

  // --- Procedural Train Click-Clack Rhythm ---
  private startTrainSynthesis() {
    if (!this.ctx || !this.trainGain) return;

    const playClickClack = () => {
      if (!this.ctx || !this.trainGain || this.trainGain.gain.value === 0) return;
      const now = this.ctx.currentTime;
      this.playRailClick(now, 0.4);
      this.playRailClick(now + 0.12, 0.25);
      this.playRailClick(now + 0.35, 0.3);
      this.playRailClick(now + 0.47, 0.2);
    };

    this.trainIntervalId = window.setInterval(playClickClack, 850);
  }

  private playRailClick(time: number, intensity: number) {
    if (!this.ctx || !this.trainGain) return;
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, time);
    bandpass.Q.setValueAtTime(3.0, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(intensity * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.trainGain);
    noise.start(time);
    noise.stop(time + 0.08);
  }

  // --- Procedural Rain Noise ---
  private startRainSynthesis() {
    if (!this.ctx || !this.rainGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(300, this.ctx.currentTime);
    whiteNoise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(this.rainGain);
    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  // --- Procedural Wind Gusts ---
  private startWindSynthesis() {
    if (!this.ctx || !this.windGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = buffer;
    windSource.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    windSource.connect(filter);
    filter.connect(this.windGain);
    windSource.start();
    this.windNode = windSource;
  }

  // --- Procedural Nature (Birds / Crickets) ---
  private startNatureSynthesis() {
    if (!this.ctx || !this.natureGain) return;
    const chirpBird = () => {
      if (!this.ctx || !this.natureGain || this.natureGain.gain.value === 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const baseFreq = 2600 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.natureGain);
      osc.start(now);
      osc.stop(now + 0.2);
    };
    const scheduleNextChirp = () => {
      const delay = 3000 + Math.random() * 4000;
      this.natureIntervalId = window.setTimeout(() => {
        chirpBird();
        scheduleNextChirp();
      }, delay);
    };
    scheduleNextChirp();
  }

  // --- Procedural Lo-Fi Chords (Fallback when not using MP3) ---
  private startMusicSynthesis() {
    if (!this.ctx || !this.musicGain) return;
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [293.66, 349.23, 440.0, 523.25], // Dm7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.musicGain || !this.settings.isPlayingMusic) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      currentChord.forEach((freq, i) => {
        if (!this.ctx || !this.bitcrusherNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

        osc.connect(gain);
        // Feed into DSP Chain!
        gain.connect(this.bitcrusherNode);

        osc.start(now);
        osc.stop(now + 3.4);
      });
    };

    playChord();
    this.musicChordIntervalId = window.setInterval(playChord, 3600);
  }

  private stopMusicSynthesis() {
    if (this.musicChordIntervalId !== null) {
      clearInterval(this.musicChordIntervalId);
      this.musicChordIntervalId = null;
    }
  }

  // --- Public Controls ---
  public toggleMusic(): boolean {
    this.init();
    const nextState = !this.settings.isPlayingMusic;
    this.settings.isPlayingMusic = nextState;

    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(
        nextState ? this.settings.musicVolume : 0,
        this.ctx.currentTime
      );
    }

    const currentTrack = this.tracks[this.settings.currentTrackIndex];

    if (nextState) {
      if (currentTrack && currentTrack.url !== 'procedural' && this.audioElement) {
        this.audioElement.play().catch(() => {});
      } else {
        this.startMusicSynthesis();
      }
    } else {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      this.stopMusicSynthesis();
    }

    this.notify();
    return nextState;
  }

  public setTrack(index: number) {
    this.init();
    this.settings.currentTrackIndex = Math.max(0, Math.min(this.tracks.length - 1, index));
    const track = this.tracks[this.settings.currentTrackIndex];

    this.stopMusicSynthesis();
    if (this.audioElement) {
      this.audioElement.pause();
      if (track.url !== 'procedural') {
        this.audioElement.src = track.url;
        if (this.settings.isPlayingMusic) {
          this.audioElement.play().catch(() => {});
        }
      } else {
        if (this.settings.isPlayingMusic) {
          this.startMusicSynthesis();
        }
      }
    }

    this.notify();
  }

  public nextTrack() {
    this.setTrack((this.settings.currentTrackIndex + 1) % this.tracks.length);
  }

  public prevTrack() {
    this.setTrack((this.settings.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length);
  }

  public loadCustomTrack(file: File) {
    this.init();
    const url = URL.createObjectURL(file);
    const newTrack: AudioTrack = {
      id: `custom_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Tệp Từ Thiết Bị Của Bạn',
      url,
      isCustom: true,
    };
    this.tracks.unshift(newTrack); // Put at top
    this.setTrack(0);
    if (!this.settings.isPlayingMusic) {
      this.toggleMusic();
    }
  }

  public setChannelVolume(channel: keyof AudioSettings, value: number) {
    this.init();
    const clamped = Math.max(0, Math.min(1, value));
    if (typeof this.settings[channel] === 'number') {
      (this.settings[channel] as number) = clamped;
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (channel) {
      case 'masterVolume':
        this.masterGain?.gain.setValueAtTime(clamped, now);
        break;
      case 'musicVolume':
        if (this.settings.isPlayingMusic) {
          this.musicGain?.gain.setValueAtTime(clamped, now);
        }
        break;
      case 'trainVolume':
        this.trainGain?.gain.setValueAtTime(clamped, now);
        break;
      case 'rainVolume':
        this.rainGain?.gain.setValueAtTime(clamped, now);
        break;
      case 'windVolume':
        this.windGain?.gain.setValueAtTime(clamped, now);
        break;
      case 'natureVolume':
        this.natureGain?.gain.setValueAtTime(clamped, now);
        break;
    }

    this.notify();
  }

  public dispose() {
    if (this.trainIntervalId !== null) clearInterval(this.trainIntervalId);
    if (this.natureIntervalId !== null) clearTimeout(this.natureIntervalId);
    if (this.musicChordIntervalId !== null) clearInterval(this.musicChordIntervalId);
    if (this.rainNode) {
      try {
        (this.rainNode as AudioScheduledSourceNode).stop();
      } catch {}
    }
    if (this.windNode) {
      try {
        (this.windNode as AudioScheduledSourceNode).stop();
      } catch {}
    }
    if (this.vinylNoiseNode) {
      try {
        (this.vinylNoiseNode as AudioScheduledSourceNode).stop();
      } catch {}
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }
  }
}

export const audioManager = new AudioManager();
