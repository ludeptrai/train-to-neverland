import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SKY_DIR = path.resolve('public/assets/sky');
if (!fs.existsSync(SKY_DIR)) {
  fs.mkdirSync(SKY_DIR, { recursive: true });
}

// =========================================================================
// 1. MẶT TRỜI PIXEL ART (Sun - Warm Golden Stepped Circle & Glow)
// =========================================================================
const sunSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <defs>
    <filter id="sunHalo" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Outer Corona Stepped Glow -->
  <g opacity="0.45">
    <rect x="24" y="8" width="16" height="48" fill="#ffb142" />
    <rect x="8" y="24" width="48" height="16" fill="#ffb142" />
    <rect x="16" y="16" width="32" height="32" fill="#ffb142" />
    <rect x="20" y="12" width="24" height="40" fill="#ffb142" />
    <rect x="12" y="20" width="40" height="24" fill="#ffb142" />
  </g>
  <!-- Mid Corona Rim -->
  <rect x="24" y="12" width="16" height="40" fill="#ff9f1a" />
  <rect x="12" y="24" width="40" height="16" fill="#ff9f1a" />
  <rect x="18" y="16" width="28" height="32" fill="#ff9f1a" />
  <rect x="16" y="18" width="32" height="28" fill="#ff9f1a" />
  <!-- Core Sun Body -->
  <rect x="24" y="16" width="16" height="32" fill="#ffd32a" />
  <rect x="16" y="24" width="32" height="16" fill="#ffd32a" />
  <rect x="20" y="20" width="24" height="24" fill="#ffd32a" />
  <!-- Inner Highlight -->
  <rect x="26" y="20" width="12" height="24" fill="#fff275" />
  <rect x="20" y="26" width="24" height="12" fill="#fff275" />
  <rect x="22" y="22" width="16" height="16" fill="#ffffff" opacity="0.9" />
</svg>
`.trim();

// =========================================================================
// 2. MẶT TRĂNG PIXEL ART (Crescent Moon for Night)
// =========================================================================
const moonSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">
  <!-- Moon Outer Glow -->
  <g opacity="0.35">
    <rect x="26" y="10" width="16" height="44" fill="#d1d8e0" />
    <rect x="20" y="16" width="24" height="32" fill="#d1d8e0" />
  </g>
  <!-- Crescent Body Outer Rim -->
  <rect x="28" y="12" width="12" height="40" fill="#a5b1c2" />
  <rect x="36" y="16" width="8" height="32" fill="#a5b1c2" />
  <rect x="24" y="18" width="12" height="28" fill="#a5b1c2" />
  <!-- Main Crescent Body -->
  <rect x="28" y="14" width="8" height="36" fill="#f1f2f6" />
  <rect x="34" y="18" width="8" height="28" fill="#f1f2f6" />
  <rect x="38" y="24" width="4" height="16" fill="#f1f2f6" />
  <!-- Crescent Cutout (Inner Shadow creating crescent shape) -->
  <rect x="24" y="20" width="6" height="24" fill="#f1f2f6" opacity="0.1" />
  <!-- Highlight -->
  <rect x="36" y="20" width="4" height="20" fill="#ffffff" />
  <rect x="32" y="16" width="4" height="4" fill="#ffffff" />
  <rect x="32" y="44" width="4" height="4" fill="#ffffff" />
</svg>
`.trim();

// =========================================================================
// 3. MÂY PIXEL ART 1 (Small Fluffy Cumulus Cloud)
// =========================================================================
const cloud1Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" width="120" height="48" shape-rendering="crispEdges">
  <!-- Bottom Shadow -->
  <rect x="12" y="32" width="96" height="10" fill="#9daab8" />
  <rect x="6" y="36" width="108" height="6" fill="#9daab8" />
  <rect x="24" y="26" width="76" height="12" fill="#b8c6d4" />
  <rect x="14" y="30" width="92" height="8" fill="#b8c6d4" />
  <!-- Cloud Mid Tone -->
  <rect x="18" y="20" width="84" height="16" fill="#e2eaf2" />
  <rect x="32" y="12" width="56" height="16" fill="#e2eaf2" />
  <rect x="46" y="8" width="32" height="12" fill="#e2eaf2" />
  <rect x="10" y="26" width="18" height="10" fill="#e2eaf2" />
  <rect x="94" y="26" width="18" height="8" fill="#e2eaf2" />
  <!-- Cloud Top Highlight (Pure White) -->
  <rect x="48" y="6" width="26" height="8" fill="#ffffff" />
  <rect x="34" y="10" width="52" height="10" fill="#ffffff" />
  <rect x="22" y="18" width="76" height="10" fill="#ffffff" />
  <rect x="12" y="24" width="18" height="6" fill="#ffffff" />
  <rect x="92" y="24" width="16" height="6" fill="#ffffff" />
</svg>
`.trim();

// =========================================================================
// 4. MÂY PIXEL ART 2 (Wide Drifting Stratus Cloud)
// =========================================================================
const cloud2Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 56" width="180" height="56" shape-rendering="crispEdges">
  <!-- Flat Base Shadow -->
  <rect x="16" y="42" width="148" height="8" fill="#9daab8" />
  <rect x="8" y="46" width="164" height="6" fill="#9daab8" />
  <rect x="28" y="34" width="130" height="12" fill="#b8c6d4" />
  <!-- Mid body -->
  <rect x="20" y="26" width="140" height="16" fill="#e2eaf2" />
  <rect x="40" y="16" width="60" height="18" fill="#e2eaf2" />
  <rect x="110" y="20" width="45" height="16" fill="#e2eaf2" />
  <rect x="55" y="10" width="35" height="12" fill="#e2eaf2" />
  <rect x="120" y="14" width="25" height="10" fill="#e2eaf2" />
  <!-- Top Highlights -->
  <rect x="58" y="8" width="28" height="8" fill="#ffffff" />
  <rect x="42" y="14" width="56" height="8" fill="#ffffff" />
  <rect x="122" y="12" width="20" height="6" fill="#ffffff" />
  <rect x="112" y="18" width="40" height="6" fill="#ffffff" />
  <rect x="24" y="24" width="132" height="8" fill="#ffffff" />
</svg>
`.trim();

// =========================================================================
// 5. MÂY PIXEL ART 3 (Puffy Majestic Cloud Formation)
// =========================================================================
const cloud3Svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72" width="240" height="72" shape-rendering="crispEdges">
  <!-- Base Shadow -->
  <rect x="20" y="56" width="200" height="10" fill="#9daab8" />
  <rect x="8" y="62" width="224" height="6" fill="#9daab8" />
  <rect x="30" y="46" width="180" height="14" fill="#b8c6d4" />
  <!-- Massive Cumulus Center -->
  <rect x="70" y="16" width="80" height="38" fill="#e2eaf2" />
  <rect x="85" y="8" width="50" height="24" fill="#e2eaf2" />
  <!-- Left puff -->
  <rect x="28" y="32" width="54" height="22" fill="#e2eaf2" />
  <rect x="38" y="24" width="36" height="16" fill="#e2eaf2" />
  <!-- Right puff -->
  <rect x="140" y="28" width="70" height="26" fill="#e2eaf2" />
  <rect x="155" y="20" width="45" height="16" fill="#e2eaf2" />
  <!-- Pure White Highlights -->
  <rect x="88" y="6" width="42" height="10" fill="#ffffff" />
  <rect x="74" y="14" width="72" height="12" fill="#ffffff" />
  <rect x="40" y="22" width="32" height="8" fill="#ffffff" />
  <rect x="158" y="18" width="38" height="8" fill="#ffffff" />
  <rect x="30" y="30" width="180" height="12" fill="#ffffff" />
</svg>
`.trim();

// =========================================================================
// 6. ĐÀN CHIM PIXEL ART (Flock of Migrating Birds in V-Formation)
// =========================================================================
const birdsFlockSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80" width="160" height="80" shape-rendering="crispEdges">
  <!-- Bird 1 (Leader - Center Front) -->
  <g transform="translate(130, 24)">
    <rect x="0" y="2" width="3" height="3" fill="#2d3436" />
    <rect x="3" y="1" width="3" height="3" fill="#2d3436" />
    <rect x="6" y="0" width="4" height="2" fill="#2d3436" />
    <rect x="3" y="3" width="5" height="2" fill="#2d3436" />
    <rect x="8" y="2" width="4" height="2" fill="#2d3436" />
    <rect x="12" y="1" width="3" height="2" fill="#2d3436" />
  </g>
  <!-- Bird 2 (Upper Flank 1) -->
  <g transform="translate(95, 12)">
    <rect x="0" y="2" width="3" height="2" fill="#3d4446" />
    <rect x="3" y="0" width="4" height="2" fill="#3d4446" />
    <rect x="7" y="2" width="3" height="2" fill="#3d4446" />
    <rect x="10" y="0" width="3" height="2" fill="#3d4446" />
  </g>
  <!-- Bird 3 (Lower Flank 1) -->
  <g transform="translate(100, 42)">
    <rect x="0" y="1" width="3" height="2" fill="#3d4446" />
    <rect x="3" y="2" width="4" height="2" fill="#3d4446" />
    <rect x="7" y="1" width="3" height="2" fill="#3d4446" />
    <rect x="10" y="0" width="3" height="2" fill="#3d4446" />
  </g>
  <!-- Bird 4 (Upper Flank 2) -->
  <g transform="translate(60, 4)">
    <rect x="0" y="2" width="2" height="2" fill="#4d5456" />
    <rect x="2" y="0" width="3" height="2" fill="#4d5456" />
    <rect x="5" y="2" width="3" height="2" fill="#4d5456" />
    <rect x="8" y="0" width="3" height="2" fill="#4d5456" />
  </g>
  <!-- Bird 5 (Lower Flank 2) -->
  <g transform="translate(68, 58)">
    <rect x="0" y="2" width="3" height="2" fill="#4d5456" />
    <rect x="3" y="1" width="4" height="2" fill="#4d5456" />
    <rect x="7" y="2" width="3" height="2" fill="#4d5456" />
  </g>
  <!-- Bird 6 (Rear Upper) -->
  <g transform="translate(25, 8)">
    <rect x="0" y="1" width="2" height="2" fill="#636e72" />
    <rect x="2" y="0" width="3" height="2" fill="#636e72" />
    <rect x="5" y="1" width="2" height="2" fill="#636e72" />
  </g>
  <!-- Bird 7 (Rear Lower) -->
  <g transform="translate(30, 68)">
    <rect x="0" y="1" width="2" height="2" fill="#636e72" />
    <rect x="2" y="0" width="3" height="2" fill="#636e72" />
    <rect x="5" y="1" width="2" height="2" fill="#636e72" />
  </g>
</svg>
`.trim();

// =========================================================================
// 7. KHINH KHÍ CẦU PIXEL ART (Vintage Striped Hot Air Balloon)
// =========================================================================
const hotAirBalloonSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 88" width="64" height="88" shape-rendering="crispEdges">
  <!-- Balloon Envelope Shape -->
  <!-- Top Crown -->
  <rect x="24" y="4" width="16" height="4" fill="#eb4d4b" />
  <rect x="18" y="8" width="28" height="6" fill="#eb4d4b" />
  <rect x="14" y="14" width="36" height="8" fill="#eb4d4b" />
  <!-- Main Sphere with Vertical Stripes (Red, Cream, Gold, Turquoise) -->
  <!-- Stripe 1 (Left Red) -->
  <rect x="10" y="22" width="8" height="18" fill="#c0392b" />
  <rect x="12" y="40" width="6" height="10" fill="#c0392b" />
  <rect x="16" y="50" width="4" height="8" fill="#c0392b" />
  <!-- Stripe 2 (Cream) -->
  <rect x="18" y="22" width="8" height="20" fill="#f5f6fa" />
  <rect x="18" y="42" width="6" height="10" fill="#f5f6fa" />
  <rect x="20" y="52" width="4" height="8" fill="#f5f6fa" />
  <!-- Stripe 3 (Center Gold/Orange) -->
  <rect x="26" y="22" width="12" height="24" fill="#f39c12" />
  <rect x="24" y="46" width="16" height="8" fill="#f39c12" />
  <rect x="24" y="54" width="16" height="6" fill="#f39c12" />
  <!-- Stripe 4 (Cream Right) -->
  <rect x="38" y="22" width="8" height="20" fill="#f5f6fa" />
  <rect x="40" y="42" width="6" height="10" fill="#f5f6fa" />
  <rect x="40" y="52" width="4" height="8" fill="#f5f6fa" />
  <!-- Stripe 5 (Turquoise Right) -->
  <rect x="46" y="22" width="8" height="18" fill="#00a8ff" />
  <rect x="46" y="40" width="6" height="10" fill="#00a8ff" />
  <rect x="44" y="50" width="4" height="8" fill="#00a8ff" />
  <!-- Balloon Neck Collar -->
  <rect x="26" y="60" width="12" height="3" fill="#2d3436" />
  <rect x="27" y="63" width="10" height="2" fill="#e17055" />
  <!-- Rigging Suspension Cables -->
  <line x1="28" y1="65" x2="29" y2="72" stroke="#2d3436" stroke-width="1.5" />
  <line x1="36" y1="65" x2="35" y2="72" stroke="#2d3436" stroke-width="1.5" />
  <!-- Passenger Wicker Basket -->
  <rect x="27" y="72" width="10" height="8" fill="#d35400" />
  <rect x="28" y="73" width="8" height="2" fill="#e67e22" />
  <rect x="28" y="76" width="8" height="3" fill="#ba4a00" />
</svg>
`.trim();

// =========================================================================
// 8. MÁY BAY PIXEL ART (Retro Twin-Engine Airliner with Contrail)
// =========================================================================
const airplaneSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40" shape-rendering="crispEdges">
  <!-- Contrail Smoke Trail (Jet engine exhaust) -->
  <g opacity="0.65">
    <rect x="0" y="21" width="18" height="2" fill="#ffffff" opacity="0.2" />
    <rect x="18" y="20" width="22" height="3" fill="#ffffff" opacity="0.4" />
    <rect x="40" y="19" width="20" height="4" fill="#ffffff" opacity="0.7" />
  </g>
  <!-- Tail Fin -->
  <rect x="58" y="6" width="6" height="4" fill="#e74c3c" />
  <rect x="60" y="10" width="8" height="6" fill="#e74c3c" />
  <rect x="64" y="16" width="8" height="4" fill="#c0392b" />
  <!-- Main Fuselage -->
  <rect x="62" y="18" width="46" height="7" fill="#f5f6fa" />
  <rect x="108" y="19" width="4" height="5" fill="#f5f6fa" />
  <rect x="112" y="20" width="3" height="3" fill="#dcdde1" />
  <!-- Cockpit Windshield (Cyan glass) -->
  <rect x="104" y="18" width="5" height="3" fill="#00d2d3" />
  <!-- Passenger Windows Line -->
  <rect x="74" y="20" width="2" height="2" fill="#2f3640" />
  <rect x="78" y="20" width="2" height="2" fill="#2f3640" />
  <rect x="82" y="20" width="2" height="2" fill="#2f3640" />
  <rect x="86" y="20" width="2" height="2" fill="#2f3640" />
  <rect x="90" y="20" width="2" height="2" fill="#2f3640" />
  <rect x="94" y="20" width="2" height="2" fill="#2f3640" />
  <rect x="98" y="20" width="2" height="2" fill="#2f3640" />
  <!-- Lower Wing with Jet Engine -->
  <polygon points="76,24 92,24 82,32 72,32" fill="#718093" />
  <!-- Engine Pod -->
  <rect x="78" y="27" width="8" height="4" fill="#2f3640" />
  <rect x="86" y="28" width="2" height="2" fill="#e1b12c" />
  <!-- Blinking Red Beacon on Tail -->
  <rect x="58" y="4" width="2" height="2" fill="#ff3838" />
  <!-- Wingtip Strobe Light -->
  <rect x="72" y="32" width="2" height="2" fill="#2ed573" />
</svg>
`.trim();

// Danh sách các asset bầu trời
const ASSETS = [
  { name: 'sun', svg: sunSvg, width: 64, height: 64 },
  { name: 'moon', svg: moonSvg, width: 64, height: 64 },
  { name: 'cloud_1', svg: cloud1Svg, width: 120, height: 48 },
  { name: 'cloud_2', svg: cloud2Svg, width: 180, height: 56 },
  { name: 'cloud_3', svg: cloud3Svg, width: 240, height: 72 },
  { name: 'birds_flock', svg: birdsFlockSvg, width: 160, height: 80 },
  { name: 'hot_air_balloon', svg: hotAirBalloonSvg, width: 64, height: 88 },
  { name: 'airplane', svg: airplaneSvg, width: 120, height: 40 },
];

async function generateAll() {
  console.log(`🌤️ Bắt đầu tạo các asset bầu trời tại: ${SKY_DIR}`);
  for (const asset of ASSETS) {
    const svgPath = path.join(SKY_DIR, `${asset.name}.svg`);
    const pngPath = path.join(SKY_DIR, `${asset.name}.png`);

    // Ghi file SVG
    fs.writeFileSync(svgPath, asset.svg, 'utf-8');

    // Render ra file PNG sắc nét pixel art (scale x2 hoặc x3 để hiển thị rõ ràng trên màn hình Retina)
    const renderScale = 2;
    await sharp(Buffer.from(asset.svg))
      .resize(asset.width * renderScale, asset.height * renderScale, { kernel: 'nearest' })
      .png({ compressionLevel: 9 })
      .toFile(pngPath);

    console.log(`  ✅ Đã tạo ${asset.name}.svg và ${asset.name}.png (${asset.width * renderScale}x${asset.height * renderScale}px)`);
  }
  console.log(`🎉 Hoàn tất toàn bộ asset bầu trời trong thư mục public/assets/sky/!\n`);
}

generateAll().catch(console.error);
