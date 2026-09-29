/**
 * Slow Rail - Internationalization (i18n) Module
 * Adheres to Architecture Standard: Multilingual-ready (vi, en)
 */
'use strict';

const I18N = {
  currentLang: (typeof localStorage !== 'undefined' ? localStorage.getItem('slow_rail_lang') : null) || 'vi',
  
  translations: {
    vi: {
      site_title: "Slow Rail · Một chuyến đi thật chậm",
      site_desc: "Ngắm đoàn tàu pixel đi qua 110 thành phố và danh lam trên thế giới, với nhạc không lời và thời tiết bạn chọn.",
      brand_edition: "chuyến đi nhẹ nhàng",
      btn_focus_on: "Đắm mình",
      btn_focus_off: "Hiện điều khiển",
      btn_focus_on_aria: "Chế độ đắm mình (ẩn bảng điều khiển)",
      btn_focus_off_aria: "Hiện lại bảng điều khiển",
      eyebrow_hero: "KHÔNG CẦN VỘI VÀNG",
      heading_hero: "Một chuyến đi thật chậm.",
      label_slow_train: "CHUYẾN TÀU KHÔNG VỘI",
      status_loading_window: "Đang mở cửa sổ chuyến đi…",
      next_stop: "ĐIỂM DỪNG TIẾP THEO",
      
      // Destination
      step_dest: "ĐIỂM ĐẾN",
      prev_city_aria: "Thành phố trước",
      next_city_aria: "Thành phố tiếp theo",
      auto_tour: "Tự chuyển ga",
      tour_30s: "30 giây / ga",
      tour_1m: "1 phút / ga",
      tour_2m: "2 phút / ga",
      tour_5m: "5 phút / ga",
      tour_summary: "110 điểm đến · chuyến đi vòng quanh thế giới",
      tour_status_stopping: "Đang dừng tại {city}",
      tour_status_next: "Ga tiếp theo: {city}",
      tour_status_loading: "Đang chuẩn bị cảnh {city}…",

      // Atmosphere / Weather & Time
      step_atmos: "KHÔNG KHÍ",
      label_time: "Thời điểm",
      time_day: "Ban ngày",
      time_sunset: "Hoàng hôn",
      time_night: "Ban đêm",
      label_weather: "Thời tiết",
      weather_clear: "Trời quang",
      weather_rain: "Mưa",
      weather_snow: "Tuyết",

      // Music & Audio
      music_eyebrow: "NHẠC KHÔNG LỜI",
      audio_hint_idle: "Bấm ▶ để bật nhạc",
      audio_hint_playing: "Hòa âm, giai điệu & không gian stereo",
      audio_hint_touch: "Chạm bất kỳ đâu để bật nhạc",
      volume_label: "Âm lượng",
      rain_volume_label: "Tiếng mưa",
      rain_volume_aria: "Âm lượng tiếng mưa",
      style_piano: "Piano êm dịu",
      style_lofi: "Lo-fi chuyến tàu",
      style_ambient: "Ambient mơ màng",
      style_bells: "Chuông trong trẻo",

      // Track names & controls
      track_day: "Nắng qua ô cửa",
      track_sunset: "Chiều trên đường ray",
      track_night: "Chuyến tàu dưới ánh trăng",
      track_rain: "Những giọt mưa bên cửa sổ",
      track_snow: "Tuyết rơi thật khẽ",
      track_prev_aria: "Bản nhạc trước (P)",
      track_next_aria: "Bản nhạc tiếp theo (N)",
      track_auto_change_hint: "Tự đổi bài sau 4-6 điểm đến",
      auto_music_toggle: "Tự đổi nhạc (4-6 ga)",
      track_select_aria: "Chọn bản nhạc",

      // Footer
      footer_quote: "Chỉ cần ngồi lại, ngắm nhìn và thở nhẹ.",
      footer_tagline: "NO RUSH. JUST RAILS.",
      nav_privacy: "Chính sách bảo mật",
      nav_terms: "Điều khoản dịch vụ",
      nav_home: "Về chuyến tàu",

      // Feedback & Modal
      btn_feedback: "Góp ý",
      feedback_modal_eyebrow: "HÒM THƯ TRÊN TOA TÀU",
      feedback_modal_title: "Góp ý chuyến tàu",
      feedback_modal_desc: "Chia sẻ cảm xúc, gợi ý điểm đến mới, đề xuất tính năng hoặc báo lỗi để chuyến tàu ngày một trọn vẹn hơn.",
      feedback_mood_title: "Cảm xúc của bạn lúc này",
      mood_peaceful: "Yên bình",
      mood_cozy: "Ấm áp",
      mood_inspired: "Hứng khởi",
      mood_nostalgic: "Hoài niệm",
      mood_buggy: "Gặp sự cố",
      feedback_topic_title: "Chủ đề bạn muốn chia sẻ",
      topic_destination: "Gợi ý điểm đến mới",
      topic_feature: "Ý tưởng tính năng",
      topic_bug: "Báo sự cố kỹ thuật",
      topic_general: "Chia sẻ cảm nghĩ",
      feedback_email_title: "Email của bạn (tùy chọn)",
      feedback_email_placeholder: "ten@example.com (để chúng mình gửi thư cảm ơn)",
      feedback_message_title: "Lời nhắn gửi người lái tàu *",
      feedback_message_placeholder: "Viết cảm nghĩ, chia sẻ danh lam bạn muốn xuất hiện, hoặc mô tả lỗi bạn gặp phải…",
      feedback_btn_send: "Gửi lời nhắn",
      feedback_btn_sending: "Đang gửi…",
      feedback_btn_sent: "Đã gửi thành công!",
      feedback_success_msg: "Cảm ơn bạn thật nhiều! Lời nhắn đã được gửi đến người lái tàu 🚂",
      feedback_error_msg: "Chưa thể gửi qua hệ thống. Bạn có thể gửi trực tiếp qua email: {email}",
      feedback_direct_email: "Hoặc gửi thư trực tiếp cho người lái tàu:",
      feedback_close_aria: "Đóng cửa sổ góp ý",

      // Chat Window
      chat_title: "Trò chuyện toa tàu",
      chat_online_count: "{count} hành khách",
      chat_minimize: "Thu nhỏ",
      chat_compact: "Cỡ nhỏ",
      chat_normal: "Cỡ chuẩn",
      chat_close: "Đóng khung chat",
      chat_input_placeholder: "Nhắn gửi bạn đồng hành…",
      chat_send: "Gửi tin nhắn",
      chat_you: "Bạn",
      chat_antispam_warn: "⚠️ Hãy chậm lại một chút: Bạn chỉ có thể gửi tối đa 10 tin nhắn/phút (thử lại sau {seconds}s)",
      chat_badge_title: "Trò chuyện",
      chat_filter_bots_btn: "Lọc tin tự động",
      chat_filter_bots_tooltip_off: "Lọc bỏ tin bot (Đang hiện tất cả)",
      chat_filter_bots_tooltip_on: "Đang lọc bỏ tin bot (Bấm để hiện lại)",
      chat_filter_notice: "Đang ẩn tin tự động (chỉ hiện người thật)",
      chat_filter_show_all: "Hiện tất cả",

      // Start Journey Modal Overlay
      start_eyebrow: "CHUYẾN TÀU THƯ GIÃN",
      start_heading: "Một chuyến đi thật chậm",
      start_desc: "Ngắm nhìn 110 thành phố và danh lam thế giới qua ô cửa sổ pixel art, hòa cùng giai điệu ambient lo-fi và thời tiết bạn chọn.",
      start_btn: "Bước lên tàu",
      start_tip: "Nhấn Space, Enter hoặc Click để bắt đầu"
    },

    en: {
      site_title: "Slow Rail · A Peaceful Journey",
      site_desc: "Watch a pixel art train ride through 110 world destinations with generative ambient music and customizable weather.",
      brand_edition: "a little escape",
      btn_focus_on: "Immerse",
      btn_focus_off: "Show Controls",
      btn_focus_on_aria: "Immersive mode (hide controls)",
      btn_focus_off_aria: "Show control panel",
      eyebrow_hero: "NO NEED TO HURRY",
      heading_hero: "A slow journey across rails.",
      label_slow_train: "NO RUSH TRAIN",
      status_loading_window: "Opening the journey window…",
      next_stop: "NEXT DESTINATION",

      // Destination
      step_dest: "DESTINATION",
      prev_city_aria: "Previous city",
      next_city_aria: "Next city",
      auto_tour: "Auto-advance",
      tour_30s: "30s / stop",
      tour_1m: "1m / stop",
      tour_2m: "2m / stop",
      tour_5m: "5m / stop",
      tour_summary: "110 destinations · world rail journey",
      tour_status_stopping: "Resting in {city}",
      tour_status_next: "Next stop: {city}",
      tour_status_loading: "Preparing scenery for {city}…",

      // Atmosphere / Weather & Time
      step_atmos: "ATMOSPHERE",
      label_time: "Time of day",
      time_day: "Daylight",
      time_sunset: "Sunset",
      time_night: "Night",
      label_weather: "Weather",
      weather_clear: "Clear",
      weather_rain: "Rain",
      weather_snow: "Snow",

      // Music & Audio
      music_eyebrow: "GENERATIVE SOUNDS",
      audio_hint_idle: "Press ▶ to play music",
      audio_hint_playing: "Chords, melody & stereo space",
      audio_hint_touch: "Click anywhere to enable music",
      volume_label: "Volume",
      rain_volume_label: "Rain",
      rain_volume_aria: "Rain sound volume",
      style_piano: "Gentle Piano",
      style_lofi: "Train Lo-fi",
      style_ambient: "Dreamy Ambient",
      style_bells: "Crystal Bells",

      // Track names & controls
      track_day: "Sunlight Through Windows",
      track_sunset: "Dusk on the Railroad",
      track_night: "Train Under Moonlight",
      track_rain: "Raindrops on the Glass",
      track_snow: "Quiet Falling Snow",
      track_prev_aria: "Previous track (P)",
      track_next_aria: "Next track (N)",
      track_auto_change_hint: "Auto-changes every 4-6 destinations",
      auto_music_toggle: "Auto-change track (4-6 stops)",
      track_select_aria: "Select soundtrack",

      // Footer
      footer_quote: "Just sit back, watch the world pass, and breathe.",
      footer_tagline: "NO RUSH. JUST RAILS.",
      nav_privacy: "Privacy Policy",
      nav_terms: "Terms of Service",
      nav_home: "Back to Train",

      // Feedback & Modal
      btn_feedback: "Feedback",
      feedback_modal_eyebrow: "TRAIN CARRIAGE MAILBOX",
      feedback_modal_title: "Train Feedback",
      feedback_modal_desc: "Share your thoughts, suggest new destinations, request features, or report issues to make our journey even better.",
      feedback_mood_title: "How does the ride feel?",
      mood_peaceful: "Peaceful",
      mood_cozy: "Cozy",
      mood_inspired: "Inspired",
      mood_nostalgic: "Nostalgic",
      mood_buggy: "Issue encountered",
      feedback_topic_title: "What are you sharing?",
      topic_destination: "Suggest Destination",
      topic_feature: "Feature Idea",
      topic_bug: "Report Bug",
      topic_general: "General Thoughts",
      feedback_email_title: "Your email (optional)",
      feedback_email_placeholder: "name@example.com (if you'd like a reply)",
      feedback_message_title: "Message to the conductor *",
      feedback_message_placeholder: "Tell us what is on your mind as the train glides forward…",
      feedback_btn_send: "Send Message",
      feedback_btn_sending: "Sending…",
      feedback_btn_sent: "Sent successfully!",
      feedback_success_msg: "Thank you so much! Your thoughts have reached the conductor 🚂",
      feedback_error_msg: "Could not send right now. You can email directly: {email}",
      feedback_direct_email: "Or email directly to the conductor:",
      feedback_close_aria: "Close feedback window",

      // Chat Window
      chat_title: "Carriage Chat",
      chat_online_count: "{count} passengers",
      chat_minimize: "Minimize",
      chat_compact: "Compact",
      chat_normal: "Standard size",
      chat_close: "Close chat",
      chat_input_placeholder: "Say something to fellow passengers…",
      chat_send: "Send message",
      chat_you: "You",
      chat_antispam_warn: "⚠️ Slow down a little: Maximum 10 messages per minute (try again in {seconds}s)",
      chat_badge_title: "Chat",
      chat_filter_bots_btn: "Filter bots",
      chat_filter_bots_tooltip_off: "Filter out bot chat (Currently: Showing all)",
      chat_filter_bots_tooltip_on: "Bot chat filtered out (Click to show all)",
      chat_filter_notice: "Bot messages hidden (real passengers only)",
      chat_filter_show_all: "Show all",

      // Start Journey Modal Overlay
      start_eyebrow: "PEACEFUL RAIL JOURNEY",
      start_heading: "A Slow Journey Across Rails",
      start_desc: "Watch 110 world destinations through pixel art windows accompanied by calming generative ambient music and custom weather.",
      start_btn: "Board the Train",
      start_tip: "Click, press Space or Enter to begin"
    }
  },

  t(key, params = {}) {
    const dict = this.translations[this.currentLang] || this.translations.vi;
    let str = dict[key] || this.translations.vi[key] || this.translations.en[key];
    if (!str) {
      if (key === 'chat_filter_notice') str = (this.currentLang === 'en') ? 'Bot messages hidden (real passengers only)' : 'Đang ẩn tin tự động (chỉ hiện người thật)';
      else if (key === 'chat_filter_show_all') str = (this.currentLang === 'en') ? 'Show all' : 'Hiện tất cả';
      else if (key === 'chat_filter_bots_btn') str = (this.currentLang === 'en') ? 'Filter bots' : 'Lọc tin tự động';
      else str = key;
    }
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return str;
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('slow_rail_lang', lang);
        }
      } catch (e) {}
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
      }
    }
  }
};

if (typeof module !== 'undefined') {
  module.exports = I18N;
}
