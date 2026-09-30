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
      // Quét và cập nhật danh sách ngay khi khởi động dev server
      generateRegistryFiles();

      // Tự động theo dõi các thư mục asset
      const watchPaths = ['public/assets/landscapes', 'public/assets/trains/templates'];
      server.watcher.add(watchPaths);

      // Khi người dùng thả thêm file .jpg/.jpeg mới vào bất kỳ thư mục ga nào -> Tự động xử lý tách nền sang PNG!
      server.watcher.on('add', async (filePath) => {
        if (/public[/\\]assets[/\\]landscapes[/\\]([^/\\]+)[/\\].+\.(jpg|jpeg)$/i.test(filePath)) {
          const match = filePath.match(/public[/\\]assets[/\\]landscapes[/\\]([^/\\]+)/i);
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
        if (filePath.includes('public/assets/landscapes') || filePath.includes('public/assets/trains/templates')) {
          generateRegistryFiles();
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
