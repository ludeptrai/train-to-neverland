import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generateRegistryFiles } from './scripts/scan_assets.js';

function assetRegistryPlugin(): Plugin {
  return {
    name: 'vite-plugin-asset-registry',
    buildStart() {
      generateRegistryFiles();
    },
    configureServer(server) {
      // Quét và cập nhật danh sách ngay khi khởi động dev server
      generateRegistryFiles();

      // Tự động theo dõi các thư mục asset: khi có folder mới/xóa folder -> tự động cập nhật ngay lập tức
      const watchPaths = ['public/assets/landscapes', 'public/assets/trains/templates'];
      server.watcher.add(watchPaths);
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
