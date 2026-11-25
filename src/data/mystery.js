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
    ['玩法', '角色破冰、八段小劇場（每個人都有台詞）、推理，不投票'],
    ['時間', '2.5 小時，含下午茶'],
    ['類型', '情感＋輕推理，沒有命案'],
    ['適合', '第一次玩劇本殺也可以'],
  ],
  roles: [
    { id: 'akai', name: '阿凱', gender: '男', blurb: '在學校旁開登山用品店，十年沒離開這個小鎮。話不多，但總是最早到、最晚走。', alt: '清晨的登山用品店，一個男人背對鏡頭，在木頭櫃台後擦著杯子' },
    { id: 'xiaoqing', name: '小晴', gender: '女', blurb: '在台北做行銷，說話很快、笑聲很大，當年社團的開心果。', alt: '夜裡的辦公室，一個女人背對鏡頭，看著窗外台北的燈火' },
    { id: 'azhe', name: '阿哲', gender: '男', blurb: '當年的社長，現在是業務經理，一年有半年在出差。很會帶氣氛。', alt: '黃昏的機場登機門，一個穿西裝的男人背對鏡頭，身旁是登機箱' },
    { id: 'zhiming', name: '志明', gender: '男', blurb: '工程師，話少、做事仔細，當年負責寫社團日誌。', alt: '深夜的書桌，一雙手在整齊的筆記本上寫字，旁邊睡著一隻灰色虎斑貓' },
    { id: 'ruotong', name: '若彤', gender: '女', blurb: '在附近的國小教書，說話溫溫的，習慣把話說得很委婉。', alt: '黃昏的國小教室，一個女人雙手捧著一盒自己烤的餅乾' },
    { id: 'peishan', name: '佩珊', gender: '女', blurb: '在柏林當了十年攝影師，這週剛回台灣。有話直說。', alt: '傍晚的月台，一個女人背對鏡頭，肩上掛著底片相機，身旁是貼滿貼紙的行李箱' },
  ],
  // id 對應 DM 稿（private/沒寄出的信/dm.mjs 的 phases）
  phases: [
    { id: 'open', title: '開場', minutes: 5, desc: '說明今天怎麼玩' },
    { id: 'read1', title: '拿角色、讀第一幕', minutes: 12, desc: '用手機讀自己的劇本，認識你和每個人的故事' },
    { id: 'icebreak', title: '破冰遊戲', minutes: 15, desc: '用角色的身分：招牌動作接龍、站隊光譜、登山隊盲走、三秒定格' },
    { id: 'reunion', title: '重逢小劇場', minutes: 8, desc: '每個人演自己的進場，老闆打開時光膠囊' },
    { id: 'round1', title: '第一輪：下午茶與小劇場', minutes: 32, desc: '邊喝下午茶邊用問題卡互相問；四段小劇場，六個人都有台詞' },
    { id: 'read2', title: '讀第二幕', minutes: 7, desc: '想起畢業那天的事' },
    { id: 'round2', title: '第二輪：小劇場與搜證', minutes: 36, desc: '四段小劇場、新的線索、私聊' },
    { id: 'restore', title: '還原', minutes: 10, desc: '不投票，大家一起把十年前的故事拼起來' },
    { id: 'act3', title: '第三幕：結局小劇場', minutes: 15, desc: '讀十年前寫給自己的信，每個人演自己選的結局' },
    { id: 'debrief', title: '出戲', minutes: 10, desc: '離開角色，回到自己' },
  ],
  rules: [
    '你的劇本只有你看得到。不要給別人看，也不要偷看別人的。',
    '關於你自己的**秘密**，你可以不說，也可以說謊；其他事情都要說實話。',
    '劇本裡標著**「被問到才說」**的事，別人用開放式問題問到相關話題時，你要照實說。是非題只要回答「是」或「不是」。',
    '每一輪可以找一個人私聊一次，3 分鐘。',
    '**小劇場**都由這六個角色自己演，每一段每個人都有台詞；你的台詞在劇本裡是**粗體、有底色**的。照唸就好，不用演得很厲害，想加自己的話也可以。',
    '任何時候都可以說 **pass**。',
    '破冰遊戲會有一些肢體互動，像擊掌、搭肩、一起擺姿勢；不想被碰到，隨時說 pass，改用聲音或動作就好。角色之間的感情，都只在劇情裡。',
  ],
  // 戀愛情境小劇場：每個角色現在的感情處境，先照原樣演一次，再換一種說法重來一次（不劇透）
  loveScenes: [
    { title: '曖昧的時候，被朋友起鬨', desc: '真心話大冒險：「妳喜歡什麼樣的人？」誰在看誰，大家都看得見。' },
    { title: '送禮告白，被笑著婉拒', desc: '聖誕交換禮物：圍巾、手套、相簿、頭燈電池，每個人用不同的方式說喜歡。' },
    { title: '喜歡的人要出國了', desc: '送機：想了一整晚的話，最後只說出一句「一路平安」。' },
    { title: '送別時，差一點就說出口', desc: '搬家那天：「其實……沒事。到台北記得吃飯。」' },
    { title: '十年後的感情近況', desc: '分手、交友軟體被句點、被問要不要結婚、離婚、被催婚、「妳的行李箱從來沒收起來過」。老朋友互相給建議，再「重來一次」，換一種說法說說看。' },
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

// 角色封面圖（public/assets/img/mystery/cover-<角色>-<寬>.jpg，AI 生成、不露臉、不劇透）
export const coverSrc = (base, id, w) => `${base}assets/img/mystery/cover-${id}-${w}.jpg`;

export const mysteryHours = () => {
  const tl = mysteryTimeline();
  return { start: tl[0].time, end: tl.at(-1).end };
};
