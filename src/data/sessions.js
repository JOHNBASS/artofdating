// 五堂課的基本資料：首頁卡片、課程頁標題、上一堂／下一堂導覽、上課流程、投影片都從這裡讀

// 上課時間：只要改這裡，首頁、課程頁、投影片上的每一個時間都會跟著變。
//   start：入場時間，例如晚上班 '18:45'、週六下午班 '14:00'、週日中午班 '11:30'
//   meal ：這一餐叫什麼，例如 '晚餐'、'午餐'、'早午餐'、'下午茶'；
//          不安排用餐就寫 null：五堂的用餐段和用餐投影片會自動拿掉，每堂少 30 分鐘，
//          首頁和投影片備註裡「一起吃飯」的說法也會換掉
export const schedule = { start: '18:45', meal: '晚餐' };
const { meal } = schedule;

// agenda：每一段 [幾分鐘, 內容]，照順序排；開始時間從 schedule.start 自動往下算。
// [30, meal] 是用餐段，meal 是 null 時這一段不算。
// 投影片的段落（section）和用餐（break）會用標題對到這裡的某一段，所以改內容文字時，投影片標題也要一起改。
export const sessions = [
  {
    num: 1,
    title: '聆聽的藝術',
    theme: '溝通',
    tagline: '先聽懂，才會被聽懂',
    summary: '認識自己和別人的溝通方式從哪裡來，練習一種讓人覺得「被聽見」的聆聽。',
    experiment: '好奇心約會',
    agenda: [
      [15, '入場、桌組破冰'],
      [30, meal],
      [35, '一、我們怎麼說話，是從哪裡來的'],
      [30, '二、聆聽：比說話更難的那一半'],
      [25, '三、好問題，是約會最好的禮物'],
      [15, '帶回家的約會實驗'],
    ],
  },
  {
    num: 2,
    title: '吵架的藝術',
    theme: '衝突',
    tagline: '不是不吵，是吵得好',
    summary: '看見生氣底下真正的情緒，學會把問題放到桌上一起解決，也分辨健康的衝突和警訊。',
    experiment: '暫停暗號',
    agenda: [
      [15, '入場、上次約會實驗分享'],
      [30, meal],
      [30, '一、生氣底下，藏著什麼'],
      [35, '二、把問題放到桌上'],
      [20, '三、修復：道歉與原諒'],
      [10, '健康的衝突，和需要警覺的訊號'],
      [10, '帶回家的約會實驗'],
    ],
  },
  {
    num: 3,
    title: '選擇的藝術',
    theme: '承諾',
    tagline: '愛，是一個又一個決定',
    summary: '分辨心動和成熟的愛，整理自己真正在找什麼，練習用「決定」而不是「順著滑過去」走進關係。',
    experiment: '我的清單對談',
    agenda: [
      [15, '入場、上次約會實驗分享'],
      [30, meal],
      [30, '一、心動，和決定去愛'],
      [35, '二、我真正在找什麼'],
      [30, '三、錢，和家人的期待'],
      [10, '帶回家的約會實驗'],
    ],
  },
  {
    num: 4,
    title: '靠近的藝術',
    theme: '連結',
    tagline: '在小事裡靠近彼此',
    summary: '認識愛的語言與每天的小小邀請，設計一場好約會，也想清楚親密的步調與界線。',
    experiment: '為對方設計一次約會',
    agenda: [
      [15, '入場、上次約會實驗分享'],
      [30, meal],
      [30, '一、愛的五種語言'],
      [20, '二、每天的小小邀請'],
      [25, '三、設計一場好約會'],
      [20, '四、親密的步調與界線（個人書寫）'],
      [10, '帶回家的約會實驗'],
    ],
  },
  {
    num: 5,
    title: '冒險的藝術',
    theme: '旅程',
    tagline: '帶著自己，走向一段關係',
    summary: '練習欣賞的眼光，放下不切實際的劇本，看見自己的地雷，排出人生的優先次序。',
    experiment: '給三個月後的自己',
    agenda: [
      [15, '入場、上次約會實驗分享'],
      [30, meal],
      [20, '一、欣賞的眼光'],
      [20, '二、放下不切實際的劇本'],
      [20, '三、我的地雷地圖'],
      [15, '四、人生的優先次序'],
      [15, '五、風箏與錨'],
      [15, '結業：寫在背上的欣賞'],
    ],
  },
];

const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toTime = (n) => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

// 把 [幾分鐘, 內容] 換算成每一段的開始、結束時間：[{ time, end, label, minutes }]
// 沒有內容的段落（不安排用餐時的 [30, null]）會跳過
export function agendaWithMinutes(agenda) {
  let t = toMin(schedule.start);
  return agenda.filter(([, label]) => label).map(([minutes, label]) => {
    const time = toTime(t);
    t += minutes;
    return { time, end: toTime(t), label, minutes };
  });
}

// 一堂課從幾點到幾點（五堂裡最晚結束的那一堂），首頁用
export const classHours = {
  start: schedule.start,
  end: sessions.map((s) => agendaWithMinutes(s.agenda).at(-1).end).sort().at(-1),
};

export const modes = {
  self: { label: '自己', icon: '✎', desc: '安靜書寫，只有你看得到' },
  pair: { label: '兩人', icon: '⇄', desc: '和伴侶，或今天的練習夥伴' },
  table: { label: '桌組', icon: '◎', desc: '同桌 4–6 人一起聊' },
};
