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

const SITE_NAME = 'Chuyến Tàu tới Xứ Sở Vĩnh Hằng';

/**
 * Hook quản lý Title, Meta Description, Canonical URL và Open Graph tags động
 * Ưu tiên: TP. Hồ Chí Minh hoàng hôn làm trang chủ
 */
export function usePageSeo({ currentScene, timeOfDay }: PageSeoProps) {
  useEffect(() => {
    const timeLabel = TIME_LABELS[timeOfDay] || 'Hoàng Hôn';
    const isHome = currentScene.id === 'hochiminhcity' && timeOfDay === 'sunset';

    // 1. Cập nhật Title động
    let title = '';
    if (isHome) {
      title = `${SITE_NAME} — TP. Hồ Chí Minh (${timeLabel}) | Train to Neverland`;
    } else {
      title = `Ga ${currentScene.name} (${timeLabel}) — ${currentScene.subtitle} | ${SITE_NAME}`;
    }
    document.title = title;

    // 2. Cập nhật Meta Description chuẩn SEO
    let description = '';
    if (isHome) {
      description = `Hành trình ngắm hoàng hôn rực rỡ trên ga TP. Hồ Chí Minh cùng Chuyến Tàu Không Vội (Train to the Neverland). Thư giãn, học tập và làm việc với không gian Pixel Art hoài niệm và âm nhạc Lo-Fi êm dịu.`;
    } else {
      description = `Thưởng ngoạn cảnh sắc ${currentScene.name} (${currentScene.location}) trong không gian ${timeLabel.toLowerCase()} yên bình trên Chuyến Tàu Không Vội. Không gian Lo-Fi lý tưởng để tập trung và thư giãn.`;
    }

    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', description);

    // 3. Chuẩn hóa Canonical Link (Bỏ qua các param phụ như weather, train, zen, tour để tránh trùng lặp nội dung)
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

    // 4. Cập nhật Open Graph tags (Hiển thị thẻ xem trước khi chia sẻ link lên Facebook, Zalo, Discord, ...)
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
    setMetaTag('og:site_name', SITE_NAME);

    // Ảnh preview đại diện: dùng background của chính ga đó
    if (currentScene.backgroundUrl) {
      try {
        const fullImgUrl = new URL(currentScene.backgroundUrl, window.location.href).href;
        setMetaTag('og:image', fullImgUrl);
      } catch {
        // Bỏ qua nếu URL không phân giải được
      }
    }
  }, [currentScene, timeOfDay]);
}
