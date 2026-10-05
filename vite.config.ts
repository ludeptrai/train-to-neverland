import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateRegistryFiles } from './scripts/scan_assets.js';
import { generateSeoFiles } from './scripts/generate_seo_files.js';
import { processLandscapeFolder } from './scripts/process_landscape_theme.js';
import { processTrainFolder } from './scripts/process_train_theme.js';

function assetRegistryPlugin(): Plugin {
  return {
    name: 'vite-plugin-asset-registry',
    buildStart() {
      generateRegistryFiles();
      generateSeoFiles();
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
              '.m4a': 'audio/mp4',
              '.flac': 'audio/flac',
              '.aac': 'audio/aac',
            };
            if (mimeMap[ext]) {
              res.setHeader('Content-Type', mimeMap[ext]);
            }
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            return fs.createReadStream(filePath).pipe(res);
          }
        }
        next();
      });

      // Quét và cập nhật danh sách ngay khi khởi động dev server
      generateRegistryFiles();
      generateSeoFiles();

      // Tự động theo dõi các thư mục asset & file quản lý tên tập trung
      const watchPaths = [
        'public/assets/landscapes',
        'public/assets/trains',
        'public/assets/music',
        'src/config/names.json',
      ];
      server.watcher.add(watchPaths);

      // Bắt lỗi EBUSY / file lock trên Windows để không làm sập server
      server.watcher.on('error', (err) => {
        console.warn('⚠️ [Vite Watcher Ignored Error]:', err instanceof Error ? err.message : err);
      });

      // Khi người dùng thả thêm file ảnh mới vào bất kỳ thư mục ga hoặc tàu nào -> Tự động xử lý tách nền sang PNG!
      let processTimeout: NodeJS.Timeout | null = null;
      server.watcher.on('add', (filePath) => {
        const norm = filePath.replace(/\\/g, '/');

        // 1. Tự động xử lý khi thả ảnh phong cảnh mới
        if (/public\/assets\/landscapes\/([^/]+)\/.+\.(jpg|jpeg|webp)$/i.test(norm)) {
          const match = norm.match(/public\/assets\/landscapes\/([^/]+)/i);
          if (match) {
            console.log(`\n📸 [Auto-Process] Phát hiện ảnh phong cảnh mới: ${filePath}`);
            if (processTimeout) clearTimeout(processTimeout);
            processTimeout = setTimeout(async () => {
              try {
                await processLandscapeFolder(match[0]);
              } catch (err) {
                console.error('❌ Lỗi tự động xử lý ảnh phong cảnh:', err);
              }
            }, 600);
          }
        }

        // 2. Tự động xử lý khi thả ảnh đoàn tàu mới
        if (/public\/assets\/trains\/templates\/([^/]+)\/.+\.(jpg|jpeg|webp)$/i.test(norm)) {
          const match = norm.match(/public\/assets\/trains\/templates\/([^/]+)/i);
          if (match) {
            console.log(`\n🚄 [Auto-Process] Phát hiện ảnh đoàn tàu mới: ${filePath}`);
            if (processTimeout) clearTimeout(processTimeout);
            processTimeout = setTimeout(async () => {
              try {
                await processTrainFolder(match[0]);
              } catch (err) {
                console.error('❌ Lỗi tự động xử lý ảnh đoàn tàu:', err);
              }
            }, 600);
          }
        }
      });

      server.watcher.on('all', (event, filePath) => {
        const norm = filePath.replace(/\\/g, '/');
        if (
          norm.includes('public/assets/landscapes') ||
          norm.includes('public/assets/trains') ||
          norm.includes('public/assets/music') ||
          norm.includes('src/config/names.json')
        ) {
          generateRegistryFiles();
          generateSeoFiles();
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  server: {
    watch: {
      usePolling: true,
      interval: 800,
    },
  },
  plugins: [react(), assetRegistryPlugin()],
});
