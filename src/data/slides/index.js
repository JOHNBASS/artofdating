// 帶領者投影片：每一堂一個檔案（1.js ～ 5.js），一個物件就是一張投影片，照順序播放。
//
// 每張都可以加 notes：只會出現在講者畫面（按 S 開啟），投影機上看不到。
// 文字裡用 **兩個星號** 包起來的字會變粗體。
//
// 張數種類（kind）：
//   cover       封面：自動帶入 sessions.js 的第幾堂、標題、副標
//   qr          掃描 QR code 打開這一堂的手機頁面（網址自動產生）
//   agenda      今天的流程：自動帶入 sessions.js 的 agenda，時間從 schedule.start 往下算
//   break       用餐／休息：{ title?, text }，畫面會顯示現在時間和幾點回到座位
//               沒寫 title 就是用餐，標題用 sessions.js 的 schedule.meal（例如「晚餐」），用標題找到流程裡那一段；
//               schedule.meal 是 null（不安排用餐）時，沒寫 title 的 break 會自動拿掉
//   section     段落標題：{ mark: '一', title }，title 要出現在 sessions.js 流程的某一段文字裡，
//               投影片會自動帶出那一段的時間和分鐘數，講者畫面也用它提醒進度
//   statement   一句大字：{ text, sub?, cite? }
//   points      重點清單：{ title, points: [...], ordered?, flow?（畫成箭頭循環）, foot? }
//   compare     兩欄對照：{ title, cols: [左, 右], rows: [[左, 右], ...], foot? }
//   research    研究：{ title, stat?, statLabel?, text, source }
//   exercise    練習：{ title, mode: 'self' | 'pair' | 'table', minutes?, steps: [...], phone?, foot? }
//               有 minutes 就會出現倒數計時；phone: true 會提示「在手機上填寫」
//   spectrum    光譜題（人體光譜用）：{ title, left, right, leftLabel, rightLabel }
//   care        關懷提醒：{ title, text?, points? }
//   experiment  帶回家的約會實驗：{ title, steps: [...] }
//   end         結尾：自動帶入下一堂的預告
import { schedule } from '../sessions.js';
import s1 from './1.js';
import s2 from './2.js';
import s3 from './3.js';
import s4 from './4.js';
import s5 from './5.js';

// 不安排用餐時，拿掉用餐投影片（沒寫 title 的 break）
const keep = (slide) => schedule.meal || !(slide.kind === 'break' && !slide.title);

export const decks = Object.fromEntries(
  Object.entries({ 1: s1, 2: s2, 3: s3, 4: s4, 5: s5 }).map(([n, deck]) => [n, deck.filter(keep)]),
);
