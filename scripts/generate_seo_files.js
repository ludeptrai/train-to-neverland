import fs from 'fs';
import path from 'path';

/**
 * Script tự động tạo sitemap.xml và robots.txt chuẩn SEO cho Google Search Console
 * Tập trung tối ưu index theo: Địa điểm kết hợp Thời gian (Scene + Time of Day)
 * Ưu tiên: TP. Hồ Chí Minh hoàng hôn làm trang chủ (Priority 1.0)
 */

const BASE_URL = (process.env.SITE_URL || 'https://ludeptrai.github.io/train-to-neverland').replace(/\/+$/, '');
const TIMES = ['sunset', 'night', 'dawn', 'day'];

export function generateSeoFiles() {
  const landscapesDir = path.resolve('public/assets/landscapes');
  const publicDir = path.resolve('public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Quét danh sách các ga có sẵn
  let sceneIds = [];
  if (fs.existsSync(landscapesDir)) {
    sceneIds = fs.readdirSync(landscapesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map(dirent => dirent.name.toLowerCase());
  }

  // Đảm bảo hochiminhcity luôn nằm đầu tiên
  sceneIds = sceneIds.filter(id => id !== 'hochiminhcity');
  sceneIds.unshift('hochiminhcity');

  const today = new Date().toISOString().split('T')[0];

  // Xây dựng các URL cần index
  const urls = [];

  // 1. Trang chủ: TP. Hồ Chí Minh (Hoàng Hôn)
  urls.push({
    loc: `${BASE_URL}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
    comment: 'Trang chủ mặc định: TP. Hồ Chí Minh (Hoàng Hôn)',
  });

  // 2. Các trang địa điểm kết hợp với 4 mốc thời gian
  for (const sceneId of sceneIds) {
    for (const time of TIMES) {
      // Bỏ qua tổ hợp trùng với trang chủ gốc
      if (sceneId === 'hochiminhcity' && time === 'sunset') {
        continue;
      }

      // Ưu tiên cao hơn cho các mốc thời gian thẩm mỹ (hoàng hôn, màn đêm)
      const priority = (time === 'sunset' || time === 'night') ? '0.85' : '0.75';

      urls.push({
        loc: `${BASE_URL}/?scene=${sceneId}&amp;time=${time}`,
        lastmod: today,
        changefreq: 'weekly',
        priority,
        comment: `${sceneId} - ${time}`,
      });
    }
  }

  // Tạo nội dung sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u => `  <!-- ${u.comment} -->
  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  // Tạo nội dung robots.txt
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf-8');

  console.log(`✅ [SEO Generator] Đã tạo sitemap.xml (${urls.length} URLs) và robots.txt thành công!`);
}

// Chạy trực tiếp qua node
if (process.argv[1] && process.argv[1].endsWith('generate_seo_files.js')) {
  generateSeoFiles();
}
