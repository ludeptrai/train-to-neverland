/**
 * Slow Rail - Main Application Controller
 * Handles Canvas pixel art rendering, procedural audio, state management,
 * UI event bindings, and multilingual synchronizations.
 */
'use strict';

// Shorthand DOM query helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Check user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Application State Store (Audio default ON as requested)
const state = {
  city: 0,
  time: 'sunset',
  weather: 'clear',
  moving: !prefersReducedMotion,
  playing: false,
  instrument: 'piano',
  volume: 0.45,
  rainVolume: 0.6,
  auto: true,
  autoMusic: true, // Default ON: auto-change music after 4-6 locations
  duration: 60,
  lang: I18N.currentLang
};

// Canvas & Audio Initializations
const canvas = $('#scene');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const audio = new RailAudio();

// Asset caching & loop state
const imageCache = new Map();
let animTime = 0;
let lastFrameMs = 0;
let elapsedCityTime = 0;
let transitionState = null;
let currentCityRequestId = 0;

// Automatic music progression state: changes music after 4-6 locations randomly
let locationsPassedSinceMusicChange = 0;
let nextMusicChangeThreshold = Math.floor(Math.random() * (6 - 4 + 1)) + 4; // 4, 5, or 6 locations


/**
 * Loads an image asset with Promise caching
 */
function loadCityAsset(cityIndex) {
  const asset = cityAsset(cityIndex);
  if (imageCache.has(asset.file)) {
    return imageCache.get(asset.file).promise;
  }

  const img = new Image();
  const entry = { img, promise: null };

  entry.promise = new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => {
      imageCache.delete(asset.file);
      reject(new Error(I18N.currentLang === 'vi' 
        ? 'Không tải được phong cảnh. Hãy thử lại.' 
        : 'Failed to load landscape. Please try again.'));
    };
  });

  imageCache.set(asset.file, entry);
  img.src = asset.file;
  return entry.promise;
}

/**
 * Populate destination select options in the current language
 */
function renderCityOptions() {
  const select = $('#city-select');
  const selectedVal = state.city;
  select.innerHTML = '';

  for (let i = 0; i < CITY_DATA.length; i++) {
    const info = getCityInfo(i, state.lang);
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${String(i + 1).padStart(2, '0')} · ${info.name} — ${info.country}`;
    select.appendChild(option);
  }

  select.value = selectedVal;
}

/**
 * Renders all 35 generative ambient tracks in the track select dropdown
 */
function renderTrackOptions() {
  const select = $('#track-select');
  if (!select) return;
  const selectedVal = audio.currentTrackIndex;
  select.innerHTML = '';

  const isEn = state.lang === 'en';
  audio.tracks.forEach((track, i) => {
    const option = document.createElement('option');
    option.value = i;
    const title = isEn ? track.titleEn : track.titleVi;
    option.textContent = `${String(i + 1).padStart(2, '0')} · ${title}`;
    select.appendChild(option);
  });

  select.value = selectedVal;
}

/**
 * Canvas Drawing Helper: draws an integer-aligned rectangle
 */
function drawBox(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

/**
 * Dynamic Sky Objects Manager:
 * Controls randomly appearing animated atmospheric elements during the rail journey:
 * - Clouds (procedural pixel puffs drifting with parallax)
 * - Stars (subtle twinkling night stars for cozy luminous night skies)
 * - Flying Birds (formations/solo with flapping wing cycles)
 * - Taking Off Plane ("a little fast", steep climb with strobe beacons & engine contrails)
 * - Balloons (majestic hot air balloons with burner flicker & colorful party balloon clusters)
 */
class SkyObjectsManager {
  constructor() {
    this.clouds = [];
    this.birds = [];
    this.planes = [];
    this.balloons = [];
    this.stars = [];

    // Calibrated timers (in seconds): early initial spawns so user sees them right away
    this.nextBirdSpawn = 3.5;
    this.nextPlaneSpawn = 8.0;
    this.nextBalloonSpawn = 14.0;
    this.nextCloudSpawn = 7.0;

    this.initDefaultClouds();
    this.initStars();
  }

  initStars() {
    this.stars = [];
    // 50 subtle twinkling pixel stars across the night sky
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: 12 + Math.random() * 936,
        y: 6 + Math.random() * 135,
        size: Math.random() < 0.2 ? 2 : 1,
        period: 1.6 + Math.random() * 2.6,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.25 ? '#fff3d1' : '#ffffff'
      });
    }
  }

  initDefaultClouds() {
    const initial = [
      { x: 50, y: 18, type: 2, scale: 1.1, speed: 11 },
      { x: 310, y: 52, type: 0, scale: 0.95, speed: 14 },
      { x: 590, y: 22, type: 1, scale: 1.05, speed: 12 },
      { x: 820, y: 64, type: 3, scale: 1.15, speed: 9 }
    ];
    for (const p of initial) {
      this.clouds.push({
        x: p.x,
        y: p.y,
        type: p.type,
        scale: p.scale,
        speed: p.speed,
        opacity: 0.82 + Math.random() * 0.14
      });
    }
  }

  spawnCloud() {
    const types = [0, 1, 2, 3];
    this.clouds.push({
      x: 980 + Math.random() * 80,
      y: 12 + Math.random() * 95,
      type: types[Math.floor(Math.random() * types.length)],
      scale: 0.85 + Math.random() * 0.35,
      speed: 10 + Math.random() * 6,
      opacity: 0.78 + Math.random() * 0.18
    });
  }

  spawnBirds() {
    const isFlock = Math.random() < 0.65;
    const count = isFlock ? 3 + Math.floor(Math.random() * 3) : (Math.random() < 0.5 ? 1 : 2);
    const startX = 990;
    const startY = 22 + Math.random() * 80;
    const speed = 72 + Math.random() * 26;
    const flockSeed = Math.random() * 10;

    for (let i = 0; i < count; i++) {
      const offsetX = i === 0 ? 0 : (i % 2 === 1 ? i * 16 : (i - 1) * 16 + 8);
      const offsetY = i === 0 ? 0 : (i % 2 === 1 ? -i * 8 : (i - 1) * 8 + 4);
      this.birds.push({
        x: startX + offsetX,
        y: startY + offsetY,
        baseY: startY + offsetY,
        speed: speed + (Math.random() * 4 - 2),
        wingTimer: Math.random() * Math.PI,
        seed: flockSeed + i * 0.3
      });
    }
  }

  spawnPlane() {
    this.planes.push({
      x: -50,
      y: 130 + Math.random() * 25,
      vx: 185 + Math.random() * 35, // "a little fast" takeoff speed
      vy: -28 - Math.random() * 8,  // Climbing angle
      contrail: [],
      contrailTimer: 0,
      beaconTimer: 0
    });
  }

  spawnBalloon() {
    const isHotAir = Math.random() < 0.65;
    if (isHotAir) {
      const palettes = [
        { outer: '#e76f51', mid: '#f4a261', inner: '#2a9d8f' },
        { outer: '#e63946', mid: '#ffd166', inner: '#118ab2' },
        { outer: '#9c89b8', mid: '#f0a6ca', inner: '#b8c0ff' }
      ];
      this.balloons.push({
        kind: 'hotair',
        x: 990,
        y: 55 + Math.random() * 65,
        baseY: 55 + Math.random() * 65,
        vx: 13 + Math.random() * 6,
        vy: -2 - Math.random() * 3,
        palette: palettes[Math.floor(Math.random() * palettes.length)],
        timer: Math.random() * 10
      });
    } else {
      this.balloons.push({
        kind: 'cluster',
        x: 120 + Math.random() * 680,
        y: 200,
        vx: 24 + Math.random() * 10,
        vy: -22 - Math.random() * 8,
        timer: Math.random() * 10
      });
    }
  }

  update(dt) {
    const effectiveDt = (state.moving || prefersReducedMotion) ? dt : dt * 0.7;

    // Spawning timers
    this.nextBirdSpawn -= effectiveDt;
    if (this.nextBirdSpawn <= 0) {
      this.spawnBirds();
      this.nextBirdSpawn = 20 + Math.random() * 26;
    }

    this.nextPlaneSpawn -= effectiveDt;
    if (this.nextPlaneSpawn <= 0) {
      this.spawnPlane();
      this.nextPlaneSpawn = 36 + Math.random() * 30;
    }

    this.nextBalloonSpawn -= effectiveDt;
    if (this.nextBalloonSpawn <= 0) {
      this.spawnBalloon();
      this.nextBalloonSpawn = 28 + Math.random() * 30;
    }

    this.nextCloudSpawn -= effectiveDt;
    if (this.nextCloudSpawn <= 0) {
      this.spawnCloud();
      this.nextCloudSpawn = 16 + Math.random() * 18;
    }

    const cloudSpeedBonus = state.moving ? 5 : 0;

    // Update Clouds
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const c = this.clouds[i];
      c.x -= (c.speed + cloudSpeedBonus) * effectiveDt;
      if (c.x < -180) {
        this.clouds.splice(i, 1);
        if (this.clouds.length < 3) this.spawnCloud();
      }
    }

    // Update Birds
    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.x -= b.speed * effectiveDt;
      b.wingTimer += effectiveDt * 14;
      b.y = b.baseY + Math.sin(b.wingTimer * 0.4 + b.seed) * 3;
      if (b.x < -50) {
        this.birds.splice(i, 1);
      }
    }

    // Update Planes
    for (let i = this.planes.length - 1; i >= 0; i--) {
      const p = this.planes[i];
      p.x += p.vx * effectiveDt;
      p.y += p.vy * effectiveDt;
      p.beaconTimer += effectiveDt;
      p.contrailTimer += effectiveDt;

      // Add contrail puffs
      if (p.contrailTimer > 0.038) {
        p.contrailTimer = 0;
        p.contrail.unshift({ x: p.x - 5, y: p.y + 4, age: 0 });
      }

      // Update contrail puffs age
      for (let k = p.contrail.length - 1; k >= 0; k--) {
        p.contrail[k].age += effectiveDt * 0.75;
        if (p.contrail[k].age >= 1) {
          p.contrail.splice(k, 1);
        }
      }

      if (p.x > 1030 || p.y < -35) {
        this.planes.splice(i, 1);
      }
    }

    // Update Balloons
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const bl = this.balloons[i];
      bl.timer += effectiveDt;
      bl.x -= bl.vx * effectiveDt;
      bl.y += bl.vy * effectiveDt;
      if (bl.kind === 'hotair') {
        bl.y = bl.baseY + Math.sin(bl.timer * 1.3) * 3.5;
      }
      if (bl.x < -70 || bl.y < -70) {
        this.balloons.splice(i, 1);
      }
    }
  }

  draw() {
    // 0. Twinkling Stars (Night only)
    if (state.time === 'night') {
      this.drawStars();
    }

    // 1. Draw Clouds
    for (const c of this.clouds) {
      this.drawCloud(c);
    }

    // 2. Draw Balloons
    for (const bl of this.balloons) {
      this.drawBalloon(bl);
    }

    // 3. Draw Planes
    for (const p of this.planes) {
      this.drawPlane(p);
    }

    // 4. Draw Birds
    for (const b of this.birds) {
      this.drawBird(b);
    }
  }

  drawStars() {
    ctx.save();
    for (const s of this.stars) {
      const alpha = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(animTime * s.period + s.phase));
      ctx.globalAlpha = alpha;
      drawBox(Math.round(s.x), Math.round(s.y), s.size, s.size, s.color);
    }
    ctx.restore();
  }

  drawCloud(c) {
    ctx.save();
    ctx.globalAlpha = c.opacity;

    let bodyCol = '#f4f8fb';
    let shadeCol = '#c2d2e2';
    if (state.time === 'sunset') {
      bodyCol = '#fce2d0';
      shadeCol = '#d99786';
    } else if (state.time === 'night') {
      bodyCol = '#5d6d98';
      shadeCol = '#3a466b';
    }

    const ox = Math.round(c.x);
    const oy = Math.round(c.y);
    const s = c.scale;

    if (c.type === 0) {
      drawBox(ox + 4 * s, oy + 8 * s, 30 * s, 6 * s, shadeCol);
      drawBox(ox + 8 * s, oy + 4 * s, 22 * s, 7 * s, bodyCol);
      drawBox(ox + 13 * s, oy, 12 * s, 5 * s, bodyCol);
      drawBox(ox + 2 * s, oy + 6 * s, 8 * s, 5 * s, bodyCol);
      drawBox(ox + 28 * s, oy + 6 * s, 8 * s, 5 * s, bodyCol);
    } else if (c.type === 1) {
      drawBox(ox + 6 * s, oy + 12 * s, 48 * s, 6 * s, shadeCol);
      drawBox(ox + 4 * s, oy + 6 * s, 50 * s, 8 * s, bodyCol);
      drawBox(ox + 11 * s, oy + 1 * s, 17 * s, 7 * s, bodyCol);
      drawBox(ox + 30 * s, oy + 3 * s, 18 * s, 6 * s, bodyCol);
      drawBox(ox, oy + 9 * s, 8 * s, 5 * s, bodyCol);
      drawBox(ox + 50 * s, oy + 8 * s, 8 * s, 5 * s, bodyCol);
    } else if (c.type === 2) {
      drawBox(ox + 8 * s, oy + 15 * s, 68 * s, 7 * s, shadeCol);
      drawBox(ox + 6 * s, oy + 7 * s, 70 * s, 10 * s, bodyCol);
      drawBox(ox + 14 * s, oy + 2 * s, 20 * s, 8 * s, bodyCol);
      drawBox(ox + 36 * s, oy, 26 * s, 9 * s, bodyCol);
      drawBox(ox + 60 * s, oy + 4 * s, 16 * s, 7 * s, bodyCol);
      drawBox(ox + 2 * s, oy + 10 * s, 8 * s, 6 * s, bodyCol);
      drawBox(ox + 74 * s, oy + 10 * s, 8 * s, 6 * s, bodyCol);
    } else {
      drawBox(ox + 10 * s, oy + 6 * s, 56 * s, 4 * s, shadeCol);
      drawBox(ox + 4 * s, oy + 3 * s, 64 * s, 4 * s, bodyCol);
      drawBox(ox + 18 * s, oy, 32 * s, 4 * s, bodyCol);
      drawBox(ox, oy + 5 * s, 12 * s, 2 * s, bodyCol);
      drawBox(ox + 62 * s, oy + 4 * s, 10 * s, 2 * s, bodyCol);
    }

    ctx.restore();
  }

  drawBird(b) {
    const bx = Math.round(b.x);
    const by = Math.round(b.y);

    const birdCol = state.time === 'night' 
      ? '#181b2c' 
      : state.time === 'sunset' 
        ? '#3a2432' 
        : '#2e3347';

    const frame = Math.floor(b.wingTimer) % 4;

    if (frame === 0) {
      drawBox(bx, by, 1, 1, birdCol);
      drawBox(bx + 1, by + 1, 1, 1, birdCol);
      drawBox(bx + 2, by + 2, 2, 1, birdCol);
      drawBox(bx + 4, by + 1, 1, 1, birdCol);
      drawBox(bx + 5, by, 1, 1, birdCol);
    } else if (frame === 1 || frame === 3) {
      drawBox(bx, by + 1, 6, 1, birdCol);
      drawBox(bx + 2, by + 2, 2, 1, birdCol);
    } else {
      drawBox(bx + 2, by, 2, 1, birdCol);
      drawBox(bx + 1, by + 1, 1, 1, birdCol);
      drawBox(bx + 4, by + 1, 1, 1, birdCol);
      drawBox(bx, by + 2, 1, 1, birdCol);
      drawBox(bx + 5, by + 2, 1, 1, birdCol);
    }
  }

  drawPlane(p) {
    const px = Math.round(p.x);
    const py = Math.round(p.y);

    // Contrail vapor trail
    for (let k = 0; k < p.contrail.length; k++) {
      const puff = p.contrail[k];
      const alpha = (1 - puff.age) * 0.42;
      const size = Math.round(2 + puff.age * 3.5);
      drawBox(puff.x, puff.y, size, size, `rgba(235, 240, 255, ${alpha})`);
    }

    const bodyColor = '#e2e8f0';
    const topHighlight = '#ffffff';
    const bellyShadow = '#64748b';
    const cockpitColor = '#0f172a';

    // Tail fin (vertical stabilizer)
    drawBox(px - 6, py - 5, 3, 3, bodyColor);
    drawBox(px - 4, py - 3, 3, 2, bodyColor);
    drawBox(px - 8, py - 2, 4, 1, bellyShadow);

    // Main fuselage
    drawBox(px - 5, py + 1, 26, 3, bodyColor);
    drawBox(px - 3, py, 22, 1, topHighlight);
    drawBox(px - 4, py + 4, 22, 1, bellyShadow);

    // Aerodynamic nose cone
    drawBox(px + 21, py + 1, 3, 2, bodyColor);
    drawBox(px + 24, py + 2, 2, 1, bodyColor);

    // Cockpit windshield
    drawBox(px + 18, py, 2, 1, cockpitColor);

    // Wing
    drawBox(px + 6, py + 3, 7, 2, bodyColor);
    drawBox(px + 3, py + 5, 6, 2, bellyShadow);
    drawBox(px + 1, py + 7, 4, 1, bellyShadow);

    // Blinking Anti-Collision Strobe Light
    const isStrobe = Math.floor(p.beaconTimer * 4.5) % 2 === 0;
    if (isStrobe) {
      drawBox(px + 7, py - 1, 2, 2, '#ff2222');
      drawBox(px, py + 7, 2, 1, '#ffffff');
      if (state.time === 'night') {
        drawBox(px + 6, py - 2, 4, 4, 'rgba(255, 50, 50, 0.4)');
      }
    } else {
      drawBox(px + 7, py - 1, 1, 1, '#661111');
    }
  }

  drawBalloon(b) {
    const bx = Math.round(b.x);
    const by = Math.round(b.y);

    if (b.kind === 'hotair') {
      const pal = b.palette;

      // Top cap & dome
      drawBox(bx + 4, by, 12, 2, pal.mid);
      drawBox(bx + 2, by + 2, 16, 3, pal.mid);
      drawBox(bx + 1, by + 5, 18, 5, pal.mid);
      drawBox(bx, by + 10, 20, 6, pal.mid);

      // Left stripe
      drawBox(bx + 2, by + 2, 4, 3, pal.outer);
      drawBox(bx + 1, by + 5, 5, 5, pal.outer);
      drawBox(bx, by + 10, 5, 6, pal.outer);
      drawBox(bx + 1, by + 16, 4, 3, pal.outer);
      drawBox(bx + 3, by + 19, 3, 2, pal.outer);

      // Right stripe
      drawBox(bx + 14, by + 2, 4, 3, pal.inner);
      drawBox(bx + 14, by + 5, 5, 5, pal.inner);
      drawBox(bx + 15, by + 10, 5, 6, pal.inner);
      drawBox(bx + 15, by + 16, 4, 3, pal.inner);
      drawBox(bx + 14, by + 19, 3, 2, pal.inner);

      // Tapering lower envelope
      drawBox(bx + 1, by + 16, 18, 3, pal.mid);
      drawBox(bx + 3, by + 19, 14, 2, pal.mid);
      drawBox(bx + 5, by + 21, 10, 2, '#483c32');

      // Burner flame flare
      const flare = Math.sin(b.timer * 4) > 0.3;
      if (flare) {
        drawBox(bx + 9, by + 23, 2, 2, '#ffaa00');
        if (state.time === 'night') {
          drawBox(bx + 8, by + 22, 4, 4, 'rgba(255, 170, 0, 0.45)');
        }
      }

      // Rigging ropes
      drawBox(bx + 7, by + 23, 1, 3, '#3a3028');
      drawBox(bx + 12, by + 23, 1, 3, '#3a3028');

      // Wicker passenger basket
      drawBox(bx + 6, by + 26, 8, 5, '#855132');
      drawBox(bx + 5, by + 26, 10, 1, '#5c3620');
      drawBox(bx + 7, by + 28, 6, 2, '#9c6644');
    } else {
      const colors = ['#e63946', '#ffb703', '#00b4d8', '#9d4edd'];
      const offsets = [
        { dx: 0, dy: 0 },
        { dx: 6, dy: -4 },
        { dx: -5, dy: -3 },
        { dx: 2, dy: -8 }
      ];

      for (let k = 0; k < 4; k++) {
        const ox = bx + offsets[k].dx;
        const oy = by + offsets[k].dy;
        const col = colors[k];

        drawBox(ox + 1, oy, 4, 1, col);
        drawBox(ox, oy + 1, 6, 4, col);
        drawBox(ox + 1, oy + 5, 4, 1, col);
        drawBox(ox + 2, oy + 6, 2, 1, col);
        drawBox(ox + 1, oy + 1, 1, 1, '#ffffff');

        const sway = Math.sin(b.timer * 3 + k) * 2;
        drawBox(ox + 2 + Math.round(sway * 0.5), oy + 7, 1, 3, '#4a4a58');
        drawBox(ox + 2 + Math.round(sway), oy + 10, 1, 4, '#4a4a58');
      }
    }
  }
}

const skyObjects = new SkyObjectsManager();

/**
 * Renders the detailed pixel train (locomotive, cars, bogies, windows, couplers, headlight)
 */
function drawTrain() {
  const y = 322 + Math.round(Math.sin(animTime * 6) * 0.6);
  const startX = 206;

  // Passenger Cars (3 cars)
  for (let n = 0; n < 3; n++) {
    const carX = startX + n * 159;

    // Undercarriage & Wheels
    drawBox(carX, y + 51, 156, 8, '#171d2d');
    for (let k = 0; k < 2; k++) {
      const wheelX = carX + 27 + k * 98;
      drawBox(wheelX - 10, y + 54, 22, 12, '#111522');
      drawBox(wheelX - 6, y + 56, 14, 9, '#465166');
      drawBox(wheelX - 2 + Math.sin(animTime * 12) * 3, y + 58, 3, 4, '#9497a2');
    }

    // Car Body & Stripes
    drawBox(carX, y, 153, 5, '#bfc7cb');
    drawBox(carX - 3, y + 5, 159, 9, '#687b8d');
    drawBox(carX - 3, y + 14, 159, 37, '#e3d6c2');
    drawBox(carX - 3, y + 37, 159, 8, '#ca7c67');
    drawBox(carX - 3, y + 45, 159, 6, '#897d7c');

    // Windows: daylight reflection, sunset amber, or cozy nighttime golden glow
    const windowColor = state.time === 'day' 
      ? '#acced0' 
      : state.time === 'night' 
        ? '#ffe29e' 
        : '#eec58c';

    for (let k = 0; k < 5; k++) {
      const winX = carX + 9 + k * 29;
      drawBox(winX, y + 17, 22, 17, '#353f56');
      drawBox(winX + 2, y + 19, 18, 12, windowColor);
      drawBox(winX + 10, y + 19, 2, 12, '#697183');
      drawBox(winX + 3, y + 27, 5, 4, '#69717f');
    }

    // Outer borders & couplings
    drawBox(carX + 2, y + 14, 2, 35, '#9b9598');
    drawBox(carX + 149, y + 14, 2, 35, '#9b9598');
    if (n < 2) {
      drawBox(carX + 156, y + 31, 3, 16, '#28283b');
    }
  }

  // Front Locomotive Nose
  const locoX = startX + 477;
  drawBox(locoX - 4, y + 5, 18, 8, '#687b8d');
  drawBox(locoX - 4, y + 13, 25, 37, '#d9cfbd');
  drawBox(locoX + 5, y + 16, 16, 17, '#374257');
  drawBox(locoX + 7, y + 18, 11, 13, state.time === 'night' ? '#ffe099' : '#dfc5a0');
  drawBox(locoX - 4, y + 37, 25, 8, '#ca7c67');
  drawBox(locoX + 17, y + 40, 7, 5, '#fff4b8'); // Headlight
  drawBox(startX - 5, y + 40, 3, 5, '#f28c7b'); // Rear marker light

  // Warm headlight projection on the rails at night
  if (state.time === 'night') {
    drawBox(locoX + 24, y + 39, 45, 8, 'rgba(255, 244, 184, 0.22)');
    drawBox(locoX + 69, y + 38, 55, 12, 'rgba(255, 244, 184, 0.12)');
    drawBox(locoX + 124, y + 37, 65, 16, 'rgba(255, 244, 184, 0.05)');
  }
}

/**
 * Renders the parallax panoramic background with horizontal mirroring loop
 */
function drawBackground() {
  const asset = cityAsset(state.city);
  const imgEntry = imageCache.get(asset.file);
  const img = imgEntry?.img;

  if (!img || !img.naturalWidth) return;

  const sliceHeight = asset.bottom - asset.top;
  const offset = animTime * 8;
  const firstTile = Math.floor(offset / 960);

  for (let k = firstTile; k <= firstTile + 1; k++) {
    const drawX = Math.round(k * 960 - offset);
    ctx.save();
    ctx.translate(drawX, 0);

    // Mirror alternate tiles horizontally for seamless loop continuity
    if (k % 2) {
      ctx.translate(960, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(img, 0, asset.top, img.naturalWidth, sliceHeight, 0, 0, 960, 378);
    ctx.restore();
  }
}

/**
 * Initiates transition to another city with smooth tunnel fade
 */
async function changeCity(index) {
  if (!Number.isInteger(index) || index < 0 || index >= CITY_DATA.length) {
    throw new Error('Thành phố không hợp lệ');
  }

  const requestId = ++currentCityRequestId;

  if (index === state.city && !transitionState) {
    elapsedCityTime = 0;
    return;
  }

  const targetInfo = getCityInfo(index, state.lang);
  $('#tour-status').textContent = I18N.t('tour_status_loading', { city: targetInfo.name });

  try {
    await loadCityAsset(index);
    if (requestId !== currentCityRequestId) return;

    transitionState = {
      target: index,
      age: 0,
      switched: false,
      duration: prefersReducedMotion ? 0.7 : 2.6
    };

    const titleEl = $('#transition-title');
    titleEl.replaceChildren();

    const small = document.createElement('small');
    small.textContent = I18N.t('next_stop');

    const name = document.createElement('span');
    name.textContent = targetInfo.name;

    titleEl.append(small, name);
  } catch (err) {
    if (requestId === currentCityRequestId) {
      $('#tour-status').textContent = err.message;
      state.auto = false;
      $('#auto-tour').checked = false;
      $('#city-select').value = state.city;
    }
  }
}

/**
 * Handles tunnel transition visual effects
 */
function updateTransition(dt) {
  if (!transitionState) return;

  transitionState.age += dt;
  const progress = transitionState.age / transitionState.duration;

  let opacity = progress < 0.35 
    ? progress / 0.35 
    : progress < 0.65 
      ? 1 
      : (1 - progress) / 0.35;
  opacity = Math.max(0, Math.min(1, opacity));

  if (progress >= 0.4 && !transitionState.switched) {
    state.city = transitionState.target;
    animTime = 0;
    elapsedCityTime = 0;
    transitionState.switched = true;
    onLocationAdvanced();
    syncUI();
    try {
      window.dispatchEvent(new CustomEvent('stationchange', { detail: { cityIndex: state.city } }));
    } catch (e) {}
  }

  // Draw dark tunnel interior
  ctx.globalAlpha = opacity;
  drawBox(0, 0, 960, 440, '#12131e');

  // Passing tunnel lights
  if (!prefersReducedMotion) {
    for (let i = 0; i < 7; i++) {
      drawBox((i * 180 - transitionState.age * 260) % 1260, 18, 46, 3, '#483645');
    }
  }
  ctx.globalAlpha = 1;

  $('#transition-title').style.opacity = Math.max(0, (opacity - 0.65) / 0.35);

  if (progress >= 1) {
    transitionState = null;
    $('#transition-title').style.opacity = 0;
    // Prefetch next city
    loadCityAsset((state.city + 1) % CITY_DATA.length).catch(() => {});
  }
}

/**
 * Main Canvas Animation Loop
 */
function renderFrame(ms) {
  const dt = Math.min((ms - lastFrameMs) / 1000, 0.06);
  lastFrameMs = ms;

  if (state.moving) {
    animTime += dt;
    if (state.auto && !transitionState) {
      elapsedCityTime += dt;
      if (elapsedCityTime >= state.duration) {
        elapsedCityTime = 0;
        changeCity((state.city + 1) % CITY_DATA.length);
      }
    }
  }

  // Clear & Sky Base
  ctx.clearRect(0, 0, 960, 440);
  drawBox(0, 0, 960, 440, '#a890b1');

  // Background Scenery
  drawBackground();

  // Animated Sky Objects (Clouds, Flying Birds, Taking Off Plane, Balloons)
  skyObjects.update(dt);
  skyObjects.draw();

  // Atmosphere Lighting & Sky Shaders
  if (state.time === 'day') {
    ctx.globalCompositeOperation = 'screen';
    drawBox(0, 0, 960, 378, '#608ea34f');
    ctx.globalCompositeOperation = 'source-over';
  } else if (state.time === 'night') {
    // Atmospheric Luminous Midnight Tint (rich indigo tone with clear scenery contrast)
    ctx.globalCompositeOperation = 'multiply';
    drawBox(0, 0, 960, 378, '#6d80ab');
    ctx.globalCompositeOperation = 'source-over';
    drawBox(0, 0, 960, 378, 'rgba(18, 25, 58, 0.15)');
  }

  // Weather atmosphere overlay
  if (state.weather !== 'clear') {
    drawBox(0, 0, 960, 378, state.weather === 'rain' ? '#242c514c' : '#c3d9e12b');
  }

  // Rail Bed & Ties
  drawBox(0, 378, 960, 62, '#282c40');
  drawBox(0, 384, 960, 3, '#667285');
  for (let i = -1; i < 49; i++) {
    drawBox(i * 24 - (animTime * 100) % 24, 393, 10, 24, '#4b4251');
  }
  drawBox(0, 391, 960, 4, '#ac9ca2');
  drawBox(0, 414, 960, 5, '#818695');
  drawBox(0, 419, 960, 3, '#161e2e');

  // Train
  drawTrain();

  // Foreground Utility Poles & Overhead Catenary Wire
  for (let i = 0; i < 3; i++) {
    const poleX = i * 520 - (animTime * 64) % 520;
    drawBox(poleX, 155, 5, 229, '#303147');
    drawBox(poleX - 31, 165, 71, 4, '#303147');
    drawBox(poleX - 23, 160, 4, 13, '#303147');
  }
  drawBox(0, 166, 960, 1, '#3c3546');

  // Weather Particles
  if (state.weather === 'rain') {
    ctx.globalAlpha = 0.48;
    for (let i = 0; i < 150; i++) {
      let rx = (i * 89 - animTime * 110) % 980;
      if (rx < 0) rx += 980;
      drawBox(rx, (i * 43 + animTime * 260) % 440, 1, 13, '#bfd4ed');
    }
    ctx.globalAlpha = 1;
  } else if (state.weather === 'snow') {
    for (let i = 0; i < 100; i++) {
      let sx = (i * 113 + Math.sin(animTime + i) * 8 - animTime * 14) % 980;
      if (sx < 0) sx += 980;
      ctx.globalAlpha = 0.45 + (i % 5) / 10;
      drawBox(sx, (i * 67 + animTime * (14 + (i % 15))) % 440, 2 + (i % 2), 2 + (i % 2), '#f4f1eb');
    }
    ctx.globalAlpha = 1;
    drawBox(0, 387, 960, 3, '#cedce4'); // Snow layer on rail
  }

  // Tunnel Transition Overlay
  updateTransition(dt);

  // Auto-tour Progress Bar
  const progressPercent = state.auto ? Math.min(100, (elapsedCityTime / state.duration) * 100) : 0;
  $('#tour-bar').style.width = `${progressPercent}%`;

  requestAnimationFrame(renderFrame);
}

/**
 * Synchronizes UI elements with the current state and language
 */
/**
 * Checks location change count and automatically switches music after 4-6 locations
 */
function onLocationAdvanced() {
  if (!state.autoMusic) return; // Only auto-change if toggle is enabled!

  locationsPassedSinceMusicChange++;
  if (locationsPassedSinceMusicChange >= nextMusicChangeThreshold) {
    locationsPassedSinceMusicChange = 0;
    nextMusicChangeThreshold = Math.floor(Math.random() * (6 - 4 + 1)) + 4;

    // Switch to a new random track (different from current)
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * audio.tracks.length);
    } while (nextIdx === audio.currentTrackIndex && audio.tracks.length > 1);

    audio.setTrack(nextIdx);

    // Subtle track title & select glow effect
    const trackEl = $('#track-name');
    if (trackEl) {
      trackEl.classList.add('track-switched');
      setTimeout(() => trackEl.classList.remove('track-switched'), 1800);
    }
    const trackSelectEl = $('#track-select');
    if (trackSelectEl) {
      trackSelectEl.classList.add('track-switched');
      setTimeout(() => trackSelectEl.classList.remove('track-switched'), 1800);
    }
  }
}

function syncUI() {
  const isEn = state.lang === 'en';
  const info = getCityInfo(state.city, state.lang);

  // Time & Weather Segmented Buttons
  ['time', 'weather'].forEach((key) => {
    $$(`[data-${key}]`).forEach((b) => {
      const isActive = state[key] === b.dataset[key];
      b.classList.toggle('selected', isActive);
      b.setAttribute('aria-pressed', isActive);
    });
  });

  // City Selector
  $('#city-select').value = state.city;

  // Header Scene Place & Clock
  $('#place').textContent = `${info.name.toUpperCase()}, ${info.country.toUpperCase()}`;
  $('#clock').textContent = { day: '09:24', sunset: '17:42', night: '23:08' }[state.time];

  // Canvas Corner Badges
  const timeLabels = isEn
    ? { day: 'DAYLIGHT', sunset: 'SUNSET', night: 'NIGHT' }
    : { day: 'BAN NGÀY', sunset: 'HOÀNG HÔN', night: 'BAN ĐÊM' };
  const weatherLabels = isEn
    ? { clear: 'CLEAR SKY', rain: 'GENTLE RAIN', snow: 'FALLING SNOW' }
    : { clear: 'TRỜI QUANG', rain: 'MƯA NHẸ', snow: 'TUYẾT RƠI' };

  $('#scene-time').textContent = timeLabels[state.time];
  $('#scene-weather').textContent = weatherLabels[state.weather];

  // Track Name and Track Selector Dropdown (from 35 tracks catalog)
  const curTrack = audio.getCurrentTrack();
  const trackTitle = (state.lang === 'vi') ? curTrack.titleVi : curTrack.titleEn;
  const trackIdxStr = `${String(audio.currentTrackIndex + 1).padStart(2, '0')}/${audio.tracks.length}`;
  const trackNameEl = $('#track-name');
  if (trackNameEl) {
    trackNameEl.textContent = `${trackTitle} · [${trackIdxStr}]`;
    trackNameEl.setAttribute('title', isEn
      ? `${trackTitle} · Auto-changes track after 4-6 destinations`
      : `${trackTitle} · Tự động đổi bài sau 4-6 điểm đến`);
  }
  const trackSelectEl = $('#track-select');
  if (trackSelectEl && trackSelectEl.value !== String(audio.currentTrackIndex)) {
    trackSelectEl.value = String(audio.currentTrackIndex);
  }

  // Motion Button
  $('#motion').textContent = state.moving ? 'Ⅱ' : '▶';
  const motionAria = state.moving
    ? (isEn ? 'Pause motion (M)' : 'Tạm dừng chuyển động (M)')
    : (isEn ? 'Resume motion (M)' : 'Tiếp tục chuyển động (M)');
  $('#motion').setAttribute('aria-label', motionAria);
  $('#motion').setAttribute('title', motionAria);

  // Auto change music toggle checkbox sync
  const autoMusicEl = $('#auto-music');
  if (autoMusicEl) {
    autoMusicEl.checked = state.autoMusic;
  }

  // Tour status
  const nextCityInfo = getCityInfo((state.city + 1) % CITY_DATA.length, state.lang);
  $('#tour-status').textContent = `${String(state.city + 1).padStart(2, '0')} / ${CITY_DATA.length} · ` +
    (state.auto ? I18N.t('tour_status_next', { city: nextCityInfo.name }) : I18N.t('tour_status_stopping', { city: info.name }));

  // Rain Volume Control Sync
  const rainVolumeEl = $('#rain-volume');
  if (rainVolumeEl && document.activeElement !== rainVolumeEl) {
    rainVolumeEl.value = Math.round(state.rainVolume * 100);
  }
  const rainWrap = $('#rain-volume-wrap');
  if (rainWrap) {
    rainWrap.classList.toggle('active-weather', state.weather === 'rain');
  }

  // Audio settings update
  audio.update(state);
}

/**
 * Displays playing state across UI
 */
function updatePlayingState(isPlaying) {
  state.playing = isPlaying;
  document.body.classList.toggle('playing', isPlaying);

  if (isPlaying) {
    $('#play').classList.remove('pulse-prompt');
  }

  $('#play').textContent = isPlaying ? 'Ⅱ' : '▶';
  const playLabel = isPlaying 
    ? (I18N.currentLang === 'vi' ? 'Tạm dừng nhạc (Space)' : 'Pause audio (Space)') 
    : (I18N.currentLang === 'vi' ? 'Bật nhạc (Space)' : 'Play audio (Space)');
  $('#play').setAttribute('aria-label', playLabel);
  $('#play').setAttribute('title', playLabel);
  $('#audio-hint').textContent = isPlaying 
    ? I18N.t('audio_hint_playing') 
    : I18N.t('audio_hint_idle');
}

/**
 * Updates Focus / Immersive button text and accessibility labels
 */
function updateFocusButton() {
  const isFocus = document.body.classList.contains('focus');
  const labelEl = $('#focus-label');
  const focusBtn = $('#focus');
  const text = isFocus ? I18N.t('btn_focus_off') : I18N.t('btn_focus_on');
  const aria = isFocus ? I18N.t('btn_focus_off_aria') : I18N.t('btn_focus_on_aria');
  if (labelEl) labelEl.textContent = text;
  if (focusBtn) {
    focusBtn.setAttribute('aria-label', aria);
    focusBtn.setAttribute('title', `${text} (F)`);
  }
}

/**
 * Applies translations to all UI elements marked with data-i18n
 */
function applyLanguage(lang) {
  state.lang = lang;
  I18N.setLanguage(lang);

  // Update dynamic texts
  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const translated = I18N.t(key);
    if (translated && (translated !== key || !el.textContent.trim())) {
      el.textContent = translated;
    }
  });

  // Update attributes
  $$('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria;
    el.setAttribute('aria-label', I18N.t(key));
  });

  // Update placeholders
  $$('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = I18N.t(key);
  });

  // Update language switcher active buttons
  $$('.lang-btn').forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle('selected', active);
    b.setAttribute('aria-pressed', active);
  });

  // Synchronize Focus button text & accessibility
  updateFocusButton();

  // Re-render city and track dropdowns
  renderCityOptions();
  renderTrackOptions();

  // Synchronize dynamic labels
  syncUI();
}

// Start Journey Modal Overlay Controller
const startOverlay = $('#start-overlay');
const startJourneyBtn = $('#start-journey-btn');

async function enterJourney() {
  if (!startOverlay || startOverlay.classList.contains('hidden')) return;

  startOverlay.classList.add('hidden');
  try {
    await audio.play();
    updatePlayingState(true);
  } catch (err) {
    console.warn('Audio activation error:', err);
    updatePlayingState(false);
  }
}

if (startJourneyBtn) {
  startJourneyBtn.onclick = enterJourney;
}

if (startOverlay) {
  startOverlay.addEventListener('click', (e) => {
    if (e.target === startOverlay) {
      enterJourney();
    }
  });
}

// Feedback Modal Controller
const feedbackOverlay = $('#feedback-overlay');
const feedbackBtn = $('#feedback-btn');
const footerFeedbackBtn = $('#footer-feedback-btn');
const feedbackCloseBtn = $('#feedback-close-btn');
const feedbackForm = $('#feedback-form');
const feedbackStatus = $('#feedback-status');
const feedbackSubmitBtn = $('#feedback-submit-btn');
const feedbackSubmitText = $('#feedback-submit-text');
const feedbackSpinner = feedbackSubmitBtn?.querySelector('.btn-spinner');

let selectedMood = '☕ Yên bình';
let selectedTopic = 'Gợi ý điểm đến';

function openFeedbackModal() {
  if (!feedbackOverlay) return;
  feedbackOverlay.classList.remove('hidden');
  feedbackOverlay.setAttribute('aria-hidden', 'false');
  if (feedbackStatus) {
    feedbackStatus.className = 'feedback-status';
    feedbackStatus.style.display = 'none';
    feedbackStatus.textContent = '';
  }
  const msgEl = $('#feedback-msg');
  if (msgEl) {
    setTimeout(() => msgEl.focus(), 60);
  }
}

function closeFeedbackModal() {
  if (!feedbackOverlay) return;
  feedbackOverlay.classList.add('hidden');
  feedbackOverlay.setAttribute('aria-hidden', 'true');
}

if (feedbackBtn) feedbackBtn.onclick = openFeedbackModal;
if (footerFeedbackBtn) footerFeedbackBtn.onclick = openFeedbackModal;
if (feedbackCloseBtn) feedbackCloseBtn.onclick = closeFeedbackModal;

if (feedbackOverlay) {
  feedbackOverlay.addEventListener('click', (e) => {
    if (e.target === feedbackOverlay) {
      closeFeedbackModal();
    }
  });
}

// Mood pill selection
$$('.mood-pill').forEach((pill) => {
  pill.onclick = () => {
    $$('.mood-pill').forEach((p) => {
      p.classList.remove('selected');
      p.setAttribute('aria-pressed', 'false');
    });
    pill.classList.add('selected');
    pill.setAttribute('aria-pressed', 'true');
    selectedMood = pill.dataset.mood;
  };
});

// Topic chip selection
$$('.topic-chip').forEach((chip) => {
  chip.onclick = () => {
    $$('.topic-chip').forEach((c) => {
      c.classList.remove('selected');
      c.setAttribute('aria-pressed', 'false');
    });
    chip.classList.add('selected');
    chip.setAttribute('aria-pressed', 'true');
    selectedTopic = chip.dataset.type;
  };
});

// Submit Feedback via /api/feedback (Resend)
if (feedbackForm) {
  feedbackForm.onsubmit = async (e) => {
    e.preventDefault();
    const msgInput = $('#feedback-msg');
    const emailInput = $('#feedback-email');
    const message = msgInput ? msgInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';

    if (!message) return;

    // Get current passenger train context for richer report
    const currentCityInfo = getCityInfo(state.city, state.lang);
    const contextStr = `Stop #${state.city + 1}: ${currentCityInfo.name} (${currentCityInfo.country}) | Time: ${state.time} | Weather: ${state.weather} | Sound: ${state.playing ? 'Playing' : 'Muted'} (${state.instrument})`;

    // UI loading state
    feedbackSubmitBtn.disabled = true;
    if (feedbackSpinner) feedbackSpinner.classList.remove('hidden');
    if (feedbackSubmitText) feedbackSubmitText.textContent = I18N.t('feedback_btn_sending');
    if (feedbackStatus) {
      feedbackStatus.className = 'feedback-status';
      feedbackStatus.style.display = 'none';
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          email,
          mood: selectedMood,
          type: selectedTopic,
          context: contextStr
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (feedbackStatus) {
          feedbackStatus.className = 'feedback-status success';
          feedbackStatus.style.display = 'block';
          feedbackStatus.textContent = I18N.t('feedback_success_msg');
        }
        feedbackForm.reset();
        if (feedbackSubmitText) feedbackSubmitText.textContent = I18N.t('feedback_btn_sent');

        setTimeout(() => {
          closeFeedbackModal();
          if (feedbackSubmitText) feedbackSubmitText.textContent = I18N.t('feedback_btn_send');
        }, 2200);
      } else {
        throw new Error(result.error || 'Server error');
      }
    } catch (err) {
      console.warn('Feedback send notice:', err);
      if (feedbackStatus) {
        feedbackStatus.className = 'feedback-status error';
        feedbackStatus.style.display = 'block';
        feedbackStatus.textContent = I18N.t('feedback_error_msg', { email: 'andy@thinkprompt.com' });
      }
      if (feedbackSubmitText) feedbackSubmitText.textContent = I18N.t('feedback_btn_send');
    } finally {
      feedbackSubmitBtn.disabled = false;
      if (feedbackSpinner) feedbackSpinner.classList.add('hidden');
    }
  };
}

/**
 * Audio Autoplay Activation:
 * Tries immediate start (if permitted by browser MEI score or previous visits).
 * If permitted, automatically hides overlay and plays music.
 * If blocked by browser autoplay policy, keeps overlay ready for seamless 1-click start.
 */
function startAudioDefaultOn() {
  audio.play()
    .then(() => {
      if (audio.ctx && audio.ctx.state === 'running') {
        if (startOverlay) startOverlay.classList.add('hidden');
        updatePlayingState(true);
      } else {
        updatePlayingState(false);
      }
    })
    .catch(() => {
      updatePlayingState(false);
    });
}

// -------------------------------------------------------------
// EVENT BINDINGS
// -------------------------------------------------------------

// Play/Pause Master Button
$('#play').onclick = async () => {
  $('#play').disabled = true;
  $('#play').classList.remove('pulse-prompt');
  try {
    if (state.playing) {
      await audio.pause();
      updatePlayingState(false);
    } else {
      await audio.play();
      updatePlayingState(true);
    }
  } catch (err) {
    console.error('Audio playback toggle error:', err);
    $('#audio-hint').textContent = I18N.currentLang === 'vi' 
      ? 'Không bật được âm thanh. Hãy thử lại.' 
      : 'Could not enable audio. Please try again.';
  } finally {
    $('#play').disabled = false;
  }
};

// Master Volume Slider
$('#volume').oninput = (e) => {
  state.volume = Number(e.target.value) / 100;
  audio.update(state);
};

// Rain Sound Volume Slider
const rainVolumeSlider = $('#rain-volume');
if (rainVolumeSlider) {
  rainVolumeSlider.oninput = (e) => {
    state.rainVolume = Number(e.target.value) / 100;
    // If user adjusts rain volume when it's not raining and volume > 0, seamlessly switch to rain weather
    if (state.weather !== 'rain' && state.rainVolume > 0) {
      state.weather = 'rain';
    }
    syncUI();
    audio.update(state);
  };
}

// Instrument Select
$('#instrument').onchange = (e) => {
  state.instrument = e.target.value;
  audio.update(state);
};

// Track Navigation Controls
const prevTrackBtn = $('#prev-track');
const nextTrackBtn = $('#next-track');

if (prevTrackBtn) {
  prevTrackBtn.onclick = () => {
    audio.prevTrack();
    syncUI();
  };
}

if (nextTrackBtn) {
  nextTrackBtn.onclick = () => {
    audio.nextTrack();
    syncUI();
  };
}

// Track Selector Dropdown
const trackSelectDropdown = $('#track-select');
if (trackSelectDropdown) {
  trackSelectDropdown.onchange = (e) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx) && idx >= 0 && idx < audio.tracks.length) {
      audio.setTrack(idx);
      syncUI();
    }
  };
}

// Auto Change Music Toggle
const autoMusicCheckbox = $('#auto-music');
if (autoMusicCheckbox) {
  autoMusicCheckbox.checked = state.autoMusic;
  autoMusicCheckbox.onchange = (e) => {
    state.autoMusic = e.target.checked;
    locationsPassedSinceMusicChange = 0;
  };
}

// Time & Weather Selection Buttons
['time', 'weather'].forEach((key) => {
  $$(`[data-${key}]`).forEach((b) => {
    b.onclick = () => {
      state[key] = b.dataset[key];
      syncUI();
    };
  });
});

// Destination Controls
$('#city-select').onchange = (e) => changeCity(Number(e.target.value));
$('#next-city').onclick = () => changeCity(((transitionState?.target ?? state.city) + 1) % CITY_DATA.length);
$('#previous-city').onclick = () => changeCity(((transitionState?.target ?? state.city) + CITY_DATA.length - 1) % CITY_DATA.length);

// Tour Automation Controls
$('#auto-tour').onchange = (e) => {
  state.auto = e.target.checked;
  elapsedCityTime = 0;
  syncUI();
};
$('#tour-duration').onchange = (e) => {
  state.duration = Number(e.target.value);
  elapsedCityTime = 0;
};

// Motion Toggle
$('#motion').onclick = () => {
  state.moving = !state.moving;
  syncUI();
};

// Focus / Immersive Mode Toggle
$('#focus').onclick = () => {
  document.body.classList.toggle('focus');
  updateFocusButton();
};

// Language Switcher Buttons
$$('.lang-btn').forEach((b) => {
  b.onclick = () => applyLanguage(b.dataset.lang);
});

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  // Always close feedback modal on Escape key
  if (e.key === 'Escape' && feedbackOverlay && !feedbackOverlay.classList.contains('hidden')) {
    e.preventDefault();
    closeFeedbackModal();
    return;
  }

  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    return;
  }

  if (startOverlay && !startOverlay.classList.contains('hidden')) {
    if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      enterJourney();
      return;
    }
  }

  if (e.code === 'Space') {
    e.preventDefault();
    $('#play').click();
  } else if (e.key === 'f' || e.key === 'F') {
    $('#focus').click();
  } else if (e.key === 'm' || e.key === 'M') {
    $('#motion').click();
  } else if (e.key === 'ArrowRight') {
    $('#next-city').click();
  } else if (e.key === 'ArrowLeft') {
    $('#previous-city').click();
  } else if (e.key === 'n' || e.key === 'N') {
    $('#next-track')?.click();
  } else if (e.key === 'p' || e.key === 'P') {
    $('#prev-track')?.click();
  }
});

// Initial boot
renderCityOptions();
renderTrackOptions();
applyLanguage(state.lang);
startAudioDefaultOn();

loadCityAsset(0)
  .then(() => {
    $('#art-status').style.display = 'none';
    loadCityAsset(1).catch(() => {});
  })
  .catch((err) => {
    $('#art-status').textContent = err.message;
  });

requestAnimationFrame(renderFrame);

// ModelContext tool registration for AI pair programming
if (document.modelContext?.registerTool) {
  try {
    document.modelContext.registerTool({
      name: 'configure_train_scene',
      description: 'Choose one of 50 train destinations, time of day and weather.',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'integer', minimum: 0, maximum: 49 },
          time: { type: 'string', enum: ['day', 'sunset', 'night'] },
          weather: { type: 'string', enum: ['clear', 'rain', 'snow'] },
          lang: { type: 'string', enum: ['vi', 'en'] }
        },
        additionalProperties: false
      },
      async execute(input) {
        if (!input || typeof input !== 'object') throw new Error('Invalid settings');
        if (input.city !== undefined) await changeCity(input.city);
        if (input.time !== undefined) state.time = input.time;
        if (input.weather !== undefined) state.weather = input.weather;
        if (input.lang !== undefined) applyLanguage(input.lang);
        syncUI();
        return {
          city: state.city,
          transitionTarget: transitionState?.target ?? null,
          time: state.time,
          weather: state.weather,
          lang: state.lang
        };
      },
      annotations: { readOnlyHint: false }
    });
  } catch (err) {
    console.warn('Scene tool unavailable:', err);
  }
}
