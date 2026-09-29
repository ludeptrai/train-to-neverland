import fs from 'fs';
import path from 'path';

// Helper to ensure dir exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Generate Seamless Midground Track SVG
function generateMidgroundTrackSVG() {
  const width = 1200;
  const height = 240;
  // Rails are at y: 190 to 220
  let ties = '';
  for (let x = 0; x < width; x += 30) {
    ties += `<rect x="${x}" y="196" width="18" height="12" fill="#5c4033" stroke="#3d2817" stroke-width="2" />`;
  }

  // Sakura trees and fences in midground
  let scenery = '';
  // Houses & fences
  for (let x = 0; x < width; x += 150) {
    // Sakura tree
    scenery += `
      <!-- Sakura Tree at ${x + 60} -->
      <rect x="${x + 68}" y="110" width="12" height="86" fill="#4a2e18" />
      <circle cx="${x + 74}" cy="95" r="32" fill="#ffb7c5" opacity="0.95" />
      <circle cx="${x + 55}" cy="105" r="22" fill="#ff94aa" opacity="0.9" />
      <circle cx="${x + 90}" cy="100" r="24" fill="#ffaec0" opacity="0.9" />
      <circle cx="${x + 74}" cy="80" r="20" fill="#ffd1dc" opacity="0.95" />
    `;
    // Traditional fence
    for (let f = 0; f < 5; f++) {
      scenery += `<rect x="${x + 10 + f * 8}" y="174" width="4" height="22" fill="#8d6e63" />`;
    }
    scenery += `<rect x="${x + 8}" y="180" width="44" height="3" fill="#6d4c41" />`;
  }

  // Power poles (Cột điện Nhật Bản)
  let poles = '';
  for (let x = 0; x < width; x += 400) {
    poles += `
      <!-- Power Pole at ${x + 200} -->
      <rect x="${x + 196}" y="15" width="8" height="185" fill="#424242" />
      <rect x="${x + 175}" y="35" width="50" height="4" fill="#303030" />
      <rect x="${x + 180}" y="55" width="40" height="4" fill="#303030" />
      <!-- Insulators -->
      <rect x="${x + 178}" y="31" width="4" height="4" fill="#90a4ae" />
      <rect x="${x + 218}" y="31" width="4" height="4" fill="#90a4ae" />
      <!-- Transformer box -->
      <rect x="${x + 192}" y="65" width="16" height="22" fill="#37474f" />
    `;
  }

  // Overhead catenary wires
  const wires = `
    <line x1="0" y1="33" x2="${width}" y2="33" stroke="#263238" stroke-width="1.5" opacity="0.75" />
    <line x1="0" y1="53" x2="${width}" y2="53" stroke="#263238" stroke-width="1.5" opacity="0.65" />
  `;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges">
    <defs>
      <pattern id="ballast" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#546e7a" />
        <rect x="1" y="2" width="2" height="2" fill="#78909c" />
        <rect x="5" y="4" width="2" height="2" fill="#37474f" />
        <rect x="3" y="6" width="2" height="2" fill="#455a64" />
      </pattern>
    </defs>
    <!-- Scenery -->
    ${scenery}
    <!-- Gravel ballast embankment -->
    <rect x="0" y="192" width="${width}" height="48" fill="url(#ballast)" />
    <!-- Wooden ties -->
    ${ties}
    <!-- Continuous steel rails -->
    <rect x="0" y="200" width="${width}" height="4" fill="#cfd8dc" stroke="#90a4ae" stroke-width="1" />
    <rect x="0" y="206" width="${width}" height="3" fill="#b0bec5" />
    <!-- Poles and wires -->
    ${poles}
    ${wires}
  </svg>
  `.trim();

  return svg;
}

// 2. Generate Emissive Night Lights SVG
function generateLightsMaskSVG() {
  const width = 1200;
  const height = 240;
  let lights = '';
  // Glowing lanterns along the path
  for (let x = 0; x < width; x += 150) {
    lights += `
      <circle cx="${x + 30}" cy="170" r="7" fill="#ffeb3b" opacity="0.9" filter="drop-shadow(0 0 6px #ff9800)" />
      <rect x="${x + 28}" y="168" width="4" height="5" fill="#fff9c4" />
    `;
  }
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${lights}
  </svg>
  `.trim();
}

// 3. Generate Retro Steam Train Body SVG
function generateSteamTrainSVG() {
  const width = 800;
  const height = 160;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges">
    <!-- Steam Locomotive & Tender & Coach -->
    <!-- Coach 2 (Rear) -->
    <rect x="20" y="45" width="220" height="75" fill="#2c1d11" stroke="#4a3525" stroke-width="2" />
    <rect x="25" y="40" width="210" height="8" fill="#1b120b" rx="2" />
    <!-- Coach 2 Windows -->
    <rect x="40" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <rect x="85" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <rect x="130" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <rect x="175" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <!-- Connector -->
    <rect x="240" y="85" width="20" height="12" fill="#212121" />

    <!-- Coach 1 (Middle) -->
    <rect x="260" y="45" width="220" height="75" fill="#2c1d11" stroke="#4a3525" stroke-width="2" />
    <rect x="265" y="40" width="210" height="8" fill="#1b120b" rx="2" />
    <!-- Coach 1 Windows -->
    <rect x="280" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <rect x="325" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <rect x="370" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <rect x="415" y="60" width="30" height="25" fill="#ffe082" stroke="#ffb300" stroke-width="1.5" />
    <!-- Connector -->
    <rect x="480" y="85" width="20" height="12" fill="#212121" />

    <!-- Coal Tender -->
    <rect x="500" y="60" width="90" height="60" fill="#212121" />
    <!-- Coal lumps -->
    <ellipse cx="545" cy="58" rx="35" ry="12" fill="#111111" />
    <!-- Connector -->
    <rect x="590" y="90" width="10" height="10" fill="#111111" />

    <!-- Locomotive Engine -->
    <!-- Cabin -->
    <rect x="600" y="35" width="70" height="85" fill="#1a1a1a" stroke="#d32f2f" stroke-width="2" />
    <rect x="605" y="28" width="60" height="9" fill="#111111" rx="2" />
    <!-- Cabin Window -->
    <rect x="620" y="48" width="35" height="25" fill="#ffe082" />
    <!-- Boiler Barrel -->
    <rect x="670" y="55" width="100" height="65" fill="#263238" stroke="#37474f" stroke-width="2" />
    <!-- Chimney / Smokestack -->
    <rect x="740" y="25" width="16" height="32" fill="#1a1a1a" />
    <polygon points="735,25 761,25 756,35 740,35" fill="#ffb300" />
    <!-- Headlamp -->
    <rect x="770" y="75" width="14" height="16" fill="#ffb300" />
    <circle cx="778" cy="83" r="6" fill="#fff9c4" />
    <!-- Cowcatcher (V-plow at front) -->
    <polygon points="768,120 795,120 780,105" fill="#d32f2f" />

    <!-- Wheels under all cars -->
    <!-- Coach 2 Wheels -->
    <circle cx="50" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="85" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="175" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="210" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <!-- Coach 1 Wheels -->
    <circle cx="290" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="325" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="415" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="450" cy="128" r="12" fill="#37474f" stroke="#cfd8dc" stroke-width="3" />
    <!-- Tender Wheels -->
    <circle cx="525" cy="128" r="10" fill="#212121" stroke="#cfd8dc" stroke-width="2" />
    <circle cx="565" cy="128" r="10" fill="#212121" stroke="#cfd8dc" stroke-width="2" />
    <!-- Big Driving Locomotive Wheels -->
    <circle cx="630" cy="125" r="16" fill="#b71c1c" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="675" cy="125" r="16" fill="#b71c1c" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="720" cy="125" r="16" fill="#b71c1c" stroke="#cfd8dc" stroke-width="3" />
    <circle cx="760" cy="130" r="10" fill="#37474f" stroke="#cfd8dc" stroke-width="2" />
  </svg>
  `.trim();
}

// 4. Generate Cyberpunk Maglev Train Body SVG
function generateCyberpunkTrainSVG() {
  const width = 800;
  const height = 140;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges">
    <defs>
      <linearGradient id="cyberNeon" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f2fe" />
        <stop offset="50%" stop-color="#4facfe" />
        <stop offset="100%" stop-color="#f093fb" />
      </linearGradient>
    </defs>
    <!-- Rear Car -->
    <polygon points="30,45 220,45 220,105 50,105 30,85" fill="#121824" stroke="#00f2fe" stroke-width="2" />
    <rect x="60" y="58" width="140" height="22" fill="#050811" stroke="#00f2fe" stroke-width="1.5" rx="3" />
    <!-- Windows glow inside -->
    <rect x="65" y="62" width="25" height="14" fill="#00f2fe" opacity="0.9" />
    <rect x="100" y="62" width="25" height="14" fill="#00f2fe" opacity="0.9" />
    <rect x="135" y="62" width="25" height="14" fill="#00f2fe" opacity="0.9" />
    <rect x="170" y="62" width="25" height="14" fill="#00f2fe" opacity="0.9" />
    <!-- Maglev levitation pads -->
    <rect x="40" y="107" width="170" height="6" fill="#ff007f" filter="drop-shadow(0 0 6px #ff007f)" />

    <!-- Coupler -->
    <rect x="220" y="70" width="20" height="15" fill="#1f293d" />

    <!-- Center Car -->
    <rect x="240" y="45" width="220" height="60" fill="#121824" stroke="#00f2fe" stroke-width="2" />
    <rect x="260" y="58" width="180" height="22" fill="#050811" stroke="#00f2fe" stroke-width="1.5" rx="3" />
    <rect x="270" y="62" width="30" height="14" fill="#00f2fe" opacity="0.9" />
    <rect x="315" y="62" width="30" height="14" fill="#00f2fe" opacity="0.9" />
    <rect x="360" y="62" width="30" height="14" fill="#00f2fe" opacity="0.9" />
    <rect x="405" y="62" width="25" height="14" fill="#00f2fe" opacity="0.9" />
    <rect x="250" y="107" width="200" height="6" fill="#ff007f" filter="drop-shadow(0 0 6px #ff007f)" />

    <!-- Coupler -->
    <rect x="460" y="70" width="20" height="15" fill="#1f293d" />

    <!-- Aerodynamic Lead Engine Nose -->
    <polygon points="480,45 680,45 770,95 760,105 480,105" fill="#121824" stroke="#00f2fe" stroke-width="2" />
    <!-- Visor Cockpit -->
    <polygon points="630,55 710,55 745,85 640,85" fill="#ff007f" opacity="0.95" />
    <!-- Neon Stripe -->
    <line x1="480" y1="95" x2="740" y2="95" stroke="url(#cyberNeon)" stroke-width="4" />
    <!-- Maglev levitation pads -->
    <rect x="490" y="107" width="240" height="6" fill="#00f2fe" filter="drop-shadow(0 0 8px #00f2fe)" />
    <!-- Laser Headlight beam -->
    <polygon points="765,92 795,85 795,100" fill="#00f2fe" opacity="0.8" />
  </svg>
  `.trim();
}

// Write files
const landscapesDir = path.resolve('public/assets/landscapes/tokyo_fuji');
ensureDir(landscapesDir);
fs.writeFileSync(path.join(landscapesDir, 'midground_track.svg'), generateMidgroundTrackSVG());
fs.writeFileSync(path.join(landscapesDir, 'background_lights.svg'), generateLightsMaskSVG());

const steamDir = path.resolve('public/assets/trains/steam_retro');
ensureDir(steamDir);
fs.writeFileSync(path.join(steamDir, 'train_body.svg'), generateSteamTrainSVG());

const cyberDir = path.resolve('public/assets/trains/cyber_maglev');
ensureDir(cyberDir);
fs.writeFileSync(path.join(cyberDir, 'train_body.svg'), generateCyberpunkTrainSVG());

console.log('✅ Generated all modular SVG pixel art assets successfully!');
