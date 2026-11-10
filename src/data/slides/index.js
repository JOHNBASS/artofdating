// 帶領者投影片：每一堂一個檔案（1.js ～ 5.js），一個物件就是一張投影片，照順序播放。
//
// 每張都可以加 notes：只會出現在講者畫面（按 S 開啟），投影機上看不到。
// 文字裡用 **兩個星號** 包起來的字會變粗體。
//
// 張數種類（kind）：
//   cover       封面：自動帶入 sessions.js 的第幾堂、標題、副標
//   qr          掃描 QR code 打開這一堂的手機頁面（網址自動產生）
//   agenda      今晚流程：自動帶入 sessions.js 的 agenda
//   break       休息／晚餐：{ title, text, until: '19:30' }，畫面會顯示現在時間
//   section     段落標題：{ mark: '一', title, time: '19:30' }，講者畫面用 time 提醒進度
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
import s1 from './1.js';
import s2 from './2.js';
import s3 from './3.js';
import s4 from './4.js';
import s5 from './5.js';

export const decks = { 1: s1, 2: s2, 3: s3, 4: s4, 5: s5 };
