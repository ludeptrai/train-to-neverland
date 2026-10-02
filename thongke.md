Với **Chuyến Tàu Không Vội**, anh có thể xây một hệ thống thống kê khá thú vị mà vẫn giữ project là **static SPA trên GitHub Pages**. Tôi sẽ tách thành 2 nhóm:

1. **Analytics** để anh hiểu người dùng sử dụng web như thế nào.
2. **Community statistics** — các con số được cộng dồn và hiển thị ngược lại trong chính thế giới của game.

GitHub Pages phù hợp để host phần frontend/static; phần thu thập dữ liệu cần một API/database bên ngoài vì Pages không phải backend runtime. GitHub Pages hỗ trợ HTTPS và custom domain nếu anh muốn dùng domain riêng. ([GitHub Docs][1])

---

# 1. Những statistic tôi đề xuất

Không nên chỉ thu thập `pageview`. Với concept của anh, có thể biến dữ liệu thành một phần của trải nghiệm.

### Core statistics

| Metric                     | Ý nghĩa                                | Có thể hiển thị |
| -------------------------- | -------------------------------------- | --------------- |
| `total_visits`             | Tổng lượt truy cập                     | ✓               |
| `unique_visitors`          | Số visitor ước tính                    | ✓               |
| `total_session_minutes`    | Tổng thời gian mọi người đã ở trên tàu | ✓               |
| `active_users`             | Người đang trên tàu                    | ✓               |
| `total_journeys`           | Tổng số chuyến đi                      | ✓               |
| `total_distance`           | Tổng quãng đường đã đi                 | ✓               |

Ví dụ UI:

```text
┌─────────────────────────────────────────┐
│        JOURNEY STATISTICS               │
│                                         │
│  👥  12,482 travelers                   │
│                                         │
│  🚂  38,721 journeys                    │
│                                         │
│  🌏  15 destinations discovered         │
│                                         │
│  ⏱   284,621 minutes spent onboard      │
└─────────────────────────────────────────┘
```

# 2. Thu thập thông tin về "hành trình"

Mỗi khi người dùng chuyển scene:

```json
{
  "event": "location_visit",
  "location": "hoian",
  "time_period": "sunset",
  "weather": "rain"
}
```

Có thể thống kê:

```text
Hội An
├── 2,431 visits
├── 18,294 minutes
...
```

Sau đó web có thể hiện:

> **2,431 travelers have passed through Hội An**

Hoặc:

> **Hội An has been visited 2,431 times**

---

# 3. "Most traveled destinations"

Cái này khá hợp với game:

```text
MOST VISITED DESTINATIONS

01  Tokyo          12,481
02  Saigon          9,382
03  Kyoto            8,921
04  Hội An           7,231
05  Paris            6,842
```

Nhưng tôi khuyên **không biến nó thành bảng ranking quá rõ ràng** nếu anh muốn giữ mood thư giãn.

Có thể làm:

```text
The train has visited...

🇻🇳 Saigon        9,382 times
🇯🇵 Tokyo         8,421 times
🇫🇷 Paris         6,231 times
```

---

# 4. Thu thập thời gian sử dụng

Đây là metric rất có giá trị.

Không nên gửi request mỗi giây.

Thay vào đó:

```text
User opens
     ↓
session_start
     ↓
heartbeat every 30–60 sec
     ↓
session_end / visibilitychange
```

Ví dụ:

```json
{
  "event": "heartbeat",
  "session_duration": 180,
  "location": "dalat"
}
```

Server chỉ cần cộng:

```text
total_session_seconds += 180
```

Sau đó hiển thị:

> **People have spent 284,621 minutes aboard the train.**

---

# 5. Một statistic rất hay: "Currently Onboard"

Anh có thể làm:

```text
🚂 127 travelers are currently onboard
```

Đây không cần chính xác tuyệt đối.

Dùng heartbeat:

```text
User A ── heartbeat ──┐
User B ── heartbeat ──┤
User C ── heartbeat ──┤
                      ▼
                 active_sessions
```

Nếu user không gửi heartbeat trong 90–120 giây:

```text
inactive → remove
```

Con số này nên gọi là:

> **Travelers currently onboard**

thay vì "users online" để phù hợp với concept.

---

# 6. Weather statistics

Anh đang có:

* Rain
* Snow
* Sakura/petal
* Clear

Có thể thống kê:

```text
WEATHER EXPERIENCED BY TRAVELERS

☀ CLEAR       41%
🌧 RAIN        28%
🌸 SAKURA      17%
❄ SNOW        14%
```

Hoặc biến thành:

> Travelers have spent **42,381 minutes listening to the rain.**

Đây là loại statistic có tính "world building" khá tốt.

---

# 7. Time-of-day statistics

Vì anh đã có:

```text
Dawn
Day
Sunset
Night
```

có thể thu thập:

```json
{
  "time_period": "night"
}
```

và tạo:

```text
THE TRAIN NEVER SLEEPS

Dawn       14%
Day        39%
Sunset     21%
Night      26%
```

Hoặc:

> **26% of journeys happen after sunset.**


---

# 10. Tôi sẽ tránh thu thập những dữ liệu này

Nếu đây là một project public/personal, tôi không thấy cần:

```text
❌ Email
❌ Name
❌ Exact location
❌ IP address
❌ GPS
❌ Clipboard
❌ Keystrokes
❌ Browsing history
❌ User-uploaded music
❌ Full URL query parameters
```

Đặc biệt **không cần GPS** để biết người dùng ở Việt Nam hay Mỹ.

Nếu muốn location analytics, chỉ cần mức rất thô như country/region và nên cân nhắc privacy/legal requirements. Một lựa chọn như GoatCounter được thiết kế theo hướng aggregate analytics và không lưu IP address trong database. ([GoatCounter][2])

---

# 11. Kiến trúc tôi khuyên dùng

Nếu anh muốn **đơn giản + rẻ + dễ maintain**, tôi sẽ chọn:

```text
                    GitHub Pages
                         │
                         │
                   React / SPA
                         │
          ┌──────────────┴──────────────┐
          │                             │
     Game Engine                   Analytics
          │                             │
 Canvas / PixiJS               POST /events
          │                             │
          │                             ▼
          │                     Cloudflare Worker
          │                             │
          │                             ▼
          │                         Cloudflare D1
          │                             │
          │                             ▼
          └────────────────────── Statistics API
                                        │
                                        ▼
                              Web "Community Stats"
```

Cloudflare D1 hiện có thể được bind trực tiếp vào Worker và truy vấn bằng API của Worker, nên khá phù hợp cho một backend nhỏ cho static site. ([Cloudflare Docs][3])

---

# 12. Database rất nhỏ là đủ

Không cần event database phức tạp.

Có thể bắt đầu bằng:

### `daily_stats`

```text
date
visits
unique_visitors
session_seconds
journeys
distance
music_seconds
rain_seconds
snow_seconds
night_seconds
```

### `location_stats`

```text
location_id
visits
session_seconds
```

### `event_stats`

```text
event_type
count
```

### `active_sessions`

```text
session_id
last_seen
location
```

Thậm chí với project nhỏ, `daily_stats + location_stats + active_sessions` đã đủ.

---

# 13. Event payload nên cực nhỏ

Ví dụ:

```json
{
  "event": "location_visit",
  "location": "saigon",
  "time": "sunset",
  "weather": "rain"
}
```

Heartbeat:

```json
{
  "event": "heartbeat",
  "location": "saigon",
  "seconds": 30
}
```

Session:

```json
{
  "event": "session_start"
}
```

Không cần gửi toàn bộ state của game.

---

# 14. Đặc biệt: tạo Anonymous Session ID

Anh có thể tạo một random UUID:

```javascript
const sessionId = crypto.randomUUID();
```

Chỉ giữ nó trong memory/session storage nếu chỉ cần session-level statistics.

Nếu muốn tính returning visitors thì có thể dùng anonymous random ID trong `localStorage`, nhưng lúc đó nên thông báo rõ trong privacy notice.

Quan trọng là:

```text
session_id
    ≠
user identity
```

Không map nó với email/name/IP.

---

# 15. Analytics tool + database nên tách nhau

Tôi sẽ làm:

```text
                 ┌────────────────┐
                 │   GitHub Pages │
                 └───────┬────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       General Analytics       Game Statistics
              │                     │
              ▼                     ▼
        GoatCounter /            Worker
           Umami                    │
                                    ▼
                                   D1
```

**GoatCounter** phù hợp nếu anh chỉ cần pageviews/referrer/browser/OS và analytics nhẹ, privacy-friendly. Nó không dùng unique identifiers để track người dùng. ([GoatCounter][2])

**Umami** phù hợp hơn nếu anh muốn custom events và dashboard cho các hành vi trong game; Umami hỗ trợ custom event data và API, đồng thời có tùy chọn cloud/self-host. ([Umami Docs][4])

Còn **D1** dùng cho những số liệu mà anh muốn đưa ngược vào game.

---

# 16. Tôi đặc biệt đề xuất tạo "World Statistics"

Thay vì một trang `/analytics`, đưa thống kê vào chính experience.

Ví dụ khi người chơi mở menu:

```text
╔══════════════════════════════════════╗
║          THE WORLD IS MOVING         ║
║                                      ║
║       🚂 38,721 journeys             ║
║                                      ║
║       👤 12,482 travelers             ║
║                                      ║
║       🌏 15 destinations              ║
║                                      ║
║       ⏱ 284,621 minutes onboard      ║
║                                      ║
║       🌧 42,381 minutes of rain       ║
║                                      ║
║       🎵 91,204 hours of music       ║
║                                      ║
║       ─────────────────────           ║
║                                      ║
║       127 travelers onboard now       ║
╚══════════════════════════════════════╝
```

Nó khiến website có cảm giác **"thế giới này đang tồn tại cùng những người khác"**, dù thực tế game vẫn là một SPA chạy độc lập trên trình duyệt.

---

## 17. Một tầng nữa tôi nghĩ rất hợp với "Chuyến Tàu Không Vội"

Anh có thể tạo **Milestones**:

```text
1,000 travelers
       ↓
First Station

10,000 travelers
       ↓
Night Route unlocked

100,000 travelers
       ↓
A new destination appears

1,000,000 minutes
       ↓
The train reaches Neverland
```

Không nhất thiết phải unlock gameplay; có thể chỉ thay đổi cosmetic:

```text
100 travelers
→ thêm một chiếc đèn trên tàu

1,000 travelers
→ thêm một NPC

10,000 travelers
→ thêm một toa tàu

100,000 minutes
→ mở một cảnh quan bí mật
```

Như vậy **aggregate statistics trở thành một phần của world-building**, thay vì chỉ là analytics cho developer.

---

## 18. Bộ metric MVP tôi sẽ triển khai trước

Đừng thu quá nhiều ngay từ đầu. Tôi sẽ bắt đầu bằng **10 metric**:

```text
① Total travelers
② Total journeys
③ Total minutes onboard
④ Currently onboard
⑤ Unique locations visited
⑥ Total location visits
⑦ Most visited location
⑧ Total music minutes
⑨ Total rain/snow minutes
⑩ Dawn / Day / Sunset / Night distribution
```

Sau đó frontend có thể gọi:

```http
GET /api/stats
```

và nhận:

```json
{
  "travelers": 12482,
  "journeys": 38721,
  "minutes": 284621,
  "active": 127,
  "locations": 15,
  "location_visits": 84231,
  "music_minutes": 547224,
  "rain_minutes": 42381,
  "night_minutes": 71238
}
```

Sau đó toàn bộ phần UI chỉ cần render dữ liệu này.
