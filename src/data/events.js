// 近期場次：首頁的「近期場次」、測驗和工具頁的報名按鈕、給 Google 看的活動資料，都從這裡讀。
// 新增一場就在 events 裡多加一筆；時間都是台灣時間。
// 已經結束的場次會自動從網頁上消失，不用手動刪（想保留紀錄也可以留著）。
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
    // 對應五堂課的第幾堂（可以不填）
    session: 1,
  },
];

const iso = (date, time) => `${date}T${time}:00+08:00`;
export const eventStart = (e) => iso(e.date, e.start);
export const eventEnd = (e) => iso(e.date, e.end);

// 還沒結束的場次，照時間排好
export function upcomingEvents(now = new Date()) {
  return events
    .filter((e) => new Date(eventEnd(e)) > now)
    .sort((a, b) => new Date(eventStart(a)) - new Date(eventStart(b)));
}

// 「12/12（六）14:00–16:30」
export function eventWhen(e) {
  const d = new Date(`${e.date}T12:00:00+08:00`);
  const wd = '日一二三四五六'[d.getUTCDay()];
  const [, m, day] = e.date.split('-').map(Number);
  return `${m}/${day}（${wd}）${e.start}–${e.end}`;
}

export const eventPlace = (e) => e.venue || e.city;
