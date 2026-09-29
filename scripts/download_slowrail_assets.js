import https from 'https';
import fs from 'fs';
import path from 'path';

const targetDir = path.join(process.cwd(), 'public', 'assets', 'reference_slowrail');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const files = [
  'landscapes.png',
  'cities-1.png',
  'cities-2.png',
  'cities-3.png',
  'anh-1.png',
  'anh-2.png',
  'anh-3.png',
  'anh-4.png',
  'anh-5.png',
  'anh-6.png',
  'anh-7.png',
  'anh-8.png',
  'style.css',
  'core.js',
  'audio.js',
  'chat.js',
  'app.js',
  'i18n.js'
];

function downloadFile(filename) {
  return new Promise((resolve) => {
    const dest = path.join(targetDir, filename);
    const options = {
      hostname: 'lofitrain.vercel.app',
      path: '/' + filename,
      method: 'GET',
      rejectUnauthorized: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        console.log(`Failed ${filename}: HTTP ${res.statusCode}`);
        resolve(false);
        return;
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        const size = fs.statSync(dest).size;
        console.log(`✓ Saved ${filename} (${(size / 1024).toFixed(1)} KB)`);
        resolve(true);
      });
    });

    req.on('error', (err) => {
      console.error(`✗ Error ${filename}:`, err.message);
      resolve(false);
    });

    req.end();
  });
}

async function downloadAll() {
  console.log('Downloading all Slow Rail assets from lofitrain.vercel.app...');
  for (const f of files) {
    await downloadFile(f);
  }
  console.log('All downloads completed!');
}

downloadAll();
