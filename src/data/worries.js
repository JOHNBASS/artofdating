// 首頁「關於愛情的四個擔心」：問題、關鍵數字、回答與資料來源
// chart 是卡片上的小圖；src 是卡片底部的簡短出處，完整出處在 notes（資料來源頁）。數字查核日：2026-11-10
export const worries = [
  {
    q: '婚姻是愛情的墳墓嗎？',
    stat: '第 10 年',
    statLabel: '關係滿意度的低點，之後會回升',
    a: '這句話出自 1763 年卡薩諾瓦的回憶錄，對方當場回他：「不一定。」滿意度第 10 年最低，之後回升；關鍵是關係品質。',
    chart: { type: 'curve' },
    src: '卡薩諾瓦《回憶錄》；Bühler 等 2021；Robles 等 2014',
  },
  {
    q: '台灣的離婚率有多高？',
    stat: '2.23‰',
    statLabel: '2025 年粗離婚率，十年來大致持平',
    a: '「每 2 對結婚就有 1 對離婚」是拿今年離婚數除以今年結婚數，兩邊不是同一群人。換個算法，每年約 1% 的已婚者離婚。',
    chart: { type: 'dots', value: 1, label: '100 位已婚者中，一年內離婚的約 1 位' },
    src: '內政部戶政司 2025 年人口統計',
  },
  {
    q: '我一個人過得很好，為什麼要結婚？',
    stat: '62.1%',
    statLabel: '2025 年底，台灣 30 到 34 歲未婚的比例',
    a: '單身是完整的人生。比起有沒有結婚，有沒有可以信任的關係，更影響健康與快樂。這門課不催婚。',
    chart: { type: 'dots', value: 62, label: '100 位 30 到 34 歲的台灣人中，62 位未婚' },
    src: '內政部戶政司 2025 年底資料；Holt-Lunstad 等 2010',
  },
  {
    q: '怎麼確定我們一輩子相愛、不出軌？',
    stat: '13–20%',
    statLabel: '美國有過婚姻的人，曾在婚內出軌的比例',
    a: '沒有人能保證永遠。但守住界線、把話說開、想清楚再往前走，都能保護關係；承諾是每天的選擇。',
    chart: { type: 'bars', bars: [{ name: '女性', value: 13 }, { name: '男性', value: 20 }] },
    src: '美國綜合社會調查（GSS）；Glass 2003；Owen 等 2013',
  },
];

export const notes = [
  {
    text: '卡薩諾瓦《回憶錄》，1763 年倫敦一段（英譯本）。',
    source: 'Project Gutenberg',
    href: 'https://www.gutenberg.org/ebooks/2981',
  },
  {
    text: 'Bühler 等（2021），關係滿意度隨交往年數變化的整合分析，165 個樣本、165,039 人。',
    source: 'Psychological Bulletin',
    href: 'https://doi.org/10.1037/bul0000342',
  },
  {
    text: 'Robles 等（2014），婚姻品質與健康的整合分析，126 篇研究、超過 72,000 人。',
    source: 'Psychological Bulletin',
    href: 'https://doi.org/10.1037/a0031859',
  },
  {
    text: '內政部戶政司人口統計（2025 年）：粗離婚率、有偶人口離婚率、離婚按結婚期間；未婚率依「現住人口按性別、年齡、婚姻狀況」計算。',
    source: '內政部戶政司',
    href: 'https://www.ris.gov.tw/app/portal/346',
  },
  {
    text: 'Holt-Lunstad 等（2010），社會關係與存活率的整合分析，148 篇研究、308,849 人。',
    source: 'PLOS Medicine',
    href: 'https://doi.org/10.1371/journal.pmed.1000316',
  },
  {
    text: 'Wang（2018）以美國綜合社會調查（GSS）分析出軌比例：有過婚姻的男性 20%、女性 13%。',
    source: 'Institute for Family Studies',
    href: 'https://ifstudies.org/blog/who-cheats-more-the-demographics-of-cheating-in-america',
  },
  {
    text: 'Shirley Glass（2003），《Not "Just" Friends》：對別人築牆，對伴侶開窗。',
    source: 'CBS News',
    href: 'https://www.cbsnews.com/news/not-just-friends/',
  },
  {
    text: 'Owen、Rhoades、Stanley（2013），想清楚再決定、而不是順勢走下去，與伴侶以外的關係較少有關。',
    source: 'PMC',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3656416/',
  },
];
