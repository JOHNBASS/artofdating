// 五堂課的基本資料：首頁卡片、課程頁標題、上一堂／下一堂導覽都從這裡讀
export const sessions = [
  {
    num: 1,
    title: '聆聽的藝術',
    theme: '溝通',
    tagline: '先聽懂，才會被聽懂',
    summary: '認識自己和別人的溝通方式從哪裡來，練習一種讓人覺得「被聽見」的聆聽。',
    experiment: '好奇心約會',
  },
  {
    num: 2,
    title: '吵架的藝術',
    theme: '衝突',
    tagline: '不是不吵，是吵得好',
    summary: '看見生氣底下真正的情緒，學會把問題放到桌上一起解決，也分辨健康的衝突和警訊。',
    experiment: '暫停暗號',
  },
  {
    num: 3,
    title: '選擇的藝術',
    theme: '承諾',
    tagline: '愛，是一個又一個決定',
    summary: '分辨心動和成熟的愛，整理自己真正在找什麼，練習用「決定」而不是「順著滑過去」走進關係。',
    experiment: '我的清單對談',
  },
  {
    num: 4,
    title: '靠近的藝術',
    theme: '連結',
    tagline: '在小事裡靠近彼此',
    summary: '認識愛的語言與每天的小小邀請，設計一場好約會，也想清楚親密的步調與界線。',
    experiment: '為對方設計一次約會',
  },
  {
    num: 5,
    title: '冒險的藝術',
    theme: '旅程',
    tagline: '帶著自己，走向一段關係',
    summary: '練習欣賞的眼光，放下不切實際的劇本，看見自己的地雷，排出人生的優先次序。',
    experiment: '給三個月後的自己',
  },
];

export const modes = {
  self: { label: '自己', icon: '✎', desc: '安靜書寫，只有你看得到' },
  pair: { label: '兩人', icon: '⇄', desc: '和伴侶，或今晚的練習夥伴' },
  table: { label: '桌組', icon: '◎', desc: '同桌 4–6 人一起聊' },
};
