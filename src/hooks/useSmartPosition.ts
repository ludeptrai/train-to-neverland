import { useState, useEffect, RefObject } from 'react';

interface SmartPositionOptions {
  isOpen: boolean;
  targetRef: RefObject<HTMLElement | null>;
  preferredWidth?: number;
  align?: 'left' | 'right' | 'auto';
  offset?: number;
}

/**
 * Hook tính toán vị trí hiển thị popup (Dropdown / Drawer) thông minh:
 * - Tự động bám theo nút kích hoạt
 * - Tự động ép dải hiển thị không bao giờ bị tràn (out) khỏi mép trái, mép phải hay mép dưới màn hình
 * - Tự động co dãn chiều cao tối đa (maxHeight) và bật cuộn nếu màn hình thấp/nhỏ
 */
export function useSmartPosition({
  isOpen,
  targetRef,
  preferredWidth = 320,
  align = 'auto',
  offset = 6,
}: SmartPositionOptions) {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
  });

  useEffect(() => {
    if (!isOpen || !targetRef.current) return;

    const updatePosition = () => {
      const el = targetRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const margin = 10;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      // Chiều rộng không vượt quá chiều rộng màn hình trừ lề
      const width = Math.min(preferredWidth, viewportW - margin * 2);

      // Điểm đặt top ngay dưới nút bấm
      const top = Math.min(rect.bottom + offset, viewportH - 120);

      // Chiều cao tối đa tự co dãn để không chạm đáy màn hình
      const maxHeight = Math.max(160, viewportH - top - margin);

      let left: number;
      if (align === 'left') {
        left = rect.left;
      } else if (align === 'right') {
        left = rect.right - width;
      } else {
        // Auto: nếu nút nằm ở nửa phải màn hình thì neo sang phải, ngược lại neo sang trái
        if (rect.left + rect.width / 2 > viewportW / 2) {
          left = rect.right - width;
        } else {
          left = rect.left;
        }
      }

      // Kẹp chặt toạ độ left để 100% không bị tràn ra ngoài màn hình
      if (left + width > viewportW - margin) {
        left = viewportW - width - margin;
      }
      if (left < margin) {
        left = margin;
      }

      setStyle({
        position: 'fixed',
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        width: `${Math.round(width)}px`,
        maxHeight: `${Math.round(maxHeight)}px`,
        overflowY: 'auto',
        zIndex: 99999,
        visibility: 'visible',
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, preferredWidth, align, offset, targetRef]);

  return style;
}
