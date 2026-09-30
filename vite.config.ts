import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateRegistryFiles } from './scripts/scan_assets.js';
import { processLandscapeFolder } from './scripts/process_landscape_theme.js';

function assetRegistryPlugin(): Plugin {
  return {
    name: 'vite-plugin-asset-registry',
    buildStart() {
      generateRegistryFiles();
    },
    configureServer(server) {
      // Đảm bảo mọi asset trong public/ luôn được đọc trực tiếp từ disk, không bị kẹt cache SPA fallback
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/')) {
          const cleanUrl = req.url.split('?')[0];
          const filePath = path.join(process.cwd(), 'public', cleanUrl);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.svg': 'image/svg+xml',
              '.webp': 'image/webp',
              '.json': 'application/json',
              '.mp3': 'audio/mpeg',
              '.wav': 'audio/wav',
              '.ogg': 'audio/ogg',
            };
            if (mimeMap[ext]) {
              res.setHeader('Content-Type', mimeMap[ext]);
            }
            res.setHeader('Cache-Control', 'no-cache');
            return fs.createReadStream(filePath).pipe(res);
          }
        }
        next();
      });

      // Quét và cập nhật danh sách ngay khi khởi động dev server
      generateRegistryFiles();

      // Tự động theo dõi các thư mục asset
      const watchPaths = ['public/assets/landscapes', 'public/assets/trains/templates'];
      server.watcher.add(watchPaths);

      // Khi người dùng thả thêm file .jpg/.jpeg mới vào bất kỳ thư mục ga nào -> Tự động xử lý tách nền sang PNG!
      server.watcher.on('add', async (filePath) => {
        const norm = filePath.replace(/\\/g, '/');
        if (/public\/assets\/landscapes\/([^/]+)\/.+\.(jpg|jpeg)$/i.test(norm)) {
          const match = norm.match(/public\/assets\/landscapes\/([^/]+)/i);
          if (match) {
            console.log(`\n📸 [Auto-Process] Phát hiện ảnh JPG mới: ${filePath}`);
            try {
              await processLandscapeFolder(match[0]);
            } catch (err) {
              console.error('❌ Lỗi tự động xử lý ảnh:', err);
            }
          }
        }
      });

      server.watcher.on('all', (event, filePath) => {
        const norm = filePath.replace(/\\/g, '/');
        if (norm.includes('public/assets/landscapes') || norm.includes('public/assets/trains/templates')) {
          generateRegistryFiles();
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), assetRegistryPlugin()],
});
