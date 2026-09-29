/**
 * Slow Rail - Real-time Shared Passenger Chat Controller
 * Synchronizes chat between ALL connected passengers worldwide in real-time.
 * Features:
 * - Real-time live synchronization via Server-Sent Events (SSE)
 * - Seamless fallback to automatic short-polling if SSE is unavailable
 * - Instant cross-tab synchronization via BroadcastChannel
 * - 3 Window states (open, smaller/compact, minimized) with unread notification badge
 * - Synchronized passenger bots (30-60s) generated on the server so everyone shares the same train experience
 * - Anti-spam rate limiting (10 chats/minute)
 */
'use strict';

(function () {
  // Deterministic color palette for passenger avatars
  const AVATAR_COLORS = [
    '#edb08f', '#a8d8ea', '#aa96da', '#fcbad3', '#ffffd2',
    '#95e1d3', '#eaffd0', '#f38181', '#fce38a', '#b5eed7',
    '#ffd3b6', '#ffaaa5', '#dcedc1', '#a8e6cf', '#ff8b94'
  ];

  function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  }

  function formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  // Persistent Client Identity
  let myClientId = '';
  let myUsername = 'You';
  try {
    const savedId = localStorage.getItem('slow_rail_client_id');
    if (savedId) {
      myClientId = savedId;
    } else {
      myClientId = 'c_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
      localStorage.setItem('slow_rail_client_id', myClientId);
    }

    const savedUser = localStorage.getItem('slow_rail_chat_user');
    if (savedUser) {
      myUsername = savedUser;
    } else {
      const randId = Math.floor(100 + Math.random() * 900);
      myUsername = `Passenger #${randId}`;
      localStorage.setItem('slow_rail_chat_user', myUsername);
    }
  } catch (e) {
    myClientId = 'c_' + Math.random().toString(36).substr(2, 8);
    myUsername = 'Passenger #' + Math.floor(100 + Math.random() * 900);
  }

  // Chat State
  let windowState = 'minimized'; // 'open' | 'smaller' | 'minimized'
  let unreadCount = 0;
  let filterBots = false; // Default: show bot chat (false = do not filter out)
  const chatMessagesMap = new Map(); // id -> msg
  const chatHistory = [];
  const MAX_HISTORY = 120;
  let lastTimestamp = 0;

  // Real-time synchronization
  let eventSource = null;
  let pollInterval = null;
  let isLiveConnected = false;
  let broadcastChannel = null;

  // Anti-spam sliding window (client-side enforcement & server feedback)
  const userMessageTimestamps = [];
  const RATE_LIMIT_MAX = 10;
  const RATE_LIMIT_WINDOW_MS = 60000;

  // DOM Elements
  let chatWidget, chatMessagesEl, chatForm, chatInput, chatSendBtn;
  let chatToggleBtn, unreadBadgeEl, antispamWarningEl, onlineCountEl;
  let btnMinimize, btnSmaller, btnClose, btnFilterBots, filterNoticeEl, filterResetBtn;

  function initChat() {
    chatWidget = document.getElementById('chat-widget');
    chatToggleBtn = document.getElementById('chat-toggle-btn');
    unreadBadgeEl = document.getElementById('chat-unread-badge');
    chatMessagesEl = document.getElementById('chat-messages');
    chatForm = document.getElementById('chat-form');
    chatInput = document.getElementById('chat-input');
    chatSendBtn = document.getElementById('chat-send-btn');
    antispamWarningEl = document.getElementById('chat-antispam-warning');
    onlineCountEl = document.querySelector('.chat-online-pill');

    btnMinimize = document.getElementById('chat-btn-minimize');
    btnSmaller = document.getElementById('chat-btn-smaller');
    btnClose = document.getElementById('chat-btn-close');
    btnFilterBots = document.getElementById('chat-filter-btn');
    filterNoticeEl = document.getElementById('chat-filter-notice');
    filterResetBtn = document.getElementById('chat-filter-reset-btn');

    if (!chatWidget) return;

    // Window controls
    if (chatToggleBtn) {
      chatToggleBtn.onclick = () => {
        setWindowState(windowState === 'minimized' ? 'open' : 'minimized');
      };
    }

    if (btnMinimize) {
      btnMinimize.onclick = () => setWindowState('minimized');
    }

    if (btnSmaller) {
      btnSmaller.onclick = () => {
        setWindowState(windowState === 'smaller' ? 'open' : 'smaller');
      };
    }

    if (btnClose) {
      btnClose.onclick = () => setWindowState('minimized');
    }

    // Bot Filter toggle button (default: show bot chat)
    if (btnFilterBots) {
      btnFilterBots.onclick = () => setBotFilter(!filterBots);
    }
    if (filterResetBtn) {
      filterResetBtn.onclick = () => setBotFilter(false);
    }

    // Apply initial bot filter UI state
    applyBotFilterUI();

    // Form submission
    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        handleUserSend();
      };
    }

    // Set initial window state
    setWindowState('minimized');

    // Setup Cross-Tab synchronization
    initBroadcastChannel();

    // Connect to live SSE Stream or fallback to polling
    connectLiveStream();

    // Ensure chat content is seeded even in offline/static environments
    ensureChatContentFallback();
  }

  function setBotFilter(shouldFilter) {
    filterBots = shouldFilter;
    applyBotFilterUI();
    scrollToBottom();
  }

  function applyBotFilterUI() {
    if (!chatWidget) return;
    chatWidget.classList.toggle('filter-bots-active', filterBots);

    if (btnFilterBots) {
      btnFilterBots.classList.toggle('active', filterBots);
      btnFilterBots.setAttribute('aria-pressed', filterBots ? 'true' : 'false');
      const tooltip = (typeof I18N !== 'undefined')
        ? (filterBots ? I18N.t('chat_filter_bots_tooltip_on') : I18N.t('chat_filter_bots_tooltip_off'))
        : (filterBots ? 'Đang lọc bỏ tin bot (Bấm để hiện lại)' : 'Lọc bỏ tin tự động (Đang hiện tất cả)');
      btnFilterBots.setAttribute('title', tooltip);
      btnFilterBots.setAttribute('aria-label', tooltip);
    }

    if (filterNoticeEl) {
      filterNoticeEl.classList.toggle('hidden', !filterBots);
      const noticeSpan = filterNoticeEl.querySelector('[data-i18n="chat_filter_notice"]');
      const resetBtn = filterNoticeEl.querySelector('#chat-filter-reset-btn');
      if (noticeSpan && typeof I18N !== 'undefined') {
        const text = I18N.t('chat_filter_notice');
        if (text && text !== 'chat_filter_notice') noticeSpan.textContent = text;
      }
      if (resetBtn && typeof I18N !== 'undefined') {
        const text = I18N.t('chat_filter_show_all');
        if (text && text !== 'chat_filter_show_all') resetBtn.textContent = text;
      }
    }
  }

  function setWindowState(state) {
    windowState = state;
    if (!chatWidget) return;

    chatWidget.classList.remove('chat-open', 'chat-smaller', 'chat-minimized');

    if (state === 'open') {
      chatWidget.classList.add('chat-open');
      unreadCount = 0;
      updateUnreadBadge();
      scrollToBottom();
      if (btnSmaller) {
        btnSmaller.innerHTML = '◱';
        btnSmaller.title = (typeof I18N !== 'undefined') ? I18N.t('chat_compact') : 'Compact';
      }
    } else if (state === 'smaller') {
      chatWidget.classList.add('chat-smaller');
      unreadCount = 0;
      updateUnreadBadge();
      scrollToBottom();
      if (btnSmaller) {
        btnSmaller.innerHTML = '◲';
        btnSmaller.title = (typeof I18N !== 'undefined') ? I18N.t('chat_normal') : 'Normal';
      }
    } else {
      chatWidget.classList.add('chat-minimized');
    }

    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('aria-expanded', state !== 'minimized');
    }
  }

  function updateUnreadBadge() {
    if (!unreadBadgeEl) return;
    if (unreadCount > 0 && windowState === 'minimized') {
      unreadBadgeEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
      unreadBadgeEl.classList.remove('hidden');
    } else {
      unreadBadgeEl.textContent = '';
      unreadBadgeEl.classList.add('hidden');
    }
  }

  function updateOnlineCount(count) {
    if (!onlineCountEl || !count) return;
    onlineCountEl.textContent = `🟢 ${count}`;
    const titleText = (typeof I18N !== 'undefined')
      ? I18N.t('chat_online_count', { count })
      : `${count} hành khách`;
    onlineCountEl.setAttribute('title', titleText);
  }

  // Cross-Tab instant sync using BroadcastChannel
  function initBroadcastChannel() {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      broadcastChannel = new BroadcastChannel('slow_rail_live_chat');
      broadcastChannel.onmessage = (event) => {
        if (!event.data) return;
        if (event.data.type === 'new_message' && event.data.message) {
          processIncomingMessage(event.data.message);
        } else if (event.data.type === 'presence' && event.data.onlineCount) {
          updateOnlineCount(event.data.onlineCount);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }

  // Connect to Live SSE Stream
  function connectLiveStream() {
    if (typeof EventSource === 'undefined') {
      startPolling();
      return;
    }

    try {
      const streamUrl = `/api/chat?stream=true&clientId=${encodeURIComponent(myClientId)}`;
      eventSource = new EventSource(streamUrl);

      eventSource.onopen = () => {
        isLiveConnected = true;
        stopPolling();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleLivePayload(data);
        } catch (err) {
          console.warn('Error parsing live SSE payload', err);
        }
      };

      eventSource.onerror = () => {
        isLiveConnected = false;
        // Fall back to polling when SSE connection drops
        startPolling();
      };
    } catch (e) {
      console.warn('EventSource initialization failed, using polling fallback', e);
      startPolling();
    }
  }

  function handleLivePayload(data) {
    if (!data) return;

    if (data.onlineCount) {
      updateOnlineCount(data.onlineCount);
    }

    if (data.type === 'init' && Array.isArray(data.messages)) {
      data.messages.forEach(msg => processIncomingMessage(msg));
    } else if (data.type === 'new_message' && data.message) {
      processIncomingMessage(data.message);
      // Forward to other local tabs
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ type: 'new_message', message: data.message });
        } catch (e) {}
      }
    } else if (data.type === 'presence' && data.onlineCount) {
      updateOnlineCount(data.onlineCount);
    }
  }

  // Polling fallback
  function startPolling() {
    if (pollInterval) return;
    pollMessages();
    pollInterval = setInterval(pollMessages, 3000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  async function pollMessages() {
    try {
      const res = await fetch(`/api/chat?since=${lastTimestamp}&clientId=${encodeURIComponent(myClientId)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.messages)) {
        data.messages.forEach(msg => processIncomingMessage(msg));
      }
      if (data.onlineCount) {
        updateOnlineCount(data.onlineCount);
      }
    } catch (err) {
      // Network offline or endpoint unreachable
    }
  }

  function processIncomingMessage(rawMsg) {
    if (!rawMsg || !rawMsg.id) return;
    if (chatMessagesMap.has(rawMsg.id)) return; // Deduplicate

    const isMe = (rawMsg.senderClientId === myClientId) || 
                 (!rawMsg.isBot && rawMsg.username === myUsername);
    const isBot = Boolean(rawMsg.isBot);

    const msg = {
      id: rawMsg.id,
      username: rawMsg.username || 'Passenger',
      text: rawMsg.text || '',
      time: rawMsg.time || formatTime(),
      timestamp: rawMsg.timestamp || Date.now(),
      isMe,
      isBot,
      color: getAvatarColor(rawMsg.username)
    };

    if (msg.timestamp > lastTimestamp) {
      lastTimestamp = msg.timestamp;
    }

    chatMessagesMap.set(msg.id, msg);
    chatHistory.push(msg);

    if (chatHistory.length > MAX_HISTORY) {
      const removed = chatHistory.shift();
      chatMessagesMap.delete(removed.id);
      if (chatMessagesEl && chatMessagesEl.firstElementChild) {
        chatMessagesEl.removeChild(chatMessagesEl.firstElementChild);
      }
    }

    renderSingleMessage(msg);

    // If chat is minimized and not my own message, increment unread badge
    // (do not count bot messages if user enabled bot filter)
    if (windowState === 'minimized' && !isMe) {
      if (!filterBots || !isBot) {
        unreadCount++;
        updateUnreadBadge();
      }
    }
  }

  function checkClientRateLimit() {
    const now = Date.now();
    while (userMessageTimestamps.length > 0 && now - userMessageTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
      userMessageTimestamps.shift();
    }

    if (userMessageTimestamps.length >= RATE_LIMIT_MAX) {
      const oldestTime = userMessageTimestamps[0];
      const waitMs = RATE_LIMIT_WINDOW_MS - (now - oldestTime);
      const waitSec = Math.ceil(waitMs / 1000);
      return { allowed: false, waitSec };
    }

    return { allowed: true };
  }

  function showAntiSpamWarning(waitSec) {
    if (!antispamWarningEl) return;
    const msg = (typeof I18N !== 'undefined')
      ? I18N.t('chat_antispam_warn', { seconds: waitSec })
      : `⚠️ Hãy chậm lại một chút: Bạn chỉ có thể gửi tối đa 10 tin nhắn/phút (${waitSec}s)`;

    antispamWarningEl.textContent = msg;
    antispamWarningEl.classList.remove('hidden');

    if (chatInput) chatInput.disabled = true;
    if (chatSendBtn) chatSendBtn.disabled = true;

    setTimeout(() => {
      if (antispamWarningEl) antispamWarningEl.classList.add('hidden');
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
      }
      if (chatSendBtn) chatSendBtn.disabled = false;
    }, Math.min(waitSec * 1000, 5000));
  }

  async function handleUserSend() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // Check rate limit
    const clientCheck = checkClientRateLimit();
    if (!clientCheck.allowed) {
      showAntiSpamWarning(clientCheck.waitSec);
      return;
    }

    userMessageTimestamps.push(Date.now());
    chatInput.value = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: myUsername,
          text,
          clientId: myClientId
        })
      });

      if (response.status === 429) {
        const errData = await response.json();
        showAntiSpamWarning(errData.waitSec || 10);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data && data.message) {
          processIncomingMessage(data.message);
        }
      } else {
        // Fallback optimistic send if server responds with error
        fallbackLocalSend(text);
      }
    } catch (e) {
      // Offline fallback
      fallbackLocalSend(text);
    }

    if (chatInput) chatInput.focus();
  }

  function fallbackLocalSend(text) {
    const fallbackMsg = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      username: myUsername,
      text,
      time: formatTime(),
      timestamp: Date.now(),
      senderClientId: myClientId,
      isBot: false
    };
    processIncomingMessage(fallbackMsg);
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'new_message', message: fallbackMsg });
      } catch (err) {}
    }
  }

  function renderSingleMessage(msg) {
    if (!chatMessagesEl) return;

    const row = document.createElement('div');
    row.className = `chat-msg-row ${msg.isMe ? 'msg-me' : 'msg-other'} ${msg.isBot ? 'msg-bot' : 'msg-human'}`;
    row.dataset.isBot = msg.isBot ? 'true' : 'false';

    const youLabel = (typeof I18N !== 'undefined') ? I18N.t('chat_you') : 'Bạn';
    const initial = (msg.username || 'P').charAt(0).toUpperCase();

    row.innerHTML = `
      <div class="chat-msg-avatar" style="background: ${msg.color}" aria-hidden="true">${initial}</div>
      <div class="chat-msg-content">
        <div class="chat-msg-header">
          <span class="chat-msg-name" style="color: ${msg.color}">${escapeHtml(msg.username)} ${msg.isMe ? `<span class="badge-you">${youLabel}</span>` : ''} ${msg.isBot ? `<span class="badge-bot" title="Tin nhắn tự động">BOT</span>` : ''}</span>
          <span class="chat-msg-time">${msg.time}</span>
        </div>
        <div class="chat-msg-bubble">${escapeHtml(msg.text)}</div>
      </div>
    `;

    chatMessagesEl.appendChild(row);
    scrollToBottom();
  }

  function scrollToBottom() {
    if (!chatMessagesEl) return;
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Local fallback simulation (used if serverless /api/chat is not reachable)
  let localSimulationTimer = null;

  function ensureChatContentFallback() {
    setTimeout(() => {
      if (chatHistory.length === 0) {
        const users = (typeof window.CHAT_USERNAMES !== 'undefined') ? window.CHAT_USERNAMES : ['quiet_traveler'];
        const messages = (typeof window.CHAT_MESSAGES !== 'undefined') ? window.CHAT_MESSAGES : ['Chuyến tàu đêm thật bình yên.'];
        const getWeighted = (typeof window.getWeightedChatMessage === 'function') ? window.getWeightedChatMessage : null;
        const now = Date.now();
        const seedCount = 14;
        const seededTexts = [];
        for (let i = seedCount; i >= 1; i--) {
          const past = new Date(now - i * 38000);
          const randUser = users[Math.floor(Math.random() * users.length)];
          const randMsg = getWeighted ? getWeighted(seededTexts) : messages[Math.floor(Math.random() * messages.length)];
          seededTexts.push(randMsg);
          processIncomingMessage({
            id: `seed_local_${past.getTime()}_${i}`,
            username: randUser,
            text: randMsg,
            time: formatTime(past),
            timestamp: past.getTime(),
            isBot: true
          });
        }
        updateOnlineCount(42);

        if (!localSimulationTimer) {
          scheduleLocalSimulation(users, messages);
        }
      }
    }, 2500);
  }

  function scheduleLocalSimulation(users, messages) {
    const delay = Math.floor(Math.random() * (90000 - 60000 + 1)) + 60000;
    localSimulationTimer = setTimeout(() => {
      if (!isLiveConnected) {
        const randUser = users[Math.floor(Math.random() * users.length)];
        const getWeighted = (typeof window.getWeightedChatMessage === 'function') ? window.getWeightedChatMessage : null;
        const recentTexts = chatHistory.slice(-25).map(m => m.text);
        const randMsg = getWeighted ? getWeighted(recentTexts) : messages[Math.floor(Math.random() * messages.length)];
        const now = new Date();
        processIncomingMessage({
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          username: randUser,
          text: randMsg,
          time: formatTime(now),
          timestamp: now.getTime(),
          isBot: true
        });
      }
      scheduleLocalSimulation(users, messages);
    }, delay);
  }

  // Station Arrival Awareness: Fellow passengers comment on newly arrived destinations
  let stationArrivalTimeout = null;
  let lastStationCommentTime = 0;

  window.addEventListener('stationchange', (e) => {
    if (stationArrivalTimeout) clearTimeout(stationArrivalTimeout);
    const cityIndex = e.detail?.cityIndex;
    if (cityIndex === undefined || typeof CITY_DATA === 'undefined') return;

    // Minimum 45s between station arrival chats to prevent spam on quick skipping
    const now = Date.now();
    if (now - lastStationCommentTime < 45000) return;

    // 50% chance a passenger shares an insight or thought about the newly arrived destination
    if (Math.random() > 0.50) return;

    stationArrivalTimeout = setTimeout(() => {
      const isVi = (typeof I18N !== 'undefined' ? I18N.currentLang : 'vi') === 'vi';
      const info = (typeof getCityInfo === 'function') 
        ? getCityInfo(cityIndex, isVi ? 'vi' : 'en') 
        : { name: CITY_DATA[cityIndex]?.[0] || '' };
      
      const cityName = info.name || '';
      if (!cityName) return;

      const knowledgePool = (typeof window.KNOWLEDGE_FACTS !== 'undefined') ? window.KNOWLEDGE_FACTS : [];
      const generalPool = (typeof window.CHAT_MESSAGES !== 'undefined') ? window.CHAT_MESSAGES : [];
      
      const knowledgeMatches = knowledgePool.filter(m => m.toLowerCase().includes(cityName.toLowerCase()));
      const generalMatches = generalPool.filter(m => m.toLowerCase().includes(cityName.toLowerCase()));

      let comment = '';
      // 60% chance to share a knowledge fact about the destination if available
      if (knowledgeMatches.length && Math.random() < 0.60) {
        comment = knowledgeMatches[Math.floor(Math.random() * knowledgeMatches.length)];
      } else if (generalMatches.length) {
        comment = generalMatches[Math.floor(Math.random() * generalMatches.length)];
      } else {
        const genericComments = isVi ? [
          `Đoàn tàu vừa tiến vào ga ${cityName}, khung cảnh bên ngoài đẹp quá.`,
          `Ngắm nhìn ${cityName} qua ô cửa kính thấy lòng thật bình yên.`,
          `Ghé qua ${cityName} lúc này, không khí bên ngoài trông thật dịu dàng.`,
          `Thích ngắm ${cityName} trong ánh hoàng hôn này ghê.`
        ] : [
          `The train just arrived in ${cityName}, what a lovely view outside.`,
          `Watching ${cityName} through the window brings such tranquility.`,
          `Passing through ${cityName} right now, the atmosphere looks wonderful.`,
          `Love watching ${cityName} glide by in this evening light.`
        ];
        comment = genericComments[Math.floor(Math.random() * genericComments.length)];
      }

      const users = (typeof window.CHAT_USERNAMES !== 'undefined') ? window.CHAT_USERNAMES : ['quiet_traveler'];
      const userMatches = users.filter(u => u.toLowerCase().includes(cityName.toLowerCase().replace(/[\s-]/g, '')));
      const username = userMatches.length ? userMatches[0] : users[Math.floor(Math.random() * users.length)];

      lastStationCommentTime = Date.now();
      processIncomingMessage({
        id: `station_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        username,
        text: comment,
        time: formatTime(),
        timestamp: Date.now(),
        isBot: true
      });
    }, 4500);
  });

  // Language update listener
  window.addEventListener('languagechange', () => {
    if (antispamWarningEl && !antispamWarningEl.classList.contains('hidden')) {
      antispamWarningEl.textContent = (typeof I18N !== 'undefined')
        ? I18N.t('chat_antispam_warn', { seconds: 10 })
        : '⚠️ Hãy chậm lại một chút...';
    }
    if (chatInput) {
      chatInput.placeholder = (typeof I18N !== 'undefined')
        ? I18N.t('chat_input_placeholder')
        : 'Nhắn gửi bạn đồng hành…';
    }
    // Update badge you labels
    const youLabel = (typeof I18N !== 'undefined') ? I18N.t('chat_you') : 'Bạn';
    document.querySelectorAll('.badge-you').forEach(b => {
      b.textContent = youLabel;
    });
    // Update bot filter button tooltips
    applyBotFilterUI();
  });

  // Boot when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();
