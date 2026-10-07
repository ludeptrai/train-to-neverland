import { useEffect } from 'react';
import { SceneConfig, TimeOfDay } from '../types';

interface PageSeoProps {
  currentScene: SceneConfig;
  timeOfDay: TimeOfDay;
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  sunset: 'Hoàng Hôn',
  night: 'Màn Đêm',
  dawn: 'Bình Minh',
  day: 'Ban Ngày',
  auto: 'Giờ Thực Tế',
};

const SITE_NAME = 'Đi Khắp Việt Nam — Chuyến Tàu Đi Khắp Việt Nam';
const BRAND_NAME = 'Blog Của Lưu';
const AUTHOR_NAME = 'Phan Duy Lưu';

/**
 * Hook quản lý Title, Meta Description, Canonical URL và Open Graph tags động
 * Tối ưu hóa chuyên sâu các từ khóa:
 * - đi khắp việt nam
 * - blog của lưu
 * - chuyến tàu đi khắp việt nam
 * - xứ sở hư vô
 * - train to neverland
 * - pixel art
 * - phan duy lưu
 */
export function usePageSeo({ currentScene, timeOfDay }: PageSeoProps) {
  useEffect(() => {
    const timeLabel = TIME_LABELS[timeOfDay] || 'Hoàng Hôn';
    const isHome = currentScene.id === 'hochiminhcity' && timeOfDay === 'sunset';

    // 1. Cập nhật Title động kết hợp đầy đủ từ khóa mục tiêu
    let title = '';
    if (isHome) {
      title = `Đi Khắp Việt Nam — Chuyến Tàu Đi Khắp Việt Nam (${timeLabel}) | Train to Neverland (Xứ Sở Hư Vô) — ${BRAND_NAME}`;
    } else {
      title = `Ga ${currentScene.name} (${timeLabel}) — Chuyến Tàu Đi Khắp Việt Nam | Train to Neverland — ${BRAND_NAME}`;
    }
    document.title = title;

    // 2. Cập nhật Meta Description chuẩn SEO (tích hợp đầy đủ từ khóa tự nhiên)
    let description = '';
    if (isHome) {
      description = `Trải nghiệm chuyến tàu đi khắp Việt Nam trong không gian Pixel Art thư giãn tại ${BRAND_NAME} của tác giả ${AUTHOR_NAME}. Khám phá hành trình tới Xứ Sở Hư Vô (Train to Neverland) ngắm hoàng hôn rực rỡ và nghe nhạc Lo-Fi êm dịu.`;
    } else {
      description = `Thưởng ngoạn cảnh sắc ${currentScene.name} (${currentScene.location}) trong không gian Pixel Art ${timeLabel.toLowerCase()} thanh bình trên Chuyến Tàu Đi Khắp Việt Nam (Train to Neverland - Xứ Sở Hư Vô) tại ${BRAND_NAME} của tác giả ${AUTHOR_NAME}.`;
    }

    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // 3. Cập nhật Meta Keywords & Author
    const setNameMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const keywords = `đi khắp việt nam, blog của lưu, chuyến tàu đi khắp việt nam, xứ sở hư vô, train to neverland, pixel art, phan duy lưu, ga ${currentScene.name.toLowerCase()}, ${currentScene.location.toLowerCase()}, lo-fi chill`;
    setNameMetaTag('keywords', keywords);
    setNameMetaTag('author', `${AUTHOR_NAME} (${BRAND_NAME})`);

    // 4. Chuẩn hóa Canonical Link (Bỏ qua các param phụ như weather, train, zen, tour để tránh trùng lặp nội dung)
    let canonicalUrl = window.location.origin + window.location.pathname;
    if (!isHome) {
      canonicalUrl += `?scene=${encodeURIComponent(currentScene.id)}&time=${encodeURIComponent(timeOfDay)}`;
    }

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 5. Cập nhật Open Graph & Twitter tags (Hiển thị thẻ xem trước khi chia sẻ link lên Facebook, LinkedIn, Twitter, Zalo, Discord, ...)
    const setMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:type', 'website');
    setMetaTag('og:site_name', `${SITE_NAME} — ${BRAND_NAME}`);

    setNameMetaTag('twitter:title', title);
    setNameMetaTag('twitter:description', description);

    // Ảnh preview đại diện: Trang chủ dùng master thumbnail.png, các ga khác dùng background ga tương ứng
    try {
      const previewImgUrl = isHome
        ? new URL('/thumbnail.png', window.location.href).href
        : currentScene.backgroundUrl
          ? new URL(currentScene.backgroundUrl, window.location.href).href
          : new URL('/thumbnail.png', window.location.href).href;

      setMetaTag('og:image', previewImgUrl);
      setNameMetaTag('twitter:image', previewImgUrl);
    } catch {
      // Bỏ qua nếu URL không phân giải được
    }
  }, [currentScene, timeOfDay]);
}
