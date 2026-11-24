// 劇本殺版《沒寄出的信》的公開資料：介紹頁、玩家頁、DM 頁共用。
// 這裡的東西任何人都看得到，只放不會劇透的內容。
// 劇本、線索、真相在 private/沒寄出的信/（不進 git），用 npm run seal 加密成 mystery-sealed.json。
import { schedule, toMin, toTime } from './sessions.js';

// 咖啡館老闆（由 DM 扮演）的預設值。DM 控制台可以隨時切換梅姐／梅叔，
// 切換後印出來的名牌 QR code 也會帶著這個設定，玩家手機上的劇本就會跟著換。
// 這裡只決定「還沒切換過」時用哪一個。
export const hostGender = 'female';
export const hosts = {
  female: { name: '梅姐', title: '老闆娘', pronoun: '她' },
  male: { name: '梅叔', title: '老闆', pronoun: '他' },
};
export const host = hosts[hostGender] || hosts.female;

export const mystery = {
  title: '沒寄出的信',
  tagline: '十年前沒說出口的話，今天還來得及嗎？',
  summary: '一場 2.5 小時的情感推理劇本殺。沒有命案，要解開的是人心。',
  premise: [
    '十年前，大學登山社的六個人，畢業那天在學校旁的「山腳咖啡」埋下時光膠囊。',
    '今天，咖啡館要收了。老闆把大家找回來，喝最後一次下午茶，打開膠囊。',
    '膠囊裡有六封寫給十年後自己的信，還有第七封。信封上沒有名字，只寫著「給妳」。',
  ],
  facts: [
    ['人數', '6 人（3 男 3 女，可反串）'],
    ['玩法', '破冰遊戲、小劇場、推理，不投票'],
    ['時間', '2.5 小時，含下午茶'],
    ['類型', '情感＋輕推理，沒有命案'],
    ['適合', '第一次玩劇本殺也可以'],
  ],
  roles: [
    { id: 'akai', name: '阿凱', gender: '男', blurb: '在學校旁開登山用品店，十年沒離開這個小鎮。話不多，但總是最早到、最晚走。' },
    { id: 'xiaoqing', name: '小晴', gender: '女', blurb: '在台北做行銷，說話很快、笑聲很大，當年社團的開心果。' },
    { id: 'azhe', name: '阿哲', gender: '男', blurb: '當年的社長，現在是業務經理，一年有半年在出差。很會帶氣氛。' },
    { id: 'zhiming', name: '志明', gender: '男', blurb: '工程師，話少、做事仔細，當年負責寫社團日誌。' },
    { id: 'ruotong', name: '若彤', gender: '女', blurb: '在附近的國小教書，說話溫溫的，習慣把話說得很委婉。' },
    { id: 'peishan', name: '佩珊', gender: '女', blurb: '在柏林當了十年攝影師，這週剛回台灣。有話直說。' },
  ],
  // id 對應 DM 稿（private/沒寄出的信/dm.mjs 的 phases）
  phases: [
    { id: 'open', title: '開場', minutes: 5, desc: '說明今天怎麼玩' },
    { id: 'icebreak', title: '破冰遊戲', minutes: 20, desc: '用自己的身分：名字接龍、兩真一假、三秒定格' },
    { id: 'read1', title: '拿角色、讀第一幕', minutes: 10, desc: '用手機讀自己的劇本' },
    { id: 'reunion', title: '重逢小劇場', minutes: 10, desc: '每個人演自己的進場，老闆打開時光膠囊' },
    { id: 'round1', title: '第一輪：下午茶與小劇場', minutes: 25, desc: '邊喝下午茶邊用問題卡互相問，兩段回憶小劇場' },
    { id: 'read2', title: '讀第二幕', minutes: 8, desc: '想起畢業那天的事' },
    { id: 'round2', title: '第二輪：小劇場與搜證', minutes: 30, desc: '四段小劇場、新的線索、私聊' },
    { id: 'restore', title: '還原', minutes: 12, desc: '不投票，大家一起把十年前的故事拼起來' },
    { id: 'act3', title: '第三幕：結局小劇場', minutes: 15, desc: '讀十年前寫給自己的信，每個人演自己選的結局' },
    { id: 'debrief', title: '出戲', minutes: 15, desc: '離開角色，回到自己' },
  ],
  rules: [
    '你的劇本只有你看得到。不要給別人看，也不要偷看別人的。',
    '關於你自己的**秘密**，你可以不說，也可以說謊；其他事情都要說實話。',
    '劇本裡標著**「被問到才說」**的事，別人用開放式問題問到相關話題時，你要照實說。是非題只要回答「是」或「不是」。',
    '每一輪可以找一個人私聊一次，3 分鐘。',
    '**小劇場**的台詞都在你的劇本裡，照唸就好，不用演得很厲害；想加自己的話也可以。不想演，用唸的也沒關係。',
    '任何時候都可以說 **pass**。',
    '不需要任何肢體接觸。角色之間的感情，都只在劇情裡。',
  ],
  // 五堂課在這場劇本殺裡變成什麼（不劇透）
  arts: [
    ['聆聽', '用好問題換到真話'],
    ['吵架', '用桌上法，把一件放了很久的事放上桌'],
    ['選擇', '最後的結局由你自己選、自己演：說出口，還是順著滑過去'],
    ['靠近', '線索藏在每個人愛人的方式裡'],
    ['冒險', '風箏與錨：留下來，還是再出發'],
  ],
};

// 每一段的開始、結束時間，從課程的上課時間（sessions.js 的 schedule.start）往下算
export function mysteryTimeline() {
  let t = toMin(schedule.start);
  return mystery.phases.map((p) => {
    const time = toTime(t);
    t += p.minutes;
    return { ...p, time, end: toTime(t) };
  });
}

export const mysteryHours = () => {
  const tl = mysteryTimeline();
  return { start: tl[0].time, end: tl.at(-1).end };
};
