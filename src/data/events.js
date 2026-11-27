// 近期場次：首頁的「近期場次」、測驗和工具頁的報名按鈕、給 Google 看的活動資料，都從這裡讀。
// 新增一場就在 events 裡多加一筆；時間都是台灣時間。
// 過了報名截止時間（沒寫就是活動開始時間），這一場會自動從網頁上消失，不用手動刪（想保留紀錄也可以留著）。
export const events = [
  {
    title: '好好聽你說｜聆聽的藝術',
    tagline: '先聽懂，才會被聽懂',
    summary: '認識自己的溝通模式，練習「複述、命名、好奇」三個聆聽步驟，再用好問題和新朋友好好聊一次。',
    date: '2026-12-12',
    start: '14:00',
    end: '16:30',
    city: '台北市大安區',
    // 場地確定後填，例如 '〇〇咖啡（捷運〇〇站步行 5 分鐘）'；空字串時只顯示 city
    venue: '',
    // 報名網址（ACCUPASS 活動頁）
    signup: 'https://www.accupass.com/event/2611220327382130004179',
    // 報名截止時間，例如 '2026-12-11 23:59'；空字串就是活動開始時（date + start）。
    // 過了這個時間，網站上就不再顯示這一場。ACCUPASS 那邊的截止時間要另外設。
    deadline: '',
    // 對應五堂課的第幾堂（可以不填）
    session: 1,
  },
];

const iso = (date, time) => `${date}T${time}:00+08:00`;
export const eventStart = (e) => iso(e.date, e.start);
export const eventEnd = (e) => iso(e.date, e.end);
// 報名截止：有寫 deadline 就用它，沒寫就是活動開始時
export const eventDeadline = (e) => (e.deadline ? iso(...e.deadline.trim().split(/\s+/)) : eventStart(e));

// 還能報名的場次（還沒過報名截止時間），照活動時間排好
export function upcomingEvents(now = new Date()) {
  return events
    .filter((e) => new Date(eventDeadline(e)) > now)
    .sort((a, b) => new Date(eventStart(a)) - new Date(eventStart(b)));
}

// 「12/12（六）」
function dayLabel(date) {
  const wd = '日一二三四五六'[new Date(`${date}T12:00:00+08:00`).getUTCDay()];
  const [, m, day] = date.split('-').map(Number);
  return `${m}/${day}（${wd}）`;
}

// 「12/12（六）14:00–16:30」
export const eventWhen = (e) => `${dayLabel(e.date)}${e.start}–${e.end}`;

// 有另外寫報名截止時間時：「報名到 12/11（五）23:59」；沒寫就是空字串
export function eventDeadlineLabel(e) {
  if (!e.deadline) return '';
  const [date, time] = e.deadline.trim().split(/\s+/);
  return `報名到 ${dayLabel(date)}${time}`;
}

export const eventPlace = (e) => e.venue || e.city;
