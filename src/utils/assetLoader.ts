/**
 * Tiện ích tải trước (preload) tài nguyên hình ảnh và âm thanh
 * Giúp tối ưu hóa tốc độ hiển thị, loại bỏ hiện tượng giật/trắng hình (flash) khi mạng yếu
 */

const preloadedUrls = new Set<string>();

/**
 * Tải trước một ảnh với cơ chế timeout an toàn (không bao giờ treo vô hạn)
 */
export function preloadImage(url: string | undefined | null, timeoutMs = 8000): Promise<boolean> {
  if (!url) return Promise.resolve(true);
  if (preloadedUrls.has(url)) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const img = new Image();

    const cleanup = () => {
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };

    const timer = setTimeout(() => {
      if (!settled) {
        cleanup();
        resolve(false); // Hết thời gian chờ, vẫn tiếp tục để không block người dùng
      }
    }, timeoutMs);

    img.onload = () => {
      if (!settled) {
        preloadedUrls.add(url);
        cleanup();
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!settled) {
        cleanup();
        resolve(false);
      }
    };

    img.src = url;
  });
}

/**
 * Tải trước toàn bộ tài nguyên của một ga phong cảnh
 */
export async function preloadSceneAssets(
  scene: {
    backgroundUrl?: string;
    backgroundLightsUrl?: string;
    midgroundUrl?: string;
    midgroundLightsUrl?: string;
    foregroundUrl?: string;
    foregroundLightsUrl?: string;
  },
  timeoutMs = 8000
): Promise<void> {
  const promises: Promise<boolean>[] = [];

  if (scene.backgroundUrl) promises.push(preloadImage(scene.backgroundUrl, timeoutMs));
  if (scene.backgroundLightsUrl) promises.push(preloadImage(scene.backgroundLightsUrl, timeoutMs));
  if (scene.midgroundUrl) promises.push(preloadImage(scene.midgroundUrl, timeoutMs));
  if (scene.midgroundLightsUrl) promises.push(preloadImage(scene.midgroundLightsUrl, timeoutMs));
  if (scene.foregroundUrl) promises.push(preloadImage(scene.foregroundUrl, timeoutMs));
  if (scene.foregroundLightsUrl) promises.push(preloadImage(scene.foregroundLightsUrl, timeoutMs));

  await Promise.all(promises);
}

/**
 * Tải trước tài nguyên đoàn tàu
 */
export async function preloadTrainAssets(
  train: {
    bodyUrl?: string;
    lightsUrl?: string;
  },
  timeoutMs = 8000
): Promise<void> {
  const promises: Promise<boolean>[] = [];

  if (train.bodyUrl) promises.push(preloadImage(train.bodyUrl, timeoutMs));
  if (train.lightsUrl) promises.push(preloadImage(train.lightsUrl, timeoutMs));
  promises.push(preloadImage('./assets/trains/headlight_beam.png', timeoutMs));

  await Promise.all(promises);
}
